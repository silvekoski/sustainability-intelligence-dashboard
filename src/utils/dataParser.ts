import { PowerPlantData, PlantSummary, EmissionsTrend } from '../types';

export const parseCSVData = (csvText: string): PowerPlantData[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      date: values[0],
      plant_id: parseInt(values[1]),
      plant_name: values[2],
      fuel_type: values[3],
      electricity_output_MWh: parseFloat(values[4]),
      heat_output_MWh: parseFloat(values[5]),
      fuel_consumption_MWh: parseFloat(values[6]),
      CO2_emissions_tonnes: parseFloat(values[7]),
      CH4_emissions_kg: parseFloat(values[8]),
      N2O_emissions_kg: parseFloat(values[9]),
      efficiency_percent: parseFloat(values[10])
    };
  });
};

export const calculatePlantSummaries = (data: PowerPlantData[]): PlantSummary[] => {
  const plantGroups = data.reduce((acc, record) => {
    if (!acc[record.plant_id]) {
      acc[record.plant_id] = [];
    }
    acc[record.plant_id].push(record);
    return acc;
  }, {} as Record<number, PowerPlantData[]>);

  return Object.values(plantGroups).map(plantData => {
    const first = plantData[0];
    const totalElectricity = plantData.reduce((sum, d) => sum + d.electricity_output_MWh, 0);
    const totalEmissions = plantData.reduce((sum, d) => sum + d.CO2_emissions_tonnes, 0);
    const avgEfficiency = plantData.reduce((sum, d) => sum + d.efficiency_percent, 0) / plantData.length;
    
    let status: 'optimal' | 'warning' | 'critical' = 'optimal';
    if (avgEfficiency < 45) status = 'critical';
    else if (avgEfficiency < 60) status = 'warning';

    return {
      plant_id: first.plant_id,
      plant_name: first.plant_name,
      fuel_type: first.fuel_type,
      total_electricity: totalElectricity,
      total_emissions: totalEmissions,
      avg_efficiency: avgEfficiency,
      status
    };
  });
};

export const calculateEmissionsTrends = (data: PowerPlantData[]): EmissionsTrend[] => {
  const dateGroups = data.reduce((acc, record) => {
    const date = record.date.split(' ')[0]; // Get just the date part
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, PowerPlantData[]>);

  return Object.entries(dateGroups).map(([date, records]) => ({
    date,
    CO2: records.reduce((sum, r) => sum + r.CO2_emissions_tonnes, 0),
    CH4: records.reduce((sum, r) => sum + r.CH4_emissions_kg, 0) / 1000, // Convert to tonnes
    N2O: records.reduce((sum, r) => sum + r.N2O_emissions_kg, 0) / 1000, // Convert to tonnes
    total: records.reduce((sum, r) => sum + r.CO2_emissions_tonnes + (r.CH4_emissions_kg + r.N2O_emissions_kg) / 1000, 0)
  }));
};
// Calculate aggregated metrics for the entire dataset
export const calculateAggregatedMetrics = (data: PowerPlantData[]) => {
  const totalElectricity = data.reduce((sum, d) => sum + d.electricity_output_MWh, 0);
  const totalEmissions = data.reduce((sum, d) => sum + d.CO2_emissions_tonnes, 0);
  const totalFuelConsumption = data.reduce((sum, d) => sum + d.fuel_consumption_MWh, 0);
  const avgEfficiency = data.length > 0 
    ? data.reduce((sum, d) => sum + d.efficiency_percent, 0) / data.length 
    : 0;

  return {
    totalElectricity: Math.round(totalElectricity),
    totalEmissions: Math.round(totalEmissions),
    totalFuelConsumption: Math.round(totalFuelConsumption),
    avgEfficiency: Math.round(avgEfficiency * 10) / 10 // Round to 1 decimal
  };
};

// Calculate period-over-period changes
export const calculatePeriodChanges = (data: PowerPlantData[]) => {
  // Split data into two periods (first day vs second day)
  const day1Data = data.filter(d => d.date.startsWith('2025-01-01'));
  const day2Data = data.filter(d => d.date.startsWith('2025-01-02'));
  
  if (day1Data.length === 0 || day2Data.length === 0) {
    return {
      electricityChange: 0,
      emissionsChange: 0,
      efficiencyChange: 0,
      fuelChange: 0
    };
  }

  const day1Metrics = calculateAggregatedMetrics(day1Data);
  const day2Metrics = calculateAggregatedMetrics(day2Data);

  const electricityChange = day1Metrics.totalElectricity > 0 
    ? ((day2Metrics.totalElectricity - day1Metrics.totalElectricity) / day1Metrics.totalElectricity) * 100 
    : 0;
  
  const emissionsChange = day1Metrics.totalEmissions > 0 
    ? ((day2Metrics.totalEmissions - day1Metrics.totalEmissions) / day1Metrics.totalEmissions) * 100 
    : 0;
  
  const efficiencyChange = day1Metrics.avgEfficiency > 0 
    ? ((day2Metrics.avgEfficiency - day1Metrics.avgEfficiency) / day1Metrics.avgEfficiency) * 100 
    : 0;
  
  const fuelChange = day1Metrics.totalFuelConsumption > 0 
    ? ((day2Metrics.totalFuelConsumption - day1Metrics.totalFuelConsumption) / day1Metrics.totalFuelConsumption) * 100 
    : 0;

  return {
    electricityChange: Math.round(electricityChange * 10) / 10,
    emissionsChange: Math.round(emissionsChange * 10) / 10,
    efficiencyChange: Math.round(efficiencyChange * 10) / 10,
    fuelChange: Math.round(fuelChange * 10) / 10
  };
};