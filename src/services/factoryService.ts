import { supabase } from '../lib/supabase';
import { FactoryData, FactoryBenchmarks, FactoryAnalysis, ComplianceStatus, ComplianceCheck, FactoryComparisonData } from '../types/factory';

export class FactoryService {
  // Fetch factory data from Supabase power plants
  static async getFactoryData(): Promise<FactoryData[]> {
    try {
      // Fetch aggregated data from the last 24 hours
      const { data: plantsData, error } = await supabase
        .from('power_plants')
        .select(`
          id,
          plant_name,
          fuel_type,
          location,
          plant_readings!inner (
            electricity_output_mwh,
            co2_emissions_tonnes,
            efficiency_percent
          )
        `)
        .gte('plant_readings.reading_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!plantsData || plantsData.length === 0) {
        console.warn('No plant data found, using fallback data');
        // Fallback to mock data if no real data available
        return [
          {
            id: '1',
            factory_name: 'Alpha Power Station',
            efficiency_pct: 38,
            emissions_gCO2_per_kWh: 820,
            output_MWh: 2156,
            location: 'Germany',
            total_co2_tonnes: 1768
          },
          {
            id: '2',
            factory_name: 'Beta Energy Facility',
            efficiency_pct: 45,
            emissions_gCO2_per_kWh: 350,
            output_MWh: 1618,
            location: 'Netherlands',
            total_co2_tonnes: 566
          },
          {
            id: '3',
            factory_name: 'Gamma CHP Plant',
            efficiency_pct: 80,
            emissions_gCO2_per_kWh: 200,
            output_MWh: 1083,
            location: 'Denmark',
            total_co2_tonnes: 217
          },
          {
            id: '4',
            factory_name: 'Delta Dual-Fuel Plant',
            efficiency_pct: 50,
            emissions_gCO2_per_kWh: 450,
            output_MWh: 1298,
            location: 'France',
            total_co2_tonnes: 584
          }
        ];
      }

      // Transform and aggregate the data
      const factoryData: FactoryData[] = plantsData.map(plant => {
        const readings = plant.plant_readings;
        
        // Calculate aggregated values
        const totalOutput = readings.reduce((sum: number, r: any) => sum + r.electricity_output_mwh, 0);
        const totalEmissions = readings.reduce((sum: number, r: any) => sum + r.co2_emissions_tonnes, 0);
        const avgEfficiency = readings.length > 0 
          ? readings.reduce((sum: number, r: any) => sum + r.efficiency_percent, 0) / readings.length 
          : 0;
        
        // Calculate emissions intensity (gCO2/kWh)
        const emissionsIntensity = totalOutput > 0 
          ? (totalEmissions * 1000 * 1000) / (totalOutput * 1000) // Convert tonnes to grams, MWh to kWh
          : 0;

        return {
          id: plant.id,
          factory_name: plant.plant_name,
          efficiency_pct: avgEfficiency,
          emissions_gCO2_per_kWh: emissionsIntensity,
          output_MWh: totalOutput,
          location: plant.location || undefined,
          total_co2_tonnes: totalEmissions
        };
      });

      return factoryData;
    } catch (error) {
      console.error('Error fetching factory data:', error);
      // Return empty array on error - will trigger fallback in UI
      throw error;
    }
  }

  // Calculate benchmarks from factory data
  static calculateBenchmarks(factories: FactoryData[]): FactoryBenchmarks {
    if (factories.length === 0) {
      // EU reference values as fallback
      return {
        efficiency_avg: 45,
        efficiency_p25: 35,
        efficiency_p75: 60,
        emissions_avg: 400,
        emissions_p25: 250,
        emissions_p75: 600,
        output_max: 2000
      };
    }

    const efficiencies = factories.map(f => f.efficiency_pct).sort((a, b) => a - b);
    const emissions = factories.map(f => f.emissions_gCO2_per_kWh).sort((a, b) => a - b);
    const outputs = factories.map(f => f.output_MWh);

    const getPercentile = (arr: number[], percentile: number) => {
      const index = Math.ceil((percentile / 100) * arr.length) - 1;
      return arr[Math.max(0, index)];
    };

    return {
      efficiency_avg: efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length,
      efficiency_p25: getPercentile(efficiencies, 25),
      efficiency_p75: getPercentile(efficiencies, 75),
      emissions_avg: emissions.reduce((a, b) => a + b, 0) / emissions.length,
      emissions_p25: getPercentile(emissions, 25),
      emissions_p75: getPercentile(emissions, 75),
      output_max: Math.max(...outputs)
    };
  }

