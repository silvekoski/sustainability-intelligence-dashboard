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
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Session error:', error);
          setState({
            user: null,
            profile: null,
            loading: false,
            initialized: true,
          });
          return;
        }

        if (session?.user) {
          // User is authenticated, fetch profile
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (mounted) {
              setState({
                user: session.user as AuthUser,
                profile: profile || null,
                loading: false,
                initialized: true,
              });
            }
          } catch (profileError) {
            console.error('Profile fetch error:', profileError);
            if (mounted) {
              setState({
                user: session.user as AuthUser,
                profile: null,
                loading: false,
                initialized: true,
              });
            }
          }
        } else {
          // No user session
          if (mounted) {
            setState({
              user: null,
              profile: null,
              loading: false,
              initialized: true,
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setState({
            user: null,
            profile: null,
            loading: false,
            initialized: true,
          });
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            setState(prev => ({ ...prev, loading: true }));
            
            // Fetch user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (mounted) {
              setState({
                user: session.user as AuthUser,
                profile: profile || null,
                loading: false,
                initialized: true,
              });
            }
          } else if (event === 'SIGNED_OUT') {
            if (mounted) {
              setState({
                user: null,
                profile: null,
                loading: false,
                initialized: true,
              });
            }
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            if (mounted) {
              setState(prev => ({
                ...prev,
                user: session.user as AuthUser,
              }));
            }
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          if (mounted) {
            setState(prev => ({
              ...prev,
              loading: false,
              initialized: true,
            }));
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await AuthService.login({ email, password });
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false }));
      }
      // Success case will be handled by onAuthStateChange
      
      return { error: result.error };
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      return { error: { message: 'Login failed' } };
    }
  };

  const register = async (email: string, password: string, confirmPassword: string, fullName: string) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await AuthService.register({ 
        email, 
        password, 
        confirmPassword, 
        fullName 
      });
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false }));
      }
      // Success case will be handled by onAuthStateChange
      
      return { error: result.error };
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      return { error: { message: 'Registration failed' } };
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await AuthService.logout();
      // State will be updated by onAuthStateChange
    } catch (error) {
      console.error('Logout error:', error);
      // Force state update even if logout fails
      setState({
        user: null,
        profile: null,
        loading: false,
        initialized: true,
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await AuthService.resetPassword({ email });
      return { error: result.error };
    } catch (error) {
      return { error: { message: 'Password reset failed' } };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      const result = await AuthService.updatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return { error: result.error };
    } catch (error) {
      return { error: { message: 'Password update failed' } };
    }
  };

  const updateProfile = async (data: { full_name: string; avatar_url?: string }) => {
    if (!state.user) return { error: { message: 'No user logged in' } };
    
    setState(prev => ({ ...prev, loading: true }));
    
    try {
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
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      return { error: { message: 'Profile update failed' } };
    }
  };

  const deleteAccount = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
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
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      return { error: { message: 'Account deletion failed' } };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const result = await AuthService.resendConfirmation(email);
      return { error: result.error };
    } catch (error) {
      return { error: { message: 'Resend confirmation failed' } };
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
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