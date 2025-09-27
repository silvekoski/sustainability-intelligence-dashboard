import React from 'react';
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';

export const Reports: React.FC = () => {
  // Function to handle report downloads
  const handleDownload = (report: any) => {
    // In a real application, this would fetch the actual file from the server
    // For demo purposes, we'll simulate a download with a blob
    
    // Create sample PDF content (in reality, this would come from your backend)
    const sampleContent = `
${report.title}
Generated: ${formatDate(report.date)}

${report.description}

This is a sample report demonstrating the download functionality.
In a production environment, this would contain:
- Detailed analytics and metrics
- Charts and visualizations
- Executive summaries
- Compliance data
- Recommendations and insights

Report ID: ${report.id}
Format: ${report.format}
Size: ${report.size}
Status: ${report.status}
    `;

    // Create a blob with the content
    const blob = new Blob([sampleContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.replace(/\s+/g, '_')}_${report.date}.txt`;
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Show success message (you could replace this with a toast notification)
    alert(`Downloading: ${report.title}`);
  };

  const reports = [
    {
      id: 1,
      title: "Monthly Emissions Report",
      description: "Comprehensive analysis of CO₂ equivalent emissions across all facilities",
      type: "Emissions",
      date: "2024-12-01",
      status: "ready",
      size: "2.4 MB",
      format: "PDF"
    },
    {
      id: 2,
      title: "Factory Performance Analysis",
      description: "Efficiency metrics and performance comparison across all manufacturing sites",
      type: "Performance",
      date: "2024-12-01",
      status: "ready",
      size: "1.8 MB",
      format: "PDF"
    },
    {
      id: 3,
      title: "Permits Compliance Report",
      description: "Current permit status, utilization rates, and compliance overview",
      type: "Compliance",
      date: "2024-12-01",
      status: "ready",
      size: "1.2 MB",
      format: "PDF"
    },
    {
      id: 4,
      title: "Sustainability Dashboard Summary",
      description: "Executive summary of key sustainability metrics and trends",
      type: "Executive",
      date: "2024-12-01",
      status: "ready",
      size: "3.1 MB",
      format: "PDF"
    },
    {
      id: 5,
      title: "Quarterly Trend Analysis",
      description: "Detailed analysis of quarterly performance trends and forecasts",
      type: "Analytics",
      date: "2024-11-30",
      status: "generating",
      size: "TBD",
      format: "PDF"
    },
    {
      id: 6,
      title: "Satellite Heat Monitoring Report",
      description: "Thermal efficiency analysis based on satellite imagery data",
      type: "Monitoring",
      date: "2024-11-29",
      status: "ready",
      size: "4.7 MB",
      format: "PDF"
    }
  ];

  const reportTypes = [
    { name: "Emissions", count: 1, color: "bg-red-100 text-red-800" },
    { name: "Performance", count: 1, color: "bg-blue-100 text-blue-800" },
    { name: "Compliance", count: 1, color: "bg-green-100 text-green-800" },
    { name: "Executive", count: 1, color: "bg-purple-100 text-purple-800" },
    { name: "Analytics", count: 1, color: "bg-orange-100 text-orange-800" },
    { name: "Monitoring", count: 1, color: "bg-indigo-100 text-indigo-800" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'generating':
        return <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const getTypeColor = (type: string) => {
    const typeConfig = reportTypes.find(t => t.name === type);
    return typeConfig?.color || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Generate and download comprehensive sustainability reports</p>
          </div>
        </div>
      </div>

      {/* Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Reports</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{reports.length}</div>
          <p className="text-sm text-gray-500 mt-1">Available for download</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Download className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Ready</span>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {reports.filter(r => r.status === 'ready').length}
          </div>
          <p className="text-sm text-gray-500 mt-1">Reports ready</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">This Month</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">4</div>
          <p className="text-sm text-gray-500 mt-1">Generated in December</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Processing</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {reports.filter(r => r.status === 'generating').length}
          </div>
          <p className="text-sm text-gray-500 mt-1">Currently generating</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => alert('Generating monthly report... This would trigger report generation in a real application.')}
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-blue-900">Generate Monthly Report</div>
              <div className="text-sm text-blue-700">Create comprehensive monthly analysis</div>
            </div>
          </button>
          
          <button 
            onClick={() => alert('Opening custom report builder... This would open a report configuration modal in a real application.')}
            className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
          >
            <PieChart className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <div className="font-medium text-green-900">Custom Report</div>
              <div className="text-sm text-green-700">Build report with specific metrics</div>
            </div>
          </button>
          
          <button 
            onClick={() => alert('Generating executive summary... This would create a high-level report in a real application.')}
            className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
          >
            <FileText className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <div className="font-medium text-purple-900">Executive Summary</div>
              <div className="text-sm text-purple-700">Generate high-level overview</div>
            </div>
          </button>
        </div>
      </div>

      {/* Report Categories */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Categories</h3>
        <div className="flex flex-wrap gap-3">
          {reportTypes.map((type) => (
            <div key={type.name} className={`px-3 py-2 rounded-lg text-sm font-medium ${type.color}`}>
              {type.name} ({type.count})
            </div>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Available Reports</h3>
          <div className="flex items-center space-x-3">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Types</option>
              <option>Emissions</option>
              <option>Performance</option>
              <option>Compliance</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last year</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="font-semibold text-gray-900">{report.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                      {report.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Generated: {formatDate(report.date)}</span>
                    <span>Size: {report.size}</span>
                    <span>Format: {report.format}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(report.status)}
                  <span className="text-sm text-gray-600 capitalize">{report.status}</span>
                </div>
                
                {report.status === 'ready' && (
                  <button 
                    onClick={() => handleDownload(report)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                )}
                
                {report.status === 'generating' && (
                  <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg">
                    <span>Generating...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Insights */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Report Insights</h3>
            <p className="text-gray-600">Key findings from recent reports</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Efficiency Improvement</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Overall factory efficiency increased by 2.4% compared to last quarter, with Trieste leading at 48% efficiency.
            </p>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Positive Trend
            </span>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Emissions Reduction</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Monthly emissions decreased by 1.2% through optimized fuel switching and improved operational efficiency.
            </p>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              On Target
            </span>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <PieChart className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-gray-900">Compliance Status</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              All facilities maintain full compliance with 15.6 months of permit coverage remaining at current usage rates.
            </p>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              Compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};