/**
 * Next.js Middleware
 * Handles Supabase session refresh
 */

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Use Node.js runtime to avoid Edge Runtime warnings from @supabase/ssr
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need auth refresh
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
