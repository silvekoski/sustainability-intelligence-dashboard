import React from 'react';
import { MetricCard } from '../components/MetricCard';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import { useData } from '../hooks/useData';
import { useAuth } from '../contexts/AuthContext';
import { 
  Zap, 
  Factory, 
  Gauge, 
  Flame, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  Leaf,
  Upload,
  BarChart3,
  Shield,
  FileText,
  Brain,
  Lightbulb
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { csvData, isAutoLoading, autoLoadedFileName } = useAuth();
  const { loading, error, metrics, changes } = useData(csvData);

  if (loading || isAutoLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-lg font-medium text-gray-700">
            {isAutoLoading ? 'Auto-loading your data...' : 'Loading overview...'}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!csvData || csvData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-6">
            Upload a CSV file in Settings → Data Source to view your power plant data and analytics.
          </p>
          <button
            onClick={() => window.location.href = '/settings'}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Settings
          </button>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/sample_data.csv';
                  link.download = 'sample_data.csv';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Download sample data
              </button>
              <p className="text-sm text-gray-600">
                Download this sample data to experiment with our application.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center justify-between mt-2">
          <p className="text-gray-600">Key performance indicators and system status</p>
          {autoLoadedFileName && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Auto-loaded: {autoLoadedFileName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Electricity Output"
          value={metrics.totalElectricity.toFixed(0)}
          unit="MWh"
          change={changes.electricityChange}
          changeLabel="vs last period"
          icon={<Zap className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Total CO₂ Emissions"
          value={metrics.totalEmissions.toFixed(0)}
          unit="tonnes"
          change={changes.emissionsChange}
          changeLabel="vs last period"
          icon={<Factory className="w-6 h-6" />}
          color="red"
        />
        <MetricCard
          title="Average Efficiency"
          value={metrics.avgEfficiency.toFixed(1)}
          unit="%"
          change={changes.efficiencyChange}
          changeLabel="vs last period"
          icon={<Gauge className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Fuel Consumption"
          value={metrics.totalFuelConsumption.toFixed(0)}
          unit="MWh"
          change={changes.fuelChange}
          changeLabel="vs last period"
          icon={<Flame className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">EU Compliance</h3>
              <p className="text-sm text-gray-600">CSRD, ESRS, EU ETS</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">Compliant</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">US SEC Disclosure</h3>
              <p className="text-sm text-gray-600">Climate Risk Assessment</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">Ready</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Prepared
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Factory className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Plant Status</h3>
              <p className="text-sm text-gray-600">Operational Overview</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-purple-600">Optimal</span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              Monitoring
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => window.location.href = '/dashboard/analytics'}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">View Analytics</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard/plants'}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Factory className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">Plant Status</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard/compliance'}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Shield className="w-5 h-5 text-red-600" />
            <span className="font-medium text-gray-900">Compliance</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard/reports'}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-900">Generate Report</span>
          </button>
        </div>
      </div>

      {/* AI Insights Preview */}
      <div className="mt-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Insights Preview</h2>
            <p className="text-gray-600">Quick AI-powered analysis of your data</p>
          </div>
        </div>
        
        {/* Sample AI Insights when no data is available */}
        {!csvData || csvData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                  <p className="text-sm text-gray-600">Powered by DeepSeek AI</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-100 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Sample Preview</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Sample Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">AI Analysis Summary</h4>
                <p className="text-sm text-purple-800">
                  Power plant operations show strong efficiency performance with CHP facilities achieving 80% efficiency. 
                  Natural gas plants demonstrate optimal fuel utilization, while coal facilities present opportunities 
                  for emissions reduction through advanced control systems.
              {/* Sample Risk Assessment */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Risk Assessment</h4>
                  <span className="px-3 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
                    MEDIUM RISK
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>EU ETS compliance requires monitoring of allowance consumption rates</span>
                  </div>
                  <div className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>Efficiency optimization potential identified in coal-fired units</span>
                  </div>
                  <div className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>SEC climate disclosure requirements for US operations</span>
                  </div>
                </div>
              </div>
                </p>
              {/* Sample Insights */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Key Insights</h4>
                <div className="space-y-3">
                  <div className="border rounded-lg p-4 border-green-200 bg-green-50 text-green-800">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">Efficiency Optimization Opportunity</h5>
                          <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                            HIGH
                          </span>
                        </div>
                        <p className="text-sm mb-2">
                          CHP plants demonstrate 80% efficiency vs 45% average. Implementing combined heat and power 
                          technology across facilities could improve overall efficiency by 15-25%.
                        </p>
                        <div className="text-xs bg-white bg-opacity-50 rounded px-2 py-1 inline-block">
                          Impact: 15-25% efficiency improvement
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 border-yellow-200 bg-yellow-50 text-yellow-800">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">Emissions Reduction Strategy</h5>
                          <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                            MEDIUM
                          </span>
                        </div>
                        <p className="text-sm mb-2">
                          Coal facilities show 67% higher emissions intensity. Fuel switching to natural gas or 
                          biomass co-firing could reduce CO₂ emissions by 20-30%.
                        </p>
                        <div className="text-xs bg-white bg-opacity-50 rounded px-2 py-1 inline-block">
                          Impact: 20-30% emissions reduction
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
              {/* Sample Recommendations */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">AI Recommendations</h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      Install waste heat recovery systems on coal units to capture 5-10% additional efficiency
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      Implement predictive maintenance programs to maintain optimal turbine performance
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      Consider biomass co-firing to reduce net CO₂ emissions while maintaining output
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Upload your CSV data to get personalized AI insights powered by DeepSeek
              </p>
            </div>
          </div>
        ) : (
          <AIInsightsPanel data={csvData} />
        )}
      </div>
    </div>
  );
};