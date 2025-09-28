import OpenAI from 'openai';
import { PowerPlantData } from '../types';

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

export interface AIInsight {
  type: 'optimization' | 'alert' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  estimatedImpact?: string;
}

export interface AIAnalysisResult {
  insights: AIInsight[];
  summary: string;
  recommendations: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
}

export class AIService {
  private static readonly MODEL = "deepseek/deepseek-chat-v3-0324:free";
  private static readonly SITE_URL = "https://esboost.ai";
  private static readonly SITE_NAME = "ESBoost - Sustainability Intelligence";
  private static readonly MAX_RETRIES = 5;
  private static readonly BASE_DELAY = 2000; // 2 seconds
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Simple in-memory cache
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static pendingRequests = new Map<string, Promise<any>>();

  private static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a rate limit error (429) or server error (5xx)
        const isRetryableError = 
          error.message?.includes('429') || 
          error.message?.includes('Provider returned error') ||
          error.status === 429 ||
          (error.status >= 500 && error.status < 600);
        
        if (!isRetryableError || attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff: wait longer after each attempt
        const delay = this.BASE_DELAY * Math.pow(2, attempt);
        console.log(`AI API attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  static async analyzeEmissionsData(data: PowerPlantData[]): Promise<AIAnalysisResult> {
    try {
      const dataAnalysis = this.prepareDataForAnalysis(data);
      
      const prompt = `As an AI sustainability expert, analyze this power plant emissions data and provide actionable insights:

DATA SUMMARY:
${dataAnalysis}

Please provide:
1. Key insights about emissions patterns and efficiency
2. Specific optimization recommendations
3. Risk assessment for regulatory compliance
4. Predictions for future performance

Focus on practical, actionable advice for plant operators and sustainability managers. Consider EU ETS compliance, SEC climate disclosure requirements, and operational efficiency.

Respond in JSON format with the following structure:
{
  "insights": [
    {
      "type": "optimization|alert|recommendation|prediction",
      "title": "Brief title",
      "description": "Detailed description",
      "priority": "low|medium|high",
      "actionable": true|false,
      "estimatedImpact": "Optional impact description"
    }
  ],
  "summary": "Overall analysis summary",
  "recommendations": ["List of specific recommendations"],
  "riskAssessment": {
    "level": "low|medium|high",
    "factors": ["Risk factors identified"]
  }
}`;

      const completion = await this.retry(() => client.chat.completions.create({
        model: this.MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert AI sustainability consultant specializing in power plant operations, emissions management, and regulatory compliance. Provide practical, data-driven insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        extra_headers: {
          "HTTP-Referer": this.SITE_URL,
          "X-Title": this.SITE_NAME,
        },
        temperature: 0.7,
        max_tokens: 2000
      }));
      
      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      // Parse JSON response
      const result = JSON.parse(response) as AIAnalysisResult;
      return result;

    } catch (error) {
      console.error('AI Analysis Error:', error);
      // Return fallback analysis
      return this.getFallbackAnalysis(data);
    }
  }

  static async generateComplianceInsights(data: PowerPlantData[], jurisdiction: 'EU' | 'US' | 'COMBINED'): Promise<string[]> {
    try {
      const dataAnalysis = this.prepareDataForAnalysis(data);
      
      const prompt = `Analyze this power plant data for ${jurisdiction} regulatory compliance insights:

${dataAnalysis}

Provide specific compliance recommendations for:
${jurisdiction === 'EU' || jurisdiction === 'COMBINED' ? '- EU ETS compliance and allowance management\n- CSRD/ESRS reporting requirements\n- EU Data Act compliance\n' : ''}
${jurisdiction === 'US' || jurisdiction === 'COMBINED' ? '- SEC climate disclosure requirements\n- GHG emissions reporting\n- Climate risk assessment\n' : ''}

Return 5-7 specific, actionable compliance recommendations as a JSON array of strings.`;

      const completion = await this.retry(() => client.chat.completions.create({
        model: this.MODEL,
        messages: [
          {
            role: "system",
            content: "You are a regulatory compliance expert specializing in environmental regulations and climate disclosure requirements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        extra_headers: {
          "HTTP-Referer": this.SITE_URL,
          "X-Title": this.SITE_NAME,
        },
        temperature: 0.5,
        max_tokens: 1000
      }));

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      return JSON.parse(response) as string[];

    } catch (error) {
      console.error('AI Compliance Insights Error:', error);
      return this.getFallbackComplianceInsights(jurisdiction);
    }
  }

  static async optimizePlantPerformance(plantData: PowerPlantData[]): Promise<string[]> {
    try {
      const plantAnalysis = plantData.map(plant => ({
        name: plant.plant_name,
        fuel: plant.fuel_type,
        efficiency: plant.efficiency_percent,
        emissions: plant.CO2_emissions_tonnes,
        output: plant.electricity_output_MWh
      }));

      const prompt = `Analyze these power plant performance metrics and provide optimization recommendations:

${JSON.stringify(plantAnalysis, null, 2)}

Focus on:
1. Efficiency improvements
2. Emissions reduction strategies
3. Fuel optimization
4. Operational adjustments
5. Technology upgrades

Provide 5-8 specific, actionable optimization recommendations as a JSON array of strings.`;

      const completion = await this.retry(() => client.chat.completions.create({
        model: this.MODEL,
        messages: [
          {
            role: "system",
            content: "You are a power plant optimization expert with deep knowledge of thermal efficiency, emissions control, and operational best practices."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        extra_headers: {
          "HTTP-Referer": this.SITE_URL,
          "X-Title": this.SITE_NAME,
        },
        temperature: 0.6,
        max_tokens: 1200
      }));

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      return JSON.parse(response) as string[];

    } catch (error) {
      console.error('AI Optimization Error:', error);
      return this.getFallbackOptimizationRecommendations();
    }
  }

  static async predictEmissionsTrends(data: PowerPlantData[]): Promise<{
    prediction: string;
    confidence: number;
    factors: string[];
    timeline: string;
  }> {
    const cacheKey = this.generateCacheKey(data, 'predict');
    
    return this.getCachedOrExecute(cacheKey, async () => {
      try {
        const trendData = this.calculateTrends(data);
        
        const prompt = `Based on this emissions trend data, predict future emissions patterns:

${JSON.stringify(trendData, null, 2)}

Provide a prediction with:
1. Expected emissions trend (increase/decrease/stable)
2. Confidence level (0-100)
3. Key factors influencing the trend
4. Timeline for the prediction

Return as JSON with structure:
{
  "prediction": "Detailed prediction description",
  "confidence": 85,
  "factors": ["Factor 1", "Factor 2", ...],
  "timeline": "Timeline description"
}`;

        const completion = await this.retry(() => client.chat.completions.create({
          model: this.MODEL,
          messages: [
            {
              role: "system",
              content: "You are a data scientist specializing in emissions forecasting and trend analysis for power generation facilities."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          extra_headers: {
            "HTTP-Referer": this.SITE_URL,
            "X-Title": this.SITE_NAME,
          },
          temperature: 0.4,
          max_tokens: 800
        }));

        const response = completion.choices[0]?.message?.content;
        if (!response) {
          throw new Error('No response from AI service');
        }

        return JSON.parse(response);

      } catch (error) {
        console.error('AI Prediction Error:', error);
        return {
          prediction: "Based on current trends, emissions are expected to remain stable with potential for 5-10% reduction through efficiency improvements.",
          confidence: 75,
          factors: ["Current efficiency levels", "Fuel mix composition", "Operational patterns"],
          timeline: "Next 6-12 months"
        };
      }
    });
  }

  // Helper methods
  private static prepareDataForAnalysis(data: PowerPlantData[]): string {
    const summary = {
      totalPlants: new Set(data.map(d => d.plant_id)).size,
      totalRecords: data.length,
      totalEmissions: data.reduce((sum, d) => sum + d.CO2_emissions_tonnes, 0),
      totalOutput: data.reduce((sum, d) => sum + d.electricity_output_MWh, 0),
      avgEfficiency: data.reduce((sum, d) => sum + d.efficiency_percent, 0) / data.length,
      fuelTypes: [...new Set(data.map(d => d.fuel_type))],
      dateRange: {
        start: data[0]?.date,
        end: data[data.length - 1]?.date
      }
    };

    return JSON.stringify(summary, null, 2);
  }

  private static calculateTrends(data: PowerPlantData[]) {
    const dailyEmissions = data.reduce((acc, record) => {
      const date = record.date.split(' ')[0];
      if (!acc[date]) acc[date] = 0;
      acc[date] += record.CO2_emissions_tonnes;
      return acc;
    }, {} as Record<string, number>);

    return {
      dailyEmissions,
      totalEmissions: Object.values(dailyEmissions).reduce((a, b) => a + b, 0),
      avgDailyEmissions: Object.values(dailyEmissions).reduce((a, b) => a + b, 0) / Object.keys(dailyEmissions).length,
      trend: Object.values(dailyEmissions).length > 1 ? 
        (Object.values(dailyEmissions).slice(-1)[0] - Object.values(dailyEmissions)[0]) / Object.values(dailyEmissions)[0] * 100 : 0
    };
  }

  private static getFallbackAnalysis(data: PowerPlantData[]): AIAnalysisResult {
    const avgEfficiency = data.reduce((sum, d) => sum + d.efficiency_percent, 0) / data.length;
    const totalEmissions = data.reduce((sum, d) => sum + d.CO2_emissions_tonnes, 0);

    return {
      insights: [
        {
          type: 'optimization',
          title: 'Efficiency Optimization Opportunity',
          description: `Current average efficiency is ${avgEfficiency.toFixed(1)}%. Consider implementing heat recovery systems to improve efficiency by 5-10%.`,
          priority: 'medium',
          actionable: true,
          estimatedImpact: '5-10% efficiency improvement'
        },
        {
          type: 'alert',
          title: 'Emissions Monitoring',
          description: `Total emissions: ${totalEmissions.toFixed(0)} tonnes CO₂. Monitor trends for compliance planning.`,
          priority: 'medium',
          actionable: true
        }
      ],
      summary: 'Plant operations show standard performance with opportunities for efficiency improvements.',
      recommendations: [
        'Implement predictive maintenance programs',
        'Consider fuel switching to lower-carbon alternatives',
        'Optimize load dispatch scheduling'
      ],
      riskAssessment: {
        level: 'medium',
        factors: ['Regulatory compliance requirements', 'Efficiency optimization potential']
      }
    };
  }

  private static getFallbackComplianceInsights(jurisdiction: string): string[] {
    const baseInsights = [
      'Ensure continuous emissions monitoring systems are properly calibrated',
      'Maintain comprehensive documentation for all emissions data',
      'Implement regular third-party verification processes'
    ];

    if (jurisdiction === 'EU' || jurisdiction === 'COMBINED') {
      baseInsights.push(
        'Monitor EU ETS allowance prices for optimal surrender timing',
        'Prepare for CSRD reporting requirements with double materiality assessment'
      );
    }

    if (jurisdiction === 'US' || jurisdiction === 'COMBINED') {
      baseInsights.push(
        'Quantify climate-related financial risks for SEC disclosure',
        'Develop scenario analysis for 1.5°C and 3°C pathways'
      );
    }

    return baseInsights;
  }

  private static getFallbackOptimizationRecommendations(): string[] {
    return [
      'Implement advanced process control systems to optimize combustion efficiency',
      'Consider co-firing with biomass to reduce net CO₂ emissions',
      'Upgrade to high-efficiency turbine technology where feasible',
      'Optimize maintenance schedules to minimize efficiency degradation',
      'Install waste heat recovery systems for combined heat and power',
      'Implement real-time performance monitoring and analytics'
    ];
  }
}