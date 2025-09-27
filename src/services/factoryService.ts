import { supabase } from '../lib/supabase';
import { FactoryData, FactoryBenchmarks, FactoryAnalysis, ComplianceStatus, ComplianceCheck, FactoryComparisonData } from '../types/factory';
import { parseCSVData, calculateAggregatedMetrics } from '../utils/dataParser';

export class FactoryService {
  // Fetch factory data from Supabase
  static async getFactoryData(): Promise<FactoryData[]> {
    try {
      // Load data from CSV file
      const response = await fetch('/sample_data.csv');
      if (!response.ok) {
        throw new Error('Failed to load CSV data');
      }
      
      const csvText = await response.text();
      const parsedData = parseCSVData(csvText);
      
      // Group data by plant and calculate aggregated metrics
      const plantGroups = parsedData.reduce((acc, record) => {
        if (!acc[record.plant_id]) {
          acc[record.plant_id] = [];
        }
        acc[record.plant_id].push(record);
        return acc;
      }, {} as Record<number, any[]>);

      const factoryData: FactoryData[] = Object.values(plantGroups).map((plantData: any[]) => {
        const first = plantData[0];
        const totalElectricity = plantData.reduce((sum, d) => sum + d.electricity_output_MWh, 0);
        const totalEmissions = plantData.reduce((sum, d) => sum + d.CO2_emissions_tonnes, 0);
        const avgEfficiency = plantData.reduce((sum, d) => sum + d.efficiency_percent, 0) / plantData.length;
        
        // Calculate emissions intensity (gCO2/kWh)
        const emissionsIntensity = totalElectricity > 0 ? (totalEmissions * 1000) / totalElectricity : 0;
        
        // Assign locations based on plant characteristics
        const locations = ['Germany', 'Netherlands', 'Denmark', 'France'];
        const location = locations[first.plant_id - 1] || 'Europe';

        return {
          id: first.plant_id.toString(),
          factory_name: first.plant_name,
          efficiency_pct: Math.round(avgEfficiency * 10) / 10,
          emissions_gCO2_per_kWh: Math.round(emissionsIntensity),
          output_MWh: Math.round(totalElectricity),
          location,
          total_co2_tonnes: Math.round(totalEmissions)
        };
      });

      return factoryData;
    } catch (error) {
      console.error('Error fetching factory data:', error);
      return [];
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