/**
 * 🇿🇼 Nyuchi Platform - Supabase Auth Client
 * "I am because we are" - Authentication utilities
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { AuthEnvBindings } from './middleware';

/**
 * Create Supabase Auth client
 * @param env - Optional environment bindings (for Cloudflare Workers)
 */
export function createAuthClient(env?: AuthEnvBindings): SupabaseClient {
  const url = env?.SUPABASE_URL || process.env.SUPABASE_URL;
  const key = env?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(url, key);
}

/**
 * Sign up new user
 * @param env - Optional environment bindings (for Cloudflare Workers)
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, unknown>,
  env?: AuthEnvBindings
) {
  const client = createAuthClient(env);

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) {
    throw new Error(`Sign up failed: ${error.message}`);
  }

  return data;
}

/**
 * Sign in user
 * @param env - Optional environment bindings (for Cloudflare Workers)
 */
export async function signIn(email: string, password: string, env?: AuthEnvBindings) {
  const client = createAuthClient(env);

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Sign in failed: ${error.message}`);
  }

  return data;
}

/**
 * Sign out user
 * @param env - Optional environment bindings (for Cloudflare Workers)
 */
export async function signOut(env?: AuthEnvBindings) {
  const client = createAuthClient(env);

  const { error } = await client.auth.signOut();

  if (error) {
    throw new Error(`Sign out failed: ${error.message}`);
  }
}

/**
 * Get current session
 * @param env - Optional environment bindings (for Cloudflare Workers)
 */
export async function getSession(env?: AuthEnvBindings): Promise<Session | null> {
  const client = createAuthClient(env);

  const { data, error } = await client.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return data.session;
}

/**
 * Get current user
 * @param env - Optional environment bindings (for Cloudflare Workers)
 */
export async function getCurrentUser(env?: AuthEnvBindings): Promise<User | null> {
  const client = createAuthClient(env);

  const { data, error } = await client.auth.getUser();

  if (error) {
    console.error('Error getting user:', error);
    return null;
  }

  return data.user;
}

/**
 * Refresh session
 * @param env - Optional environment bindings (for Cloudflare Workers)
 */
export async function refreshSession(env?: AuthEnvBindings): Promise<Session | null> {
  const client = createAuthClient(env);

  const { data, error } = await client.auth.refreshSession();

  if (error) {
    console.error('Error refreshing session:', error);
    return null;
  }

  return data.session;
}

/**
 * Verify JWT token
 * @param env - Optional environment bindings (for Cloudflare Workers)
 */
export async function verifyToken(token: string, env?: AuthEnvBindings): Promise<User | null> {
  const client = createAuthClient(env);

  const { data, error } = await client.auth.getUser(token);

  if (error) {
    console.error('Error verifying token:', error);
    return null;
  }

  return data.user;
}

/**
 * Send password reset email
 * @param env - Optional environment bindings (for Cloudflare Workers)
 */
export async function resetPassword(email: string, env?: AuthEnvBindings) {
  const client = createAuthClient(env);

  const { error } = await client.auth.resetPasswordForEmail(email);

  if (error) {
    throw new Error(`Password reset failed: ${error.message}`);
  }
}

/**
 * Update password
 * @param env - Optional environment bindings (for Cloudflare Workers)
 */
export async function updatePassword(newPassword: string, env?: AuthEnvBindings) {
  const client = createAuthClient(env);

  const { error } = await client.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(`Password update failed: ${error.message}`);
  }
}
