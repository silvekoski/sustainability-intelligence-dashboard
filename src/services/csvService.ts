import { supabase } from '../lib/supabase';
import { CSVUploadResult, CSVValidationResult, UserCSVFile, EXPECTED_CSV_HEADERS } from '../types/csv';

export class CSVService {
  private static readonly BUCKET_NAME = 'csv-uploads';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Upload CSV file to Supabase storage
  static async uploadCSV(file: File, userId: string): Promise<CSVUploadResult> {
    try {
      // Validate file
      const validation = await this.validateCSVFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: `CSV validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        return {
          success: false,
          error: 'File size exceeds 10MB limit'
        };
      }

      // Generate unique file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      return {
        success: true,
        fileName,
        filePath: data.path
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to upload CSV file'
      };
    }
  }

  // Download and parse CSV file from storage
  static async downloadAndParseCSV(filePath: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(filePath);

      if (error) {
        throw error;
      }

      const csvText = await data.text();
      const parsedData = this.parseCSVData(csvText);

      return {
        success: true,
        data: parsedData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to download CSV file'
      };
    }
  }

  // Get user's uploaded CSV files
  static async getUserCSVFiles(userId: string): Promise<{ success: boolean; files?: UserCSVFile[]; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(userId, {
          limit: 10,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        throw error;
      }

      const files: UserCSVFile[] = data.map(file => ({
        fileName: file.name,
        filePath: `${userId}/${file.name}`,
        uploadedAt: file.created_at,
        size: file.metadata?.size || 0
      }));

      return {
        success: true,
        files
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch CSV files'
      };
    }
  }

  // Delete CSV file from storage
  static async deleteCSV(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete CSV file'
      };
    }
  }

  // Validate CSV file structure
  static async validateCSVFile(file: File): Promise<CSVValidationResult> {
    const errors: string[] = [];

    // Check file type
    if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
      errors.push('File must be a CSV file');
    }

    try {
      const text = await file.text();
      const lines = text.trim().split('\n');

      if (lines.length < 2) {
        errors.push('CSV must contain at least a header row and one data row');
        return { isValid: false, errors };
      }

      // Validate headers
      const headers = lines[0].split(',').map(h => h.trim());
      const missingHeaders = EXPECTED_CSV_HEADERS.filter(expected => 
        !headers.includes(expected)
      );

      if (missingHeaders.length > 0) {
        errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      // Validate data rows (sample first few rows)
      const sampleRows = lines.slice(1, Math.min(6, lines.length));
      for (let i = 0; i < sampleRows.length; i++) {
        const row = sampleRows[i].split(',');
        if (row.length !== headers.length) {
          errors.push(`Row ${i + 2} has ${row.length} columns, expected ${headers.length}`);
        }

        // Validate numeric fields
        const numericFields = [
          'plant_id', 'electricity_output_MWh', 'heat_output_MWh', 
          'fuel_consumption_MWh', 'CO2_emissions_tonnes', 'CH4_emissions_kg', 
          'N2O_emissions_kg', 'efficiency_percent'
        ];

        numericFields.forEach(field => {
          const fieldIndex = headers.indexOf(field);
          if (fieldIndex !== -1) {
            const value = row[fieldIndex]?.trim();
            if (value && isNaN(Number(value))) {
              errors.push(`Row ${i + 2}: ${field} must be a number, got "${value}"`);
            }
          }
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        rowCount: lines.length - 1
      };
    } catch (error: any) {
      errors.push(`Failed to parse CSV: ${error.message}`);
      return { isValid: false, errors };
    }
  }

  // Parse CSV data (same logic as existing parseCSVData)
  static parseCSVData(csvText: string): any[] {
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
  }

  // Format file size for display
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}