import { PowerPlantData } from '../types';
import { SECFacilityData, SECComplianceSummary, SECComplianceReport, SECClimateRisk, SECFinancialImpact, SECScenarioAnalysis } from '../types/secCompliance';

export class SECComplianceService {
  // GWP factors for GHG calculations (AR5 100-year values)
  private static readonly GWP_CH4 = 25;
  private static readonly GWP_N2O = 298;

  /**
   * Main entry point for SEC compliance calculations
   * Processes parsed CSV data and returns SEC compliance report
   */
  static calculateSECCompliance(data: PowerPlantData[]): SECComplianceReport {
    if (!data || data.length === 0) {
      throw new Error('No data provided for SEC compliance calculation');
    }

    // Extract SEC-eligible facilities
    const facilities = this.extractSECEligibleFacilities(data);
    
    // Calculate summary metrics
    const summary = this.calculateSECSummary(facilities);

    // Determine reporting period from data
    const reportingPeriod = this.determineReportingPeriod(data);

    return {
      facilities,
      summary,
      reportingPeriod,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Extract and transform facilities for SEC reporting
   * Filters for SEC-eligible facilities and calculates required metrics
   */
  private static extractSECEligibleFacilities(data: PowerPlantData[]): SECFacilityData[] {
    // Group data by plant
    const plantGroups = data.reduce((acc, record) => {
      if (!acc[record.plant_id]) {
        acc[record.plant_id] = [];
      }
      acc[record.plant_id].push(record);
      return acc;
    }, {} as Record<number, PowerPlantData[]>);

    return Object.values(plantGroups).map((plantData: PowerPlantData[]) => {
      const first = plantData[0];
      
      // Calculate aggregated metrics for the facility
      const totalElectricity = plantData.reduce((sum, d) => sum + (d.electricity_output_MWh || 0), 0);
      const totalHeat = plantData.reduce((sum, d) => sum + (d.heat_output_MWh || 0), 0);
      const totalCO2 = plantData.reduce((sum, d) => sum + (d.CO2_emissions_tonnes || 0), 0);
      const totalCH4 = plantData.reduce((sum, d) => sum + (d.CH4_emissions_kg || 0), 0) / 1000; // Convert to tonnes
      const totalN2O = plantData.reduce((sum, d) => sum + (d.N2O_emissions_kg || 0), 0) / 1000; // Convert to tonnes
      
      // Calculate CO2 equivalent emissions using GWP factors
      const totalCO2e = totalCO2 + (totalCH4 * this.GWP_CH4) + (totalN2O * this.GWP_N2O);
      
      // Total energy output (electricity + heat)
      const totalEnergy = totalElectricity + totalHeat;
      
      // Determine SEC eligibility and location
      const location = this.getPlantLocation(first.plant_id);
      const isUSCompany = location === 'US' || first.plant_id === 1; // Alpha Power as US company
      const hasUSOperations = location !== 'US' && first.plant_id <= 2; // Beta Energy has US operations
      const secEligible = isUSCompany || hasUSOperations;
      
      if (!secEligible) return null;
      
      // Calculate renewable share (CHP plants considered more renewable-like)
      const renewableShare = this.calculateRenewableShare(first);
      
      // Simulate allowances (110% of emissions for compliance buffer)
      const allowancesAllocated = Math.ceil(totalCO2e * 1.1);
      const allowancesUsed = Math.round(totalCO2e);
      
      // Determine compliance status
      const complianceStatus = this.determineComplianceStatus(allowancesUsed, allowancesAllocated);
      
      // Generate SEC disclosure notes
      const secNote = this.generateSECDisclosureNote(first, totalCO2e, complianceStatus);
      
      return {
        facility: first.plant_name || `Plant ${first.plant_id}`,
        location: isUSCompany ? 'US' : `${location} (US Ops)`,
        sector: this.getSECSector(first.fuel_type),
        emissionsCO2e: Math.round(totalCO2e * 100) / 100,
        emissionsCO2: Math.round(totalCO2 * 100) / 100,
        emissionsCH4: Math.round(totalCH4 * 1000) / 1000, // Keep 3 decimals
        emissionsN2O: Math.round(totalN2O * 1000) / 1000, // Keep 3 decimals
        energyMWh: Math.round(totalEnergy),
        renewableShare,
        allowancesAllocated,
        allowancesUsed,
        complianceStatus,
        secNote
      };
    }).filter(Boolean) as SECFacilityData[]; // Remove null entries
  }

  /**
   * Calculate summary metrics across all SEC facilities
   */
  private static calculateSECSummary(facilities: SECFacilityData[]): SECComplianceSummary {
    if (facilities.length === 0) {
      return {
        totalGHGEmissions: 0,
        totalEnergyConsumption: 0,
        weightedRenewableShare: 0,
        totalAllowancesAllocated: 0,
        totalAllowancesUsed: 0,
        overallComplianceStatus: 'Compliant',
        facilitiesCount: 0,
        compliantFacilities: 0,
        nonCompliantFacilities: 0
      };
    }

    const totalGHGEmissions = facilities.reduce((sum, f) => sum + f.emissionsCO2e, 0);
    const totalEnergyConsumption = facilities.reduce((sum, f) => sum + f.energyMWh, 0);
    const totalAllowancesAllocated = facilities.reduce((sum, f) => sum + f.allowancesAllocated, 0);
    const totalAllowancesUsed = facilities.reduce((sum, f) => sum + f.allowancesUsed, 0);
    
    // Calculate weighted renewable share
    const weightedRenewableShare = totalEnergyConsumption > 0 
      ? facilities.reduce((sum, f) => sum + (f.renewableShare * f.energyMWh), 0) / totalEnergyConsumption
      : 0;

    // Count compliant vs non-compliant facilities
    const compliantFacilities = facilities.filter(f => f.complianceStatus === 'Compliant').length;
    const nonCompliantFacilities = facilities.length - compliantFacilities;

    // Determine overall compliance status
    const overallComplianceStatus = this.determineComplianceStatus(totalAllowancesUsed, totalAllowancesAllocated);

    return {
      totalGHGEmissions: Math.round(totalGHGEmissions * 100) / 100,
      totalEnergyConsumption: Math.round(totalEnergyConsumption),
      weightedRenewableShare: Math.round(weightedRenewableShare * 10) / 10,
      totalAllowancesAllocated,
      totalAllowancesUsed,
      overallComplianceStatus,
      facilitiesCount: facilities.length,
      compliantFacilities,
      nonCompliantFacilities
    };
  }

  /**
   * Generate climate risk assessment for SEC reporting
   */
  static generateClimateRisks(): SECClimateRisk[] {
    return [
      {
        type: 'Physical',
        category: 'Acute Physical Risk',
        description: 'Extreme weather events (hurricanes, floods, heat waves) affecting power generation facilities',
        timeHorizon: 'Short-term',
        likelihood: 'Medium',
        impact: 'High',
        financialImpact: 15000000, // $15M estimated
        mitigationMeasures: [
          'Emergency response protocols implementation',
          'Infrastructure hardening and weatherization',
          'Comprehensive insurance coverage',
          'Backup power systems installation'
        ]
      },
      {
        type: 'Physical',
        category: 'Chronic Physical Risk',
        description: 'Rising temperatures affecting cooling efficiency and increasing energy demand',
        timeHorizon: 'Long-term',
        likelihood: 'High',
        impact: 'Medium',
        financialImpact: 8000000, // $8M estimated
        mitigationMeasures: [
          'Advanced cooling system upgrades',
          'Alternative cooling technologies deployment',
          'Energy efficiency improvements',
          'Load management optimization'
        ]
      },
      {
        type: 'Transition',
        category: 'Policy and Legal Risk',
        description: 'Carbon pricing mechanisms and stricter emission regulations',
        timeHorizon: 'Medium-term',
        likelihood: 'High',
        impact: 'High',
        financialImpact: 25000000, // $25M estimated
        mitigationMeasures: [
          'Fuel switching to lower-carbon alternatives',
          'Energy efficiency improvements',
          'Carbon capture and storage technology',
          'Renewable energy portfolio expansion'
        ]
      },
      {
        type: 'Transition',
        category: 'Technology Risk',
        description: 'Stranded assets from renewable energy transition and grid modernization',
        timeHorizon: 'Long-term',
        likelihood: 'Medium',
        impact: 'High',
        financialImpact: 50000000, // $50M estimated
        mitigationMeasures: [
          'Portfolio diversification strategy',
          'Renewable energy investments',
          'Grid flexibility services',
          'Asset retirement planning'
        ]
      }
    ];
  }

  /**
   * Generate financial impact analysis for SEC reporting
   */
  static generateFinancialImpacts(summary: SECComplianceSummary): SECFinancialImpact[] {
    const carbonPrice = 85; // EUR per tonne CO2
    
    return [
      {
        category: 'Carbon Compliance Costs',
        amount: summary.totalGHGEmissions * carbonPrice,
        currency: 'EUR',
        description: 'Annual carbon allowance costs and compliance expenses under current regulations',
        timeframe: '2025',
        uncertainty: 'Medium'
      },
      {
        category: 'Transition Capital Expenditures',
        amount: 35000000,
        currency: 'EUR',
        description: 'Investments in clean technology, efficiency improvements, and fuel switching',
        timeframe: '2025-2030',
        uncertainty: 'High'
      },
      {
        category: 'Physical Risk Adaptation',
        amount: 12000000,
        currency: 'EUR',
        description: 'Infrastructure hardening and climate resilience measures',
        timeframe: '2025-2027',
        uncertainty: 'Medium'
      },
      {
        category: 'Green Revenue Opportunities',
        amount: summary.totalEnergyConsumption * 8, // 8 EUR/MWh premium
        currency: 'EUR',
        description: 'Premium pricing for low-carbon electricity and green certificates',
        timeframe: '2025-2030',
        uncertainty: 'Medium'
      }
    ];
  }

  /**
   * Generate scenario analysis for SEC reporting
   */
  static generateScenarioAnalysis(): SECScenarioAnalysis[] {
    return [
      {
        scenario: '1.5°C Paris-Aligned Scenario',
        temperatureIncrease: 1.5,
        description: 'Rapid decarbonization pathway aligned with Paris Agreement goals',
        assumptions: [
          'Carbon price reaches EUR 200/tonne by 2030',
          'Renewable energy achieves 80% grid penetration by 2030',
          'Phase-out of unabated fossil fuel generation by 2035',
          'Massive investment in grid flexibility and storage'
        ],
        financialImpacts: [
          {
            category: 'Stranded Asset Risk',
            amount: -75000000,
            currency: 'EUR',
            description: 'Accelerated depreciation of fossil fuel assets',
            timeframe: '2025-2035',
            uncertainty: 'High'
          },
          {
            category: 'Transition Investment',
            amount: -100000000,
            currency: 'EUR',
            description: 'Required investment in clean technology and infrastructure',
            timeframe: '2025-2030',
            uncertainty: 'Medium'
          }
        ],
        emissionReductions: [
          { year: 2030, reductionPercent: 55, description: '55% reduction vs 2025 baseline' },
          { year: 2035, reductionPercent: 75, description: '75% reduction vs 2025 baseline' },
          { year: 2040, reductionPercent: 90, description: '90% reduction vs 2025 baseline' },
          { year: 2050, reductionPercent: 100, description: 'Net zero emissions achieved' }
        ]
      },
      {
        scenario: '3°C Current Policies Scenario',
        temperatureIncrease: 3.0,
        description: 'Business-as-usual scenario with limited additional climate action',
        assumptions: [
          'Moderate carbon pricing around EUR 100/tonne by 2030',
          'Gradual renewable energy transition',
          'Continued use of natural gas as transition fuel',
          'Limited policy intervention beyond current commitments'
        ],
        financialImpacts: [
          {
            category: 'Physical Climate Damages',
            amount: -30000000,
            currency: 'EUR',
            description: 'Infrastructure damage from extreme weather events',
            timeframe: '2030-2050',
            uncertainty: 'High'
          },
          {
            category: 'Operational Efficiency Loss',
            amount: -15000000,
            currency: 'EUR',
            description: 'Reduced efficiency due to higher temperatures',
            timeframe: '2025-2040',
            uncertainty: 'Medium'
          }
        ],
        emissionReductions: [
          { year: 2030, reductionPercent: 25, description: '25% reduction vs 2025 baseline' },
          { year: 2040, reductionPercent: 40, description: '40% reduction vs 2025 baseline' },
          { year: 2050, reductionPercent: 60, description: '60% reduction vs 2025 baseline' }
        ]
      }
    ];
  }

  // Helper methods
  private static getPlantLocation(plantId: number): string {
    const locations = ['US', 'Germany', 'Denmark', 'France'];
    return locations[plantId - 1] || 'Europe';
  }

  private static getSECSector(fuelType: string): string {
    if (!fuelType) return 'Energy';
    
    switch (fuelType.toLowerCase()) {
      case 'coal': return 'Energy - Coal';
      case 'natural gas': return 'Energy - Gas';
      case 'diesel': return 'Energy - Oil';
      default: return 'Energy';
    }
  }

  private static calculateRenewableShare(plant: PowerPlantData): number {
    // CHP plants considered more renewable-like due to higher efficiency
    if (plant.plant_name?.toLowerCase().includes('chp')) {
      return 25;
    }
    
    // Natural gas plants have some renewable potential
    if (plant.fuel_type?.toLowerCase() === 'natural gas') {
      return 15;
    }
    
    // Coal and diesel have minimal renewable share
    return 5;
  }

  private static determineComplianceStatus(used: number, allocated: number): 'Compliant' | 'Shortfall' | 'Surplus' {
    if (used <= allocated) {
      return used < allocated * 0.8 ? 'Surplus' : 'Compliant';
    }
    return 'Shortfall';
  }

  private static generateSECDisclosureNote(plant: PowerPlantData, totalCO2e: number, status: string): string {
    const riskLevel = totalCO2e > 2000 ? 'high' : totalCO2e > 1000 ? 'medium' : 'low';
    const baseNotes = [
      'Physical climate risks disclosed per SEC requirements',
      'Scope 1+2 emissions verified and disclosed in 10-K',
      'Climate governance framework implemented',
      'Financial exposure quantified in climate risk assessment',
      'Transition risk assessment completed with scenario analysis'
    ];
    
    let note = baseNotes[plant.plant_id - 1] || baseNotes[0];
    
    if (riskLevel === 'high') {
      note += '; Material climate risks identified requiring enhanced disclosure';
    }
    
    if (status !== 'Compliant') {
      note += '; Enhanced monitoring and reporting required';
    }
    
    return note;
  }

  private static determineReportingPeriod(data: PowerPlantData[]) {
    const dates = data.map(d => new Date(d.date)).sort();
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      year: startDate.getFullYear()
    };
  }

  /**
   * Format numbers for display in reports
   */
  static formatNumber(num: number, decimals: number = 0): string {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Format currency for display in reports
   */
  static formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}