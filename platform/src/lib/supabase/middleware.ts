/**
 * Supabase Middleware Client
 * For session refresh and route protection
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Use environment variables with fallback for build time
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://aqjhuyqhgmmdutwzqvyv.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  // Build-time placeholder - real key set in Vercel env vars
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxamh1eXFoZ21tZHV0d3pxdnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NzExNTUsImV4cCI6MjA0OTQ0NzE1NX0.placeholder';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard'];

// Routes to redirect authenticated users away from (auth pages)
const AUTH_ROUTES = ['/sign-in', '/sign-up', '/login', '/register'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Get current user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check if accessing a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Check if accessing an auth route
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // If trying to access protected route without being authenticated, redirect to sign-in
  if (isProtectedRoute && (error || !user)) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If authenticated user tries to access auth pages, redirect to dashboard
  if (isAuthRoute && user && !error) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}
