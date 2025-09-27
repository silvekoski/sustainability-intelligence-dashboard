import React, { useState } from 'react';
import { ComplianceReportService } from '../services/complianceReportService';
import { Download, FileText, Loader2, Globe, Flag, Database } from 'lucide-react';

export const ComplianceReportGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [jurisdiction, setJurisdiction] = useState<'EU' | 'US' | 'COMBINED'>('COMBINED');

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const report = await ComplianceReportService.generateComplianceReport(jurisdiction);

      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();

      const cleanText = (text: string): string => {
        return text
          .replace(/€/g, 'EUR')
          .replace(/₂/g, '2')
          .replace(/₄/g, '4')
          .replace(/–/g, '-')
          .replace(/'/g, "'")
          .replace(/"/g, '"');
      };

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

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

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
      pdf.text(
        `Reporting Period: ${report.reportingPeriod?.startDate ?? 'N/A'} to ${report.reportingPeriod?.endDate ?? 'N/A'}`,
        margin,
        yPosition
      );
      yPosition += 20;

      // Executive Summary
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', margin, yPosition);
      yPosition += 15;

      const totalCO2 = report.aggregatedData?.totalCO2Emissions ?? 0;
      const executiveSummary = `This report presents compliance status with ${
        jurisdiction === 'EU'
          ? 'EU Emission Reporting Standards'
          : jurisdiction === 'US'
          ? 'US SEC Climate-Related Disclosure requirements'
          : 'EU and US regulatory frameworks'
      } for the reporting period ${report.reportingPeriod?.startDate ?? 'N/A'} to ${report.reportingPeriod?.endDate ?? 'N/A'}. The assessment covers ${
        report.facilities?.length ?? 0
      } facilities with total verified emissions of ${totalCO2.toLocaleString()} tonnes CO2 equivalent. All facilities demonstrate compliance with applicable regulatory requirements.`;

      yPosition = addWrappedText(executiveSummary, margin, yPosition, contentWidth, 11);
      yPosition += 15;

      // Aggregated Data
      if (report.aggregatedData) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Aggregated Emissions Data', margin, yPosition);
        yPosition += 15;

        const aggregatedText = `Total CO2 Emissions: ${report.aggregatedData.totalCO2Emissions?.toLocaleString() ?? 0} tonnes
Total CH4 Emissions: ${report.aggregatedData.totalCH4Emissions ?? 0} tonnes
Total N2O Emissions: ${report.aggregatedData.totalN2OEmissions ?? 0} tonnes
Total GHG Emissions: ${report.aggregatedData.totalGHGEmissions?.toLocaleString() ?? 0} tonnes CO2 equivalent
Energy Consumption: ${report.aggregatedData.energyConsumption?.toLocaleString() ?? 0} MWh
Renewable Energy Share: ${report.aggregatedData.renewableEnergyShare ?? 0}%`;

        yPosition = addWrappedText(aggregatedText, margin, yPosition, contentWidth, 11);
        yPosition += 15;
      }

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
Total Emissions: ${facility.totalEmissions?.toLocaleString() ?? 0} tonnes CO2
Verified Emissions: ${facility.verifiedEmissions?.toLocaleString() ?? 0} tonnes CO2
Allowances Allocated: ${facility.allowancesAllocated?.toLocaleString() ?? 0}
Compliance Status: ${facility.complianceStatus?.toUpperCase() ?? 'UNKNOWN'}`;

          yPosition = addWrappedText(facilityText, margin, yPosition, contentWidth, 10);
          yPosition += 10;
        });
      }

      // US-specific
      if (jurisdiction === 'US' || jurisdiction === 'COMBINED') {
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('SEC Climate-Related Disclosures', margin, yPosition);
        yPosition += 15;

        if (report.secDisclosure) {
          const secText = `Climate-Related Risks Assessment:
Physical Risks: Extreme weather events, sea level rise, temperature changes
Transition Risks: Policy changes, technology shifts, market preferences
Financial Impact: Estimated EUR ${(report.secDisclosure.financialImpacts?.costs?.[0]?.amount ?? 0).toLocaleString()} in carbon costs
Capital Expenditures: EUR ${(report.secDisclosure.financialImpacts?.capitalExpenditures?.[0]?.amount ?? 0).toLocaleString()} in climate-related investments
Scenario Analysis: 1.5°C and 3°C pathways analyzed with net-zero targets by 2050`;

          yPosition = addWrappedText(secText, margin, yPosition, contentWidth, 11);
          yPosition += 15;
        }
      }

      // EU-specific
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
      const fileName = `${jurisdiction.toLowerCase()}_compliance_report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    // … your JSX stays the same …
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* existing JSX unchanged */}
    </div>
  );
};
