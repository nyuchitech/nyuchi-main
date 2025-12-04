/**
 * Auth Context with Supabase Auth
 * "I am because we are"
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from './supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  role?: string;
  capabilities?: string[];
  ubuntu_score?: number;
  full_name?: string;
  avatar_url?: string;
  company?: string;
  country?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Fetch user profile from profiles table
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        console.error('Profile fetch error:', error);
        return null;
      }

      return {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        capabilities: profile.capabilities || [],
        ubuntu_score: profile.ubuntu_score,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        company: profile.company,
        country: profile.country,
      };
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  // Create profile if it doesn't exist
  const createProfileIfNeeded = async (supabaseUser: SupabaseUser, name?: string) => {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', supabaseUser.id)
      .single();

    if (!existing) {
      // Determine role - admin for bryan@nyuchi.com
      const role = supabaseUser.email === 'bryan@nyuchi.com' ? 'admin' : 'user';

      await supabase.from('profiles').insert({
        id: supabaseUser.id,
        email: supabaseUser.email,
        full_name: name || supabaseUser.user_metadata?.full_name || '',
        role,
        capabilities: [],
        ubuntu_score: 0,
        contribution_count: 0,
      });
    }
  };

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (initialSession?.user) {
          setSession(initialSession);
          const profile = await fetchProfile(initialSession.user.id);
          if (profile) {
            setUser(profile);
          } else {
            // Create profile if it doesn't exist
            await createProfileIfNeeded(initialSession.user);
            const newProfile = await fetchProfile(initialSession.user.id);
            setUser(newProfile);
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);

        if (currentSession?.user) {
          const profile = await fetchProfile(currentSession.user.id);
          if (profile) {
            setUser(profile);
          } else if (event === 'SIGNED_IN') {
            // Create profile for new users
            await createProfileIfNeeded(currentSession.user);
            const newProfile = await fetchProfile(currentSession.user.id);
            setUser(newProfile);
          }
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        setUser(profile);
        router.push('/dashboard');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        await createProfileIfNeeded(data.user, name);
        const profile = await fetchProfile(data.user.id);
        setUser(profile);
        router.push('/dashboard');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.push('/');
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const refreshUser = async () => {
    if (!session?.user?.id) return;

    const profile = await fetchProfile(session.user.id);
    if (profile) {
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        token: session?.access_token || null,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
