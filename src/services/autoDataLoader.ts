import { supabase } from '../lib/supabase';
import { CSVService } from './csvService';
import { UserCSVFile } from '../types/csv';
import { PowerPlantData } from '../types';

export interface AutoLoadResult {
  success: boolean;
  data?: PowerPlantData[];
  fileName?: string;
  error?: string;
  fromCache?: boolean;
}

export class AutoDataLoader {
  private static readonly CACHE_KEY = 'esboost_auto_loaded_data';
  private static readonly CACHE_TIMESTAMP_KEY = 'esboost_auto_loaded_timestamp';
  private static readonly CACHE_FILENAME_KEY = 'esboost_auto_loaded_filename';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Main entry point for automatic data loading
   * Called during app initialization
   */
  static async autoLoadLatestCSV(userId: string): Promise<AutoLoadResult> {
    try {
      // Check cache first for performance
      const cachedResult = this.getCachedData();
      if (cachedResult.success) {
        return cachedResult;
      }

      // Scan user's storage bucket for CSV files
      const filesResult = await this.scanUserCSVFiles(userId);
      if (!filesResult.success || !filesResult.files || filesResult.files.length === 0) {
        return {
          success: false,
          error: 'No CSV files found in storage'
        };
      }

      // Select the most recent file
      const latestFile = this.selectLatestFile(filesResult.files);
      
      // Load and parse the CSV data
      const loadResult = await this.loadCSVData(latestFile);
      if (!loadResult.success) {
        return {
          success: false,
          error: loadResult.error || 'Failed to load CSV data'
        };
      }

      // Cache the loaded data for performance
      this.cacheData(loadResult.data!, latestFile.fileName);

      return {
        success: true,
        data: loadResult.data,
        fileName: latestFile.fileName,
        fromCache: false
      };

    } catch (error) {
      console.error('Auto-load error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during auto-load'
      };
    }
  }

  /**
   * Scan user's storage bucket for CSV files
   */
  private static async scanUserCSVFiles(userId: string): Promise<{
    success: boolean;
    files?: UserCSVFile[];
    error?: string;
  }> {
    try {
      const result = await CSVService.getUserCSVFiles(userId);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scan CSV files'
      };
    }
  }

  /**
   * Select the most recent file from the list
   */
  private static selectLatestFile(files: UserCSVFile[]): UserCSVFile {
    return files.reduce((latest, current) => {
      const latestDate = new Date(latest.uploadedAt);
      const currentDate = new Date(current.uploadedAt);
      return currentDate > latestDate ? current : latest;
    });
  }

  /**
   * Load and parse CSV data from storage
   */
  private static async loadCSVData(file: UserCSVFile): Promise<{
    success: boolean;
    data?: PowerPlantData[];
    error?: string;
  }> {
    try {
      const result = await CSVService.downloadAndParseCSV(file.filePath);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load CSV data'
      };
    }
  }

  /**
   * Cache loaded data in localStorage for performance
   */
  private static cacheData(data: PowerPlantData[], fileName: string): void {
    try {
      const cacheData = {
        data,
        fileName,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString());
      localStorage.setItem(this.CACHE_FILENAME_KEY, fileName);
    } catch (error) {
      console.warn('Failed to cache data:', error);
      // Non-critical error, continue without caching
    }
  }

  /**
   * Get cached data if available and not expired
   */
  private static getCachedData(): AutoLoadResult {
    try {
      const cachedDataStr = localStorage.getItem(this.CACHE_KEY);
      const cachedTimestampStr = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);
      const cachedFileName = localStorage.getItem(this.CACHE_FILENAME_KEY);

      if (!cachedDataStr || !cachedTimestampStr || !cachedFileName) {
        return { success: false };
      }

      const cachedTimestamp = parseInt(cachedTimestampStr);
      const now = Date.now();

      // Check if cache is expired
      if (now - cachedTimestamp > this.CACHE_DURATION) {
        this.clearCache();
        return { success: false };
      }

      const cacheData = JSON.parse(cachedDataStr);
      
      return {
        success: true,
        data: cacheData.data,
        fileName: cacheData.fileName,
        fromCache: true
      };

    } catch (error) {
      console.warn('Failed to read cached data:', error);
      this.clearCache();
      return { success: false };
    }
  }

  /**
   * Clear cached data
   */
  static clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.CACHE_TIMESTAMP_KEY);
      localStorage.removeItem(this.CACHE_FILENAME_KEY);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Check if auto-load is available for user
   */
  static async isAutoLoadAvailable(userId: string): Promise<boolean> {
    try {
      const result = await CSVService.getUserCSVFiles(userId);
      return result.success && result.files && result.files.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Force refresh - bypass cache and reload from storage
   */
  static async forceRefresh(userId: string): Promise<AutoLoadResult> {
    this.clearCache();
    return this.autoLoadLatestCSV(userId);
  }
}