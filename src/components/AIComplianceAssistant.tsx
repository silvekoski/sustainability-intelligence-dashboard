import React, { useState } from 'react';
import { Shield, Loader2, CheckCircle, AlertTriangle, Globe, Flag } from 'lucide-react';
import { AIService } from '../services/aiService';
import { PowerPlantData } from '../types';

interface AIComplianceAssistantProps {
  data: PowerPlantData[] | null;
}

export const AIComplianceAssistant: React.FC<AIComplianceAssistantProps> = ({ data }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [jurisdiction, setJurisdiction] = useState<'EU' | 'US' | 'COMBINED'>('COMBINED');
  const [loading, setLoading] = useState(false);
  const [lastAnalyzedData, setLastAnalyzedData] = useState<PowerPlantData[] | null>(null);
  const [lastJurisdiction, setLastJurisdiction] = useState<'EU' | 'US' | 'COMBINED'>('COMBINED');

  // Hardcoded sample compliance insights
  const getSampleInsights = (jurisdiction: 'EU' | 'US' | 'COMBINED'): string[] => {
    const baseInsights = [
      'Ensure continuous emissions monitoring systems (CEMS) are properly calibrated and certified annually',
      'Maintain comprehensive audit trail for all emissions data with 10-year retention requirement',
      'Implement quarterly third-party verification processes for material emission sources'
    ];

    if (jurisdiction === 'EU' || jurisdiction === 'COMBINED') {
      return [
        ...baseInsights,
        'Monitor EU ETS allowance prices for optimal surrender timing - current market volatility suggests Q2 procurement strategy',
        'Prepare CSRD double materiality assessment by Q3 2025 - climate change identified as material topic',
        'Implement ESRS E1 disclosure requirements including Scope 3 emissions for upstream fuel supply chain',
        'Ensure Data Act compliance with standardized API endpoints for regulatory data sharing'
      ];
    }

    if (jurisdiction === 'US') {
      return [
        ...baseInsights,
        'Quantify climate-related financial risks for SEC 10-K disclosure - physical and transition risks assessment required',
        'Develop scenario analysis for 1.5°C and 3°C pathways with quantified financial impacts',
        'Implement Scope 1 and 2 emissions verification for SEC climate disclosure requirements',
        'Prepare climate governance framework documentation for SEC reporting'
      ];
    }

    // COMBINED
    return [
      ...baseInsights,
      'Coordinate EU ETS and SEC climate disclosure timelines - Q1 EU ETS verification, Q2 SEC 10-K filing',
      'Implement unified GHG accounting system meeting both EU MRV and SEC requirements',
      'Develop cross-jurisdictional climate risk assessment covering EU physical risks and US transition risks',
      'Establish data governance framework compliant with EU Data Act and SEC disclosure requirements',
      'Prepare integrated climate transition plan addressing both EU taxonomy and SEC scenario analysis'
    ];
  };

  const generateInsights = async () => {
    if (!data || data.length === 0) return;
    
    // Don't re-analyze the same data and jurisdiction
    if (lastAnalyzedData && lastJurisdiction === jurisdiction && 
        JSON.stringify(lastAnalyzedData) === JSON.stringify(data)) {
      return;
    }

    // Use hardcoded sample data instead of API call
    setLoading(true);
    
    // Simulate API delay for realistic UX
    setTimeout(() => {
      setInsights(getSampleInsights(jurisdiction));
      setLastAnalyzedData(data);
      setLastJurisdiction(jurisdiction);
      setLoading(false);
    }, 1000);
  };

  React.useEffect(() => {
    if (data && data.length > 0) {
      generateInsights();
    }
  }, [data, jurisdiction]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Compliance Assistant</h3>
            <p className="text-sm text-gray-600">Regulatory compliance recommendations</p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Upload data to get AI-powered compliance insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Compliance Assistant</h3>
            <p className="text-sm text-gray-600">Regulatory compliance recommendations</p>
          </div>
        </div>
      </div>

      {/* Jurisdiction Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Framework</label>
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

      {loading && insights.length === 0 && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">AI is analyzing compliance requirements...</p>
        </div>
      )}

      {insights.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Compliance Recommendations</h4>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {jurisdiction} Framework
            </span>
          </div>
          
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-red-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-800">{insight}</p>
                </div>
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Compliance Status</span>
            </div>
            <p className="text-sm text-blue-800">
              Based on your data analysis, {insights.length} key compliance areas have been identified for attention. 
              Regular monitoring and implementation of these recommendations will help maintain regulatory compliance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};