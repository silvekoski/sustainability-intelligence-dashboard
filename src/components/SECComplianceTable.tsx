import React from 'react';
import { SECFacilityData, SECComplianceSummary } from '../types/secCompliance';
import { SECComplianceService } from '../services/secComplianceService';
import { Building, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SECComplianceTableProps {
  facilities: SECFacilityData[];
  summary: SECComplianceSummary;
}

export const SECComplianceTable: React.FC<SECComplianceTableProps> = ({ facilities, summary }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Compliant':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Surplus':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'Shortfall':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'Surplus':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Shortfall':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  if (facilities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No SEC Eligible Facilities</h3>
          <p className="text-gray-600">No facilities meet SEC climate disclosure requirements.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">SEC Climate Disclosure Extract</h3>
            <p className="text-sm text-gray-600">Compliance Summary for SEC Reporting Entities</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Reporting Period</p>
            <p className="font-medium text-gray-900">2025</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {SECComplianceService.formatNumber(summary.totalGHGEmissions, 1)}
            </p>
            <p className="text-sm text-gray-600">Total GHG (tCO₂e)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {SECComplianceService.formatNumber(summary.totalEnergyConsumption)}
            </p>
            <p className="text-sm text-gray-600">Energy (MWh)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {SECComplianceService.formatNumber(summary.weightedRenewableShare, 1)}%
            </p>
            <p className="text-sm text-gray-600">Renewables</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {summary.compliantFacilities}/{summary.facilitiesCount}
            </p>
            <p className="text-sm text-gray-600">Compliant</p>
          </div>
        </div>
      </div>

      {/* Facilities Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Facility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sector
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                GHG Emissions (tCO₂e)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Energy (MWh)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Renewables %
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Allowances
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {facilities.map((facility, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{facility.facility}</div>
                      <div className="text-xs text-gray-500">{facility.sector}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {facility.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {facility.sector.replace('Energy - ', '')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                  {SECComplianceService.formatNumber(facility.emissionsCO2e, 1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                  {SECComplianceService.formatNumber(facility.energyMWh)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                  {facility.renewableShare}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  <div className="font-mono">
                    {SECComplianceService.formatNumber(facility.allowancesUsed)} / {SECComplianceService.formatNumber(facility.allowancesAllocated)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(facility.complianceStatus)}`}>
                    {getStatusIcon(facility.complianceStatus)}
                    <span>{facility.complianceStatus}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed Breakdown */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Emission Breakdown by Gas Type</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CO₂ Direct</span>
              <span className="text-sm font-mono text-gray-900">
                {SECComplianceService.formatNumber(facilities.reduce((sum, f) => sum + f.emissionsCO2, 0), 1)} t
              </span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CH₄ (CO₂e)</span>
              <span className="text-sm font-mono text-gray-900">
                {SECComplianceService.formatNumber(facilities.reduce((sum, f) => sum + (f.emissionsCH4 * 25), 0), 1)} t
              </span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">N₂O (CO₂e)</span>
              <span className="text-sm font-mono text-gray-900">
                {SECComplianceService.formatNumber(facilities.reduce((sum, f) => sum + (f.emissionsN2O * 298), 0), 1)} t
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SEC Notes */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">SEC Disclosure Notes</h4>
        <div className="space-y-2">
          {facilities.map((facility, index) => (
            <div key={index} className="text-xs text-gray-600">
              <span className="font-medium">{facility.facility}:</span> {facility.secNote}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};