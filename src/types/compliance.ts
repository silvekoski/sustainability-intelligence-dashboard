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
  sections: ReportSection[];
  conclusion: string;
  generatedAt: string;
  reportingEntity: string;
}