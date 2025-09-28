import React from 'react';
import { ComplianceReportGenerator } from '../components/ComplianceReportGenerator';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Upload } from 'lucide-react';

export const DashboardReports: React.FC = () => {
  const { csvData } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Generate compliance and regulatory reports</p>
          </div>
        </div>
      </div>

      {!csvData || csvData.length === 0 ? (
        <div className="text-center py-16">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-6">
            Upload a CSV file in Settings → Data Source to generate reports.
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
          <ComplianceReportGenerator currentData={csvData} />
          
          {/* Additional Report Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">Plant Performance Report</h4>
                <p className="text-sm text-gray-600 mb-3">Detailed analysis of individual plant performance metrics</p>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Generate Report →
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">Emissions Summary</h4>
                <p className="text-sm text-gray-600 mb-3">Comprehensive emissions tracking and trends analysis</p>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Generate Report →
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">Efficiency Analysis</h4>
                <p className="text-sm text-gray-600 mb-3">Plant efficiency benchmarking and optimization recommendations</p>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Generate Report →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};