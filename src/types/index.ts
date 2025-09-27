export interface PowerPlantData {
  date: string;
  plant_id: number;
  plant_name: string;
  fuel_type: string;
  electricity_output_MWh: number;
  heat_output_MWh: number;
  fuel_consumption_MWh: number;
  CO2_emissions_tonnes: number;
  CH4_emissions_kg: number;
  N2O_emissions_kg: number;
  efficiency_percent: number;
}

export interface PlantSummary {
  plant_id: number;
  plant_name: string;
  fuel_type: string;
  total_electricity: number;
  total_emissions: number;
  avg_efficiency: number;
  status: 'optimal' | 'warning' | 'critical';
}

export interface EmissionsTrend {
  date: string;
  CO2: number;
  CH4: number;
  N2O: number;
  total: number;
}