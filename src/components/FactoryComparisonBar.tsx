import React from 'react';
import { Factory, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface FactoryData {
  factory_name: string;
  efficiency_pct: number;
  emissions_gCO2_per_kWh: number;
  output_MWh: number;
  location?: string;
}

interface FactoryComparisonBarProps {
  factories: FactoryData[];
}

interface ProcessedFactory extends FactoryData {
  status: 'green' | 'yellow' | 'red';
  statusEmoji: string;
  recommendations: string[];
  normalizedOutput: number;
}

export const FactoryComparisonBar: React.FC<FactoryComparisonBarProps> = ({ factories }) => {
  const processFactories = (factories: FactoryData[]): ProcessedFactory[] => {
    if (!factories.length) return [];

    // Calculate cohort statistics
    const efficiencies = factories.map(f => f.efficiency_pct).filter(v => v != null);
    const emissions = factories.map(f => f.emissions_gCO2_per_kWh).filter(v => v != null);
    const outputs = factories.map(f => f.output_MWh).filter(v => v != null);

    const getPercentile = (arr: number[], percentile: number): number => {
      const sorted = [...arr].sort((a, b) => a - b);
      const index = (percentile / 100) * (sorted.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      if (lower === upper) return sorted[lower];
      return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
    };

    const efficiencyP75 = getPercentile(efficiencies, 75);
    const efficiencyP25 = getPercentile(efficiencies, 25);
    const emissionsP25 = getPercentile(emissions, 25);
    const emissionsP75 = getPercentile(emissions, 75);
    const maxOutput = Math.max(...outputs);

    const efficiencyAvg = efficiencies.reduce((sum, v) => sum + v, 0) / efficiencies.length;
    const emissionsAvg = emissions.reduce((sum, v) => sum + v, 0) / emissions.length;

    return factories.map(factory => {
      // Determine status
      let status: 'green' | 'yellow' | 'red' = 'yellow';
      let statusEmoji = '🟡';

      if (factory.efficiency_pct >= efficiencyP75 && factory.emissions_gCO2_per_kWh <= emissionsP25) {
        status = 'green';
        statusEmoji = '🟢';
      } else if (factory.efficiency_pct <= efficiencyP25 || factory.emissions_gCO2_per_kWh >= emissionsP75) {
        status = 'red';
        statusEmoji = '🔴';
      }

      // Generate recommendations
      const recommendations: string[] = [];
      const isEfficiencyBelowAvg = factory.efficiency_pct < efficiencyAvg;
      const isEmissionsAboveAvg = factory.emissions_gCO2_per_kWh > emissionsAvg;

      if (status === 'green') {
        recommendations.push("Maintain current practices; add predictive maintenance / digital twin to squeeze +2–3%.");
      } else {
        if (isEfficiencyBelowAvg && isEmissionsAboveAvg) {
          recommendations.push("Hybridize with heat pumps or add storage to improve load factor and cut CO₂.");
        } else {
          if (isEfficiencyBelowAvg) {
            recommendations.push("Install/upgrade waste heat recovery (+5–10% efficiency).");
          }
          if (isEmissionsAboveAvg) {
            recommendations.push("Shift 15–25% fuel mix to biogas/e-methane (–10–20% CO₂).");
          }
        }
      }

      // Ensure max 2 recommendations
      if (recommendations.length > 2) {
        recommendations.splice(2);
      }

      return {
        ...factory,
        status,
        statusEmoji,
        recommendations,
        normalizedOutput: maxOutput > 0 ? (factory.output_MWh / maxOutput) * 100 : 0
      };
    });
  };

  const processedFactories = processFactories(factories);

  // Sort by status (Green→Yellow→Red), then efficiency descending
  const sortedFactories = processedFactories.sort((a, b) => {
    const statusOrder = { green: 0, yellow: 1, red: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return b.efficiency_pct - a.efficiency_pct;
  });

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  if (!factories.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Factory className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">Factory Comparison Bar</h3>
        </div>
        <p className="text-gray-500">No factory data available for comparison.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Factory className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-bold text-gray-900">Factory Comparison Bar</h3>
      </div>

      <div className="space-y-6">
        {sortedFactories.map((factory, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            {/* Factory Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{factory.statusEmoji}</span>
                <h4 className="font-semibold text-gray-900">{factory.factory_name}</h4>
                {factory.location && (
                  <span className="text-sm text-gray-500">({factory.location})</span>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                factory.status === 'green' ? 'bg-green-100 text-green-800' :
                factory.status === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {factory.status.charAt(0).toUpperCase() + factory.status.slice(1)}
              </div>
            </div>

            {/* Metrics Line */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>Efficiency: <strong>{factory.efficiency_pct.toFixed(1)}%</strong></span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span>Emissions: <strong>{formatNumber(factory.emissions_gCO2_per_kWh)} gCO₂/kWh</strong></span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Output: <strong>{formatNumber(factory.output_MWh)} MWh</strong></span>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="mb-4">
              <div className="flex h-6 rounded-lg overflow-hidden border border-gray-200">
                {/* Efficiency Segment */}
                <div 
                  className="bg-gradient-to-r from-green-300 to-green-600 flex items-center justify-center text-xs font-medium text-white"
                  style={{ width: `${Math.max(factory.efficiency_pct * 0.3, 5)}%` }}
                  title={`Efficiency: ${factory.efficiency_pct.toFixed(1)}%`}
                >
                  {factory.efficiency_pct >= 20 && 'EFF'}
                </div>
                
                {/* Emissions Intensity Segment */}
                <div 
                  className="bg-gradient-to-r from-red-300 to-red-600 flex items-center justify-center text-xs font-medium text-white"
                  style={{ width: `${Math.max((factory.emissions_gCO2_per_kWh / 1000) * 30, 5)}%` }}
                  title={`Emissions: ${formatNumber(factory.emissions_gCO2_per_kWh)} gCO₂/kWh`}
                >
                  {factory.emissions_gCO2_per_kWh >= 200 && 'EMI'}
                </div>
                
                {/* Output Segment */}
                <div 
                  className="bg-gradient-to-r from-blue-300 to-blue-600 flex items-center justify-center text-xs font-medium text-white"
                  style={{ width: `${Math.max(factory.normalizedOutput * 0.4, 5)}%` }}
                  title={`Output: ${formatNumber(factory.output_MWh)} MWh`}
                >
                  {factory.normalizedOutput >= 25 && 'OUT'}
                </div>
                
                {/* Remaining space */}
                <div className="flex-1 bg-gray-100"></div>
              </div>
              
              {/* Legend */}
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Efficiency</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Emissions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Output</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {factory.recommendations.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Recommendations:</h5>
                <ul className="space-y-1">
                  {factory.recommendations.map((rec, recIndex) => (
                    <li key={recIndex} className="flex items-start space-x-2 text-sm text-gray-700">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};