import { EmissionsTrend } from '../types';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

interface EmissionsChartProps {
  data: EmissionsTrend[];
}

export const EmissionsChart = ({ data }: EmissionsChartProps) => {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emissions Trend</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No emissions data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.total));
  const minValue = Math.min(...data.map(d => d.total));
  const avgValue = data.reduce((sum, d) => sum + d.total, 0) / data.length;
  
  // Calculate trend
  const firstValue = data[0]?.total || 0;
  const lastValue = data[data.length - 1]?.total || 0;
  const trendPercentage = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const isIncreasing = trendPercentage > 0;

  // Calculate day-to-day changes for better comparison
  const monthChanges = data.map((item, index) => {
    if (index === 0) return { ...item, change: 0, changePercent: 0 };
    const prevValue = data[index - 1].total;
    const change = item.total - prevValue;
    const changePercent = prevValue > 0 ? (change / prevValue) * 100 : 0;
    return { ...item, change, changePercent };
  });

  // Subtle scaling improvement - add small padding for better visibility
  const valueRange = maxValue - minValue;
  const scaledMin = Math.max(0, minValue - (valueRange * 0.05)); // Add 5% padding below
  const scaledMax = maxValue + (valueRange * 0.05); // Add 5% padding above
  const effectiveRange = scaledMax - scaledMin;

  // Enhanced color scheme
  const colors = {
    CO2: {
      primary: '#3b82f6',
      light: '#93c5fd',
      bg: '#eff6ff'
    },
    CH4: {
      primary: '#f97316',
      light: '#fdba74',
      bg: '#fff7ed'
    },
    N2O: {
      primary: '#eab308',
      light: '#fde047',
      bg: '#fefce8'
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header with trend indicator */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Emissions Trend Analysis</h3>
          <p className="text-sm text-gray-500">Monthly emissions breakdown by gas type (2024)</p>
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

      {/* Day-to-day comparison summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{Math.min(...data.map(d => d.total)).toFixed(0)}t</div>
          <div className="text-sm text-gray-600">Lowest Month</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{Math.max(...data.map(d => d.total)).toFixed(0)}t</div>
          <div className="text-sm text-gray-600">Highest Month</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{avgValue.toFixed(0)}t</div>
          <div className="text-sm text-gray-600">Monthly Average</div>
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
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: colors.CO2.primary }} />
            <span className="text-sm font-medium text-gray-700">CO₂ (Carbon Dioxide)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: colors.CH4.primary }} />
            <span className="text-sm font-medium text-gray-700">CH₄ (Methane)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: colors.N2O.primary }} />
            <span className="text-sm font-medium text-gray-700">N₂O (Nitrous Oxide)</span>
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
        <div className="absolute left-0 top-0 h-80 flex flex-col justify-between text-xs text-gray-500 -ml-16">
          <span>{scaledMax.toFixed(0)}t</span>
          <span>{(scaledMin + effectiveRange * 0.75).toFixed(0)}t</span>
          <span>{(scaledMin + effectiveRange * 0.5).toFixed(0)}t</span>
          <span>{(scaledMin + effectiveRange * 0.25).toFixed(0)}t</span>
          <span>{scaledMin.toFixed(0)}t</span>
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
            Avg: {avgValue.toFixed(0)}t
          </span>
        </div>
        
        {/* Chart bars */}
        <div className="h-80 flex items-end justify-between space-x-3 relative z-20">
          {monthChanges.map((item, index) => {
            // Use scaled values for subtle visual improvement
            const co2Height = ((item.CO2 - scaledMin) / effectiveRange) * 100;
            const ch4Height = ((item.CH4 - scaledMin) / effectiveRange) * 100;
            const n2oHeight = ((item.N2O - scaledMin) / effectiveRange) * 100;
            const totalHeight = ((item.total - scaledMin) / effectiveRange) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                {/* Stacked bar */}
                <div className="w-full flex flex-col justify-end h-64 relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                    <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg min-w-max">
                      <div className="font-semibold mb-2">
                        {item.date}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: colors.CO2.primary }} />
                            <span>CO₂:</span>
                          </div>
                          <span className="font-medium">{item.CO2.toFixed(1)}t</span>
                        </div>
                        <div className="flex items-center justify-between space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: colors.CH4.primary }} />
                            <span>CH₄:</span>
                          </div>
                          <span className="font-medium">{item.CH4.toFixed(3)}t</span>
                        </div>
                        <div className="flex items-center justify-between space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: colors.N2O.primary }} />
                            <span>N₂O:</span>
                          </div>
                          <span className="font-medium">{item.N2O.toFixed(3)}t</span>
                        </div>
                        <div className="border-t border-gray-600 pt-1 mt-2">
                          <div className="flex items-center justify-between space-x-4 font-semibold">
                            <span>Total:</span>
                            <span>{item.total.toFixed(1)}t</span>
                          </div>
                          {index > 0 && (
                            <div className="flex items-center justify-between space-x-4 text-xs mt-1">
                              <span>Change:</span>
                              <span className={item.change >= 0 ? 'text-red-300' : 'text-green-300'}>
                                {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}t ({item.changePercent.toFixed(1)}%)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>

                  {/* CO2 bar */}
                  <div 
                    className="w-full rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                    style={{ 
                      height: `${co2Height}%`,
                      backgroundColor: colors.CO2.primary
                    }}
                  />
                  
                  {/* CH4 bar */}
                  <div 
                    className="w-full transition-all duration-300 group-hover:brightness-110"
                    style={{ 
                      height: `${ch4Height}%`,
                      backgroundColor: colors.CH4.primary
                    }}
                  />
                  
                  {/* N2O bar */}
                  <div 
                    className="w-full rounded-b-sm transition-all duration-300 group-hover:brightness-110"
                    style={{ 
                      height: `${n2oHeight}%`,
                      backgroundColor: colors.N2O.primary
                    }}
                  />
                </div>
                
                {/* Date label */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 font-medium">
                    {item.date.split(' ')[0]}
                  </p>
                  {index > 0 && (
                    <p className={`text-xs font-bold mt-1 ${
                      item.change >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Summary Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.CO2.bg }}>
            <p className="text-2xl font-bold" style={{ color: colors.CO2.primary }}>
              {data.reduce((sum, d) => sum + d.CO2, 0).toFixed(0)}
            </p>
            <p className="text-sm text-gray-600 font-medium">Total CO₂ (tonnes)</p>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.CH4.bg }}>
            <p className="text-2xl font-bold" style={{ color: colors.CH4.primary }}>
              {data.reduce((sum, d) => sum + d.CH4, 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 font-medium">Total CH₄ (tonnes)</p>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.N2O.bg }}>
            <p className="text-2xl font-bold" style={{ color: colors.N2O.primary }}>
              {data.reduce((sum, d) => sum + d.N2O, 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 font-medium">Total N₂O (tonnes)</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {data.reduce((sum, d) => sum + d.total, 0).toFixed(0)}
            </p>
            <p className="text-sm text-gray-600 font-medium">Grand Total (tonnes)</p>
          </div>
        </div>
      </div>
    </div>
  );
};