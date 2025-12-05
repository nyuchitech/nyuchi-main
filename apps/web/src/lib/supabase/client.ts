/**
 * Supabase Browser Client
 * For use in client components
 *
 * Configuration:
 * - NEXT_PUBLIC_SUPABASE_URL: https://aqjhuyqhgmmdutwzqvyv.supabase.co
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your publishable anon key
 */

import { createBrowserClient } from '@supabase/ssr';

// Supabase configuration - values come from environment at runtime
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aqjhuyqhgmmdutwzqvyv.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function createClient() {
  if (!SUPABASE_ANON_KEY) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
