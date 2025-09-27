import { PlantSummary } from '../types';
import { Factory, Zap, Gauge, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface PlantStatusCardProps {
  plant: PlantSummary;
}

export const PlantStatusCard = ({ plant }: PlantStatusCardProps) => {
  const getStatusConfig = () => {
    switch (plant.status) {
      case 'optimal':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          label: 'Optimal'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          label: 'Warning'
        };
      case 'critical':
        return {
          icon: <XCircle className="w-5 h-5" />,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          label: 'Critical'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 ${statusConfig.border} p-6 hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Factory className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{plant.plant_name}</h3>
            <p className="text-sm text-gray-500">{plant.fuel_type}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusConfig.bg}`}>
          <div className={statusConfig.color}>
            {statusConfig.icon}
          </div>
          <span className={`text-sm font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {plant.total_electricity.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500">MWh Output</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 h-4 bg-red-500 rounded-full" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {plant.total_emissions.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500">CO₂ Tonnes</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Gauge className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {plant.avg_efficiency.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">Efficiency</p>
        </div>
      </div>
    </div>
  );
};