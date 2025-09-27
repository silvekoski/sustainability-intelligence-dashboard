export interface FactoryData {
  id: string;
  factory_name: string;
  efficiency_pct: number;
  emissions_gCO2_per_kWh: number;
  output_MWh: number;
  location?: string;
  total_co2_tonnes?: number;
}

export interface FactoryBenchmarks {
  efficiency_avg: number;
  efficiency_p25: number;
  efficiency_p75: number;
  emissions_avg: number;
  emissions_p25: number;
  emissions_p75: number;
  output_max: number;
}

export type ComplianceStatus = 'green' | 'yellow' | 'red';

export interface ComplianceCheck {
  eu_ets: {
    status: 'compliant' | 'warning' | 'non_compliant';
    allowance_used_pct: number;
    message: string;
  };
  csrd_esrs: {
    status: 'compliant' | 'warning' | 'non_compliant';
    missing_fields: string[];
    message: string;
  };
  sec: {
    status: 'compliant' | 'warning' | 'non_compliant';
    scope1_complete: boolean;
    scope2_complete: boolean;
    message: string;
  };
}

export interface FactoryAnalysis {
  factory: FactoryData;
  status: ComplianceStatus;
  normalized_output: number;
  compliance: ComplianceCheck;
  recommendations: string[];
  data_available: boolean;
}

export interface FactoryComparisonData {
  factories: FactoryAnalysis[];
  benchmarks: FactoryBenchmarks;
  cohort_size: number;
}