  // Determine traffic light status
  static getComplianceStatus(factory: FactoryData, benchmarks: FactoryBenchmarks): ComplianceStatus {
    const isEfficiencyGood = factory.efficiency_pct >= benchmarks.efficiency_p75;
    const isEmissionsGood = factory.emissions_gCO2_per_kWh <= benchmarks.emissions_p25;
    const isEfficiencyPoor = factory.efficiency_pct <= benchmarks.efficiency_p25;
    const isEmissionsPoor = factory.emissions_gCO2_per_kWh >= benchmarks.emissions_p75;

    if (isEfficiencyGood && isEmissionsGood) {
      return 'green';
    } else if (isEfficiencyPoor || isEmissionsPoor) {
      return 'red';
    } else {
      return 'yellow';
    }
  }

  // Generate compliance checks
  static generateComplianceChecks(factory: FactoryData): ComplianceCheck {
    const totalEmissions = factory.total_co2_tonnes || 0;
    const allowanceUsed = Math.min((totalEmissions / 2000) * 100, 100); // Assuming 2000 tonnes allowance

    return {
      eu_ets: {
        status: allowanceUsed > 90 ? 'non_compliant' : allowanceUsed > 75 ? 'warning' : 'compliant',
        allowance_used_pct: allowanceUsed,
        message: `${allowanceUsed.toFixed(1)}% of CO₂ allowance used`
      },
      csrd_esrs: {
        status: factory.efficiency_pct && factory.emissions_gCO2_per_kWh ? 'compliant' : 'warning',
        missing_fields: factory.efficiency_pct && factory.emissions_gCO2_per_kWh ? [] : ['Scope 1 emissions', 'Energy intensity'],
        message: factory.efficiency_pct && factory.emissions_gCO2_per_kWh ? 'All required fields captured' : 'Missing required data fields'
      },
      sec: {
        status: factory.total_co2_tonnes ? 'compliant' : 'warning',
        scope1_complete: !!factory.total_co2_tonnes,
        scope2_complete: true, // Assuming scope 2 is available
        message: factory.total_co2_tonnes ? 'Scope 1 & 2 data complete' : 'Scope 1 data incomplete'
      }
    };
  }

  // Generate recommendations
  static generateRecommendations(factory: FactoryData, benchmarks: FactoryBenchmarks, status: ComplianceStatus): string[] {
    const recommendations: string[] = [];

    if (status === 'green') {
      recommendations.push('Maintain current practices; add predictive maintenance to squeeze +2–3% efficiency');
      recommendations.push('Consider digital twin implementation for continuous optimization');
    } else {
      if (factory.efficiency_pct < benchmarks.efficiency_avg) {
        recommendations.push('Install/upgrade waste heat recovery systems (+5–10% efficiency)');
      }
      
      if (factory.emissions_gCO2_per_kWh > benchmarks.emissions_avg) {
        recommendations.push('Shift 15–25% fuel mix to biogas/e-methane (–10–20% CO₂)');
      }

      if (factory.efficiency_pct < benchmarks.efficiency_avg && factory.emissions_gCO2_per_kWh > benchmarks.emissions_avg) {
        recommendations.push('Hybridize with heat pumps or add storage to improve load factor and cut CO₂');
      }
    }

    return recommendations.slice(0, 2); // Max 2 recommendations
  }

  // Main method to get complete factory comparison data
  static async getFactoryComparisonData(): Promise<FactoryComparisonData> {
    try {
      const factories = await this.getFactoryData();
      const benchmarks = this.calculateBenchmarks(factories);

      const factoryAnalyses: FactoryAnalysis[] = factories.map(factory => {
        const status = this.getComplianceStatus(factory, benchmarks);
        const compliance = this.generateComplianceChecks(factory);
        const recommendations = this.generateRecommendations(factory, benchmarks, status);
        const normalized_output = (factory.output_MWh / benchmarks.output_max) * 100;

        return {
          factory,
          status,
          normalized_output,
          compliance,
          recommendations,
          data_available: !!(factory.efficiency_pct && factory.emissions_gCO2_per_kWh && factory.output_MWh)
        };
      });

      // Sort by status (Green → Yellow → Red), then efficiency descending
      const statusOrder = { green: 0, yellow: 1, red: 2 };
      factoryAnalyses.sort((a, b) => {
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return b.factory.efficiency_pct - a.factory.efficiency_pct;
      });

      return {
        factories: factoryAnalyses,
        benchmarks,
        cohort_size: factories.length
      };
    } catch (error) {
      console.error('Error getting factory comparison data:', error);
      return {
        factories: [],
        benchmarks: this.calculateBenchmarks([]),
        cohort_size: 0
      };
    }
  }
}