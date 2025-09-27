import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EUPermitsService } from '../services/euPermitsService';
import { EUPermit } from '../types/permits';

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

  // Determine status based on permit count
  const getStatus = () => {
    if (permit.active_permits === 0) return { color: 'red', label: 'No Permits', icon: AlertTriangle };
    if (permit.active_permits < 5) return { color: 'yellow', label: 'Low Coverage', icon: AlertTriangle };
    return { color: 'green', label: 'Active', icon: CheckCircle };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">EU Permits</h3>
            <p className="text-sm text-gray-600">
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

      {/* Key Metrics */}
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

      {/* Additional Info */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Permit Year:</span>
          <span className="font-medium text-gray-900">
            {permit.permit_year}
            {!isCurrentYear && (
              <span className="ml-2 text-xs text-orange-600">(Historical)</span>
            )}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Est. Market Value:</span>
          <span className="font-medium text-gray-900">
            €{estimatedValue.toLocaleString()}
          </span>
        </div>

        {permit.notes && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">{permit.notes}</p>
          </div>
        )}
      </div>

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
        </div>
      </div>
    </div>
  );
};