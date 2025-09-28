import React, { useState } from 'react';
import { Zap, Loader2, TrendingUp, Target } from 'lucide-react';
import { AIService } from '../services/aiService';
import { PowerPlantData } from '../types';

interface AIOptimizationWidgetProps {
  data: PowerPlantData[] | null;
}

export const AIOptimizationWidget: React.FC<AIOptimizationWidgetProps> = ({ data }) => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateOptimizations = async () => {
    if (!data || data.length === 0) return;

    setLoading(true);
    try {
      const [optimizations, emissionsPrediction] = await Promise.all([
        AIService.optimizePlantPerformance(data),
        AIService.predictEmissionsTrends(data)
      ]);
      
      setRecommendations(optimizations);
      setPrediction(emissionsPrediction);
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (data && data.length > 0) {
      generateOptimizations();
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Optimization</h3>
            <p className="text-sm text-gray-600">Performance optimization recommendations</p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Upload data to get AI-powered optimization recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Optimization</h3>
            <p className="text-sm text-gray-600">Performance optimization recommendations</p>
          </div>
        </div>
        
        <button
          onClick={generateOptimizations}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Target className="w-4 h-4" />
          )}
          <span>{loading ? 'Optimizing...' : 'Optimize'}</span>
        </button>
      </div>

      {loading && recommendations.length === 0 && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">AI is generating optimization recommendations...</p>
        </div>
      )}

      {prediction && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6 border border-green-200">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Emissions Prediction</h4>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {prediction.confidence}% Confidence
            </span>
          </div>
          <p className="text-sm text-green-800 mb-3">{prediction.prediction}</p>
          <div className="text-xs text-green-700">
            <strong>Timeline:</strong> {prediction.timeline}
          </div>
          <div className="mt-2">
            <strong className="text-xs text-green-700">Key Factors:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {prediction.factors.map((factor: string, index: number) => (
                <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  {factor}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Optimization Recommendations</h4>
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-orange-600">{index + 1}</span>
                </div>
                <p className="text-sm text-orange-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};