import React from 'react';
import { Factory, TrendingUp, TrendingDown, Zap, MapPin, Award, AlertTriangle } from 'lucide-react';

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
  statusLabel: string;
  recommendations: string[];
  normalizedOutput: number;
  efficiencyRank: number;
  emissionsRank: number;
  overallScore: number;
}

export const FactoryComparisonBar: React.FC<FactoryComparisonBarProps> = ({ factories }) => {
  const processFactories = (factories: FactoryData[]): ProcessedFactory[] => {
    if (!factories.length) return [];

    // Calculate cohort statistics (ignore missing values)
    const efficiencies = factories.map(f => f.efficiency_pct).filter(v => v != null && !isNaN(v));
    const emissions = factories.map(f => f.emissions_gCO2_per_kWh).filter(v => v != null && !isNaN(v));
    const outputs = factories.map(f => f.output_MWh).filter(v => v != null && !isNaN(v));

    const getPercentile = (arr: number[], percentile: number): number => {
      if (!arr.length) return 0;
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

    const efficiencyAvg = efficiencies.length ? efficiencies.reduce((sum, v) => sum + v, 0) / efficiencies.length : 0;
    const emissionsAvg = emissions.length ? emissions.reduce((sum, v) => sum + v, 0) / emissions.length : 0;

    return factories.map((factory, index) => {
      // Traffic light logic
      let status: 'green' | 'yellow' | 'red' = 'yellow';
      let statusEmoji = '🟡';
      let statusLabel = 'Average';

      if (factory.efficiency_pct >= efficiencyP75 && factory.emissions_gCO2_per_kWh <= emissionsP25) {
        status = 'green';
        statusEmoji = '🟢';
        statusLabel = 'Excellent';
      } else if (factory.efficiency_pct <= efficiencyP25 || factory.emissions_gCO2_per_kWh >= emissionsP75) {
        status = 'red';
        statusEmoji = '🔴';
        statusLabel = 'Needs Attention';
      }

      // Calculate rankings
      const efficiencyRank = factories.filter(f => f.efficiency_pct > factory.efficiency_pct).length + 1;
      const emissionsRank = factories.filter(f => f.emissions_gCO2_per_kWh < factory.emissions_gCO2_per_kWh).length + 1;
      
      // Overall score (0-100, higher is better)
      const efficiencyScore = (factory.efficiency_pct / Math.max(...efficiencies)) * 50;
      const emissionsScore = (1 - (factory.emissions_gCO2_per_kWh / Math.max(...emissions))) * 50;
      const overallScore = efficiencyScore + emissionsScore;

      // Generate recommendations (max 2)
      const recommendations: string[] = [];
      const isEfficiencyBelowAvg = factory.efficiency_pct < efficiencyAvg;
      const isEmissionsAboveAvg = factory.emissions_gCO2_per_kWh > emissionsAvg;

      if (status === 'green') {
        recommendations.push("🏆 Maintain current practices; add predictive maintenance / digital twin to squeeze +2–3%.");
        if (factory.efficiency_pct > efficiencyP75 * 1.1) {
          recommendations.push("⭐ Consider sharing best practices with other facilities in the network.");
        }
      } else {
        if (isEfficiencyBelowAvg && isEmissionsAboveAvg) {
          recommendations.push("🔄 Hybridize with heat pumps or add storage to improve load factor and cut CO₂.");
        } else {
          if (isEfficiencyBelowAvg) {
            recommendations.push("⚡ Install/upgrade waste heat recovery (+5–10% efficiency).");
          }
          if (isEmissionsAboveAvg) {
            recommendations.push("🌱 Shift 15–25% fuel mix to biogas/e-methane (–10–20% CO₂).");
          }
        }
        
        // Add second recommendation if only one so far
        if (recommendations.length === 1) {
          if (factory.efficiency_pct < efficiencyP25) {
            recommendations.push("🔧 Schedule comprehensive efficiency audit and equipment optimization.");
          } else if (factory.emissions_gCO2_per_kWh > emissionsP75) {
            recommendations.push("📊 Implement real-time emissions monitoring and optimization system.");
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
        statusLabel,
        recommendations,
        normalizedOutput: maxOutput > 0 ? (factory.output_MWh / maxOutput) * 100 : 0,
        efficiencyRank,
        emissionsRank,
        overallScore
      };
    });
  };

  const processedFactories = processFactories(factories);

  // Sort by status (Green→Yellow→Red), then by overall score descending
  const sortedFactories = processedFactories.sort((a, b) => {
    const statusOrder = { green: 0, yellow: 1, red: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return b.overallScore - a.overallScore;
  });

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'green': return <Award className="w-5 h-5 text-green-600" />;
      case 'yellow': return <TrendingUp className="w-5 h-5 text-yellow-600" />;
      case 'red': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Factory className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!factories.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Factory className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">Factory Comparison Bar</h3>
        </div>
        <div className="text-center py-8">
          <Factory className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No factory data available for comparison.</p>
        </div>
      </div>
    );
  }

  // Calculate cohort insights
  const topPerformer = sortedFactories[0];
  const avgEfficiency = processedFactories.reduce((sum, f) => sum + f.efficiency_pct, 0) / processedFactories.length;
  const avgEmissions = processedFactories.reduce((sum, f) => sum + f.emissions_gCO2_per_kWh, 0) / processedFactories.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header with insights */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Factory className="w-6 h-6 text-gray-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Factory Performance Comparison</h3>
            <p className="text-sm text-gray-500">
              {sortedFactories.filter(f => f.status === 'green').length} excellent • {' '}
              {sortedFactories.filter(f => f.status === 'yellow').length} average • {' '}
              {sortedFactories.filter(f => f.status === 'red').length} need attention
            </p>
          </div>
        </div>
        <div className="text-right text-sm text-gray-600">
          <div>Avg Efficiency: <span className="font-semibold">{avgEfficiency.toFixed(1)}%</span></div>
          <div>Avg Emissions: <span className="font-semibold">{formatNumber(avgEmissions)} gCO₂/kWh</span></div>
        </div>
      </div>

      {/* Top performer highlight */}
      {topPerformer && topPerformer.status === 'green' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Top Performer</span>
          </div>
          <p className="text-sm text-green-700">
            <strong>{topPerformer.factory_name}</strong> leads with {topPerformer.efficiency_pct.toFixed(1)}% efficiency 
            and {formatNumber(topPerformer.emissions_gCO2_per_kWh)} gCO₂/kWh emissions intensity.
          </p>
        </div>
      )}

      {/* Factory comparison rows */}
      <div className="space-y-4">
        {sortedFactories.map((factory, index) => (
          <div key={index} className={`border-2 rounded-lg p-5 transition-all hover:shadow-md ${
            factory.status === 'green' ? 'border-green-200 bg-green-50/30' :
            factory.status === 'yellow' ? 'border-yellow-200 bg-yellow-50/30' :
            'border-red-200 bg-red-50/30'
          }`}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(factory.status)}
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{factory.factory_name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {factory.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{factory.location}</span>
                      </div>
                    )}
                    <span>Rank #{index + 1}</span>
                  </div>
                </div>
              </div>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold ${
                factory.status === 'green' ? 'bg-green-100 text-green-800' :
                factory.status === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                <span className="text-lg">{factory.statusEmoji}</span>
                <span>{factory.statusLabel}</span>
              </div>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-600">EFFICIENCY</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{factory.efficiency_pct.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">#{factory.efficiencyRank} of {factories.length}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-gray-600">EMISSIONS</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{formatNumber(factory.emissions_gCO2_per_kWh)}</div>
                <div className="text-xs text-gray-500">gCO₂/kWh • #{factory.emissionsRank} of {factories.length}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-600">OUTPUT</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{formatNumber(factory.output_MWh)}</div>
                <div className="text-xs text-gray-500">MWh</div>
              </div>
            </div>

            {/* Performance bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Performance Breakdown</span>
                <span className="text-sm text-gray-500">Score: {factory.overallScore.toFixed(0)}/100</span>
              </div>
              <div className="flex h-6 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                {/* Efficiency segment */}
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-xs font-bold text-white transition-all hover:from-green-500 hover:to-green-700"
                  style={{ width: `${Math.max(factory.efficiency_pct * 0.4, 10)}%` }}
                  title={`Efficiency: ${factory.efficiency_pct.toFixed(1)}%`}
                >
                  {factory.efficiency_pct >= 20 && 'EFF'}
                </div>
                
                {/* Emissions segment (inverted - lower is better, so we show inverse) */}
                <div 
                  className="bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center text-xs font-bold text-white transition-all hover:from-red-500 hover:to-red-700"
                  style={{ width: `${Math.max((factory.emissions_gCO2_per_kWh / 1000) * 30, 8)}%` }}
                  title={`Emissions: ${formatNumber(factory.emissions_gCO2_per_kWh)} gCO₂/kWh`}
                >
                  {factory.emissions_gCO2_per_kWh >= 200 && 'EMI'}
                </div>
                
                {/* Output segment */}
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white transition-all hover:from-blue-500 hover:to-blue-700"
                  style={{ width: `${Math.max(factory.normalizedOutput * 0.25, 8)}%` }}
                  title={`Output: ${formatNumber(factory.output_MWh)} MWh`}
                >
                  {factory.normalizedOutput >= 40 && 'OUT'}
                </div>
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
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <span>💡</span>
                  <span>Recommendations</span>
                </h5>
                <ul className="space-y-2">
                  {factory.recommendations.map((rec, recIndex) => (
                    <li key={recIndex} className="flex items-start space-x-2 text-sm text-gray-700">
                      <span className="text-gray-400 mt-1 font-bold">•</span>
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