import React from 'react';
import { PermitsStatusWidget } from '../components/PermitsStatusWidget';
import { useData } from '../hooks/useData';
import { Shield, Calendar, AlertTriangle, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';

export const Permits: React.FC = () => {
  const { metrics, loading, error } = useData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Loading permits...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Permits</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Sample permits data
  const permitsData = {
    active_permits: 5,
    avg_consumption_rate_t_per_month: 32000,
    target_buffer_months: 12,
    warning_threshold_pct: 80,
    cumulative_emissions_t: metrics.totalEmissions
  };

  // Sample permit history data
  const permitHistory = [
    {
      id: 1,
      permit_number: "EU-ETS-2024-001",
      type: "EU Emissions Trading System",
      quantity: 100000,
      purchase_date: "2024-01-15",
      expiry_date: "2024-12-31",
      status: "active",
      cost: 8500000,
      used: 75000
    },
    {
      id: 2,
      permit_number: "EU-ETS-2024-002",
      type: "EU Emissions Trading System",
      quantity: 100000,
      purchase_date: "2024-03-20",
      expiry_date: "2024-12-31",
      status: "active",
      cost: 8750000,
      used: 45000
    },
    {
      id: 3,
      permit_number: "EU-ETS-2024-003",
      type: "EU Emissions Trading System",
      quantity: 100000,
      purchase_date: "2024-06-10",
      expiry_date: "2024-12-31",
      status: "active",
      cost: 9200000,
      used: 20000
    },
    {
      id: 4,
      permit_number: "EU-ETS-2024-004",
      type: "EU Emissions Trading System",
      quantity: 100000,
      purchase_date: "2024-09-05",
      expiry_date: "2024-12-31",
      status: "active",
      cost: 9500000,
      used: 5000
    },
    {
      id: 5,
      permit_number: "EU-ETS-2024-005",
      type: "EU Emissions Trading System",
      quantity: 100000,
      purchase_date: "2024-11-15",
      expiry_date: "2024-12-31",
      status: "active",
      cost: 9800000,
      used: 0
    }
  ];

  const totalPermits = permitHistory.reduce((sum, permit) => sum + permit.quantity, 0);
  const totalUsed = permitHistory.reduce((sum, permit) => sum + permit.used, 0);
  const totalCost = permitHistory.reduce((sum, permit) => sum + permit.cost, 0);
  const utilizationRate = (totalUsed / totalPermits) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expiring':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Permits Management</h1>
            <p className="text-gray-600">Monitor and manage carbon emission permits and compliance</p>
          </div>
        </div>
      </div>

      {/* Permits Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Active Permits</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{permitsData.active_permits}</div>
          <p className="text-sm text-gray-500 mt-1">500,000 tCO₂ total capacity</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Utilization Rate</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{utilizationRate.toFixed(1)}%</div>
          <p className="text-sm text-gray-500 mt-1">{totalUsed.toLocaleString()} tCO₂ used</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Months Remaining</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">15.6</div>
          <p className="text-sm text-gray-500 mt-1">At current usage rate</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">€</span>
            </div>
            <span className="text-sm font-medium text-gray-600">Total Investment</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">{formatCurrency(totalCost)}</div>
          <p className="text-sm text-gray-500 mt-1">2024 permit purchases</p>
        </div>
      </div>

      {/* Permits Status Widget */}
      <div className="mb-8">
        <PermitsStatusWidget input={permitsData} />
      </div>

      {/* Permits History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Permit Portfolio</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Purchase New Permits
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Permit Number</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Quantity</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Used</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Remaining</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Purchase Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Expiry</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Cost</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {permitHistory.map((permit) => (
                <tr key={permit.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{permit.permit_number}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600">{permit.type}</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-medium text-gray-900">{permit.quantity.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">tCO₂</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-medium text-gray-900">{permit.used.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">tCO₂</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-medium text-gray-900">{(permit.quantity - permit.used).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">tCO₂</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600">{formatDate(permit.purchase_date)}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600">{formatDate(permit.expiry_date)}</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-medium text-gray-900">{formatCurrency(permit.cost)}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(permit.status)}
                      <span className="text-sm capitalize text-gray-600">{permit.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Compliance Status</h3>
            <p className="text-gray-600">Current regulatory compliance overview</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">EU ETS Compliance</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              All emissions are covered by valid permits. Current buffer provides 15.6 months of coverage.
            </p>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Compliant
            </span>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <h4 className="font-semibold text-gray-900">Renewal Timeline</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Next permit renewal required by December 31, 2024. Recommend purchasing additional permits by Q4.
            </p>
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              Action Required
            </span>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Risk Assessment</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Low compliance risk. Current permit portfolio covers projected emissions with adequate buffer.
            </p>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Low Risk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};