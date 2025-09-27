import React from 'react';
import { EmissionsChart } from '../components/EmissionsChart';
import { EfficiencyGauge } from '../components/EfficiencyGauge';
import { useData } from '../hooks/useData';
import { BarChart3, TrendingUp, PieChart, Activity, Loader2, AlertCircle } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { plantSummaries, emissionsTrends, loading, error } = useData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Deep dive into performance metrics and trends</p>
          </div>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
              <p className="text-sm text-gray-500">12-month performance trends</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">+2.4%</div>
          <p className="text-sm text-gray-600">Efficiency improvement YoY</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <PieChart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Optimization</h3>
              <p className="text-sm text-gray-500">Potential improvements</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">15%</div>
          <p className="text-sm text-gray-600">Emissions reduction potential</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Real-time</h3>
              <p className="text-sm text-gray-500">Live monitoring status</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">98.5%</div>
          <p className="text-sm text-gray-600">System uptime</p>
        </div>
      </div>

      {/* Main Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Emissions Chart - Takes up 2/3 of the width */}
        <div className="lg:col-span-2">
          <EmissionsChart data={emissionsTrends} />
        </div>
        
        {/* Efficiency Gauges - Takes up 1/3 of the width */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Plant Efficiency Analysis</h3>
          <div className="space-y-6">
            {plantSummaries.map(plant => (
              <EfficiencyGauge
                key={plant.plant_id}
                value={plant.avg_efficiency}
                label={plant.plant_name}
                color={
                  plant.avg_efficiency >= 60 ? 'green' :
                  plant.avg_efficiency >= 45 ? 'orange' : 'red'
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics Sections */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Performance Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Peak Efficiency Period</p>
                <p className="text-sm text-gray-600">March-May shows highest efficiency rates across all plants</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Seasonal Variations</p>
                <p className="text-sm text-gray-600">Winter months show 12% higher emissions due to increased demand</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Fuel Mix Optimization</p>
                <p className="text-sm text-gray-600">Natural gas plants outperform coal by 35% in efficiency</p>
              </div>
            </div>
          </div>
        </div>

        {/* Predictive Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Analytics</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Next Quarter Forecast</h4>
              <p className="text-sm text-blue-800">Expected 8% reduction in emissions with planned optimizations</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">Maintenance Alert</h4>
              <p className="text-sm text-yellow-800">Alpha Power Station efficiency declining - maintenance recommended</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Optimization Opportunity</h4>
              <p className="text-sm text-green-800">Fuel switching could save 2,400 tCO₂e annually</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};