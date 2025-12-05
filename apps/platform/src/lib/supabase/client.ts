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

// Placeholder for build time - allows static generation to complete
// Real key must be set in production environment
const BUILD_TIME_PLACEHOLDER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.placeholder';

export function createClient() {
  const key = SUPABASE_ANON_KEY || BUILD_TIME_PLACEHOLDER;

  if (!SUPABASE_ANON_KEY && typeof window !== 'undefined') {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set - auth will not work');
  }

  return createBrowserClient(SUPABASE_URL, key);
}
