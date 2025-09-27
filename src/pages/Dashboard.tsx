import React from 'react';
import { MetricCard } from '../components/MetricCard';
import { PlantStatusCard } from '../components/PlantStatusCard';
import { EmissionsChart } from '../components/EmissionsChart';
import { EfficiencyGauge } from '../components/EfficiencyGauge';
import { PermitsStatusWidget } from '../components/PermitsStatusWidget';
import { FactoryComparisonBar } from '../components/FactoryComparisonBar';
import { SatelliteHeatTracker } from '../components/SatelliteHeatTracker';
import { useData } from '../hooks/useData';
import { 
  Zap, 
  Factory, 
  Gauge, 
  Flame, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  Leaf
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { plantSummaries, emissionsTrends, loading, error, metrics } = useData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-lg font-medium text-gray-700">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const optimalPlants = plantSummaries.filter(p => p.status === 'optimal').length;
  const warningPlants = plantSummaries.filter(p => p.status === 'warning').length;
  const criticalPlants = plantSummaries.filter(p => p.status === 'critical').length;

  // Sample permits data - in a real application, this would come from your backend
  const permitsData = {
    active_permits: 5,
    avg_consumption_rate_t_per_month: 32000,
    target_buffer_months: 12,
    warning_threshold_pct: 80,
    cumulative_emissions_t: metrics.totalEmissions
  };

  // Sample factory data for comparison - in a real application, this would come from your backend
  const factoryData = [
    {
      factory_name: "Wärtsilä Vaasa Power Plant",
      efficiency_pct: 42.0,
      emissions_gCO2_per_kWh: 820,
      output_MWh: 2156, 
      location: "Vaasa, Finland"
    },
    {
      factory_name: "Wärtsilä Santos Power Plant",
      efficiency_pct: 48.0,
      emissions_gCO2_per_kWh: 350,
      output_MWh: 1618,
      location: "Santos, Brazil"
    },
    {
      factory_name: "Wärtsilä Jordan Power Plant",
      efficiency_pct: 46.0,
      emissions_gCO2_per_kWh: 200,
      output_MWh: 1079,
      location: "Amman, Jordan"
    },
    {
      factory_name: "Wärtsilä Singapore Power Plant",
      efficiency_pct: 52.0,
      emissions_gCO2_per_kWh: 420,
      output_MWh: 1295,
      location: "Jurong Island, Singapore"
    }
  ];

  // Sample satellite heat data - in a real application, this would come from satellite imagery processing
  const satelliteHeatData = [
    {
      factory_name: "Wärtsilä Vaasa Power Plant",
      latitude: 63.0960,
      longitude: 21.6158,
      output_MWh: 2156,
      thermal_value: 42.8,
      baseline_temp: 5.2,
      heat_index: 7.8,
      efficiency_rank: 4,
      status: 'red' as const,
      status_emoji: '🔴'
    },
    {
      factory_name: "Wärtsilä Santos Power Plant",
      latitude: -23.9608,
      longitude: -46.3331,
      output_MWh: 1618,
      thermal_value: 35.4,
      baseline_temp: 24.1,
      heat_index: 4.2,
      efficiency_rank: 2,
      status: 'yellow' as const,
      status_emoji: '🟡'
    },
    {
      factory_name: "Wärtsilä Jordan Power Plant",
      latitude: 31.9454,
      longitude: 35.9284,
      output_MWh: 1079,
      thermal_value: 38.7,
      baseline_temp: 22.3,
      heat_index: 3.8,
      efficiency_rank: 1,
      status: 'green' as const,
      status_emoji: '🟢'
    },
    {
      factory_name: "Wärtsilä Singapore Power Plant",
      latitude: 1.2644,
      longitude: 103.6999,
      output_MWh: 1295,
      thermal_value: 41.2,
      baseline_temp: 28.5,
      heat_index: 5.1,
      efficiency_rank: 3,
      status: 'yellow' as const,
      status_emoji: '🟡'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Permits Status Widget */}
      <div className="mb-8">
        <PermitsStatusWidget input={permitsData} />
      </div>

      {/* Factory Comparison Bar */}
      <div className="mb-8">
        <FactoryComparisonBar factories={factoryData} />
      </div>

      {/* Satellite Heat Tracker */}
      <div className="mb-8">
        <SatelliteHeatTracker factories={satelliteHeatData} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Electricity Output"
          value={metrics.totalElectricity.toFixed(0)}
          unit="MWh"
          change={2.4}
          changeLabel="vs last period"
          icon={<Zap className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Total CO₂ Emissions"
          value={metrics.totalEmissions.toFixed(0)}
          unit="tonnes"
          change={-1.2}
          changeLabel="vs last period"
          icon={<Factory className="w-6 h-6" />}
          color="red"
        />
        <MetricCard
          title="Average Efficiency"
          value={metrics.avgEfficiency.toFixed(1)}
          unit="%"
          change={0.8}
          changeLabel="vs last period"
          icon={<Gauge className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Fuel Consumption"
          value={metrics.totalFuelConsumption.toFixed(0)}
          unit="MWh"
          change={-0.5}
          changeLabel="vs last period"
          icon={<Flame className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Plant Status Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Plant Status Overview</h2>
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

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <EmissionsChart data={emissionsTrends} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Efficiency Overview</h3>
          <div className="space-y-6">
            {plantSummaries.map(plant => (
              <EfficiencyGauge
                key={plant.plant_id}
                value={plant.avg_efficiency}
                label={plant.plant_name}
                color={
                  plant.avg_efficiency >= 60 ? 'green' :
                  plant.avg_efficiency >= 45 ? 'orange' : 'red'
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sustainability Insights */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Sustainability Insights</h3>
            <p className="text-gray-600">AI-powered recommendations for optimization</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Efficiency Opportunity</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Alpha Power Station shows potential for 12% efficiency improvement through fuel optimization.
            </p>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              High Impact
            </span>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Factory className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Emissions Reduction</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Switching Delta Plant to natural gas during peak hours could reduce CO₂ by 15%.
            </p>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Medium Impact
            </span>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Gauge className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-gray-900">Maintenance Alert</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Gamma CHP Plant efficiency trending down. Schedule maintenance to prevent issues.
            </p>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              Preventive
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};