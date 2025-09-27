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
  // Generate 12 months of sample data for demonstration
  const months = [
    'Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024',
    'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024'
  ];

  // Base monthly emissions with seasonal variations
  const baseMonthlyEmissions = [
    { CO2: 2850, CH4: 0.185, N2O: 0.095 }, // Jan - higher winter demand
    { CO2: 2650, CH4: 0.172, N2O: 0.088 }, // Feb
    { CO2: 2420, CH4: 0.158, N2O: 0.081 }, // Mar - spring reduction
    { CO2: 2180, CH4: 0.142, N2O: 0.073 }, // Apr
    { CO2: 1950, CH4: 0.127, N2O: 0.065 }, // May - lowest demand
    { CO2: 2100, CH4: 0.137, N2O: 0.070 }, // Jun - slight increase
    { CO2: 2350, CH4: 0.153, N2O: 0.078 }, // Jul - summer peak
    { CO2: 2280, CH4: 0.149, N2O: 0.076 }, // Aug
    { CO2: 2150, CH4: 0.140, N2O: 0.072 }, // Sep - autumn reduction
    { CO2: 2380, CH4: 0.155, N2O: 0.079 }, // Oct - heating season starts
    { CO2: 2720, CH4: 0.177, N2O: 0.091 }, // Nov - higher demand
    { CO2: 2950, CH4: 0.192, N2O: 0.098 }  // Dec - peak winter
  ];

  return months.map((month, index) => {
    const monthData = baseMonthlyEmissions[index];
    return {
      date: month,
      CO2: monthData.CO2,
      CH4: monthData.CH4,
      N2O: monthData.N2O,
      total: monthData.CO2 + monthData.CH4 + monthData.N2O
    };
  });
};