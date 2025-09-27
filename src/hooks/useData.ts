import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PowerPlantData, PlantSummary, EmissionsTrend } from '../types';
import { calculatePlantSummaries, calculateEmissionsTrends } from '../utils/dataParser';

export const useData = () => {
  const [data, setData] = useState<PowerPlantData[]>([]);
  const [plantSummaries, setPlantSummaries] = useState<PlantSummary[]>([]);
  const [emissionsTrends, setEmissionsTrends] = useState<EmissionsTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch power plants and their recent readings
        const { data: plantsData, error: plantsError } = await supabase
          .from('power_plants')
          .select(`
            *,
            plant_readings!inner (
              reading_time,
              electricity_output_mwh,
              heat_output_mwh,
              fuel_consumption_mwh,
              co2_emissions_tonnes,
              ch4_emissions_kg,
              n2o_emissions_kg,
              efficiency_percent
            )
          `)
          .gte('plant_readings.reading_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('plant_readings.reading_time', { ascending: true });

        if (plantsError) {
          throw new Error(`Database error: ${plantsError.message}`);
        }
        
        // Transform Supabase data to match PowerPlantData interface
        const parsedData: PowerPlantData[] = [];
        
        if (plantsData) {
          plantsData.forEach(plant => {
            plant.plant_readings.forEach((reading: any) => {
              parsedData.push({
                date: reading.reading_time,
                plant_id: parseInt(plant.id.slice(-1)), // Simple ID extraction for compatibility
                plant_name: plant.plant_name,
                fuel_type: plant.fuel_type,
                electricity_output_MWh: reading.electricity_output_mwh,
                heat_output_MWh: reading.heat_output_mwh,
                fuel_consumption_MWh: reading.fuel_consumption_mwh,
                CO2_emissions_tonnes: reading.co2_emissions_tonnes,
                CH4_emissions_kg: reading.ch4_emissions_kg,
                N2O_emissions_kg: reading.n2o_emissions_kg,
                efficiency_percent: reading.efficiency_percent
              });
            });
          });
        }
        
        setData(parsedData);
        setPlantSummaries(calculatePlantSummaries(parsedData));
        setEmissionsTrends(calculateEmissionsTrends(parsedData));
      } catch (err) {
        console.error('Data loading error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data from database');
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