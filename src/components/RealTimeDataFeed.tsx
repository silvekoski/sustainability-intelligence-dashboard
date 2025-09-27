import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, Zap, Thermometer, Gauge, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface RealTimeData {
  factory_id: string;
  factory_name: string;
  timestamp: string;
  power_output_MW: number;
  efficiency_pct: number;
  temperature_C: number;
  emissions_rate_kg_per_hour: number;
  fuel_consumption_rate: number;
  status: 'online' | 'offline' | 'maintenance';
  alerts: string[];
}

interface RealTimeDataFeedProps {
  factories: string[];
}

export const RealTimeDataFeed: React.FC<RealTimeDataFeedProps> = ({ factories }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [liveData, setLiveData] = useState<RealTimeData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate real-time data updates
  useEffect(() => {
    const generateRealTimeData = (): RealTimeData[] => {
      return factories.map((factory, index) => {
        const baseEfficiency = 42 + (index * 2); // Different base efficiency per factory
        const timeVariation = Math.sin(Date.now() / 60000) * 5; // Slow sine wave variation
        const randomVariation = (Math.random() - 0.5) * 3; // Small random variation
        
        return {
          factory_id: `factory_${index + 1}`,
          factory_name: factory,
          timestamp: new Date().toISOString(),
          power_output_MW: Math.max(0, 150 + Math.random() * 100 + timeVariation * 10),
          efficiency_pct: Math.max(30, Math.min(55, baseEfficiency + timeVariation + randomVariation)),
          temperature_C: 85 + Math.random() * 20 + timeVariation * 2,
          emissions_rate_kg_per_hour: 450 + Math.random() * 200 + timeVariation * 50,
          fuel_consumption_rate: 180 + Math.random() * 40 + timeVariation * 15,
          status: Math.random() > 0.95 ? 'maintenance' : Math.random() > 0.02 ? 'online' : 'offline',
          alerts: Math.random() > 0.8 ? ['High temperature detected'] : Math.random() > 0.9 ? ['Efficiency below threshold'] : []
        };
      });
    };

    // Initial data
    setLiveData(generateRealTimeData());

    // Update every 2 seconds
    const interval = setInterval(() => {
      if (isConnected) {
        setLiveData(generateRealTimeData());
        setLastUpdate(new Date());
      }
    }, 2000);

    // Simulate occasional connection issues
    const connectionInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 3000);
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(connectionInterval);
    };
  }, [factories, isConnected]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'maintenance':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-50 border-green-200';
      case 'offline':
        return 'bg-red-50 border-red-200';
      case 'maintenance':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Real-Time Data Feed</h3>
            <p className="text-sm text-gray-500">Live factory performance monitoring</p>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Last update: {formatTime(lastUpdate)}
          </div>
        </div>
      </div>

      {/* Live Data Grid */}
      <div className="space-y-4">
        {liveData.map((factory) => (
          <div
            key={factory.factory_id}
            className={`border-2 rounded-lg p-4 transition-all ${getStatusColor(factory.status)} ${
              factory.status === 'online' ? 'animate-pulse-subtle' : ''
            }`}
          >
            {/* Factory Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(factory.status)}
                <div>
                  <h4 className="font-bold text-gray-900">{factory.factory_name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="capitalize">{factory.status}</span>
                    <span>•</span>
                    <span>{formatTime(new Date(factory.timestamp))}</span>
                  </div>
                </div>
              </div>
              
              {/* Alerts */}
              {factory.alerts.length > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-700 font-medium">
                    {factory.alerts.length} Alert{factory.alerts.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Real-time Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-gray-600">POWER</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {factory.power_output_MW.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">MW</div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Gauge className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-gray-600">EFFICIENCY</span>
                </div>
                <div className={`text-lg font-bold ${
                  factory.efficiency_pct >= 45 ? 'text-green-600' : 
                  factory.efficiency_pct >= 40 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {factory.efficiency_pct.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">%</div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-medium text-gray-600">TEMP</span>
                </div>
                <div className={`text-lg font-bold ${
                  factory.temperature_C >= 100 ? 'text-red-600' : 
                  factory.temperature_C >= 90 ? 'text-orange-600' : 'text-gray-900'
                }`}>
                  {factory.temperature_C.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">°C</div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-4 h-4 bg-red-500 rounded-full" />
                  <span className="text-xs font-medium text-gray-600">EMISSIONS</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {factory.emissions_rate_kg_per_hour.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">kg/h</div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-4 h-4 bg-purple-500 rounded-full" />
                  <span className="text-xs font-medium text-gray-600">FUEL</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {factory.fuel_consumption_rate.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">L/h</div>
              </div>
            </div>

            {/* Alerts Display */}
            {factory.alerts.length > 0 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-800">Active Alerts</span>
                </div>
                <ul className="space-y-1">
                  {factory.alerts.map((alert, index) => (
                    <li key={index} className="text-sm text-orange-700">
                      • {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Data Feed Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">Live Data Stream</span>
        </div>
        <p className="text-sm text-blue-700">
          Data updates every 2 seconds from factory sensors and monitoring systems. 
          Connection status and alerts are monitored in real-time.
        </p>
      </div>
    </div>
  );
};