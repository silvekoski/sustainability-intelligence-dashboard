import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface PermitsStatusInput {
  active_permits: number;
  avg_consumption_rate_t_per_month: number;
  current_date?: string;
  target_buffer_months?: number;
  warning_threshold_pct?: number;
  cumulative_emissions_t?: number;
}

interface PermitsStatusOutput {
  active_permits: number;
  total_capacity_t: number;
  months_remaining: number;
  years_remaining: number;
  status: 'Green' | 'Yellow' | 'Red';
  status_emoji: string;
  status_reason: string;
  recommendations: string[];
  error?: string;
}

export const PermitsStatusWidget: React.FC<{ input: PermitsStatusInput }> = ({ input }) => {
  const computePermitsStatus = (input: PermitsStatusInput): PermitsStatusOutput => {
    const {
      active_permits,
      avg_consumption_rate_t_per_month,
      current_date = new Date().toISOString(),
      target_buffer_months = 12,
      warning_threshold_pct = 80,
      cumulative_emissions_t = null
    } = input;

    // Validation
    if (active_permits == null || avg_consumption_rate_t_per_month == null) {
      return {
        active_permits: 0,
        total_capacity_t: 0,
        months_remaining: 0,
        years_remaining: 0,
        status: 'Red',
        status_emoji: '🔴',
        status_reason: '',
        recommendations: [],
        error: 'Insufficient data to calculate permit validity. Please provide active_permits and avg_consumption_rate_t_per_month.'
      };
    }

    if (avg_consumption_rate_t_per_month <= 0) {
      return {
        active_permits: 0,
        total_capacity_t: 0,
        months_remaining: 0,
        years_remaining: 0,
        status: 'Red',
        status_emoji: '🔴',
        status_reason: '',
        recommendations: [],
        error: 'Average consumption must be > 0 tCO₂/month.'
      };
    }

    // Calculations
    const permit_size_t = 100000; // Each permit = 100,000 tCO₂
    const total_capacity_t = active_permits * permit_size_t;
    const months_remaining = total_capacity_t / avg_consumption_rate_t_per_month;
    const years_remaining = months_remaining / 12;

    // Status determination
    let status: 'Green' | 'Yellow' | 'Red' = 'Green';
    let status_emoji = '🟢';
    let status_reason = '';

    if (months_remaining <= 12) {
      status = 'Red';
      status_emoji = '🔴';
      status_reason = 'validity ≤ 12 months';
    } else if (months_remaining <= 24) {
      status = 'Yellow';
      status_emoji = '🟡';
      status_reason = 'validity between 12–24 months';
    } else {
      status = 'Green';
      status_emoji = '🟢';
      status_reason = 'validity > 24 months';
    }

    // Recommendations
    const recommendations: string[] = [];
    
    if (status === 'Red') {
      const months_to_buffer = target_buffer_months;
      const total_needed_months = months_to_buffer + months_remaining;
      const total_needed_capacity = total_needed_months * avg_consumption_rate_t_per_month;
      const needed_permits = Math.ceil((total_needed_capacity - total_capacity_t) / permit_size_t);
      
      if (active_permits === 0) {
        recommendations.push('Procure permits immediately — no active permits available.');
      } else {
        recommendations.push(`At the current usage rate, buy ${needed_permits} permit${needed_permits > 1 ? 's' : ''} within ${months_to_buffer} months to maintain a ${target_buffer_months}-month buffer.`);
      }
    } else if (status === 'Yellow') {
      const needed_for_24_months = 24 * avg_consumption_rate_t_per_month;
      const needed_permits = Math.ceil((needed_for_24_months - total_capacity_t) / permit_size_t);
      
      recommendations.push(`Buy ${needed_permits} additional permit${needed_permits > 1 ? 's' : ''} to extend coverage beyond 24 months.`);
      recommendations.push('Evaluate a 10% usage reduction to gain ~2 months of runway.');
    } else {
      recommendations.push('Revisit average consumption quarterly; set auto-alert at 80% capacity used.');
      if (years_remaining < 5) {
        recommendations.push('Consider long-term procurement strategy for sustained operations.');
      }
    }

    // Add capacity warning if applicable
    if (cumulative_emissions_t && cumulative_emissions_t > 0) {
      const consumed_pct = (cumulative_emissions_t / total_capacity_t) * 100;
      if (consumed_pct >= warning_threshold_pct) {
        recommendations.unshift(`Warning: ${consumed_pct.toFixed(1)}% of capacity already consumed.`);
      }
    }

    return {
      active_permits,
      total_capacity_t,
      months_remaining,
      years_remaining,
      status,
      status_emoji,
      status_reason,
      recommendations
    };
  };

  const result = computePermitsStatus(input);

  // Format numbers with thousand separators
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatYears = (years: number): string => {
    if (years > 10) return '>10 years';
    return `${years.toFixed(1)} years`;
  };

  // Error state
  if (result.error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <XCircle className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-bold text-gray-900">Permits Status</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{result.error}</p>
        </div>
      </div>
    );
  }

  // Status icon component
  const getStatusIcon = () => {
    switch (result.status) {
      case 'Green':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'Yellow':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'Red':
        return <XCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (result.status) {
      case 'Green':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'Yellow':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Red':
        return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        {getStatusIcon()}
        <h3 className="text-lg font-bold text-gray-900">Permits Status</h3>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Active Permits</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(result.active_permits)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Capacity</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(result.total_capacity_t)} tCO₂</p>
        </div>
      </div>

      {/* Predicted Validity */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Predicted Validity</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{formatYears(result.years_remaining)}</p>
      </div>

      {/* Status */}
      <div className={`rounded-lg border p-4 mb-6 ${getStatusColor()}`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{result.status_emoji}</span>
          <div>
            <p className="font-semibold">{result.status}</p>
            <p className="text-sm">{result.status_reason}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
        <ul className="space-y-2">
          {result.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-gray-400 mt-1">•</span>
              <span className="text-sm text-gray-700">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};