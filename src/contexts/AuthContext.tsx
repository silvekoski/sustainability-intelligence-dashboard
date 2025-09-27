import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthState, AuthUser, UserProfile } from '../types/auth';
import { AuthService } from '../services/authService';
import { supabase } from '../lib/supabase';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, confirmPassword: string, fullName: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ error: any }>;
  updateProfile: (data: { full_name: string; avatar_url?: string }) => Promise<{ error: any }>;
  deleteAccount: () => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    initialized: false,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data } = await AuthService.getSession();
        if (data.session?.user) {
          await handleUserSession(data.session.user as AuthUser);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setState(prev => ({ ...prev, loading: false, initialized: true }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await handleUserSession(session.user as AuthUser);
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            loading: false,
            initialized: true,
          });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          await handleUserSession(session.user as AuthUser);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (user: AuthUser) => {
    setState(prev => ({ ...prev, user, loading: true }));
    
    // Fetch user profile
    const { data: profile } = await AuthService.getUserProfile(user.id);
    
    setState({
      user,
      profile,
      loading: false,
      initialized: true,
    });
  };

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }));
    const result = await AuthService.login({ email, password });
    
    if (result.error) {
      setState(prev => ({ ...prev, loading: false }));
    }
    
    return { error: result.error };
  };

  const register = async (email: string, password: string, confirmPassword: string, fullName: string) => {
    setState(prev => ({ ...prev, loading: true }));
    const result = await AuthService.register({ 
      email, 
      password, 
      confirmPassword, 
      fullName 
    });
    
    if (result.error) {
      setState(prev => ({ ...prev, loading: false }));
    }
    
    return { error: result.error };
  };

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }));
    await AuthService.logout();
    setState({
      user: null,
      profile: null,
      loading: false,
      initialized: true,
    });
  const resendConfirmation = async (email: string) => {
    return await AuthService.resendConfirmation(email);
  };

  };

  const resetPassword = async (email: string) => {
    const result = await AuthService.resetPassword({ email });
    return { error: result.error };
  };

  const updatePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    const result = await AuthService.updatePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return { error: result.error };
  };

  const updateProfile = async (data: { full_name: string; avatar_url?: string }) => {
    if (!state.user) return { error: { message: 'No user logged in' } };
    
    setState(prev => ({ ...prev, loading: true }));
    const result = await AuthService.updateUserProfile(state.user.id, data);
    
    if (result.data) {
      setState(prev => ({
        ...prev,
        profile: result.data,
        loading: false,
      }));
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
    
    return { error: result.error };
  };

  const deleteAccount = async () => {
    setState(prev => ({ ...prev, loading: true }));
    const result = await AuthService.deleteAccount();
    
    if (!result.error) {
      setState({
        user: null,
        profile: null,
        loading: false,
        initialized: true,
      });
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
    
    return { error: result.error };
  };

  const resendConfirmation = async (email: string) => {
    const result = await AuthService.resendConfirmation(email);
    return { error: result.error };
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    resendConfirmation,
    resetPassword,
    updatePassword,
    updateProfile,
    deleteAccount,
    resendConfirmation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};