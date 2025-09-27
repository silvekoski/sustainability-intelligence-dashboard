import React, { useState, useEffect } from 'react';
import { MapPin, Thermometer, Satellite, Info, Eye, EyeOff } from 'lucide-react';

interface FactoryHeatData {
  factory_name: string;
  latitude: number;
  longitude: number;
  output_MWh?: number;
  thermal_value: number; // Raw thermal band value from satellite
  baseline_temp: number; // Local background temperature
  heat_index: number; // Calculated 0-10 scale
  efficiency_rank: number;
  status: 'green' | 'yellow' | 'red';
  status_emoji: string;
}

interface SatelliteHeatTrackerProps {
  factories: FactoryHeatData[];
}

export const SatelliteHeatTracker: React.FC<SatelliteHeatTrackerProps> = ({ factories }) => {
  const [showMap, setShowMap] = useState(true);
  const [selectedFactory, setSelectedFactory] = useState<FactoryHeatData | null>(null);

  // Process and sort factories by efficiency rank
  const processedFactories = factories
    .map((factory, index) => ({
      ...factory,
      efficiency_rank: index + 1 // This would be calculated based on output/heat_index in real implementation
    }))
    .sort((a, b) => a.efficiency_rank - b.efficiency_rank);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'green': return 'border-green-200 bg-green-50';
      case 'yellow': return 'border-yellow-200 bg-yellow-50';
      case 'red': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  // Simple map visualization (in production, you'd use Leaflet/Mapbox)
  const MapVisualization = () => {
    if (!factories.length) return null;

    // Calculate bounds for the map
    const lats = factories.map(f => f.latitude);
    const lngs = factories.map(f => f.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    return (
      <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-80 overflow-hidden border border-gray-200">
        {/* Map background */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-green-200 via-blue-200 to-gray-200"></div>
        </div>

        {/* Factory markers */}
        {factories.map((factory, index) => {
          const x = ((factory.longitude - minLng) / lngRange) * 100;
          const y = ((maxLat - factory.latitude) / latRange) * 100;

          return (
            <div
              key={index}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-125 ${
                selectedFactory?.factory_name === factory.factory_name ? 'scale-125 z-10' : ''
              }`}
              style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}
              onClick={() => setSelectedFactory(selectedFactory?.factory_name === factory.factory_name ? null : factory)}
            >
              {/* Heat circle */}
              <div className={`w-8 h-8 rounded-full ${getStatusColor(factory.status)} opacity-80 animate-pulse`}>
                <div className="w-full h-full rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{factory.heat_index.toFixed(1)}</span>
                </div>
              </div>

              {/* Tooltip */}
              {selectedFactory?.factory_name === factory.factory_name && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-48 z-20">
                  <div className="text-sm font-semibold text-gray-900 mb-2">{factory.factory_name}</div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>Heat Index: <span className="font-medium">{factory.heat_index.toFixed(1)}</span></div>
                    <div>Efficiency Rank: <span className="font-medium">{factory.efficiency_rank}/{factories.length}</span></div>
                    <div>Coordinates: <span className="font-medium">{factory.latitude.toFixed(3)}, {factory.longitude.toFixed(3)}</span></div>
                    {factory.output_MWh && (
                      <div>Output: <span className="font-medium">{factory.output_MWh.toFixed(0)} MWh</span></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Map legend */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="text-xs font-semibold text-gray-900 mb-2">Heat Index</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">Low (0-3)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-600">Medium (4-6)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">High (7-10)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!factories.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Satellite className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">Satellite Factory Heat Tracker</h3>
        </div>
        <div className="text-center py-8">
          <Thermometer className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No satellite heat data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Satellite className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Satellite Factory Heat Tracker</h3>
            <p className="text-sm text-gray-500">Thermal efficiency monitoring via satellite imagery</p>
          </div>
        </div>
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {showMap ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
        </button>
      </div>

      {/* Map Overlay */}
      {showMap && (
        <div className="mb-6">
          <MapVisualization />
        </div>
      )}

      {/* Comparison Bar */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
          <Thermometer className="w-5 h-5 text-orange-500" />
          <span>Heat Index Comparison</span>
        </h4>

        {processedFactories.map((factory, index) => (
          <div
            key={index}
            className={`border-2 rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${getStatusBorder(factory.status)} ${
              selectedFactory?.factory_name === factory.factory_name ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedFactory(selectedFactory?.factory_name === factory.factory_name ? null : factory)}
          >
            {/* Factory header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getStatusColor(factory.status)}`}></div>
                <div>
                  <h5 className="font-bold text-gray-900">{factory.factory_name}</h5>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>{factory.latitude.toFixed(3)}, {factory.longitude.toFixed(3)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl">{factory.status_emoji}</div>
                <div className="text-xs text-gray-500">Rank #{factory.efficiency_rank}</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{factory.heat_index.toFixed(1)}</div>
                <div className="text-xs text-gray-500">Heat Index</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">#{factory.efficiency_rank}</div>
                <div className="text-xs text-gray-500">Efficiency Rank</div>
              </div>
              {factory.output_MWh && (
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{factory.output_MWh.toFixed(0)}</div>
                  <div className="text-xs text-gray-500">Output MWh</div>
                </div>
              )}
            </div>

            {/* Heat visualization bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Thermal Intensity</span>
                <span className="text-sm text-gray-500">{factory.heat_index.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    factory.heat_index <= 3 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    factory.heat_index <= 6 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ width: `${(factory.heat_index / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Additional details when selected */}
            {selectedFactory?.factory_name === factory.factory_name && (
              <div className="bg-white rounded-lg border border-gray-200 p-3 mt-3">
                <h6 className="font-semibold text-gray-900 mb-2">Satellite Data Details</h6>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Thermal Value:</span>
                    <span className="font-medium ml-2">{factory.thermal_value.toFixed(1)}°C</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Baseline Temp:</span>
                    <span className="font-medium ml-2">{factory.baseline_temp.toFixed(1)}°C</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Heat Anomaly:</span>
                    <span className="font-medium ml-2">+{(factory.thermal_value - factory.baseline_temp).toFixed(1)}°C</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Data Source:</span>
                    <span className="font-medium ml-2">Sentinel-3 SLSTR</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h6 className="font-semibold text-blue-900 mb-1">Data Disclaimer</h6>
            <p className="text-sm text-blue-800">
              Heat tracking is based on open satellite data (Sentinel-3, Landsat) and provides approximate 
              efficiency and emission levels. Resolution is 100m–1km pixel accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};