import { EmissionsTrend } from '../types';

interface EmissionsChartProps {
  data: EmissionsTrend[];
}

export const EmissionsChart = ({ data }: EmissionsChartProps) => {
  const maxValue = Math.max(...data.map(d => d.total));
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Daily Emissions Trend</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-600">CO₂</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-gray-600">CH₄</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-gray-600">N₂O</span>
          </div>
        </div>
      </div>
      
      <div className="h-64 flex items-end justify-between space-x-2">
        {data.slice(-7).map((item, index) => { // Show last 7 days for better visibility
          const co2Height = (item.CO2 / maxValue) * 100;
          const ch4Height = (item.CH4 / maxValue) * 100;
          const n2oHeight = (item.N2O / maxValue) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col justify-end h-48 space-y-1">
                <div 
                  className="w-full bg-red-500 rounded-t-sm transition-all hover:bg-red-600"
                  style={{ height: `${co2Height}%` }}
                  title={`CO₂: ${item.CO2.toFixed(1)} tonnes`}
                />
                <div 
                  className="w-full bg-orange-500 transition-all hover:bg-orange-600"
                  style={{ height: `${ch4Height}%` }}
                  title={`CH₄: ${item.CH4.toFixed(3)} tonnes`}
                />
                <div 
                  className="w-full bg-yellow-500 rounded-b-sm transition-all hover:bg-yellow-600"
                  style={{ height: `${n2oHeight}%` }}
                  title={`N₂O: ${item.N2O.toFixed(3)} tonnes`}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {new Date(item.date).toLocaleDateString('en-US', { 
                  month: 'numeric', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-red-600">
              {data.reduce((sum, d) => sum + d.CO2, 0).toFixed(0)}
            </p>
            <p className="text-sm text-gray-500">30-Day CO₂ (tonnes)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {data.reduce((sum, d) => sum + d.CH4, 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">30-Day CH₄ (tonnes)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {data.reduce((sum, d) => sum + d.N2O, 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">30-Day N₂O (tonnes)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {data.length}
            </p>
            <p className="text-sm text-gray-500">Days Tracked</p>
          </div>
        </div>
      </div>
    </div>
  );
};