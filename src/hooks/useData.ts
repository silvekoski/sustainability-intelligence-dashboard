import { useState, useEffect } from 'react';
import { PowerPlantData, PlantSummary, EmissionsTrend } from '../types';
import { parseCSVData, calculatePlantSummaries, calculateEmissionsTrends, calculateAggregatedMetrics, calculatePeriodChanges } from '../utils/dataParser';
import { CSVService } from '../services/csvService';

export const useData = (customData?: PowerPlantData[] | null) => {
  const [data, setData] = useState<PowerPlantData[]>([]);
  const [plantSummaries, setPlantSummaries] = useState<PlantSummary[]>([]);
  const [emissionsTrends, setEmissionsTrends] = useState<EmissionsTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If custom data is provided, use it directly
    if (customData !== undefined) {
      if (customData === null) {
        // Clear all data
        setData([]);
        setPlantSummaries([]);
        setEmissionsTrends([]);
        setLoading(false);
        return;
      } else {
        // Use custom data
        setData(customData);
        setPlantSummaries(calculatePlantSummaries(customData));
        setEmissionsTrends(calculateEmissionsTrends(customData));
        setLoading(false);
        return;
      }
    }

    // Fallback to sample data only if no custom data is provided
    const loadData = async () => {
      try {
        const response = await fetch('/sample_data.csv');
        if (!response.ok) {
          throw new Error('Failed to load data');
        }
        
        const csvText = await response.text();
        const parsedData = CSVService.parseCSVData(csvText);
        
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
  }, [customData]);

  const metrics = calculateAggregatedMetrics(data);
  const changes = calculatePeriodChanges(data);

  return {
    data,
    plantSummaries,
    emissionsTrends,
    loading,
    error,
    metrics,
    changes
  };
};