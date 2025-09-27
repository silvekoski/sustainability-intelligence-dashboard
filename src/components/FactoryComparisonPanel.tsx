import React, { useState, useEffect } from 'react';
import { Factory, CheckCircle, AlertTriangle, XCircle, TrendingUp, Leaf, Shield, FileText } from 'lucide-react';
import { FactoryComparisonData, FactoryAnalysis, ComplianceStatus } from '../types/factory';
import { FactoryService } from '../services/factoryService';

const StatusIcon = ({ status }: { status: ComplianceStatus }) => {
  switch (status) {
    case 'green':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'yellow':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'red':
      return <XCircle className="w-5 h-5 text-red-500" />;
  }
};

const ComplianceBadge = ({ type, status, message }: { type: string; status: string; message: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'non_compliant': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`} title={message}>
      {type}
    </div>
  );
};

const FactoryRow = ({ analysis }: { analysis: FactoryAnalysis }) => {
  const { factory, status, normalized_output, compliance, recommendations, data_available } = analysis;

  if (!data_available) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <Factory className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">{factory.factory_name}</h3>
            <span className="text-sm text-gray-500">Data unavailable</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Factory className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">{factory.factory_name}</h3>
          <StatusIcon status={status} />
          {factory.location && (
            <span className="text-sm text-gray-500">📍 {factory.location}</span>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{factory.efficiency_pct}%</p>
          <p className="text-sm text-gray-500">Efficiency</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{factory.emissions_gCO2_per_kWh}</p>
          <p className="text-sm text-gray-500">gCO₂/kWh</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{factory.output_MWh.toFixed(0)}</p>
          <p className="text-sm text-gray-500">MWh Output</p>
        </div>
      </div>

      {/* Visual bars */}
      <div className="space-y-2 mb-4">
        {/* Efficiency bar */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 w-16">Efficiency</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${factory.efficiency_pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 w-8">{factory.efficiency_pct}%</span>
        </div>

        {/* Emissions bar (inverted - lower is better) */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 w-16">Emissions</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((factory.emissions_gCO2_per_kWh / 1000) * 100, 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 w-16">{factory.emissions_gCO2_per_kWh}</span>
        </div>

        {/* Output bar */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 w-16">Output</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${normalized_output}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 w-16">{factory.output_MWh.toFixed(0)} MWh</span>
        </div>
      </div>

      {/* Compliance badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <ComplianceBadge 
          type="EU ETS" 
          status={compliance.eu_ets.status} 
          message={compliance.eu_ets.message} 
        />
        <ComplianceBadge 
          type="CSRD/ESRS" 
          status={compliance.csrd_esrs.status} 
          message={compliance.csrd_esrs.message} 
        />
        <ComplianceBadge 
          type="SEC" 
          status={compliance.sec.status} 
          message={compliance.sec.message} 
        />
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Recommendations</span>
          </div>
          <ul className="space-y-1">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-blue-800 flex items-start space-x-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const FactoryComparisonPanel: React.FC = () => {
  const [data, setData] = useState<FactoryComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const comparisonData = await FactoryService.getFactoryComparisonData();
        console.log('Factory comparison data loaded:', comparisonData);
        setData(comparisonData);
      } catch (err) {
        console.error('Error loading factory data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load factory data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <XCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Failed to load factory comparison data</p>
          {error && <p className="text-sm text-gray-500 mt-1">{error}</p>}
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { factories, benchmarks, cohort_size } = data;
  const greenCount = factories.filter(f => f.status === 'green').length;
  const yellowCount = factories.filter(f => f.status === 'yellow').length;
  const redCount = factories.filter(f => f.status === 'red').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Factory className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Factory Comparison & Compliance</h3>
            <p className="text-gray-600">Benchmarking across {cohort_size} facilities</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">{greenCount} Optimal</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-600">{yellowCount} Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">{redCount} Critical</span>
          </div>
        </div>
      </div>

      {/* Benchmark summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Cohort Benchmarks</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Avg Efficiency</p>
            <p className="font-semibold">{benchmarks.efficiency_avg.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-500">Top 25% Efficiency</p>
            <p className="font-semibold">{benchmarks.efficiency_p75.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-500">Avg Emissions</p>
            <p className="font-semibold">{benchmarks.emissions_avg.toFixed(0)} gCO₂/kWh</p>
          </div>
          <div>
            <p className="text-gray-500">Best 25% Emissions</p>
            <p className="font-semibold">{benchmarks.emissions_p25.toFixed(0)} gCO₂/kWh</p>
          </div>
        </div>
      </div>

      {/* Factory rows */}
      <div className="space-y-4">
        {factories.map((analysis) => (
          <FactoryRow key={analysis.factory.id} analysis={analysis} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
              <span>Efficiency %</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-2 bg-gradient-to-r from-red-400 to-red-600 rounded"></div>
              <span>Emissions Intensity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded"></div>
              <span>Output (normalized)</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Leaf className="w-4 h-4 text-green-500" />
            <span>🟢 ≥75th efficiency + ≤25th emissions | 🟡 Middle cohort | 🔴 ≤25th efficiency or ≥75th emissions</span>
          </div>
        </div>
      </div>
    </div>
  );
};