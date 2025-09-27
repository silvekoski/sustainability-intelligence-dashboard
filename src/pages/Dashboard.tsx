import React from 'react';
import { MetricCard } from '../components/MetricCard';
import { PlantStatusCard } from '../components/PlantStatusCard';
import { EmissionsChart } from '../components/EmissionsChart';
import { EfficiencyGauge } from '../components/EfficiencyGauge';
import { FactoryComparisonPanel } from '../components/FactoryComparisonPanel';
import { PermitsStatusWidget } from '../components/PermitsStatusWidget';
import { ComplianceReportGenerator } from '../components/ComplianceReportGenerator';
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
  const { plantSummaries, emissionsTrends, loading, error, metrics, changes } = useData();

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

  // Sample permits data - replace with real data from your backend
  const permitsData = {
    active_permits: 5,
    avg_consumption_rate_t_per_month: 32000,
    current_date: new Date().toISOString(),
    target_buffer_months: 12,
    warning_threshold_pct: 80,
    cumulative_emissions_t: 256000 // Optional: current emissions to date
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Electricity Output"
          value={metrics.totalElectricity.toFixed(0)}
          unit="MWh"
          change={changes.electricityChange}
          changeLabel="vs last period"
          icon={<Zap className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Total CO₂ Emissions"
          value={metrics.totalEmissions.toFixed(0)}
          unit="tonnes"
          change={changes.emissionsChange}
          changeLabel="vs last period"
          icon={<Factory className="w-6 h-6" />}
          color="red"
        />
        <MetricCard
          title="Average Efficiency"
          value={metrics.avgEfficiency.toFixed(1)}
          unit="%"
          change={changes.efficiencyChange}
          changeLabel="vs last period"
          icon={<Gauge className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Fuel Consumption"
          value={metrics.totalFuelConsumption.toFixed(0)}
          unit="MWh"
          change={changes.fuelChange}
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        <div className="lg:col-span-2">
          <EmissionsChart data={emissionsTrends} />
        </div>
        
        <div>
          <PermitsStatusWidget data={permitsData} />
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

      {/* Factory Comparison & Compliance Panel */}
      <div className="mb-8">
        <FactoryComparisonPanel />
      </div>

      {/* EU Compliance Report Generator */}
      <div className="mb-8">
        <ComplianceReportGenerator />
      </div>

      {/* Sustainability Insights */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <PermitsStatusWidget data={{
              active_permits: 17,
              avg_consumption_rate_t_per_month: Math.round(metrics.totalEmissions / 2 * 30), // Estimate monthly rate
              current_date: new Date().toISOString(),
              target_buffer_months: 12,
              warning_threshold_pct: 80,
              cumulative_emissions_t: metrics.totalEmissions
            }} />
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