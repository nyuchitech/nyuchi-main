/**
 * Supabase Server Client
 * For use in server components and API routes
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Use environment variables with fallback for build time
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://aqjhuyqhgmmdutwzqvyv.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  // Build-time placeholder - real key set in Vercel env vars
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxamh1eXFoZ21tZHV0d3pxdnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NzExNTUsImV4cCI6MjA0OTQ0NzE1NX0.placeholder';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
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
  });
}
