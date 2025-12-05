/**
 * 🇿🇼 Nyuchi Platform - Auth Middleware
 * "I am because we are" - Authentication middleware for Hono
 */

import { Context, Next } from 'hono';
import { verifyToken, getSession } from './client';
import { UserRole } from './roles';

/**
 * User context interface
 */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  ubuntuScore?: number;
}

/**
 * Auth environment bindings for Cloudflare Workers
 */
export interface AuthEnvBindings {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

/**
 * Extend Hono context with user
 */
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

/**
 * Authentication middleware - requires valid JWT token
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.json({ error: 'Missing authorization header' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: 'Missing token' }, 401);
  }

  const user = await verifyToken(token);

  if (!user) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Set user in context
  c.set('user', {
    id: user.id,
    email: user.email || '',
    role: (user.user_metadata?.role as UserRole) || 'user',
    ubuntuScore: user.user_metadata?.ubuntu_score,
  });

  await next();
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const user = await verifyToken(token);

    if (user) {
      c.set('user', {
        id: user.id,
        email: user.email || '',
        role: (user.user_metadata?.role as UserRole) || 'user',
        ubuntuScore: user.user_metadata?.ubuntu_score,
      });
    }
  }

  await next();
}

/**
 * Role-based access control middleware
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: user.role,
      }, 403);
    }

    await next();
  };
}

/**
 * Admin-only middleware
 */
export async function requireAdmin(c: Context, next: Next) {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  if (user.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  await next();
}

/**
 * Moderator or Admin middleware
 */
export async function requireModerator(c: Context, next: Next) {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  if (user.role !== 'moderator' && user.role !== 'admin') {
    return c.json({ error: 'Moderator access required' }, 403);
  }

  await next();
}

/**
 * Session-based authentication middleware (for browser requests)
 */
export async function sessionAuthMiddleware(c: Context, next: Next) {
  const session = await getSession();

  if (!session || !session.user) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  c.set('user', {
    id: session.user.id,
    email: session.user.email || '',
    role: (session.user.user_metadata?.role as UserRole) || 'user',
    ubuntuScore: session.user.user_metadata?.ubuntu_score,
  });

  await next();
}
