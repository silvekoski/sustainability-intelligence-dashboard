export interface EUPermit {
  id: string;
  user_id: string;
  active_permits: number;
  company_name?: string;
  permit_year: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EUPermitInput {
  active_permits: number;
  company_name?: string;
  permit_year: number;
  notes?: string;
}

export interface PermitsData {
  active_permits: number;
  avg_consumption_rate_t_per_month: number;
  current_date: string;
  target_buffer_months?: number;
  warning_threshold_pct?: number;
  cumulative_emissions_t?: number;
}

export interface PermitsCalculation {
  total_capacity_t: number;
  months_remaining: number;
  years_remaining: number;
  status_light: 'green' | 'yellow' | 'red';
  consumed_pct?: number;
  needed_permits_for_buffer: number;
  months_to_buffer: number;
}

export interface PermitsStatus {
  isValid: boolean;
  error?: string;
  data?: PermitsCalculation;
  recommendations: string[];
}