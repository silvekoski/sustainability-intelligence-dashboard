import React, { useState } from 'react';
import { FileText, Download, Loader2, CheckCircle, AlertCircle, FileDown } from 'lucide-react';
import { ComplianceReportService } from '../services/complianceReportService';
import { ComplianceReport } from '../types/compliance';
import jsPDF from 'jspdf';

export const ComplianceReportGenerator: React.FC = () => {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const generatedReport = await ComplianceReportService.generateComplianceReport();
      setReport(generatedReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!report) return;

    setDownloadingPdf(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        
        // Check if we need a new page
        if (yPosition + (lines.length * lineHeight) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        lines.forEach((line: string) => {
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
        
        yPosition += 3; // Extra spacing after paragraphs
      };

      // Title
      addText(report.title, 18, true);
      yPosition += 5;

      // Metadata
      addText(`Generated: ${new Date(report.generatedAt).toLocaleDateString()}`, 10);
      addText(`Reporting Entity: ${report.reportingEntity}`, 10);
      yPosition += 5;

      // Executive Summary
      addText('Executive Summary', 14, true);
      addText(report.executiveSummary, 10);
      yPosition += 5;

      // Sections
      report.sections.forEach(section => {
        addText(section.title, 12, true);
        addText(section.content, 10);
        
        section.subsections.forEach(subsection => {
          addText(subsection.title, 11, true);
          addText(subsection.content, 10);
        });
        
        yPosition += 3;
      });

      // Conclusion
      addText('Conclusion', 14, true);
      addText(report.conclusion, 10);

      // Save the PDF
      const fileName = `EU_Emission_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      setError('Failed to generate PDF report');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const downloadMarkdown = () => {
    if (!report) return;

    let content = `# ${report.title}\n\n`;
    content += `**Generated:** ${new Date(report.generatedAt).toLocaleDateString()}\n`;
    content += `**Reporting Entity:** ${report.reportingEntity}\n\n`;
    
    content += `## Executive Summary\n\n${report.executiveSummary}\n\n`;
    
    report.sections.forEach(section => {
      content += `## ${section.title}\n\n${section.content}\n\n`;
      section.subsections.forEach(subsection => {
        content += `### ${subsection.title}\n\n${subsection.content}\n\n`;
      });
    });
    
    content += `## Conclusion\n\n${report.conclusion}\n`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EU_Emission_Report_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">EU Compliance Report Generator</h3>
            <p className="text-sm text-gray-600">Generate formal regulatory compliance reports</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {!report && (
            <button
              onClick={generateReport}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          )}
          
          {report && (
            <div className="flex items-center space-x-3">
              <button
                onClick={downloadPDF}
                disabled={downloadingPdf}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
              
              <button
                onClick={downloadMarkdown}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download MD</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {report && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900">Report Generated Successfully</p>
              <p className="text-xs text-green-700">
                Generated on {new Date(report.generatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">{report.title}</h4>
              <p className="text-sm text-gray-600">{report.reportingEntity}</p>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Executive Summary</h5>
                <p className="text-sm text-gray-700 mb-4">{report.executiveSummary}</p>
                
                {report.sections.map((section, index) => (
                  <div key={index} className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">{section.title}</h5>
                    <p className="text-xs text-gray-600 mb-2">{section.content}</p>
                    
                    {section.subsections.map((subsection, subIndex) => (
                      <div key={subIndex} className="ml-4 mb-2">
                        <h6 className="text-xs font-medium text-gray-800">{subsection.title}</h6>
                        <p className="text-xs text-gray-600">{subsection.content.substring(0, 150)}...</p>
                      </div>
                    ))}
                  </div>
                ))}
                
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Conclusion</h5>
                <p className="text-sm text-gray-700">{report.conclusion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};