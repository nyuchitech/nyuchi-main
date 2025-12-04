/**
 * 🇿🇼 Nyuchi Platform - Session Management
 * "I am because we are" - Session utilities
 */

import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createAuthClient, getSession, refreshSession as refreshSupabaseSession } from './client';
import { UserRole } from './roles';

/**
 * Session user with extended profile
 */
export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  ubuntuScore: number;
  contributionCount: number;
  verificationStatus: 'unverified' | 'pending' | 'verified';
  createdAt: string;
}

/**
 * Session data
 */
export interface SessionData {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Get current session with extended user data
 */
export async function getCurrentSession(): Promise<SessionData | null> {
  const session = await getSession();

  if (!session || !session.user) {
    return null;
  }

  return {
    user: mapUserToSessionUser(session.user),
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: new Date(session.expires_at || 0).getTime(),
  };
}

/**
 * Check if session is valid
 */
export async function isSessionValid(): Promise<boolean> {
  const session = await getSession();
  return session !== null && session.user !== null;
}

/**
 * Check if session is expired or expiring soon (within 5 minutes)
 */
export function isSessionExpiring(session: SessionData): boolean {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  return session.expiresAt - now < fiveMinutes;
}

/**
 * Refresh session if expiring
 */
export async function refreshSessionIfNeeded(): Promise<SessionData | null> {
  const currentSession = await getCurrentSession();

  if (!currentSession) {
    return null;
  }

  if (isSessionExpiring(currentSession)) {
    const refreshedSession = await refreshSupabaseSession();

    if (!refreshedSession || !refreshedSession.user) {
      return null;
    }

    return {
      user: mapUserToSessionUser(refreshedSession.user),
      accessToken: refreshedSession.access_token,
      refreshToken: refreshedSession.refresh_token,
      expiresAt: new Date(refreshedSession.expires_at || 0).getTime(),
    };
  }

  return currentSession;
}

/**
 * Get session user ID
 */
export async function getSessionUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id || null;
}

/**
 * Get session user role
 */
export async function getSessionUserRole(): Promise<UserRole> {
  const session = await getSession();
  return (session?.user?.user_metadata?.role as UserRole) || 'user';
}

/**
 * Check if current user has role
 */
export async function hasSessionRole(role: UserRole): Promise<boolean> {
  const userRole = await getSessionUserRole();
  return userRole === role;
}

/**
 * Check if current user is admin
 */
export async function isSessionAdmin(): Promise<boolean> {
  return hasSessionRole('admin');
}

/**
 * Check if current user is moderator or admin
 */
export async function isSessionModerator(): Promise<boolean> {
  const role = await getSessionUserRole();
  return role === 'moderator' || role === 'admin';
}

/**
 * Get session token for API requests
 */
export async function getSessionToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token || null;
}

/**
 * Create authorization header
 */
export async function getAuthHeader(): Promise<Record<string, string> | null> {
  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const client = createAuthClient();

  const { data } = client.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  // Return unsubscribe function
  return data.subscription.unsubscribe;
}

/**
 * Map Supabase User to SessionUser
 */
function mapUserToSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    email: user.email || '',
    role: (user.user_metadata?.role as UserRole) || 'user',
    ubuntuScore: user.user_metadata?.ubuntu_score || 0,
    contributionCount: user.user_metadata?.contribution_count || 0,
    verificationStatus: user.user_metadata?.verification_status || 'unverified',
    createdAt: user.created_at,
  };
}

/**
 * Store session in localStorage (for browser-side caching)
 */
export function storeSessionLocally(session: SessionData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('nyuchi_session', JSON.stringify(session));
  } catch (error) {
    console.error('Failed to store session:', error);
  }
}

/**
 * Get session from localStorage
 */
export function getLocalSession(): SessionData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('nyuchi_session');
    if (!stored) return null;

    const session = JSON.parse(stored) as SessionData;

    // Check if expired
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem('nyuchi_session');
      return null;
    }

    return session;
  } catch (error) {
    console.error('Failed to get local session:', error);
    return null;
  }
}

/**
 * Clear local session
 */
export function clearLocalSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('nyuchi_session');
  } catch (error) {
    console.error('Failed to clear local session:', error);
  }
}
