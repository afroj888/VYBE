import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile } from '../types/music';
import { getSupabase } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, displayName: string, username: string) => Promise<{ error?: string; message?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  deleteAccount: () => Promise<{ error?: string }>;
  toggleRole: (role: 'listener' | 'artist' | 'admin') => void; // Development/testing switch for admin reviews
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_STORAGE_KEY = 'vybe_current_user';

const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr-100-demo',
  email: 'afrojbhai1340@gmail.com',
  username: 'afroj_vybe',
  displayName: 'Afroj',
  avatarPath: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Sonic explorer & synthesizer enthusiast on VYBE',
  role: 'admin', // defaulted to admin for developer evaluation convenience
  createdAt: '2026-01-10T10:00:00Z',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_DEMO_USER;
        }
      }
    }
    return DEFAULT_DEMO_USER;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  // Sync session with Supabase if client is active
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsSupabaseConnected(false);
      setIsLoading(false);
      return;
    }

    setIsSupabaseConnected(true);

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profileData }) => {
            const profile: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              username: profileData?.username || session.user.email?.split('@')[0] || 'user',
              displayName: profileData?.display_name || session.user.email?.split('@')[0] || 'Listener',
              avatarPath: profileData?.avatar_path,
              bio: profileData?.bio,
              role: 'listener',
              createdAt: profileData?.created_at || new Date().toISOString(),
            };
            setUser(profile);
            localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(profile));
          });
      }
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // preserve demo user or clear
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          username: email.split('@')[0],
          displayName: email.split('@')[0],
          role: 'listener',
          createdAt: new Date().toISOString(),
        };
        setUser(profile);
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(profile));
      }
      setIsLoading(false);
      return {};
    }

    // Local authentication fallback
    const localProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      username: email.split('@')[0],
      displayName: email.split('@')[0],
      bio: 'Music enthusiast on VYBE',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    setUser(localProfile);
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(localProfile));
    setIsLoading(false);
    return {};
  }, []);

  const signUp = useCallback(async (
    email: string,
    pass: string,
    displayName: string,
    username: string
  ): Promise<{ error?: string; message?: string }> => {
    setIsLoading(true);
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            display_name: displayName,
            username,
          },
        },
      });

      setIsLoading(false);
      if (error) return { error: error.message };
      if (data.user && !data.session) {
        return { message: 'Confirmation link sent to your email. Please verify before signing in.' };
      }
      return { message: 'Account successfully registered!' };
    }

    // Local fallback
    const localProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      username,
      displayName,
      role: 'listener',
      bio: 'New explorer on VYBE',
      createdAt: new Date().toISOString(),
    };
    setUser(localProfile);
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(localProfile));
    setIsLoading(false);
    return { message: 'Registered successfully in local sandbox!' };
  }, []);

  const logout = useCallback(async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { error: error.message };
      return { message: 'Password recovery instructions sent to your email.' };
    }
    return { message: 'Simulated password reset instructions dispatched to your inbox.' };
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' };

    const updatedUser: UserProfile = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(updatedUser));

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('profiles').update({
        display_name: updates.displayName,
        username: updates.username,
        bio: updates.bio,
        avatar_path: updates.avatarPath,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);

      if (error) return { error: error.message };
    }

    return {};
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!user) return { error: 'Not authenticated' };
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
    return {};
  }, [user]);

  const toggleRole = useCallback((role: 'listener' | 'artist' | 'admin') => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(updated));
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSupabaseConnected,
        login,
        signUp,
        logout,
        resetPassword,
        updateProfile,
        deleteAccount,
        toggleRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
