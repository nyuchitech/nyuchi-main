/**
 * Supabase Middleware Client
 * For session refresh and route protection
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Supabase configuration - values come from environment at runtime
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aqjhuyqhgmmdutwzqvyv.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Placeholder for build time - allows static generation to complete
const BUILD_TIME_PLACEHOLDER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.placeholder';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard'];

// Routes to redirect authenticated users away from (auth pages)
const AUTH_ROUTES = ['/sign-in', '/sign-up', '/login', '/register'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const key = SUPABASE_ANON_KEY || BUILD_TIME_PLACEHOLDER;

  const supabase = createServerClient(
    SUPABASE_URL,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
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
    }
  );

  // Get current user
  const { data: { user }, error } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check if accessing a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  // Check if accessing an auth route
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

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
