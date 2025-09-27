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
        console.log('[AuthContext] Initializing auth...');
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          console.log('[AuthContext] User found, fetching profile...');
          // User is authenticated, try to fetch profile
          let profile = null;
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.error('[AuthContext] Profile fetch error:', error);
            } else {
              console.log('[AuthContext] Profile fetched:', data);
            }
            profile = data;
          } catch (error) {
            console.error('[AuthContext] Profile fetch exception:', error);
          }

          if (mounted) {
            console.log('[AuthContext] Setting user and profile state');
            setState({
              user: session.user as AuthUser,
              profile,
              loading: false,
              initialized: true,
            });
          }
        } else {
          console.log('[AuthContext] No user session found');
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
    const { data } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, !!session?.user);

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          setState(prev => ({ ...prev, loading: true }));
          
          console.log('[AuthContext] Auth state change - fetching profile for user:', session.user.id);
          // Fetch user profile
          let profile = null;
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.error('[AuthContext] Profile fetch error in auth change:', error);
              // If profile doesn't exist, try to create it
              if (error.code === 'PGRST116') {
                console.log('[AuthContext] Profile not found, creating...');
                try {
                  const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                      id: session.user.id,
                      email: session.user.email || '',
                      full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
                      avatar_url: session.user.user_metadata?.avatar_url || null,
                    })
                    .select()
                    .single();
                  
                  if (createError) {
                    console.error('[AuthContext] Failed to create profile:', createError);
                  } else {
                    console.log('[AuthContext] Profile created:', newProfile);
                    profile = newProfile;
                  }
                } catch (insertError) {
                  console.error('[AuthContext] Profile creation exception:', insertError);
                }
              }
            } else {
              console.log('[AuthContext] Profile fetched in auth change:', data);
              profile = data;
            }
            profile = data;
          } catch (error: any) {
            console.error('[AuthContext] Profile fetch exception in auth change:', error);
          }

          if (mounted) {
            console.log('[AuthContext] Setting state after auth change');
            setState({
              user: session.user as AuthUser,
              profile,
              loading: false,
              initialized: true,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[AuthContext] User signed out');
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
      if (data && data.subscription && typeof data.subscription.unsubscribe === 'function') {
        data.subscription.unsubscribe();
      }
    };
  }, []);

  // Force initialization after 10 seconds if still loading
  useEffect(() => {
    if (state.loading && !state.initialized) {
      const timer = setTimeout(() => {
        // Only force init if STILL no session and no user
        if (!state.user) {
          console.warn('[auth] Forcing auth initialization due to timeout');
          setState(prev => ({
            ...prev,
            loading: false,
            initialized: true,
          }));
        }
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [state.loading, state.initialized, state.user]);

  const login = async (email: string, password: string) => {
    console.log('[AuthContext] Login attempt for:', email);
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await AuthService.login({ email, password });
      
      if (result.error) {
        console.error('[AuthContext] Login error:', result.error);
        setState(prev => ({ ...prev, loading: false }));
      } else {
        console.log('[AuthContext] Login successful');
      }
      // Don't set loading to false here - let the auth state change handler do it
      
      return { error: result.error };
    } catch (error) {
      console.error('[AuthContext] Login exception:', error);
      setState(prev => ({ ...prev, loading: false }));
      return { error: { message: 'Login failed' } };
    }
  };

  const register = async (email: string, password: string, confirmPassword: string, fullName: string) => {
    console.log('[AuthContext] Register attempt for:', email);
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await AuthService.register({ 
        email, 
        password, 
        confirmPassword, 
        fullName 
      });
      
      if (result.error) {
        console.error('[AuthContext] Register error:', result.error);
        setState(prev => ({ ...prev, loading: false }));
      } else {
        console.log('[AuthContext] Registration successful');
      }
      // Don't set loading to false here - let the auth state change handler do it
      
      return { error: result.error };
    } catch (error) {
      console.error('[AuthContext] Register exception:', error);
      setState(prev => ({ ...prev, loading: false }));
      return { error: { message: 'Registration failed' } };
    }
  };

  const logout = async () => {
    console.log('Logout initiated');
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Clear state immediately to prevent UI issues
      setState({
        user: null,
        profile: null,
        loading: false,
        initialized: true,
      });
      
      const result = await AuthService.logout();
      console.log('Logout result:', result);
      
      if (result.error) {
        console.error('Logout error:', result.error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Force page reload to ensure clean state
    window.location.href = '/auth/login';
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
    
    console.log('[AuthContext] Updating profile for user:', state.user.id, 'with data:', data);
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await AuthService.updateUserProfile(state.user.id, data);
      
      if (result.data) {
        console.log('[AuthContext] Profile updated successfully:', result.data);
        setState(prev => ({
          ...prev,
          profile: result.data,
          loading: false,
        }));
      } else {
        console.error('[AuthContext] Profile update failed:', result.error);
        setState(prev => ({ ...prev, loading: false }));
      }
      
      return { error: result.error };
    } catch (error) {
      console.error('[AuthContext] Profile update exception:', error);
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