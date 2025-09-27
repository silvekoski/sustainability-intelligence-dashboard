import { EmissionsTrend } from '../types';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

interface EmissionsChartProps {
  data: EmissionsTrend[];
}

export const EmissionsChart = ({ data }: EmissionsChartProps) => {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Carbon Footprint Trend</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No emissions data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.tCO2e));
  const minValue = Math.min(...data.map(d => d.tCO2e));
  const avgValue = data.reduce((sum, d) => sum + d.tCO2e, 0) / data.length;
  
  // Calculate trend
  const firstValue = data[0]?.tCO2e || 0;
  const lastValue = data[data.length - 1]?.tCO2e || 0;
  const trendPercentage = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const isIncreasing = trendPercentage > 0;

  // Subtle scaling improvement - add small padding for better visibility
  const valueRange = maxValue - minValue;
  const scaledMin = Math.max(0, minValue - (valueRange * 0.05)); // Add 5% padding below
  const scaledMax = maxValue + (valueRange * 0.05); // Add 5% padding above
  const effectiveRange = scaledMax - scaledMin;

  // Single color for all bars - professional blue
  const barColor = '#3b82f6'; // Blue-500

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header with trend indicator */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Carbon Footprint Analysis</h3>
          <p className="text-sm text-gray-500">Monthly tCO₂e emissions (CO₂ equivalent, 2024)</p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
          isIncreasing ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {isIncreasing ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isIncreasing ? '+' : ''}{trendPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Monthly comparison summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{minValue.toFixed(0)}</div>
          <div className="text-sm text-gray-600">Lowest Month</div>
          <div className="text-xs text-gray-500">tCO₂e</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{maxValue.toFixed(0)}</div>
          <div className="text-sm text-gray-600">Highest Month</div>
          <div className="text-xs text-gray-500">tCO₂e</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{avgValue.toFixed(0)}</div>
          <div className="text-sm text-gray-600">Monthly Average</div>
          <div className="text-xs text-gray-500">tCO₂e</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${isIncreasing ? 'text-red-600' : 'text-green-600'}`}>
            {isIncreasing ? '+' : ''}{trendPercentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Year-over-Year</div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-8">
          <div className="text-sm font-medium text-gray-700">
            <span className="font-semibold">tCO₂e</span> - Tonnes of CO₂ Equivalent
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
              <span>High</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Info className="w-3 h-3" />
          <span>Hover bars for details</span>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-80 flex flex-col justify-between text-xs text-gray-500 -ml-20">
          <span>{scaledMax.toFixed(0)} tCO₂e</span>
          <span>{(scaledMin + effectiveRange * 0.75).toFixed(0)} tCO₂e</span>
          <span>{(scaledMin + effectiveRange * 0.5).toFixed(0)} tCO₂e</span>
          <span>{(scaledMin + effectiveRange * 0.25).toFixed(0)} tCO₂e</span>
          <span>{scaledMin.toFixed(0)} tCO₂e</span>
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 h-80">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div
              key={percent}
              className="absolute w-full border-t border-gray-100"
              style={{ bottom: `${percent}%` }}
            />
          ))}
        </div>

        {/* Average line */}
        <div
          className="absolute w-full border-t-2 border-dashed border-blue-300 z-10"
          style={{ bottom: `${((avgValue - scaledMin) / effectiveRange) * 100}%` }}
        >
          <span className="absolute right-0 -top-5 text-xs text-blue-600 bg-white px-2 py-1 rounded shadow-sm">
            Avg: {avgValue.toFixed(0)} tCO₂e
          </span>
        </div>
        
        {/* Chart bars */}
        <div className="h-80 flex items-end justify-between space-x-3 relative z-20">
          {data.map((item, index) => {
            const barHeight = ((item.tCO2e - scaledMin) / effectiveRange) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                {/* Single tCO2e bar */}
                <div className="w-full flex flex-col justify-end h-64 relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                    <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg min-w-max">
                      <div className="font-semibold mb-2">
                        {item.date}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between space-x-4 font-semibold">
                          <span>Total Emissions:</span>
                          <span>{item.tCO2e.toFixed(0)} tCO₂e</span>
                        </div>
                        <div className="text-xs text-gray-300">
                          Includes CO₂, CH₄ (25x GWP), N₂O (298x GWP)
                        </div>
                        <div className="border-t border-gray-600 pt-1 mt-2">
                          {item.change !== undefined && (
                            <div className="flex items-center justify-between space-x-4 text-xs mt-1">
                              <span>Change:</span>
                              <span className={item.change >= 0 ? 'text-red-300' : 'text-green-300'}>
                                {item.change >= 0 ? '+' : ''}{item.change.toFixed(0)} tCO₂e ({item.changePercent?.toFixed(1)}%)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>

                  {/* tCO2e bar */}
                  <div 
                    className="w-full rounded-sm transition-all duration-300 group-hover:brightness-110 border border-white"
                    style={{ 
                      height: `${barHeight}%`,
                      backgroundColor: barColor
                    }}
                  />
                </div>
                
                {/* Date label */}
                <div className="mt-2 text-xs text-gray-600 text-center font-medium">
                  {item.date}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex justify-center">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <span>Monthly Emissions</span>
        </div>
      </div>
      
      {/* Summary Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <p className="text-3xl font-bold text-blue-700">
              {data.reduce((sum, d) => sum + d.tCO2e, 0).toFixed(0)}
            </p>
            <p className="text-sm text-blue-600 font-medium mt-1">Total Annual tCO₂e</p>
            <p className="text-xs text-gray-500 mt-1">All greenhouse gases combined</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <p className="text-3xl font-bold text-green-700">
              {(data.reduce((sum, d) => sum + d.tCO2e, 0) / 12).toFixed(0)}
            </p>
            <p className="text-sm text-green-600 font-medium mt-1">Monthly Average</p>
            <p className="text-xs text-gray-500 mt-1">tCO₂e per month</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <p className="text-3xl font-bold text-purple-700">
              {((maxValue - minValue) / avgValue * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-purple-600 font-medium mt-1">Seasonal Variation</p>
            <p className="text-xs text-gray-500 mt-1">Peak vs. low emissions</p>
          </div>
        </div>
      </div>
    </div>
  );
};