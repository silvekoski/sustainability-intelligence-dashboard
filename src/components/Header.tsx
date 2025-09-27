import { Activity, Settings, Bell } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src="/esboost-logo.svg" 
            alt="ESBoost" 
            className="h-8 w-auto"
          />
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Sustainability Intelligence Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Prototype Demo
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Live Monitoring</span>
          </div>
        </div>
      </div>
    </header>
  );
};