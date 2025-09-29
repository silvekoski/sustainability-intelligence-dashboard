import React from 'react';
import { FactoryComparisonPanel } from '../components/FactoryComparisonPanel';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Upload } from 'lucide-react';

export const DashboardBenchmarking: React.FC = () => {
  const { csvData, isAutoLoading } = useAuth();

  if (isAutoLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-lg font-medium text-gray-700">Auto-loading your data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Benchmarking</h1>
            <p className="text-gray-600 mt-1">Compare performance across facilities and industry standards</p>
          </div>
        </div>
      </div>

      {!csvData || csvData.length === 0 ? (
        <div className="text-center py-16">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-6">
            Upload a CSV file in Settings → Data Source to view benchmarking analysis.
          </p>
          <button
            onClick={() => window.location.href = '/settings'}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
      ) : (
        <div className="space-y-8">
          <FactoryComparisonPanel currentData={csvData} />
          
          {/* Benchmarking Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Benchmarking Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Performance Recommendations</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Top Performers:</strong> CHP plants achieve 80% efficiency vs 45% average
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Optimization Opportunity:</strong> Natural gas plants can improve by 15-25%
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Fuel Switching:</strong> Biogas blend could reduce CO₂ by 10-20%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Industry Comparison</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Your Average Efficiency</span>
                    <span className="text-sm text-blue-600 font-semibold">52.5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Industry Average</span>
                    <span className="text-sm text-gray-600 font-semibold">45.0%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Best in Class</span>
                    <span className="text-sm text-green-600 font-semibold">75.0%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-medium text-green-700">Your Performance</span>
                    <span className="text-sm text-green-600 font-semibold">Above Average</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};