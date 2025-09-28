import React from 'react';
import { MetricCard } from '../components/MetricCard';
import { PlantStatusCard } from '../components/PlantStatusCard';
import { EmissionsChart } from '../components/EmissionsChart';
import { EfficiencyGauge } from '../components/EfficiencyGauge';
import { FactoryComparisonPanel } from '../components/FactoryComparisonPanel';
import { ComplianceReportGenerator } from '../components/ComplianceReportGenerator';
import { EUPermitsCard } from '../components/EUPermitsCard';
import { SECClimateDisclosureSection } from '../components/SECClimateDisclosureSection';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import { AIOptimizationWidget } from '../components/AIOptimizationWidget';
import { AIComplianceAssistant } from '../components/AIComplianceAssistant';
import { useData } from '../hooks/useData';
import { useAuth } from '../contexts/AuthContext';
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
  const { csvData } = useAuth();
  const { plantSummaries, emissionsTrends, loading, error, metrics, changes } = useData(csvData);


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

  // Show message when no data is available
  if (!csvData || csvData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">        
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-6">
            Upload a CSV file in Settings → Data Source to view your power plant data and analytics.
          </p>
          <button
            onClick={() => window.location.href = '/settings'}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

      {/* EU Permits Analysis */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <EUPermitsCard />
        </div>
      </div>

      {/* AI-Powered Insights */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
            <p className="text-gray-600">Advanced analytics powered by DeepSeek AI</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <AIInsightsPanel data={csvData} />
          <AIOptimizationWidget data={csvData} />
        </div>
        
        <AIComplianceAssistant data={csvData} />
      </div>

      {/* Factory Comparison & Compliance Panel */}
      <div className="mb-8">
        <FactoryComparisonPanel currentData={csvData} />
      </div>

      {/* SEC Climate Disclosure Extract */}
      <div className="mb-8">
        <SECClimateDisclosureSection currentData={csvData} />
      </div>

      {/* EU Compliance Report Generator */}
      <div className="mb-8">
        <ComplianceReportGenerator currentData={csvData} />
      </div>

      {/* Sustainability Insights */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Multi-Jurisdictional Compliance</h3>
            <p className="text-gray-600">AI-powered recommendations for optimization</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">EU Compliance Status</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              CSRD, ESRS, and EU ETS requirements fully met. Data Act compliance implemented with role-based access controls.
            </p>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Compliant
            </span>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Factory className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">US SEC Disclosure</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Climate-related risks assessed, financial impacts quantified, and scenario analysis completed for SEC reporting.
            </p>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Ready
            </span>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Gauge className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-gray-900">Data Interoperability</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Multi-format data export (JSON, CSV, XML) available with audit logging and access controls implemented.
            </p>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};