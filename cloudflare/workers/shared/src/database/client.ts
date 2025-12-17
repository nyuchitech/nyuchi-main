/**
 * Supabase client factory for workers
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { BaseEnv } from '../types/env';

// Cache clients to avoid recreating on every request
const clientCache = new Map<string, SupabaseClient>();

/**
 * Create a Supabase client with anon key (for user-scoped operations)
 */
export function createAnonClient(env: BaseEnv): SupabaseClient {
  const cacheKey = `anon:${env.SUPABASE_URL}`;

  if (!clientCache.has(cacheKey)) {
    clientCache.set(
      cacheKey,
      createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    );
  }

  return clientCache.get(cacheKey)!;
}

/**
 * Create a Supabase client with service role key (for admin operations)
 */
export function createServiceClient(env: BaseEnv): SupabaseClient {
  const cacheKey = `service:${env.SUPABASE_URL}`;

  if (!clientCache.has(cacheKey)) {
    clientCache.set(
      cacheKey,
      createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    );
  }

  return clientCache.get(cacheKey)!;
}

/**
 * Create a Supabase client authenticated with a user's JWT
 */
export function createUserClient(env: BaseEnv, accessToken: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
