/**
 * Authentication middleware for the API gateway
 */

import { Context, Next } from 'hono';
import { createServiceClient } from '@nyuchi/workers-shared';
import type { ApiEnv } from '@nyuchi/workers-shared';

// Extend Hono context with user data
declare module 'hono' {
  interface ContextVariableMap {
    user: {
      id: string;
      email: string;
      role: string;
      capabilities: string[];
    };
    token: string;
  }
}

/**
 * Required authentication middleware
 * Returns 401 if not authenticated
 */
export async function authMiddleware(
  c: Context<{ Bindings: ApiEnv }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createServiceClient(c.env);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401);
    }

    // Get user profile with role and capabilities
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, capabilities')
      .eq('id', user.id)
      .single();

    c.set('user', {
      id: user.id,
      email: user.email || '',
      role: profile?.role || 'user',
      capabilities: profile?.capabilities || [],
    });
    c.set('token', token);

    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Unauthorized', message: 'Authentication failed' }, 401);
  }
}

/**
 * Optional authentication middleware
 * Continues even if not authenticated, but sets user if valid token provided
 */
export async function optionalAuthMiddleware(
  c: Context<{ Bindings: ApiEnv }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const supabase = createServiceClient(c.env);

    try {
      const { data: { user } } = await supabase.auth.getUser(token);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, capabilities')
          .eq('id', user.id)
          .single();

        c.set('user', {
          id: user.id,
          email: user.email || '',
          role: profile?.role || 'user',
          capabilities: profile?.capabilities || [],
        });
        c.set('token', token);
      }
    } catch {
      // Ignore auth errors for optional auth
    }
  }

  await next();
}

/**
 * Role-based access control middleware factory
 */
export function requireRole(...roles: string[]) {
  return async (c: Context<{ Bindings: ApiEnv }>, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const hasRole = roles.includes(user.role) ||
                    user.capabilities.some(cap => roles.includes(cap));

    if (!hasRole) {
      return c.json({
        error: 'Forbidden',
        message: `Requires one of: ${roles.join(', ')}`
      }, 403);
    }

    await next();
  };
}

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * Moderator or admin middleware
 */
export const requireModerator = requireRole('moderator', 'admin');

/**
 * Reviewer or admin middleware
 */
export const requireReviewer = requireRole('reviewer', 'admin');
