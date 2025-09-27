import React from 'react';
import { FactoryComparisonBar } from '../components/FactoryComparisonBar';
import { SatelliteHeatTracker } from '../components/SatelliteHeatTracker';
import { RealTimeDataFeed } from '../components/RealTimeDataFeed';
import { PlantStatusCard } from '../components/PlantStatusCard';
import { useData } from '../hooks/useData';
import { Factory, MapPin, Thermometer, Loader2, AlertCircle } from 'lucide-react';

export const Factories: React.FC = () => {
  const { plantSummaries, loading, error } = useData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Loading factories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Factories</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Sample factory data for comparison
  const factoryData = [
    {
      factory_name: "Wärtsilä Vaasa Engine Factory",
      efficiency_pct: 42.0,
      emissions_gCO2_per_kWh: 820,
      output_MWh: 2156, 
      location: "Vaasa, Finland"
    },
    {
      factory_name: "Wärtsilä Turku Shipyard",
      efficiency_pct: 45.0,
      emissions_gCO2_per_kWh: 380,
      output_MWh: 1420,
      location: "Turku, Finland"
    },
    {
      factory_name: "Wärtsilä Trieste Manufacturing",
      efficiency_pct: 48.0,
      emissions_gCO2_per_kWh: 320,
      output_MWh: 1180,
      location: "Trieste, Italy"
    },
    {
      factory_name: "Wärtsilä Zwolle Factory",
      efficiency_pct: 50.0,
      emissions_gCO2_per_kWh: 290,
      output_MWh: 1350,
      location: "Zwolle, Netherlands"
    }
  ];

  // Sample satellite heat data
  const satelliteHeatData = [
    {
      factory_name: "Wärtsilä Vaasa Engine Factory",
      latitude: 63.0960,
      longitude: 21.6158,
      output_MWh: 2156,
      thermal_value: 15.2,
      baseline_temp: 2.1,
      heat_index: 6.8,
      efficiency_rank: 3,
      status: 'yellow' as const,
      status_emoji: '🔴'
    },
    {
      factory_name: "Wärtsilä Turku Shipyard",
      latitude: 60.4518,
      longitude: 22.2666,
      output_MWh: 1420,
      thermal_value: 18.7,
      baseline_temp: 3.5,
      heat_index: 5.2,
      efficiency_rank: 2,
      status: 'yellow' as const,
      status_emoji: '🟡'
    },
    {
      factory_name: "Wärtsilä Trieste Manufacturing",
      latitude: 45.6495,
      longitude: 13.7768,
      output_MWh: 1180,
      thermal_value: 22.4,
      baseline_temp: 12.1,
      heat_index: 3.8,
      efficiency_rank: 1,
      status: 'green' as const,
      status_emoji: '🟢'
    },
    {
      factory_name: "Wärtsilä Zwolle Factory",
      latitude: 52.5168,
      longitude: 6.0830,
      output_MWh: 1350,
      thermal_value: 19.8,
      baseline_temp: 8.2,
      heat_index: 4.7,
      efficiency_rank: 4,
      status: 'yellow' as const,
      status_emoji: '🟡'
    }
  ];

  const optimalPlants = plantSummaries.filter(p => p.status === 'optimal').length;
  const warningPlants = plantSummaries.filter(p => p.status === 'warning').length;
  const criticalPlants = plantSummaries.filter(p => p.status === 'critical').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Factory className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Factory Management</h1>
            <p className="text-gray-600">Monitor and optimize factory performance across all locations</p>
          </div>
        </div>
      </div>

      {/* Factory Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Factory className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Factories</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{factoryData.length}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Optimal</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{optimalPlants}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Warning</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">{warningPlants}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-5 h-5 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Critical</span>
          </div>
          <div className="text-3xl font-bold text-red-600">{criticalPlants}</div>
        </div>
      </div>

      {/* Factory Performance Comparison */}
      <div className="mb-8">
        <FactoryComparisonBar factories={factoryData} />
      </div>

      {/* Real-Time Data Feed */}
      <div className="mb-8">
        <RealTimeDataFeed factories={factoryData.map(f => f.factory_name)} />
      </div>

      {/* Satellite Heat Tracking */}
      <div className="mb-8">
        <SatelliteHeatTracker factories={satelliteHeatData} />
      </div>

      {/* Plant Status Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Plant Status Details</h2>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plantSummaries.map(plant => (
            <PlantStatusCard key={plant.plant_id} plant={plant} />
          ))}
        </div>
      </div>

      {/* Factory Locations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Factory Locations</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {factoryData.map((factory, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Factory className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{factory.factory_name}</h4>
                <p className="text-sm text-gray-600 flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{factory.location}</span>
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>Efficiency: {factory.efficiency_pct}%</span>
                  <span>Output: {factory.output_MWh} MWh</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};