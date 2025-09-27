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
      <div className="relative rounded-lg h-96 overflow-hidden border border-gray-300 shadow-inner">
        {/* Realistic map background with terrain */}
        <div className="absolute inset-0">
          {/* Base terrain layer */}
          <div className="w-full h-full bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100"></div>
          
          {/* Terrain features */}
          <div className="absolute inset-0 opacity-30">
            {/* Mountain ranges */}
            <div className="absolute top-4 left-8 w-32 h-16 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full transform rotate-12 opacity-40"></div>
            <div className="absolute top-12 right-16 w-24 h-12 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full transform -rotate-6 opacity-40"></div>
            
            {/* Rivers/waterways */}
            <div className="absolute top-20 left-0 w-full h-2 bg-gradient-to-r from-transparent via-blue-300 to-transparent transform rotate-3 opacity-50"></div>
            <div className="absolute bottom-16 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-transparent to-blue-200 transform -rotate-1 opacity-40"></div>
            
            {/* Forest areas */}
            <div className="absolute bottom-8 left-12 w-40 h-20 bg-gradient-radial from-green-300 to-green-500 rounded-full opacity-30"></div>
            <div className="absolute top-16 right-8 w-28 h-16 bg-gradient-radial from-green-200 to-green-400 rounded-full opacity-25"></div>
            
            {/* Urban areas */}
            <div className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-400 opacity-20"></div>
          </div>
          
          {/* Grid lines for map authenticity */}
          <div className="absolute inset-0 opacity-10">
            {/* Latitude lines */}
            {[...Array(8)].map((_, i) => (
              <div key={`lat-${i}`} className="absolute w-full h-px bg-gray-400" style={{ top: `${(i + 1) * 12}%` }}></div>
            ))}
            {/* Longitude lines */}
            {[...Array(10)].map((_, i) => (
              <div key={`lng-${i}`} className="absolute h-full w-px bg-gray-400" style={{ left: `${(i + 1) * 10}%` }}></div>
            ))}
          </div>
        </div>

        {/* Factory markers */}
        {factories.map((factory, index) => {
          const x = ((factory.longitude - minLng) / lngRange) * 100;
          const y = ((maxLat - factory.latitude) / latRange) * 100;

          return (
            <div key={index} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}>
              {/* Heat plume effect */}
              <div className={`absolute inset-0 rounded-full blur-md opacity-40 animate-pulse ${
                factory.status === 'red' ? 'bg-red-400 w-16 h-16' :
                factory.status === 'yellow' ? 'bg-yellow-400 w-12 h-12' :
                'bg-green-400 w-8 h-8'
              } transform -translate-x-1/2 -translate-y-1/2`}></div>
              
              {/* Factory marker */}
              <div
                className={`relative cursor-pointer transition-all hover:scale-125 z-10 ${
                  selectedFactory?.factory_name === factory.factory_name ? 'scale-125' : ''
                }`}
                onClick={() => setSelectedFactory(selectedFactory?.factory_name === factory.factory_name ? null : factory)}
              >
                {/* Factory building icon */}
                <div className="relative">
                  <div className={`w-6 h-6 ${getStatusColor(factory.status)} rounded-sm border-2 border-white shadow-lg flex items-center justify-center`}>
                    <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                  </div>
                  {/* Smoke stack */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-gray-600 rounded-t"></div>
                  {/* Heat index label */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                    {factory.heat_index.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Tooltip */}
              {selectedFactory?.factory_name === factory.factory_name && (
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-300 p-4 min-w-56 z-30">
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-300 rotate-45"></div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">{factory.factory_name}</div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>Heat Index: <span className="font-medium">{factory.heat_index.toFixed(1)}</span></div>
                    <div>Efficiency Rank: <span className="font-medium">{factory.efficiency_rank}/{factories.length}</span></div>
                    <div>Coordinates: <span className="font-medium">{factory.latitude.toFixed(3)}, {factory.longitude.toFixed(3)}</span></div>
                    <div>Thermal Value: <span className="font-medium">{factory.thermal_value.toFixed(1)}°C</span></div>
                    <div>Baseline Temp: <span className="font-medium">{factory.baseline_temp.toFixed(1)}°C</span></div>
                    {factory.output_MWh && (
                      <div>Output: <span className="font-medium">{factory.output_MWh.toFixed(0)} MWh</span></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Enhanced map legend */}
        <div className="absolute top-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-300 p-4">
          <div className="text-xs font-semibold text-gray-900 mb-2">Heat Index</div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-green-500 rounded-sm border border-white shadow-sm"></div>
              <span className="text-xs text-gray-700">Low (0-3)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-yellow-500 rounded-sm border border-white shadow-sm"></div>
              <span className="text-xs text-gray-700">Medium (4-6)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-red-500 rounded-sm border border-white shadow-sm"></div>
              <span className="text-xs text-gray-700">High (7-10)</span>
            </div>
          </div>
        </div>
        
        {/* Map coordinates display */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded font-mono">
          {minLat.toFixed(2)}°N, {minLng.toFixed(2)}°E
        </div>
        
        {/* Scale indicator */}
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-px bg-gray-800"></div>
            <span>~50km</span>
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