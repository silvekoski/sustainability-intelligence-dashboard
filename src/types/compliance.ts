export interface ComplianceReportData {
  reportingPeriod: {
    startDate: string;
    endDate: string;
    year: number;
  };
  facilities: {
    id: string;
    name: string;
    location: string;
    sector: string;
    totalEmissions: number;
    verifiedEmissions: number;
    allowancesAllocated: number;
    allowancesSurrendered: number;
    complianceStatus: 'compliant' | 'non_compliant' | 'pending';
  }[];
  aggregatedData: {
    totalCO2Emissions: number;
    totalCH4Emissions: number;
    totalN2OEmissions: number;
    totalGHGEmissions: number;
    energyConsumption: number;
    renewableEnergyShare: number;
  };
  csrdCompliance: {
    doubleMateriality: boolean;
    esrsStandards: string[];
    reportingDeadline: string;
    auditRequired: boolean;
  };
  etsCompliance: {
    totalAllowances: number;
    totalEmissions: number;
    surplus: number;
    complianceGap: number;
    verificationStatus: 'verified' | 'pending' | 'non_verified';
  };
}

export interface ReportSection {
  title: string;
  content: string;
  subsections: {
    title: string;
    content: string;
  }[];
}

export interface ComplianceReport {
  title: string;
  executiveSummary: string;
  facilities: {
    id: string;
    name: string;
    location: string;
    sector: string;
    totalEmissions: number;
    verifiedEmissions: number;
    allowancesAllocated: number;
    allowancesSurrendered: number;
    complianceStatus: 'compliant' | 'non_compliant' | 'pending';
  }[];
  sections: ReportSection[];
  conclusion: string;
  generatedAt: string;
  reportingEntity: string;
  jurisdiction: 'EU' | 'US' | 'COMBINED';
  framework: string[];
}

// US SEC Climate-Related Disclosures
export interface SECClimateDisclosure {
  ghgEmissions: {
    scope1: number;
    scope2: number;
    scope3?: number;
    methodology: string;
    verificationStatus: 'verified' | 'unverified';
  };
  climateRisks: {
    physicalRisks: ClimateRisk[];
    transitionRisks: ClimateRisk[];
  };
  financialImpacts: {
    costs: FinancialImpact[];
    revenues: FinancialImpact[];
    capitalExpenditures: FinancialImpact[];
  };
  scenarioAnalysis: {
    scenarios: ClimateScenario[];
    netZeroPathway: NetZeroPathway;
  };
}

export interface ClimateRisk {
  type: string;
  description: string;
  timeHorizon: 'short' | 'medium' | 'long';
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigationMeasures: string[];
}

export interface FinancialImpact {
  category: string;
  amount: number;
  currency: string;
  description: string;
  timeframe: string;
}

export interface ClimateScenario {
  name: string;
  description: string;
  temperatureIncrease: number;
  assumptions: string[];
  impacts: FinancialImpact[];
}

export interface NetZeroPathway {
  targetYear: number;
  milestones: {
    year: number;
    emissionReduction: number;
    description: string;
  }[];
  investments: FinancialImpact[];
}

// EU Data Act Compliance
export interface DataActCompliance {
  dataInteroperability: {
    formats: ('JSON' | 'CSV' | 'XML' | 'ESEF')[];
    standards: string[];
    apiEndpoints?: string[];
  };
  dataPortability: {
    exportFormats: string[];
    transferMechanisms: string[];
    retentionPeriod: number;
  };
  accessControls: {
    roles: DataAccessRole[];
    permissions: DataPermission[];
  };
  auditLogging: {
    enabled: boolean;
    retentionPeriod: number;
    loggedEvents: string[];
  };
}

export interface DataAccessRole {
  role: 'regulator' | 'internal' | 'partner' | 'public';
  permissions: string[];
  dataScope: string[];
}

export interface DataPermission {
  action: 'read' | 'write' | 'export' | 'share';
  resource: string;
  conditions?: string[];
}

// Enhanced Compliance Report Data
export interface EnhancedComplianceReportData extends ComplianceReportData {
  secDisclosure?: SECClimateDisclosure;
  dataActCompliance: DataActCompliance;
  complianceMapping: {
    eu: string[];
    us: string[];
    dataAct: string[];
  };
}