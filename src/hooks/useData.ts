import { useState, useEffect } from 'react';
import { PowerPlantData, PlantSummary, EmissionsTrend } from '../types';
import { parseCSVData, calculatePlantSummaries, calculateEmissionsTrends } from '../utils/dataParser';

export const useData = () => {
  const [data, setData] = useState<PowerPlantData[]>([]);
  const [plantSummaries, setPlantSummaries] = useState<PlantSummary[]>([]);
  const [emissionsTrends, setEmissionsTrends] = useState<EmissionsTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/sample_data.csv');
        if (!response.ok) {
          throw new Error('Failed to load data');
        }
        
        const csvText = await response.text();
        const parsedData = parseCSVData(csvText);
        
        setData(parsedData);
        setPlantSummaries(calculatePlantSummaries(parsedData));
        setEmissionsTrends(calculateEmissionsTrends(parsedData));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalElectricity = data.reduce((sum, d) => sum + d.electricity_output_MWh, 0);
  const totalEmissions = data.reduce((sum, d) => sum + d.CO2_emissions_tonnes, 0);
  const avgEfficiency = data.length > 0 
    ? data.reduce((sum, d) => sum + d.efficiency_percent, 0) / data.length 
    : 0;
  const totalFuelConsumption = data.reduce((sum, d) => sum + d.fuel_consumption_MWh, 0);

  return {
    data,
    plantSummaries,
    emissionsTrends,
    loading,
    error,
    metrics: {
      totalElectricity,
      totalEmissions,
      avgEfficiency,
      totalFuelConsumption
    }
  };
};