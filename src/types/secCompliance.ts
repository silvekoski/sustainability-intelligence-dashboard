export interface SECFacilityData {
  facility: string;
  location: string;
  sector: string;
  emissionsCO2e: number;
  emissionsCO2: number;
  emissionsCH4: number;
  emissionsN2O: number;
  energyMWh: number;
  renewableShare: number;
  allowancesAllocated: number;
  allowancesUsed: number;
  complianceStatus: 'Compliant' | 'Shortfall' | 'Surplus';
  secNote: string;
}

export interface SECComplianceSummary {
  totalGHGEmissions: number;
  totalEnergyConsumption: number;
  weightedRenewableShare: number;
  totalAllowancesAllocated: number;
  totalAllowancesUsed: number;
  overallComplianceStatus: 'Compliant' | 'Shortfall' | 'Surplus';
  facilitiesCount: number;
  compliantFacilities: number;
  nonCompliantFacilities: number;
}

export interface SECComplianceReport {
  facilities: SECFacilityData[];
  summary: SECComplianceSummary;
  reportingPeriod: {
    startDate: string;
    endDate: string;
    year: number;
  };
  generatedAt: string;
}

export interface SECClimateRisk {
  type: 'Physical' | 'Transition';
  category: string;
  description: string;
  timeHorizon: 'Short-term' | 'Medium-term' | 'Long-term';
  likelihood: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  financialImpact?: number;
  mitigationMeasures: string[];
}

export interface SECFinancialImpact {
  category: string;
  amount: number;
  currency: string;
  description: string;
  timeframe: string;
  uncertainty: 'Low' | 'Medium' | 'High';
}

export interface SECScenarioAnalysis {
  scenario: string;
  temperatureIncrease: number;
  description: string;
  assumptions: string[];
  financialImpacts: SECFinancialImpact[];
  emissionReductions: {
    year: number;
    reductionPercent: number;
    description: string;
  }[];
}