import { supabase } from '../lib/supabase';
import { EUPermit, EUPermitInput } from '../types/permits';

export class EUPermitsService {
  // Get user's EU permits
  static async getUserPermits(userId: string): Promise<{ data: EUPermit[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('eu_permits')
        .select('*')
        .eq('user_id', userId)
        .order('permit_year', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Get current year permit for user
  static async getCurrentYearPermit(userId: string): Promise<{ data: EUPermit | null; error: any }> {
    try {
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from('eu_permits')
        .select('*')
        .eq('user_id', userId)
        .eq('permit_year', currentYear)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return { data: error?.code === 'PGRST116' ? null : data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Create new permit record
  static async createPermit(userId: string, permitData: EUPermitInput): Promise<{ data: EUPermit | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('eu_permits')
        .insert({
          user_id: userId,
          ...permitData
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Update existing permit record
  static async updatePermit(permitId: string, permitData: Partial<EUPermitInput>): Promise<{ data: EUPermit | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('eu_permits')
        .update(permitData)
        .eq('id', permitId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Delete permit record
  static async deletePermit(permitId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('eu_permits')
        .delete()
        .eq('id', permitId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: this.formatError(error) };
    }
  }

  // Upsert permit (create or update for current year)
  static async upsertCurrentYearPermit(userId: string, permitData: EUPermitInput): Promise<{ data: EUPermit | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('eu_permits')
        .upsert({
          user_id: userId,
          ...permitData
        }, {
          onConflict: 'user_id,permit_year'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Format error messages
  private static formatError(error: any): { message: string } {
    if (error.message) {
      if (error.message.includes('duplicate key')) {
        return { message: 'A permit record for this year already exists' };
      }
      if (error.message.includes('check constraint')) {
        return { message: 'Active permits must be a non-negative number' };
      }
      return { message: error.message };
    }
    return { message: 'An unexpected error occurred' };
  }

  // Validate permit input
  static validatePermitInput(input: EUPermitInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (input.active_permits < 0) {
      errors.push('Active permits must be a non-negative number');
    }

    if (!Number.isInteger(input.active_permits)) {
      errors.push('Active permits must be a whole number');
    }

    if (input.permit_year < 2020 || input.permit_year > 2030) {
      errors.push('Permit year must be between 2020 and 2030');
    }

    if (input.company_name && input.company_name.length > 100) {
      errors.push('Company name must be less than 100 characters');
    }

    if (input.notes && input.notes.length > 500) {
      errors.push('Notes must be less than 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}