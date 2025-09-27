import { supabase } from '../lib/supabase';
import { 
  LoginCredentials, 
  RegisterCredentials, 
  ResetPasswordCredentials,
  UpdatePasswordCredentials,
  UpdateProfileData,
  UserProfile,
  AuthError
} from '../types/auth';

export class AuthService {
  // Register new user
  static async register(credentials: RegisterCredentials) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
          }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email: credentials.email,
          full_name: credentials.fullName,
        });
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Login user
  static async login(credentials: LoginCredentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Logout user
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: this.formatError(error) };
    }
  }

  // Reset password
  static async resetPassword(credentials: ResetPasswordCredentials) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        credentials.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Update password
  static async updatePassword(credentials: UpdatePasswordCredentials) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: credentials.newPassword
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Get current session
  static async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Create user profile
  static async createUserProfile(userId: string, profileData: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            ...profileData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, profileData: UpdateProfileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Also update auth user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
        }
      });

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Delete user account
  static async deleteAccount() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('No user found');

      // Delete profile first
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.user.id);

      // Note: Supabase doesn't allow deleting users from client-side
      // This would need to be handled by an admin function or RLS policy
      
      return { error: null };
    } catch (error: any) {
      return { error: this.formatError(error) };
    }
  }

  // Resend email confirmation
  static async resendConfirmation(email: string) {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Format error messages
  private static formatError(error: any): AuthError {
    if (error.message) {
  // Validate password strength
  static validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true };
  }
}