import { ComplianceReportData, ComplianceReport, ReportSection } from '../types/compliance';
import { 
  EnhancedComplianceReportData, 
  SECClimateDisclosure, 
  DataActCompliance,
  ClimateRisk,
  FinancialImpact,
  ClimateScenario,
  NetZeroPathway
} from '../types/compliance';
import { PowerPlantData } from '../types';
import { parseCSVData, calculateAggregatedMetrics } from '../utils/dataParser';

export class ComplianceReportService {
  static async generateComplianceReport(jurisdiction: 'EU' | 'US' | 'COMBINED' = 'COMBINED'): Promise<ComplianceReport> {
    try {
      // Load and process data
      const response = await fetch('/sample_data.csv');
      if (!response.ok) {
        throw new Error('Failed to load CSV data');
      }
      
      const csvText = await response.text();
      const parsedData = parseCSVData(csvText);
      const reportData = this.processDataForCompliance(parsedData, jurisdiction);
      
      return this.generateReport(reportData);
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  private static processDataForCompliance(data: PowerPlantData[], jurisdiction: 'EU' | 'US' | 'COMBINED'): EnhancedComplianceReportData {
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

    const baseData = {
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

    // Add SEC Climate Disclosure if US or COMBINED
    let secDisclosure: SECClimateDisclosure | undefined;
    if (jurisdiction === 'US' || jurisdiction === 'COMBINED') {
      secDisclosure = this.generateSECDisclosure(data, metrics, totalCH4, totalN2O);
    }

    // Add EU Data Act Compliance
    const dataActCompliance = this.generateDataActCompliance();

    // Generate compliance mapping
    const complianceMapping = {
      eu: ['CSRD', 'ESRS E1', 'ESRS E2', 'EU ETS', 'MRV', 'UNFCCC'],
      us: ['SEC Climate Rule', 'SEC 10-K', 'SEC 8-K'],
      dataAct: ['Data Interoperability', 'Data Portability', 'Access Controls', 'Audit Logging']
    };

    // ✅ Correct return inside the same function
    return {
      ...baseData,
      secDisclosure,
      dataActCompliance,
      complianceMapping
    };
  }

  // --- rest of your code stays the same ---
  // generateSECDisclosure, generateDataActCompliance, generateReport, generateExecutiveSummary, 
  // generateCSRDSection, generateESRSSection, generateETSSection, generateClimateMonitoringSection,
  // generateSECSection, generateDataActSection, generateConclusion, getPlantLocation, getSectorFromFuel, 
  // calculateRenewableShare, exportData, applyRoleBasedFiltering, convertToCSV, convertToXML
}
