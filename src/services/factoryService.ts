import { supabase } from '../lib/supabase';
import { FactoryData, FactoryBenchmarks, FactoryAnalysis, ComplianceStatus, ComplianceCheck, FactoryComparisonData } from '../types/factory';

export class FactoryService {
  // Fetch factory data from Supabase
  static async getFactoryData(): Promise<FactoryData[]> {
    try {
      // Mock data for now - replace with actual Supabase queries
      const mockData: FactoryData[] = [
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

      return mockData;
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