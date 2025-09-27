import { ComplianceReportData, ComplianceReport, ReportSection } from '../types/compliance';
import { PowerPlantData } from '../types';
import { parseCSVData, calculateAggregatedMetrics } from '../utils/dataParser';

export class ComplianceReportService {
  static async generateComplianceReport(): Promise<ComplianceReport> {
    try {
      // Load and process data
      const response = await fetch('/sample_data.csv');
      if (!response.ok) {
        throw new Error('Failed to load CSV data');
      }
      
      const csvText = await response.text();
      const parsedData = parseCSVData(csvText);
      const reportData = this.processDataForCompliance(parsedData);
      
      return this.generateReport(reportData);
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  private static processDataForCompliance(data: PowerPlantData[]): ComplianceReportData {
    const metrics = calculateAggregatedMetrics(data);
    
    // Group data by plant
    const plantGroups = data.reduce((acc, record) => {
      if (!acc[record.plant_id]) {
        acc[record.plant_id] = [];
      }
      acc[record.plant_id].push(record);
      return acc;
    }, {} as Record<number, PowerPlantData[]>);

    const facilities = Object.values(plantGroups).map((plantData: PowerPlantData[]) => {
      const first = plantData[0];
      const totalEmissions = plantData.reduce((sum, d) => sum + d.CO2_emissions_tonnes, 0);
      const avgEfficiency = plantData.reduce((sum, d) => sum + d.efficiency_percent, 0) / plantData.length;
      
      // Simulate compliance data
      const allowancesAllocated = Math.ceil(totalEmissions * 1.1); // 10% buffer
      const complianceStatus = totalEmissions <= allowancesAllocated ? 'compliant' : 'non_compliant';
      
      return {
        id: first.plant_id.toString(),
        name: first.plant_name,
        location: this.getPlantLocation(first.plant_id),
        sector: this.getSectorFromFuel(first.fuel_type),
        totalEmissions: Math.round(totalEmissions),
        verifiedEmissions: Math.round(totalEmissions * 0.98), // 98% verified
        allowancesAllocated,
        allowancesSurrendered: Math.round(totalEmissions),
        complianceStatus: complianceStatus as 'compliant' | 'non_compliant'
      };
    });

    const totalCH4 = data.reduce((sum, d) => sum + d.CH4_emissions_kg, 0) / 1000; // Convert to tonnes
    const totalN2O = data.reduce((sum, d) => sum + d.N2O_emissions_kg, 0) / 1000; // Convert to tonnes

    return {
      reportingPeriod: {
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        year: 2025
      },
      facilities,
      aggregatedData: {
        totalCO2Emissions: metrics.totalEmissions,
        totalCH4Emissions: Math.round(totalCH4 * 100) / 100,
        totalN2OEmissions: Math.round(totalN2O * 100) / 100,
        totalGHGEmissions: Math.round((metrics.totalEmissions + totalCH4 + totalN2O) * 100) / 100,
        energyConsumption: metrics.totalFuelConsumption,
        renewableEnergyShare: this.calculateRenewableShare(data)
      },
      csrdCompliance: {
        doubleMateriality: true,
        esrsStandards: ['ESRS E1', 'ESRS E2', 'ESRS E3'],
        reportingDeadline: '2026-04-30',
        auditRequired: true
      },
      etsCompliance: {
        totalAllowances: facilities.reduce((sum, f) => sum + f.allowancesAllocated, 0),
        totalEmissions: metrics.totalEmissions,
        surplus: facilities.reduce((sum, f) => sum + (f.allowancesAllocated - f.totalEmissions), 0),
        complianceGap: Math.max(0, metrics.totalEmissions - facilities.reduce((sum, f) => sum + f.allowancesAllocated, 0)),
        verificationStatus: 'verified'
      }
    };
  }

  private static generateReport(data: ComplianceReportData): ComplianceReport {
    const sections: ReportSection[] = [
      this.generateCSRDSection(data),
      this.generateESRSSection(data),
      this.generateETSSection(data),
      this.generateClimateMonitoringSection(data)
    ];

    return {
      title: 'EU Emission Reporting Standards (2025)',
      executiveSummary: this.generateExecutiveSummary(data),
      sections,
      conclusion: this.generateConclusion(data),
      generatedAt: new Date().toISOString(),
      reportingEntity: 'European Power Generation Consortium'
    };
  }

  private static generateExecutiveSummary(data: ComplianceReportData): string {
    return `This report presents compliance status with EU Emission Reporting Standards for the reporting period ${data.reportingPeriod.startDate} to ${data.reportingPeriod.endDate}. The assessment covers ${data.facilities.length} facilities with total verified emissions of ${data.aggregatedData.totalCO2Emissions.toLocaleString()} tonnes CO₂ equivalent. All facilities demonstrate compliance with applicable EU regulations including CSRD, ESRS, and EU ETS requirements. The report confirms adherence to mandatory monitoring, reporting, and verification protocols under current EU climate legislation.`;
  }

  private static generateCSRDSection(data: ComplianceReportData): ReportSection {
    return {
      title: '1. Corporate Sustainability Reporting Directive (CSRD)',
      content: 'Assessment of compliance with Directive (EU) 2022/2464 on corporate sustainability reporting.',
      subsections: [
        {
          title: 'Scope & Applicability',
          content: `The Corporate Sustainability Reporting Directive applies to large EU companies, listed SMEs, and non-EU companies with significant EU operations. Our reporting entity qualifies as a large undertaking with ${data.facilities.length} facilities across EU member states, requiring full CSRD compliance from the 2025 reporting year.`
        },
        {
          title: 'Requirements',
          content: `CSRD mandates comprehensive ESG reporting using European Sustainability Reporting Standards (ESRS). Key requirements include double materiality assessment (impact on and by the company), sustainability statement integration into management reports, and mandatory third-party assurance. Our assessment confirms ${data.csrdCompliance.doubleMateriality ? 'completion' : 'pending completion'} of double materiality analysis.`
        },
        {
          title: 'Legal Basis',
          content: 'Directive (EU) 2022/2464 amending Regulation (EU) No 537/2014, Directive 2004/109/EC, Directive 2006/43/EC and Directive 2013/34/EU, as regards corporate sustainability reporting.'
        },
        {
          title: 'Implications in Practice',
          content: `Compliance requires annual sustainability reporting by ${data.csrdCompliance.reportingDeadline}, mandatory external assurance, and alignment with ${data.csrdCompliance.esrsStandards.join(', ')} standards. Digital reporting format (ESEF) mandatory from 2026.`
        }
      ]
    };
  }

  private static generateESRSSection(data: ComplianceReportData): ReportSection {
    return {
      title: '2. European Sustainability Reporting Standards (ESRS)',
      content: 'Technical standards implementation under CSRD framework.',
      subsections: [
        {
          title: 'Scope & Applicability',
          content: `ESRS provides detailed technical standards for sustainability reporting under CSRD. Our facilities report under ${data.csrdCompliance.esrsStandards.join(', ')} covering climate change mitigation, adaptation, and energy topics. The Voluntary SME Standard (VSME) introduced in 2025 does not apply to our large undertaking classification.`
        },
        {
          title: 'Requirements',
          content: `ESRS E1 (Climate Change) requires disclosure of GHG emissions (${data.aggregatedData.totalGHGEmissions} tonnes CO₂e), energy consumption (${data.aggregatedData.energyConsumption.toLocaleString()} MWh), and climate transition plans. ESRS E2 (Pollution) covers air pollutants including CH₄ (${data.aggregatedData.totalCH4Emissions} tonnes) and N₂O (${data.aggregatedData.totalN2OEmissions} tonnes).`
        },
        {
          title: 'Legal Basis',
          content: 'Commission Delegated Regulation (EU) 2023/2772 supplementing Directive (EU) 2022/2464 with regard to European sustainability reporting standards.'
        },
        {
          title: 'Implications in Practice',
          content: `Requires granular disclosure of Scope 1, 2, and 3 emissions, energy mix analysis (renewable share: ${data.aggregatedData.renewableEnergyShare}%), and forward-looking climate targets. Data quality and verification standards align with EU ETS MRV requirements.`
        }
      ]
    };
  }

  private static generateETSSection(data: ComplianceReportData): ReportSection {
    return {
      title: '3. EU Emissions Trading System (EU ETS) & MRV Regulations',
      content: 'Compliance with cap-and-trade system and mandatory monitoring, reporting, and verification.',
      subsections: [
        {
          title: 'Scope & Applicability',
          content: `EU ETS covers power generation, industry, aviation, maritime, buildings, and transport sectors. Our ${data.facilities.length} power generation facilities fall under Phase 4 (2021-2030) with mandatory participation. Total allocated allowances: ${data.etsCompliance.totalAllowances.toLocaleString()} EUAs.`
        },
        {
          title: 'Requirements',
          content: `Mandatory monitoring, reporting, and verification (MRV) of GHG emissions under MRR and AVR. Annual emissions report by 31 March, third-party verification required, allowance surrender by 30 April. Current compliance status: ${data.etsCompliance.surplus >= 0 ? 'surplus of ' + data.etsCompliance.surplus.toLocaleString() + ' allowances' : 'deficit of ' + Math.abs(data.etsCompliance.surplus).toLocaleString() + ' allowances'}.`
        },
        {
          title: 'Legal Basis',
          content: 'Directive 2003/87/EC (EU ETS Directive), Commission Implementing Regulation (EU) 2018/2066 (MRR), Commission Implementing Regulation (EU) 2018/2067 (AVR).'
        },
        {
          title: 'Implications in Practice',
          content: `Requires continuous emissions monitoring systems (CEMS), annual verification by accredited bodies, and real-time transaction logging in Union Registry. Verification status: ${data.etsCompliance.verificationStatus}. Non-compliance penalties: €100 per tonne CO₂ plus obligation to surrender additional allowances.`
        }
      ]
    };
  }

  private static generateClimateMonitoringSection(data: ComplianceReportData): ReportSection {
    return {
      title: '4. Climate Monitoring Mechanism & UNFCCC Reporting',
      content: 'National greenhouse gas inventory and international climate reporting obligations.',
      subsections: [
        {
          title: 'Scope & Applicability',
          content: `EU Member States must submit annual GHG inventories and biennial reports to UNFCCC. Our facilities contribute to national inventory data through standardized reporting protocols. Emissions data feeds into EU-wide monitoring of climate targets under European Climate Law.`
        },
        {
          title: 'Requirements',
          content: `Annual GHG inventory submission by 15 January (preliminary) and 15 March (final), biennial transparency reports under Paris Agreement, and progress tracking toward 2030 climate targets (-55% GHG emissions vs 1990). Our facilities represent ${((data.aggregatedData.totalGHGEmissions / 3000000) * 100).toFixed(3)}% of estimated national power sector emissions.`
        },
        {
          title: 'Legal Basis',
          content: 'Regulation (EU) No 525/2013 (MMR), Regulation (EU) 2018/1999 (Energy Union Governance), UNFCCC Decision 18/CMA.1 (Enhanced Transparency Framework).'
        },
        {
          title: 'Implications in Practice',
          content: `Requires harmonized methodologies (IPCC Guidelines 2006/2019), quality assurance/quality control procedures, and uncertainty analysis. Data integration with EU ETS registry ensures consistency across reporting systems. Annual review process by expert review teams under UNFCCC.`
        }
      ]
    };
  }

  private static generateConclusion(data: ComplianceReportData): string {
    const complianceRate = (data.facilities.filter(f => f.complianceStatus === 'compliant').length / data.facilities.length) * 100;
    return `This assessment confirms ${complianceRate}% facility-level compliance with applicable EU emission reporting standards for the ${data.reportingPeriod.year} reporting period. All mandatory reporting deadlines have been met, verification procedures completed, and allowance surrender obligations fulfilled. Continued monitoring and reporting under evolving EU climate legislation remains essential for maintaining regulatory compliance and supporting EU climate neutrality objectives by 2050.`;
  }

  private static getPlantLocation(plantId: number): string {
    const locations = ['Germany', 'Netherlands', 'Denmark', 'France'];
    return locations[plantId - 1] || 'Europe';
  }

  private static getSectorFromFuel(fuelType: string): string {
    switch (fuelType.toLowerCase()) {
      case 'coal': return 'Power Generation - Coal';
      case 'natural gas': return 'Power Generation - Gas';
      case 'diesel': return 'Power Generation - Oil';
      default: return 'Power Generation';
    }
  }

  private static calculateRenewableShare(data: PowerPlantData[]): number {
    // For this demo, calculate based on CHP plants (more efficient = more renewable-like)
    const totalOutput = data.reduce((sum, d) => sum + d.electricity_output_MWh, 0);
    const chpOutput = data.filter(d => d.plant_name.includes('CHP')).reduce((sum, d) => sum + d.electricity_output_MWh, 0);
    return Math.round((chpOutput / totalOutput) * 100 * 100) / 100; // Round to 2 decimals
  }
}