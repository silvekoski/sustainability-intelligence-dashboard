import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Settings, Bell, BarChart3, Factory, FileText, Shield, Cog } from 'lucide-react';

export const Header = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Analytics', href: '/analytics', icon: Activity },
    { name: 'Factories', href: '/factories', icon: Factory },
    { name: 'Permits', href: '/permits', icon: Shield },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Cog },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-gray-100">
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
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-6">
        <div className="flex space-x-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive(item.href)
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
};