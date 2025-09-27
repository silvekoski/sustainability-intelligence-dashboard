import React, { useState, useEffect } from 'react';
import { SECComplianceService } from '../services/secComplianceService';
import { SECComplianceTable } from './SECComplianceTable';
import { FileText, Building, TrendingUp, AlertCircle } from 'lucide-react';
import { PowerPlantData } from '../types';
import { SECComplianceReport } from '../types/secCompliance';

interface SECClimateDisclosureSectionProps {
  currentData?: PowerPlantData[] | null;
}

export const SECClimateDisclosureSection: React.FC<SECClimateDisclosureSectionProps> = ({ currentData }) => {
  const [secReport, setSecReport] = useState<SECComplianceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate SEC compliance report when data changes
  useEffect(() => {
    const generateSecReport = async () => {
      if (!currentData || currentData.length === 0) {
        setSecReport(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const report = SECComplianceService.calculateSECCompliance(currentData);
        setSecReport(report);
      } catch (err) {
        console.error('Error generating SEC report:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate SEC report');
        setSecReport(null);
      } finally {
        setLoading(false);
      }
    };

    generateSecReport();
  }, [currentData]);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <FileText className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">SEC Climate Disclosure Extract</h3>
            <p className="text-sm text-gray-600">US SEC reporting entities and compliance summary</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  // Show no data state
  if (!currentData || currentData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <FileText className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">SEC Climate Disclosure Extract</h3>
            <p className="text-sm text-gray-600">US SEC reporting entities and compliance summary</p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h4>
          <p className="text-gray-600">Upload a CSV file to view SEC climate disclosure information.</p>
        </div>
      </div>
    );
  }

  // Show no SEC eligible facilities
  if (!secReport || secReport.facilities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <FileText className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">SEC Climate Disclosure Extract</h3>
            <p className="text-sm text-gray-600">US SEC reporting entities and compliance summary</p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No SEC Eligible Facilities</h4>
          <p className="text-gray-600">No facilities in the current dataset meet SEC climate disclosure requirements.</p>
          <p className="text-sm text-gray-500 mt-2">
            SEC requirements apply to US public companies and non-US companies with significant US operations.
          </p>
        </div>
      </div>
    );
  }

  // Show SEC compliance table
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">SEC Climate Disclosure Extract</h3>
            <p className="text-sm text-gray-600">US SEC reporting entities and compliance summary</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">
              {secReport.summary.compliantFacilities}/{secReport.summary.facilitiesCount} Compliant
            </span>
          </div>
          <div className="text-gray-500">
            Reporting Period: {secReport.reportingPeriod.year}
          </div>
        </div>
      </div>

      <SECComplianceTable 
        facilities={secReport.facilities} 
        summary={secReport.summary} 
      />
      
      {/* Additional SEC Information */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="font-medium text-blue-900 mb-1">Climate Risks</div>
            <p className="text-blue-700">Physical and transition risks assessed per SEC requirements</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="font-medium text-green-900 mb-1">Financial Impacts</div>
            <p className="text-green-700">Quantified climate-related financial exposures</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="font-medium text-purple-900 mb-1">Scenario Analysis</div>
            <p className="text-purple-700">1.5°C and 3°C pathway analysis with net-zero targets</p>
          </div>
        </div>
      </div>
    </div>
  );
};