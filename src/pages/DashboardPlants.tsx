import React from 'react';
import { PlantStatusCard } from '../components/PlantStatusCard';
import { useData } from '../hooks/useData';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, AlertCircle, Upload, Factory } from 'lucide-react';

export const DashboardPlants: React.FC = () => {
  const { csvData } = useAuth();
  const { plantSummaries, loading, error } = useData(csvData);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-lg font-medium text-gray-700">Loading plants...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!csvData || csvData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-6">
            Upload a CSV file in Settings → Data Source to view plant status.
          </p>
          <button
            onClick={() => window.location.href = '/settings'}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  const optimalPlants = plantSummaries.filter(p => p.status === 'optimal').length;
  const warningPlants = plantSummaries.filter(p => p.status === 'warning').length;
  const criticalPlants = plantSummaries.filter(p => p.status === 'critical').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Factory className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Plant Status</h1>
              <p className="text-gray-600 mt-1">Monitor and manage power plant operations</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-600">{optimalPlants} Optimal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-gray-600">{warningPlants} Warning</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-gray-600">{criticalPlants} Critical</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plant Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {plantSummaries.map(plant => (
          <PlantStatusCard key={plant.plant_id} plant={plant} />
        ))}
      </div>

      {/* Plant Details Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Plant Information</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plant Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Output (MWh)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emissions (tonnes)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efficiency (%)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plantSummaries.map((plant) => (
                <tr key={plant.plant_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Factory className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{plant.plant_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {plant.fuel_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                    {plant.total_electricity.toFixed(0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                    {plant.total_emissions.toFixed(0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                    {plant.avg_efficiency.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      plant.status === 'optimal' ? 'bg-green-100 text-green-800' :
                      plant.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {plant.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};