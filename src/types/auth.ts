import { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface UpdatePasswordCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  full_name: string;
  avatar_url?: string;
}

export interface AuthError {
  message: string;
  field?: string;
}