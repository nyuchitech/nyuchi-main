/**
 * Supabase Server Client
 * For use in server components and API routes
 *
 * Configuration:
 * - NEXT_PUBLIC_SUPABASE_URL: https://aqjhuyqhgmmdutwzqvyv.supabase.co
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your publishable anon key
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Supabase configuration - values come from environment at runtime
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aqjhuyqhgmmdutwzqvyv.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
