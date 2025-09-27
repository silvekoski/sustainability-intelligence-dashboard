export interface CSVUploadResult {
  success: boolean;
  error?: string;
  fileName?: string;
  filePath?: string;
}

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  rowCount?: number;
}

export interface UserCSVFile {
  fileName: string;
  filePath: string;
  uploadedAt: string;
  size: number;
}

// Expected CSV schema based on sample_data.csv
export const EXPECTED_CSV_HEADERS = [
  'date',
  'plant_id',
  'plant_name',
  'fuel_type',
  'electricity_output_MWh',
  'heat_output_MWh',
  'fuel_consumption_MWh',
  'CO2_emissions_tonnes',
  'CH4_emissions_kg',
  'N2O_emissions_kg',
  'efficiency_percent'
] as const;

export type CSVHeaders = typeof EXPECTED_CSV_HEADERS[number];