/**
 * 🇿🇼 Nyuchi Platform - Supabase Client
 * "I am because we are" - Database connection management
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database, EnvBindings } from './types';

/**
 * Environment configuration
 */
interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

/**
 * Get Supabase configuration from environment
 * Supports both Node.js process.env and Cloudflare Workers env
 */
function getSupabaseConfig(env?: EnvBindings): SupabaseConfig {
  const url = env?.SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = env?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'
    );
  }

  return { url, anonKey, serviceRoleKey };
}

/**
 * Create Supabase client for public access (with RLS)
 * @param env - Optional environment bindings (for Cloudflare Workers)
 */
export function createSupabaseClient(env?: EnvBindings): SupabaseClient<Database> {
  const { url, anonKey } = getSupabaseConfig(env);

  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

/**
 * Create Supabase client for server-side operations (bypasses RLS)
 * Use with caution - only for admin operations
 * @param env - Optional environment bindings (for Cloudflare Workers)
 */
export function createSupabaseAdminClient(env?: EnvBindings): SupabaseClient<Database> {
  const { url, serviceRoleKey } = getSupabaseConfig(env);

  if (!serviceRoleKey) {
    throw new Error(
      'Missing service role key. Set SUPABASE_SERVICE_ROLE_KEY for admin operations.'
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create Supabase client with custom auth token (for API routes)
 * @param authToken - JWT token for authentication
 * @param env - Optional environment bindings (for Cloudflare Workers)
 */
export function createSupabaseClientWithAuth(
  authToken: string,
  env?: EnvBindings
): SupabaseClient<Database> {
  const { url, anonKey } = getSupabaseConfig(env);

  return createClient<Database>(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = createSupabaseClient();
    const { error } = await client.from('profiles').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}
