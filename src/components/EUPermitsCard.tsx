import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, Loader2, Clock, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EUPermitsService } from '../services/euPermitsService';
import { EUPermit, PermitsData } from '../types/permits';
import { PermitsService } from '../services/permitsService';

export const EUPermitsCard: React.FC = () => {
  const [permit, setPermit] = useState<EUPermit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadPermitData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await EUPermitsService.getCurrentYearPermit(user.id);
        if (error) {
          setError(error.message);
        } else {
          setPermit(data);
        }
      } catch (err) {
        setError('Failed to load permit data');
      } finally {
        setLoading(false);
      }
    };

    loadPermitData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">EU Permits</h3>
            <p className="text-sm text-gray-600">Error loading data</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Shield className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">EU Permits</h3>
            <p className="text-sm text-gray-600">No permit data available</p>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-3">No EU emissions permits configured</p>
          <p className="text-xs text-gray-500">
            Configure your permits in Account Settings to see status information
          </p>
        </div>
      </div>
    );
  }

  // Calculate permit metrics
  const totalCapacity = permit.active_permits * 100000; // 100,000 tCO₂ per permit
  const estimatedValue = totalCapacity * 85; // €85 per tCO₂
  const currentYear = new Date().getFullYear();
  const isCurrentYear = permit.permit_year === currentYear;

  // Calculate permits analysis using the actual permit data
  const permitsData: PermitsData = {
    active_permits: permit.active_permits,
    avg_consumption_rate_t_per_month: 32000, // Default consumption rate
    current_date: new Date().toISOString(),
    target_buffer_months: 12,
    warning_threshold_pct: 80,
    cumulative_emissions_t: totalCapacity * 0.512 // Simulate 51.2% usage
  };

  const permitsStatus = PermitsService.calculatePermitsStatus(permitsData);

  // Determine status based on permit count
  const getStatus = () => {
    if (!permitsStatus.isValid || !permitsStatus.data) {
      return { color: 'red', label: 'No Data', icon: AlertTriangle };
    }
    
    const status = permitsStatus.data.status_light;
    if (status === 'red') return { color: 'red', label: 'Critical', icon: AlertTriangle };
    if (status === 'yellow') return { color: 'yellow', label: 'Warning', icon: AlertTriangle };
    return { color: 'green', label: 'Active', icon: CheckCircle };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  if (!permitsStatus.isValid || !permitsStatus.data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">EU Permits</h3>
              <p className="text-sm text-gray-600">Emissions Trading System</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">Unable to calculate permit analysis</p>
        </div>
      </div>
    );
  }

  const calc = permitsStatus.data;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">EU Permits</h3>
            <p className="text-sm text-gray-600 mb-1">
              {permit.company_name || 'Emissions Trading System'}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
          status.color === 'green' ? 'bg-green-100 text-green-700' :
          status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{status.label}</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {permit.active_permits.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Active Permits</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {totalCapacity.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">tCO₂ Capacity</p>
        </div>
      </div>

      {/* Detailed Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Predictions */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Predicted Validity</h4>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {calc.years_remaining.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500">years</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Capacity Used</h4>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {calc.consumed_pct?.toFixed(1) || '0.0'}%
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  calc.status_light === 'green' ? 'bg-green-500' :
                  calc.status_light === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(calc.consumed_pct || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Status & Value */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Permit Year</h4>
            <p className="text-xl font-bold text-gray-900">
              {permit.permit_year}
              {!isCurrentYear && (
                <span className="ml-2 text-sm text-orange-600">(Historical)</span>
              )}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Est. Market Value</h4>
            <p className="text-xl font-bold text-gray-900">
              €{estimatedValue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      <div className={`rounded-lg p-4 mb-6 ${
        calc.status_light === 'green' ? 'bg-green-50 border border-green-200' :
        calc.status_light === 'yellow' ? 'bg-yellow-50 border border-yellow-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center space-x-3">
          <StatusIcon className={`w-5 h-5 ${
            calc.status_light === 'green' ? 'text-green-600' :
            calc.status_light === 'yellow' ? 'text-yellow-600' :
            'text-red-600'
          }`} />
          <span className={`text-sm font-medium ${
            calc.status_light === 'green' ? 'text-green-900' :
            calc.status_light === 'yellow' ? 'text-yellow-900' :
            'text-red-900'
          }`}>
            {PermitsService.getStatusLabel(calc.status_light, calc.years_remaining)}
          </span>
        </div>
      </div>

      {/* Recommendations */}
      {permitsStatus.recommendations.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Recommendations</h4>
          </div>
          <ul className="space-y-2">
            {permitsStatus.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-blue-800">
                <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full ${
            status.color === 'green' ? 'bg-green-500' :
            status.color === 'yellow' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <span>
            Last updated: {new Date(permit.updated_at).toLocaleDateString()}
          </span>
          {permit.notes && (
            <>
              <span className="mx-2">•</span>
              <span className="italic">
                {permit.notes.length > 50 ? `${permit.notes.substring(0, 50)}...` : permit.notes}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};