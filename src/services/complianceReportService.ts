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
    
    // Extract SEC-eligible facilities (US companies + non-US with US operations)
    const secEligibleFacilities = this.extractSECEligibleFacilities(data);
    
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
        secEligibleFacilities,
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

    return {
      ...baseData,
      secDisclosure,
      dataActCompliance,
      complianceMapping
    };
  }

  private static generateSECDisclosure(
    data: PowerPlantData[], 
    metrics: any, 
    totalCH4: number, 
    totalN2O: number
  ): SECClimateDisclosure {
    return {
      ghgEmissions: {
        scope1: metrics.totalEmissions + totalCH4 + totalN2O, // Direct emissions
        scope2: metrics.totalElectricity * 0.4, // Estimated grid emissions
        scope3: metrics.totalElectricity * 0.1, // Estimated upstream emissions
        methodology: 'EPA GHG Reporting Program methodologies and IPCC Guidelines',
        verificationStatus: 'verified'
      },
      climateRisks: {
        physicalRisks: [
          {
            type: 'Acute Physical Risk',
            description: 'Extreme weather events affecting power generation facilities',
            timeHorizon: 'short',
            likelihood: 'medium',
            impact: 'high',
            mitigationMeasures: ['Emergency response protocols', 'Infrastructure hardening', 'Insurance coverage']
          },
          {
            type: 'Chronic Physical Risk',
            description: 'Rising temperatures affecting cooling efficiency',
            timeHorizon: 'long',
            likelihood: 'high',
            impact: 'medium',
            mitigationMeasures: ['Cooling system upgrades', 'Alternative cooling technologies']
          }
        ],
        transitionRisks: [
          {
            type: 'Policy and Legal Risk',
            description: 'Carbon pricing and emission regulations',
            timeHorizon: 'medium',
            likelihood: 'high',
            impact: 'high',
            mitigationMeasures: ['Fuel switching', 'Efficiency improvements', 'Carbon capture technology']
          },
          {
            type: 'Technology Risk',
            description: 'Stranded assets from renewable energy transition',
            timeHorizon: 'long',
            likelihood: 'medium',
            impact: 'high',
            mitigationMeasures: ['Portfolio diversification', 'Renewable energy investments']
          }
        ]
      },
      financialImpacts: {
        costs: [
          {
            category: 'Carbon Compliance Costs',
            amount: metrics.totalEmissions * 85, // EUR 85/tonne estimated
            currency: 'EUR',
            description: 'EU ETS allowance costs and compliance expenses',
            timeframe: '2025'
          },
          {
            category: 'Transition Investments',
            amount: 15000000, // 15M EUR estimated
            currency: 'EUR',
            description: 'Investments in efficiency improvements and fuel switching',
            timeframe: '2025-2030'
          }
        ],
        revenues: [
          {
            category: 'Green Energy Premium',
            amount: metrics.totalElectricity * 5, // 5 EUR/MWh premium
            currency: 'EUR',
            description: 'Premium pricing for low-carbon electricity',
            timeframe: '2025'
          }
        ],
        capitalExpenditures: [
          {
            category: 'Decarbonization CapEx',
            amount: 25000000, // 25M EUR estimated
            currency: 'EUR',
            description: 'Capital investments in clean technology and infrastructure',
            timeframe: '2025-2030'
          }
        ]
      },
      scenarioAnalysis: {
        scenarios: [
          {
            name: '1.5°C Scenario',
            description: 'Rapid decarbonization aligned with Paris Agreement',
            temperatureIncrease: 1.5,
            assumptions: ['Carbon price reaches EUR 200/tonne by 2030', 'Renewable energy dominance', 'Phase-out of fossil fuels'],
            impacts: [
              {
                category: 'Stranded Assets',
                amount: -50000000,
                currency: 'EUR',
                description: 'Impairment of fossil fuel assets',
                timeframe: '2025-2035'
              }
            ]
          },
          {
            name: '3°C Scenario',
            description: 'Current policies scenario with limited climate action',
            temperatureIncrease: 3.0,
            assumptions: ['Moderate carbon pricing', 'Gradual transition', 'Continued fossil fuel use'],
            impacts: [
              {
                category: 'Physical Damage',
                amount: -10000000,
                currency: 'EUR',
                description: 'Infrastructure damage from extreme weather',
                timeframe: '2030-2050'
              }
            ]
          }
        ],
        netZeroPathway: {
          targetYear: 2050,
          milestones: [
            { year: 2030, emissionReduction: 50, description: '50% emission reduction vs 2025 baseline' },
            { year: 2040, emissionReduction: 80, description: '80% emission reduction vs 2025 baseline' },
            { year: 2050, emissionReduction: 100, description: 'Net zero emissions achieved' }
          ],
          investments: [
            {
              category: 'Clean Technology',
              amount: 100000000,
              currency: 'EUR',
              description: 'Total investment in clean technology and infrastructure',
              timeframe: '2025-2050'
            }
          ]
        }
      }
    };
  }

  private static generateDataActCompliance(): DataActCompliance {
    return {
      dataInteroperability: {
        formats: ['JSON', 'CSV', 'XML', 'ESEF'],
        standards: ['ISO 14064', 'GRI Standards', 'TCFD', 'SASB'],
        apiEndpoints: ['/api/emissions', '/api/compliance', '/api/reports']
      },
      dataPortability: {
        exportFormats: ['JSON', 'CSV', 'XML', 'PDF'],
        transferMechanisms: ['API', 'Secure File Transfer', 'Data Portal'],
        retentionPeriod: 7 // years
      },
      accessControls: {
        roles: [
          {
            role: 'regulator',
            permissions: ['read', 'export'],
            dataScope: ['emissions', 'compliance', 'verification']
          },
          {
            role: 'internal',
            permissions: ['read', 'write', 'export'],
            dataScope: ['all']
          },
          {
            role: 'partner',
            permissions: ['read'],
            dataScope: ['aggregated_data']
          },
          {
            role: 'public',
            permissions: ['read'],
            dataScope: ['summary_data']
          }
        ],
        permissions: [
          { action: 'read', resource: 'emissions_data' },
          { action: 'export', resource: 'compliance_reports', conditions: ['authenticated', 'authorized'] },
          { action: 'share', resource: 'aggregated_metrics', conditions: ['data_minimization'] }
        ]
      },
      auditLogging: {
        enabled: true,
        retentionPeriod: 10, // years
        loggedEvents: ['data_access', 'data_export', 'data_sharing', 'report_generation', 'user_authentication']
      }
    };
  }

  // Extract facilities subject to SEC climate disclosure requirements
  private static extractSECEligibleFacilities(data: PowerPlantData[]) {
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
      const totalElectricity = plantData.reduce((sum, d) => sum + d.electricity_output_MWh, 0);
      const totalHeat = plantData.reduce((sum, d) => sum + d.heat_output_MWh, 0);
      const totalFuel = plantData.reduce((sum, d) => sum + d.fuel_consumption_MWh, 0);
      const totalCO2 = plantData.reduce((sum, d) => sum + d.CO2_emissions_tonnes, 0);
      const totalCH4 = plantData.reduce((sum, d) => sum + d.CH4_emissions_kg, 0) / 1000; // Convert to tonnes
      const totalN2O = plantData.reduce((sum, d) => sum + d.N2O_emissions_kg, 0) / 1000; // Convert to tonnes
      const totalCO2e = totalCO2 + (totalCH4 * 25) + (totalN2O * 298); // GWP factors
      const avgEfficiency = plantData.reduce((sum, d) => sum + d.efficiency_percent, 0) / plantData.length;
      
      // Determine SEC eligibility and location
      const location = this.getPlantLocation(first.plant_id);
      const isUSCompany = location === 'US' || first.plant_id === 1; // Alpha Power as US company
      const hasUSOperations = location !== 'US' && first.plant_id <= 2; // Beta Energy has US operations
      const secEligible = isUSCompany || hasUSOperations;
      
      if (!secEligible) return null;
      
      // Calculate renewable share (CHP plants considered more renewable-like)
      const renewableShare = first.plant_name.includes('CHP') ? 25 : 
                           first.fuel_type === 'Natural Gas' ? 15 : 5;
      
      // Simulate allowances (110% of emissions for compliance buffer)
      const allowancesAllocated = Math.ceil(totalCO2e * 1.1);
      const allowancesUsed = Math.round(totalCO2e);
      const complianceStatus = allowancesUsed <= allowancesAllocated ? 'Compliant' : 
                              allowancesUsed > allowancesAllocated * 1.2 ? 'Shortfall' : 'Surplus';
      
      // Generate SEC disclosure notes
      const secNote = this.generateSECDisclosureNote(first, totalCO2e, complianceStatus);
      
      return {
        facility: first.plant_name,
        location: isUSCompany ? 'US' : `${location} (US Ops)`,
        sector: this.getSECSector(first.fuel_type),
        emissionsCO2e: Math.round(totalCO2e),
        emissionsCO2: Math.round(totalCO2),
        emissionsCH4: Math.round(totalCH4 * 1000) / 1000, // Keep 3 decimals
        emissionsN2O: Math.round(totalN2O * 1000) / 1000, // Keep 3 decimals
        energyMWh: Math.round(totalElectricity + totalHeat),
        renewableShare,
        allowancesAllocated,
        allowancesUsed,
        complianceStatus,
        secNote
      };
    }).filter(Boolean); // Remove null entries
  }

  private static getSECSector(fuelType: string): string {
    switch (fuelType.toLowerCase()) {
      case 'coal': return 'Energy - Coal';
      case 'natural gas': return 'Energy - Gas';
      case 'diesel': return 'Energy - Oil';
      default: return 'Energy';
    }
  }

  private static generateSECDisclosureNote(plant: PowerPlantData, totalCO2e: number, status: string): string {
    const riskLevel = totalCO2e > 2000 ? 'high' : totalCO2e > 1000 ? 'medium' : 'low';
    const baseNotes = [
      'Disclosed physical climate risks',
      'SEC Scope 1+2 disclosure filed',
      'Climate governance framework implemented',
      'Financial exposure quantified',
      'Transition risk assessment completed'
    ];
    
    let note = baseNotes[plant.plant_id - 1] || baseNotes[0];
    
    if (riskLevel === 'high') {
      note += '; Material climate risks identified';
    }
    
    if (status !== 'Compliant') {
      note += '; Enhanced monitoring required';
    }
    
    return note;
  }

  private static generateReport(data: EnhancedComplianceReportData): ComplianceReport {
    const sections: ReportSection[] = [
      this.generateCSRDSection(data),
      this.generateESRSSection(data),
      this.generateETSSection(data),
      this.generateClimateMonitoringSection(data)
    ];

    // Add SEC section if SEC disclosure is present
    if (data.secDisclosure) {
      sections.push(this.generateSECSection(data));
    }

    // Add Data Act section
    sections.push(this.generateDataActSection(data));

    return {
      title: data.secDisclosure ? 'Multi-Jurisdictional Emission Reporting Standards (2025)' : 'EU Emission Reporting Standards (2025)',
      executiveSummary: this.generateExecutiveSummary(data),
      reportingPeriod: data.reportingPeriod,
      facilities: data.facilities,
      aggregatedData: data.aggregatedData,
      sections,
      conclusion: this.generateConclusion(data),
      generatedAt: new Date().toISOString(),
      reportingEntity: 'European Power Generation Consortium',
      jurisdiction: data.secDisclosure ? 'COMBINED' : 'EU',
      framework: data.complianceMapping.eu.concat(data.secDisclosure ? data.complianceMapping.us : [])
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

  private static generateSECSection(data: EnhancedComplianceReportData): ReportSection {
    const sec = data.secDisclosure!;
    
    return {
      title: '5. US SEC Climate-Related Disclosures',
      content: 'Assessment of compliance with SEC Climate-Related Disclosure Rules (2024).',
      subsections: [
        {
          title: 'Scope & Applicability',
          content: `The SEC Climate-Related Disclosure Rules apply to public companies required to file annual reports. Our reporting entity qualifies as a large accelerated filer, requiring comprehensive climate-related disclosures including GHG emissions, climate risks, and financial impacts. Scope 1 emissions: ${sec.ghgEmissions.scope1.toFixed(0)} tCO₂e, Scope 2 emissions: ${sec.ghgEmissions.scope2.toFixed(0)} tCO₂e.`
        },
        {
          title: 'Requirements',
          content: `SEC rules mandate disclosure of material climate-related risks, GHG emissions (Scope 1 and 2, and material Scope 3), and quantified financial impacts. Physical risks include extreme weather events with high impact potential. Transition risks encompass policy changes with estimated compliance costs of EUR ${sec.financialImpacts.costs[0]?.amount.toLocaleString()} annually. Scenario analysis covers 1.5°C and 3°C pathways with net zero target by ${sec.scenarioAnalysis.netZeroPathway.targetYear}.`
        },
        {
          title: 'Legal Basis',
          content: 'SEC Final Rule on "The Enhancement and Standardization of Climate-Related Disclosures for Investors" (Release Nos. 33-11275; 34-99678), effective for large accelerated filers beginning with fiscal year 2025.'
        },
        {
          title: 'Implications in Practice',
          content: `Requires annual 10-K disclosure of climate risks, quarterly 8-K reporting of material climate events, and third-party attestation of Scope 1 and 2 emissions. Financial statement impacts must be disclosed when material. Transition investments of EUR ${sec.financialImpacts.capitalExpenditures[0]?.amount.toLocaleString()} planned over 2025-2030 period. Safe harbor provisions apply to forward-looking statements in scenario analysis.`
        }
      ]
    };
  }

  private static generateDataActSection(data: EnhancedComplianceReportData): ReportSection {
    const dataAct = data.dataActCompliance;
    
    return {
      title: '6. EU Data Act Compliance',
      content: 'Implementation of data interoperability, portability, and access control requirements under EU Data Act.',
      subsections: [
        {
          title: 'Scope & Applicability',
          content: `The EU Data Act (Regulation 2023/2854) applies to data holders and users in the EU, establishing rights for data access and portability. Our reporting system qualifies as a data holder for emissions and compliance data, subject to data sharing obligations with authorized parties including regulators, business users, and third parties under specific conditions.`
        },
        {
          title: 'Requirements',
          content: `Data Act mandates interoperability through standardized formats (${dataAct.dataInteroperability.formats.join(', ')}), data portability with ${dataAct.dataPortability.retentionPeriod}-year retention, and role-based access controls for ${dataAct.accessControls.roles.length} user categories. Audit logging enabled for ${dataAct.auditLogging.loggedEvents.length} event types with ${dataAct.auditLogging.retentionPeriod}-year retention. API endpoints available for automated data access and sharing.`
        },
        {
          title: 'Legal Basis',
          content: 'Regulation (EU) 2023/2854 of the European Parliament and of the Council on harmonised rules on fair access to and use of data (Data Act), applicable from September 2025.'
        },
        {
          title: 'Implications in Practice',
          content: `Requires technical implementation of data portability mechanisms, standardized APIs for data sharing, and comprehensive access control systems. Data minimization principles apply to all sharing activities. Regulatory authorities have enhanced access rights to emissions and compliance data. Business users can request data portability with 30-day response time. Audit trails maintain compliance evidence for regulatory inspections.`
        }
      ]
    };
  }

  private static generateConclusion(data: ComplianceReportData): string {
    const complianceRate = (data.facilities.filter(f => f.complianceStatus === 'compliant').length / data.facilities.length) * 100;
    const enhanced = data as EnhancedComplianceReportData;
    const frameworks = enhanced.secDisclosure ? 'EU and US emission reporting standards' : 'EU emission reporting standards';
    const additional = enhanced.secDisclosure ? ' US SEC climate disclosure requirements have been addressed with comprehensive risk assessment and financial impact quantification.' : '';
    
    return `This assessment confirms ${complianceRate}% facility-level compliance with applicable ${frameworks} for the ${data.reportingPeriod.year} reporting period. All mandatory reporting deadlines have been met, verification procedures completed, and allowance surrender obligations fulfilled.${additional} EU Data Act compliance ensures data interoperability and access rights are properly implemented. Continued monitoring and reporting under evolving climate legislation remains essential for maintaining regulatory compliance and supporting climate neutrality objectives.`;
  }

  private static getPlantLocation(plantId: number): string {
    // For SEC reporting, Alpha Power is US-based, others are EU with potential US operations
    const locations = ['US', 'Germany', 'Denmark', 'France'];
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
    const chpOutput = data.filter(d => d.plant_name?.includes('CHP')).reduce((sum, d) => sum + d.electricity_output_MWh, 0);
    return Math.round((chpOutput / totalOutput) * 100 * 100) / 100; // Round to 2 decimals
  }

  // Export data in various formats for Data Act compliance
  static async exportData(format: 'JSON' | 'CSV' | 'XML', userRole: string): Promise<string> {
    try {
      const response = await fetch('/sample_data.csv');
      const csvText = await response.text();
      const parsedData = parseCSVData(csvText);
      const reportData = this.processDataForCompliance(parsedData, 'COMBINED');

      // Apply role-based filtering
      const filteredData = this.applyRoleBasedFiltering(reportData, userRole);

      switch (format) {
        case 'JSON':
          return JSON.stringify(filteredData, null, 2);
        case 'CSV':
          return this.convertToCSV(filteredData);
        case 'XML':
          return this.convertToXML(filteredData);
        default:
          throw new Error('Unsupported format');
      }
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  private static applyRoleBasedFiltering(data: EnhancedComplianceReportData, role: string): any {
    const roleConfig = data.dataActCompliance.accessControls.roles.find(r => r.role === role);
    if (!roleConfig) {
      throw new Error('Unauthorized role');
    }

    // Apply data scope filtering based on role
    if (roleConfig.dataScope.includes('all')) {
      return data;
    }

    // Return filtered data based on role permissions
    const filtered: any = {
      reportingPeriod: data.reportingPeriod,
      aggregatedData: roleConfig.dataScope.includes('aggregated_data') ? data.aggregatedData : undefined,
      facilities: roleConfig.dataScope.includes('emissions') ? data.facilities : undefined,
    };

    return filtered;
  }

  private static convertToCSV(data: any): string {
    // Simple CSV conversion - in production, use a proper CSV library
    const headers = Object.keys(data);
    const values = Object.values(data).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
    return `${headers.join(',')}\n${values.join(',')}`;
  }

  private static convertToXML(data: any): string {
    // Simple XML conversion - in production, use a proper XML library
    const xmlString = Object.entries(data)
      .map(([key, value]) => `<${key}>${typeof value === 'object' ? JSON.stringify(value) : value}</${key}>`)
      .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<ComplianceData>\n${xmlString}\n</ComplianceData>`;
  }
}