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
      // Validate password confirmation
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
          },
        }
      });

      if (error) throw error;

      // Profile is automatically created by database trigger
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

      console.log(data);

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

  static async updateProfile(dto: UpdateProfileData) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: dto.full_name,
          avatar_url: dto.avatar_url,
        },
      });
      if (error) throw error;
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
      // Handle specific Supabase error messages
      if (error.message.includes('Invalid login credentials')) {
        return { message: 'Invalid email or password' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { message: 'Please check your email and click the confirmation link' };
      }
      if (error.message.includes('User already registered')) {
        return { message: 'An account with this email already exists' };
      }
      if (error.message.includes('Password should be at least')) {
        return { message: 'Password must be at least 6 characters long' };
      }
      if (error.message.includes('Passwords do not match')) {
        return { message: 'Passwords do not match' };
      }
      return { message: error.message };
    }
    return { message: 'An unexpected error occurred' };
  }

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