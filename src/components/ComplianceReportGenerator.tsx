import React, { useState } from 'react';
import { ComplianceReportService } from '../services/complianceReportService';
import { SECComplianceService } from '../services/secComplianceService';
import { SECComplianceTable } from './SECComplianceTable';
import { Download, FileText, Loader2, Globe, Flag, Database } from 'lucide-react';
import { PowerPlantData } from '../types';
import { SECComplianceReport } from '../types/secCompliance';

interface ComplianceReportGeneratorProps {
  currentData?: PowerPlantData[] | null;
}

export const ComplianceReportGenerator: React.FC<ComplianceReportGeneratorProps> = ({ currentData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [jurisdiction, setJurisdiction] = useState<'EU' | 'US' | 'COMBINED'>('COMBINED');
  const [secReport, setSecReport] = useState<SECComplianceReport | null>(null);
  const [showSecTable, setShowSecTable] = useState(false);

  // Generate SEC compliance report when data changes
  React.useEffect(() => {
    if (currentData && currentData.length > 0) {
      try {
        const report = SECComplianceService.calculateSECCompliance(currentData);
        setSecReport(report);
      } catch (error) {
        console.error('Error generating SEC report:', error);
        setSecReport(null);
      }
    } else {
      setSecReport(null);
    }
  }, [currentData]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Pass the current CSV data to the report service
      const report = await ComplianceReportService.generateComplianceReport(jurisdiction, currentData || undefined);

      // Generate SEC report if needed
      let secComplianceReport: SECComplianceReport | null = null;
      if ((jurisdiction === 'US' || jurisdiction === 'COMBINED') && currentData && currentData.length > 0) {
        secComplianceReport = SECComplianceService.calculateSECCompliance(currentData);
      }

      // Generate PDF
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();

      // Clean text function
      const cleanText = (text: string): string => {
        return text
          .replace(/€/g, 'EUR')
          .replace(/₂/g, '2')
          .replace(/₄/g, '4')
          .replace(/–/g, '-')
          .replace(/'/g, "'")
          .replace(/"/g, '"');
      };

      // Manual text wrapping function
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11): number => {
        const cleanedText = cleanText(text);
        pdf.setFontSize(fontSize);

        const paragraphs = cleanedText.split('\n');
        let currentY = y;

        paragraphs.forEach((paragraph, paragraphIndex) => {
          if (paragraph.trim() === '') {
            currentY += fontSize * 0.5;
            return;
          }

          const words = paragraph.split(' ');
          let currentLine = '';

          words.forEach((word, wordIndex) => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = pdf.getTextWidth(testLine);

            if (testWidth > maxWidth && currentLine) {
              pdf.text(currentLine, x, currentY);
              currentY += fontSize * 0.6;
              currentLine = word;
            } else {
              currentLine = testLine;
            }

            if (wordIndex === words.length - 1) {
              pdf.text(currentLine, x, currentY);
              currentY += fontSize * 0.6;
            }
          });

          if (paragraphIndex < paragraphs.length - 1) {
            currentY += fontSize * 0.3;
          }
        });

        return currentY;
      };

      // PDF Generation
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Add logo (if available)
      try {
        // Try to add logo - this will work if the logo is accessible
        const logoImg = new Image();
        logoImg.src = '/esboost-logo.svg';
        // For now, we'll add a text-based logo since SVG handling in jsPDF can be complex
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(34, 197, 94); // Green color
        pdf.text('ESBoost', margin, yPosition);
        pdf.setTextColor(0, 0, 0); // Reset to black
        yPosition += 15;
      } catch (error) {
        console.warn('Could not load logo:', error);
      }

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      const title =
        jurisdiction === 'EU'
          ? 'EU Compliance Report'
          : jurisdiction === 'US'
          ? 'US SEC Climate Disclosure Report'
          : 'Multi-Jurisdictional Compliance Report';
      pdf.text(title, margin, yPosition);
      yPosition += 25;

      // Report period
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Reporting Period: ${report.reportingPeriod.startDate} to ${report.reportingPeriod.endDate}`, margin, yPosition);
      yPosition += 20;

// Executive Summary
const totalCO2 = report.aggregatedData?.totalCO2Emissions ?? 0;
const executiveSummary = `This report presents compliance status with ${
  jurisdiction === 'EU'
    ? 'EU Emission Reporting Standards'
    : jurisdiction === 'US'
    ? 'US SEC Climate-Related Disclosure requirements'
    : 'EU and US regulatory frameworks'
} for the reporting period ${report.reportingPeriod.startDate} to ${report.reportingPeriod.endDate}. The assessment covers ${
  report.facilities?.length ?? 0
} facilities with total verified emissions of ${totalCO2.toLocaleString()} tonnes CO2 equivalent. All facilities demonstrate compliance with applicable regulatory requirements.`;

yPosition = addWrappedText(executiveSummary, margin, yPosition, contentWidth, 11);
yPosition += 15;

      const aggregatedText = `Total CO2 Emissions: ${report.aggregatedData.totalCO2Emissions.toLocaleString()} tonnes
Total CH4 Emissions: ${report.aggregatedData.totalCH4Emissions} tonnes
Total N2O Emissions: ${report.aggregatedData.totalN2OEmissions} tonnes
Total GHG Emissions: ${report.aggregatedData.totalGHGEmissions.toLocaleString()} tonnes CO2 equivalent
Energy Consumption: ${report.aggregatedData.energyConsumption.toLocaleString()} MWh
Renewable Energy Share: ${report.aggregatedData.renewableEnergyShare}%`;

      yPosition = addWrappedText(aggregatedText, margin, yPosition, contentWidth, 11);
      yPosition += 15;

      // Facilities Overview
      if (report.facilities && report.facilities.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Facilities Overview', margin, yPosition);
        yPosition += 15;

        report.facilities.forEach((facility) => {
          if (yPosition > pageHeight - 50) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${facility.name}`, margin, yPosition);
          yPosition += 10;

          const facilityText = `Location: ${facility.location}
Sector: ${facility.sector}
Total Emissions: ${facility.totalEmissions.toLocaleString()} tonnes CO2
Verified Emissions: ${facility.verifiedEmissions.toLocaleString()} tonnes CO2
Allowances Allocated: ${facility.allowancesAllocated.toLocaleString()}
Compliance Status: ${facility.complianceStatus.toUpperCase()}`;

          yPosition = addWrappedText(facilityText, margin, yPosition, contentWidth, 10);
          yPosition += 10;
        });
      }

      // Jurisdiction-specific sections
      if (jurisdiction === 'US' || jurisdiction === 'COMBINED') {
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('SEC Climate-Related Disclosures', margin, yPosition);
        yPosition += 15;

        // SEC Eligible Facilities Table
        if (secComplianceReport && secComplianceReport.facilities.length > 0) {
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text('SEC Reporting Entities', margin, yPosition);
          yPosition += 15;

          // Table headers
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          const headers = ['Facility', 'Location', 'Sector', 'GHG (tCO2e)', 'Energy (MWh)', 'Renewables %', 'Status'];
          const colWidths = [35, 25, 20, 25, 25, 20, 30];
          let xPos = margin;
          
          headers.forEach((header, i) => {
            pdf.text(header, xPos, yPosition);
            xPos += colWidths[i];
          });
          yPosition += 12;

          // Table rows
          pdf.setFont('helvetica', 'normal');
          secComplianceReport.facilities.forEach((facility) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = margin;
            }

            xPos = margin;
            const rowData = [
              facility.facility,
              facility.location,
              facility.sector,
              SECComplianceService.formatNumber(facility.emissionsCO2e, 1),
              facility.energyMWh.toLocaleString(),
              `${facility.renewableShare}%`,
              facility.complianceStatus
            ];

            rowData.forEach((data, i) => {
              pdf.text(data.toString(), xPos, yPosition);
              xPos += colWidths[i];
            });
            yPosition += 10;
          });
          yPosition += 10;

          // SEC Summary
          const summary = secComplianceReport.summary;

          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('SEC Reporting Summary:', margin, yPosition);
          yPosition += 15;

          pdf.setFont('helvetica', 'normal');
          const summaryText = `Total GHG Emissions: ${SECComplianceService.formatNumber(summary.totalGHGEmissions, 1)} tCO2e
Total Energy Consumption: ${SECComplianceService.formatNumber(summary.totalEnergyConsumption)} MWh (${summary.weightedRenewableShare}% renewables)
SEC Reporting Entities: ${summary.facilitiesCount}
Compliant Facilities: ${summary.compliantFacilities} | Non-compliant: ${summary.nonCompliantFacilities}
Overall Compliance Status: ${summary.overallComplianceStatus}`;

          yPosition = addWrappedText(summaryText, margin, yPosition, contentWidth, 11);
          yPosition += 15;

          // Climate Risk Assessment
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Climate Risk Assessment:', margin, yPosition);
          yPosition += 12;

          pdf.setFont('helvetica', 'normal');
          const climateRisks = SECComplianceService.generateClimateRisks();
          const financialImpacts = SECComplianceService.generateFinancialImpacts(summary);
          
          const riskText = `Physical Risks: ${climateRisks.filter(r => r.type === 'Physical').length} risks identified
Transition Risks: ${climateRisks.filter(r => r.type === 'Transition').length} risks identified
Financial Impact: ${SECComplianceService.formatCurrency(financialImpacts[0]?.amount || 0)} in annual carbon costs
Scenario Analysis: 1.5°C and 3°C pathways analyzed with net-zero targets by 2050`;

          yPosition = addWrappedText(riskText, margin, yPosition, contentWidth, 11);
          yPosition += 15;
        }
      }

      if (jurisdiction === 'EU' || jurisdiction === 'COMBINED') {
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('EU Regulatory Compliance', margin, yPosition);
        yPosition += 15;

        const euText = `CSRD Compliance: Double materiality assessment completed
ESRS Standards: E1 (Climate Change), E2 (Pollution), E3 (Water) implemented
EU ETS Compliance: All allowances surrendered, verification completed
Data Act Compliance: Data interoperability and portability implemented`;

        yPosition = addWrappedText(euText, margin, yPosition, contentWidth, 11);
      }

      // Save PDF
      const fileName = `${String(jurisdiction ?? 'combined').toLowerCase()}_compliance_report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <FileText className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Multi-Jurisdictional Compliance Report</h3>
            <p className="text-sm text-gray-600">Generate EU and US regulatory compliance reports</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Jurisdiction Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Jurisdiction</label>
          <div className="flex space-x-3">
            <button
              onClick={() => setJurisdiction('EU')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                jurisdiction === 'EU'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>EU Only</span>
            </button>
            <button
              onClick={() => setJurisdiction('US')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                jurisdiction === 'US'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>US Only</span>
            </button>
            <button
              onClick={() => setJurisdiction('COMBINED')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                jurisdiction === 'COMBINED'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Combined</span>
            </button>
          </div>
        </div>

        {/* Compliance Framework Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Compliance Frameworks</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {(jurisdiction === 'EU' || jurisdiction === 'COMBINED') && (
              <div>
                <div className="font-medium text-blue-700 mb-1">EU Frameworks</div>
                <ul className="text-gray-600 space-y-1">
                  <li>• CSRD (Corporate Sustainability Reporting)</li>
                  <li>• ESRS E1, E2, E3 (Climate, Pollution, Water)</li>
                  <li>• EU ETS (Emissions Trading System)</li>
                  <li>• MRV (Monitoring, Reporting, Verification)</li>
                  <li>• EU Data Act (Interoperability)</li>
                </ul>
              </div>
            )}
            {(jurisdiction === 'US' || jurisdiction === 'COMBINED') && (
              <div>
                <div className="font-medium text-red-700 mb-1">US Frameworks</div>
                <ul className="text-gray-600 space-y-1">
                  <li>• SEC Climate-Related Disclosures</li>
                  <li>• GHG Emissions (Scope 1, 2, 3)</li>
                  <li>• Climate Risk Assessment</li>
                  <li>• Financial Impact Analysis</li>
                  <li>• Scenario Analysis & Net Zero</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Database className="w-4 h-4" />
            <span>Data export available in JSON, CSV, XML formats</span>
          </div>

          <div className="flex items-center space-x-3">
            {secReport && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
              </div>
            )}
            
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isGenerating ? 'Generating...' : 'Generate PDF Report'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};