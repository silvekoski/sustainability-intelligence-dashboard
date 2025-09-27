import { useState, useEffect } from 'react';
import { PowerPlantData, PlantSummary, EmissionsTrend } from '../types';
import { parseCSVData, calculatePlantSummaries, calculateEmissionsTrends, calculateAggregatedMetrics } from '../utils/dataParser';

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

  const metrics = calculateAggregatedMetrics(data);

  return {
    data,
    plantSummaries,
    emissionsTrends,
    loading,
    error,
    metrics
  };
};