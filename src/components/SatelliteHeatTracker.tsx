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

    // World map bounds (Web Mercator projection approximation)
    const worldBounds = {
      minLat: -85,
      maxLat: 85,
      minLng: -180,
      maxLng: 180
    };
    
    // Convert lat/lng to pixel coordinates
    const latToY = (lat: number) => {
      const latRad = (lat * Math.PI) / 180;
      const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
      return (1 - (mercN / Math.PI)) * 50; // Scale to 0-100%
    };
    
    const lngToX = (lng: number) => {
      return ((lng + 180) / 360) * 100; // Scale to 0-100%
    };

    return (
      <div className="relative rounded-lg h-96 overflow-hidden border border-gray-300 shadow-inner bg-blue-100">
        {/* World map base layer */}
        <div className="absolute inset-0">
          {/* Ocean base */}
          <div className="w-full h-full bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400"></div>
          
          {/* Continental landmasses (simplified) */}
          <div className="absolute inset-0">
            {/* North America */}
            <div className="absolute bg-gradient-to-br from-green-200 to-green-400 rounded-lg opacity-80"
                 style={{ 
                   left: '10%', top: '15%', 
                   width: '25%', height: '35%',
                   clipPath: 'polygon(20% 0%, 100% 0%, 95% 70%, 80% 100%, 0% 90%, 5% 40%)'
                 }}>
            </div>
            
            {/* South America */}
            <div className="absolute bg-gradient-to-br from-green-300 to-yellow-400 rounded-lg opacity-80"
                 style={{ 
                   left: '20%', top: '50%', 
                   width: '15%', height: '40%',
                   clipPath: 'polygon(30% 0%, 100% 10%, 80% 100%, 0% 90%, 10% 30%)'
                 }}>
            </div>
            
            {/* Europe */}
            <div className="absolute bg-gradient-to-br from-green-200 to-yellow-300 rounded-lg opacity-80"
                 style={{ 
                   left: '48%', top: '20%', 
                   width: '12%', height: '20%',
                   clipPath: 'polygon(0% 40%, 80% 0%, 100% 60%, 60% 100%, 20% 80%)'
                 }}>
            </div>
            
            {/* Africa */}
            <div className="absolute bg-gradient-to-br from-yellow-300 to-orange-400 rounded-lg opacity-80"
                 style={{ 
                   left: '45%', top: '35%', 
                   width: '15%', height: '35%',
                   clipPath: 'polygon(40% 0%, 100% 20%, 90% 100%, 10% 95%, 0% 60%, 20% 10%)'
                 }}>
            </div>
            
            {/* Asia */}
            <div className="absolute bg-gradient-to-br from-green-300 to-yellow-400 rounded-lg opacity-80"
                 style={{ 
                   left: '60%', top: '10%', 
                   width: '35%', height: '45%',
                   clipPath: 'polygon(0% 30%, 70% 0%, 100% 40%, 90% 80%, 60% 100%, 20% 90%, 10% 60%)'
                 }}>
            </div>
            
            {/* Australia */}
            <div className="absolute bg-gradient-to-br from-orange-300 to-red-400 rounded-lg opacity-80"
                 style={{ 
                   left: '75%', top: '65%', 
                   width: '12%', height: '15%',
                   clipPath: 'polygon(20% 30%, 100% 0%, 90% 100%, 0% 80%)'
                 }}>
            </div>
          </div>
          
          {/* Geographic features overlay */}
          <div className="absolute inset-0 opacity-40">
            {/* Mountain ranges - Himalayas */}
            <div className="absolute bg-gradient-to-b from-gray-400 to-gray-600 rounded-full transform rotate-12"
                 style={{ left: '70%', top: '25%', width: '15%', height: '8%' }}>
            </div>
            
            {/* Rocky Mountains */}
            <div className="absolute bg-gradient-to-b from-gray-300 to-gray-500 rounded-full transform rotate-45"
                 style={{ left: '15%', top: '20%', width: '3%', height: '25%' }}>
            </div>
            
            {/* Andes */}
            <div className="absolute bg-gradient-to-b from-gray-400 to-gray-600 rounded-full transform rotate-12"
                 style={{ left: '22%', top: '50%', width: '2%', height: '35%' }}>
            </div>
            
            {/* Major rivers - Amazon */}
            <div className="absolute h-1 bg-blue-400 transform rotate-6 opacity-60"
                 style={{ left: '20%', top: '60%', width: '12%' }}>
            </div>
            
            {/* Nile */}
            <div className="absolute h-1 bg-blue-400 transform -rotate-12 opacity-60"
                 style={{ left: '52%', top: '40%', width: '8%' }}>
            </div>
            
            {/* Sahara Desert */}
            <div className="absolute bg-gradient-radial from-yellow-400 to-orange-500 rounded-full opacity-30"
                 style={{ left: '45%', top: '35%', width: '12%', height: '10%' }}>
            </div>
            
            {/* Amazon Rainforest */}
            <div className="absolute bg-gradient-radial from-green-400 to-green-600 rounded-full opacity-40"
                 style={{ left: '18%', top: '55%', width: '15%', height: '12%' }}>
            </div>
          </div>
          
          {/* Latitude/Longitude grid */}
          <div className="absolute inset-0 opacity-10">
            {/* Latitude lines (horizontal) */}
            {[-60, -30, 0, 30, 60].map((lat, i) => (
              <div key={`lat-${lat}`} className="absolute w-full h-px bg-gray-600" 
                   style={{ top: `${latToY(lat)}%` }}>
                <span className="absolute left-2 -top-2 text-xs text-gray-600 font-mono">
                  {lat}°
                </span>
              </div>
            ))}
            {/* Longitude lines (vertical) */}
            {[-120, -60, 0, 60, 120].map((lng, i) => (
              <div key={`lng-${lng}`} className="absolute h-full w-px bg-gray-600" 
                   style={{ left: `${lngToX(lng)}%` }}>
                <span className="absolute -bottom-4 -left-3 text-xs text-gray-600 font-mono">
                  {lng}°
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Factory markers */}
        {factories.map((factory, index) => {
          const x = lngToX(factory.longitude);
          const y = latToY(factory.latitude);

          return (
            <div key={index} className="absolute transform -translate-x-1/2 -translate-y-1/2" 
                 style={{ left: `${Math.max(2, Math.min(98, x))}%`, top: `${Math.max(2, Math.min(98, y))}%` }}>
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
                    HI: {factory.heat_index.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Tooltip */}
              {selectedFactory?.factory_name === factory.factory_name && (
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-300 p-4 min-w-56 z-30">
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-300 rotate-45 z-20"></div>
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

        {/* Map legend */}
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
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded font-mono flex items-center space-x-2">
          <span>🌍</span>
          <span>World Map View</span>
        </div>
        
        {/* Scale and projection info */}
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-px bg-gray-800"></div>
            <span>Web Mercator</span>
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