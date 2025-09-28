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
  Brain
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { csvData } = useAuth();
  const { loading, error, metrics, changes } = useData(csvData);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-lg font-medium text-gray-700">Loading overview...</span>
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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Key performance indicators and system status</p>
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
        <AIInsightsPanel data={csvData} />
      </div>
    </div>
  );
};