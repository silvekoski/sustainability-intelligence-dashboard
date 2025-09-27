import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { PermitsData } from '../types/permits';
import { PermitsService } from '../services/permitsService';

interface PermitsStatusWidgetProps {
  data: PermitsData;
}

export const PermitsStatusWidget: React.FC<PermitsStatusWidgetProps> = ({ data }) => {
  const status = PermitsService.calculatePermitsStatus(data);

  if (!status.isValid) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Permits Status</h3>
            <p className="text-sm text-gray-600">EU Emission Reporting Standards (2025)</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{status.error}</p>
        </div>
      </div>
    );
  }

  const calc = status.data!;
  const statusIcon = calc.status_light === 'green' ? CheckCircle : 
                    calc.status_light === 'yellow' ? AlertTriangle : XCircle;
  const statusColor = calc.status_light === 'green' ? 'text-green-600' : 
                     calc.status_light === 'yellow' ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Permits Status</h3>
          <p className="text-sm text-gray-600">EU Emission Reporting Standards (2025)</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Active Permits:</span>
          <span className="text-lg font-bold text-gray-900">
            {PermitsService.formatNumber(data.active_permits)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Total Capacity:</span>
          <span className="text-lg font-bold text-gray-900">
            {PermitsService.formatNumber(calc.total_capacity_t)} tCO₂
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Predicted Validity:</span>
          <span className="text-lg font-bold text-gray-900">
            {PermitsService.formatYears(calc.years_remaining)} years
          </span>
        </div>

        {calc.consumed_pct !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Capacity Used:</span>
            <span className="text-lg font-bold text-gray-900">
              {calc.consumed_pct.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          {React.createElement(statusIcon, { className: `w-5 h-5 ${statusColor}` })}
          <span className="text-sm font-medium text-gray-900">
            {PermitsService.getStatusLabel(calc.status_light, calc.years_remaining)}
          </span>
        </div>
      </div>

      {/* Recommendations */}
      {status.recommendations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Recommendations:</h4>
          <ul className="space-y-2">
            {status.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Consumption Rate Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Based on average consumption rate of {PermitsService.formatNumber(data.avg_consumption_rate_t_per_month)} tCO₂/month
        </p>
      </div>
    </div>
  );
};