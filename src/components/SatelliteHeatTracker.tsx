import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Thermometer, Satellite, Info, Eye, EyeOff } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Process and sort factories by efficiency rank
  const processedFactories = factories
    .map((factory, index) => ({
      ...factory,
      efficiency_rank: index + 1 // This would be calculated based on output/heat_index in real implementation
    }))
    .sort((a, b) => a.efficiency_rank - b.efficiency_rank);

  // Initialize Leaflet map
  useEffect(() => {
    if (!showMap || !mapRef.current || mapInstanceRef.current) return;

    // Create map centered on Europe (good view for global factories)
    const map = L.map(mapRef.current).setView([50.0, 10.0], 3);

    // Add OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showMap]);

  // Add factory markers to map
  useEffect(() => {
    if (!mapInstanceRef.current || !showMap) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    factories.forEach((factory) => {
      if (!mapInstanceRef.current) return;

      // Create custom icon based on status
      const getMarkerColor = (status: string) => {
        switch (status) {
          case 'green': return '#10b981';
          case 'yellow': return '#f59e0b';
          case 'red': return '#ef4444';
          default: return '#6b7280';
        }
      };

      // Create custom HTML marker
      const customIcon = L.divIcon({
        html: `
          <div style="position: relative;">
            <!-- Heat plume effect -->
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: ${factory.heat_index * 4 + 20}px;
              height: ${factory.heat_index * 4 + 20}px;
              background: ${getMarkerColor(factory.status)};
              border-radius: 50%;
              opacity: 0.3;
              filter: blur(8px);
              animation: pulse 2s infinite;
            "></div>
            
            <!-- Factory marker -->
            <div style="
              position: relative;
              width: 24px;
              height: 24px;
              background: ${getMarkerColor(factory.status)};
              border: 3px solid white;
              border-radius: 4px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10;
            ">
              <div style="
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                opacity: 0.9;
              "></div>
            </div>
            
            <!-- Smoke stack -->
            <div style="
              position: absolute;
              top: -8px;
              left: 50%;
              transform: translateX(-50%);
              width: 4px;
              height: 12px;
              background: #4b5563;
              border-radius: 2px 2px 0 0;
            "></div>
            
            <!-- Heat index label -->
            <div style="
              position: absolute;
              top: 32px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0,0,0,0.8);
              color: white;
              font-size: 10px;
              padding: 2px 4px;
              border-radius: 3px;
              white-space: nowrap;
              font-family: monospace;
            ">
              HI: ${factory.heat_index.toFixed(1)}
            </div>
          </div>
          
          <style>
            @keyframes pulse {
              0% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
              50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.2; }
              100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
            }
          </style>
        `,
        className: 'custom-factory-marker',
        iconSize: [40, 60],
        iconAnchor: [20, 30],
      });

      const marker = L.marker([factory.latitude, factory.longitude], {
        icon: customIcon
      }).addTo(mapInstanceRef.current);

      // Add popup
      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #1f2937;">
            ${factory.factory_name}
          </div>
          <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">
            <div><strong>Heat Index:</strong> ${factory.heat_index.toFixed(1)}/10</div>
            <div><strong>Efficiency Rank:</strong> #${factory.efficiency_rank}/${factories.length}</div>
            <div><strong>Coordinates:</strong> ${factory.latitude.toFixed(3)}, ${factory.longitude.toFixed(3)}</div>
            <div><strong>Thermal Value:</strong> ${factory.thermal_value.toFixed(1)}°C</div>
            <div><strong>Baseline Temp:</strong> ${factory.baseline_temp.toFixed(1)}°C</div>
            ${factory.output_MWh ? `<div><strong>Output:</strong> ${factory.output_MWh.toFixed(0)} MWh</div>` : ''}
          </div>
          <div style="margin-top: 8px; padding: 4px 8px; background: ${
            factory.status === 'green' ? '#dcfce7' : 
            factory.status === 'yellow' ? '#fef3c7' : '#fee2e2'
          }; border-radius: 4px; font-size: 11px; text-align: center;">
            ${factory.status_emoji} ${
              factory.status === 'green' ? 'Efficient' :
              factory.status === 'yellow' ? 'Average' : 'Needs Attention'
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Handle marker click
      marker.on('click', () => {
        setSelectedFactory(factory);
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all factories
    if (factories.length > 0) {
      const group = new L.FeatureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [factories, showMap]);

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

      {/* Interactive Leaflet Map */}
      {showMap && (
        <div className="mb-6">
          <div 
            ref={mapRef} 
            className="h-96 rounded-lg border border-gray-300 shadow-inner"
            style={{ minHeight: '400px' }}
          />
          
          {/* Map Legend */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-green-500 rounded-sm border border-white shadow-sm"></div>
                <span className="text-gray-700">Low Heat (0-3)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-yellow-500 rounded-sm border border-white shadow-sm"></div>
                <span className="text-gray-700">Medium Heat (4-6)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-red-500 rounded-sm border border-white shadow-sm"></div>
                <span className="text-gray-700">High Heat (7-10)</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Data: Sentinel-3 SLSTR, Landsat TIRS
            </div>
          </div>
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