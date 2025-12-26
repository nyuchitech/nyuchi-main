/**
 * Supabase Browser Client
 * For use in client components
 */

import { createBrowserClient } from '@supabase/ssr';

// Use environment variables with fallback for build time
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://aqjhuyqhgmmdutwzqvyv.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  // Build-time placeholder - real key set in Vercel env vars
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxamh1eXFoZ21tZHV0d3pxdnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NzExNTUsImV4cCI6MjA0OTQ0NzE1NX0.placeholder';

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
