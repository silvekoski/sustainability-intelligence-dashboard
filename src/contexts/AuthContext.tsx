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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          // User is authenticated, try to fetch profile
          let profile = null;
          try {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            profile = data;
          } catch (error) {
            console.warn('Profile fetch failed:', error);
          }

          if (mounted) {
            setState({
              user: session.user as AuthUser,
              profile,
              loading: false,
              initialized: true,
            });
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

    // Initialize with a small delay to prevent race conditions
    const timer = setTimeout(initializeAuth, 100);

    // Listen for auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, !!session?.user);

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          setState(prev => ({ ...prev, loading: true }));
          
          // Fetch user profile
          let profile = null;
          try {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            profile = data;
          } catch (error: any) {
            console.warn('Profile fetch failed, creating profile:', error);
            // If profile doesn't exist, create it
            if (error?.code === 'PGRST116') {
              try {
                const { data: newProfile } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email || '',
                    full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
                    avatar_url: session.user.user_metadata?.avatar_url || null,
                  })
                  .select()
                  .single();
                profile = newProfile;
              } catch (insertError) {
                console.error('Failed to create profile:', insertError);
              }
            }
          }

          if (mounted) {
            setState({
              user: session.user as AuthUser,
              profile,
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
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription?.unsubscribe();
    };
  }, []);

  // Force initialization after 10 seconds if still loading
  useEffect(() => {
    if (state.loading && !state.initialized) {
      const forceInit = setTimeout(() => {
        console.warn('Forcing auth initialization due to timeout');
        setState(prev => ({
          ...prev,
          loading: false,
          initialized: true,
        }));
      }, 10000);

      return () => clearTimeout(forceInit);
    }
  }, [state.loading, state.initialized]);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await AuthService.login({ email, password });
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false }));
      }
      // Don't set loading to false here - let the auth state change handler do it
      
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
      // Don't set loading to false here - let the auth state change handler do it
      
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
    } catch (error) {
      console.error('Logout error:', error);
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
    if (!state.user) return Promise.resolve({ error: { message: 'No user logged in' } });
    
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
}

export default AuthProvider;