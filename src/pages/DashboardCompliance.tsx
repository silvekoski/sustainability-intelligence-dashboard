import React from 'react';
import { EUPermitsCard } from '../components/EUPermitsCard';
import { SECClimateDisclosureSection } from '../components/SECClimateDisclosureSection';
import { AIComplianceAssistant } from '../components/AIComplianceAssistant';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Upload } from 'lucide-react';

export const DashboardCompliance: React.FC = () => {
  const { csvData } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compliance</h1>
            <p className="text-gray-600 mt-1">Multi-jurisdictional regulatory compliance monitoring</p>
          </div>
        </div>
      </div>

      {!csvData || csvData.length === 0 ? (
        <div className="text-center py-16">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-6">
            Upload a CSV file in Settings → Data Source to view compliance information.
          </p>
          <button
            onClick={() => window.location.href = '/settings'}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Settings
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* EU Permits Analysis */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">EU Emissions Trading System</h2>
            <EUPermitsCard />
          </div>

          {/* SEC Climate Disclosure */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">US SEC Climate Disclosure</h2>
            <SECClimateDisclosureSection currentData={csvData} />
          </div>

          {/* AI Compliance Assistant */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Compliance Assistant</h2>
            <AIComplianceAssistant data={csvData} />
          </div>

          {/* Compliance Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-medium text-green-900">EU Frameworks</h4>
                </div>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✓ CSRD Reporting</li>
                  <li>✓ ESRS Standards</li>
                  <li>✓ EU ETS Compliance</li>
                  <li>✓ Data Act Ready</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h4 className="font-medium text-blue-900">US Frameworks</h4>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ SEC Climate Rules</li>
                  <li>✓ GHG Emissions</li>
                  <li>✓ Risk Assessment</li>
                  <li>✓ Financial Impact</li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h4 className="font-medium text-purple-900">Data Management</h4>
                </div>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>✓ Data Interoperability</li>
                  <li>✓ Access Controls</li>
                  <li>✓ Audit Logging</li>
                  <li>✓ Export Ready</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};