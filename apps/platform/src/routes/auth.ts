/**
 * 🇿🇼 Nyuchi Platform - Auth Routes
 * "I am because we are" - Authentication endpoints
 */

import { Hono } from 'hono';
import { signUp, signIn, signOut, resetPassword, updatePassword, getCurrentUser } from '../lib/auth';
import { Env } from '../index';

const auth = new Hono<{ Bindings: Env }>();

/**
 * POST /api/auth/signup
 * Register new user
 */
auth.post('/signup', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    // Use provided role or default to 'user' - admin roles should be assigned through proper database operations
    const userRole = role || 'user';

    const { user, session } = await signUp(email, password, { name, role: userRole }, c.env);

    if (!user || !session) {
      return c.json({ error: 'Signup failed - no user or session returned' }, 400);
    }

    // Create profile in profiles table using service role
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      c.env.SUPABASE_URL || process.env.SUPABASE_URL || '',
      c.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || email,
        full_name: name || '',
        role: userRole,
        ubuntu_score: 0,
        contribution_count: 0
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail signup if profile creation fails - profile might already exist from trigger
    }

    return c.json({
      message: 'Welcome to the Nyuchi community',
      ubuntu: 'I am because we are',
      user: {
        id: user.id,
        email: user.email,
        role: userRole,
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json(
      {
        error: 'Signup failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      400
    );
  }
});

/**
 * POST /api/auth/signin
 * Authenticate user
 */
auth.post('/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    const { user, session } = await signIn(email, password, c.env);

    return c.json({
      message: 'Welcome back',
      ubuntu: 'I am because we are',
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'user',
        ubuntu_score: user.user_metadata?.ubuntu_score || 0,
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    return c.json(
      {
        error: 'Signin failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      401
    );
  }
});

/**
 * POST /api/auth/signout
 * Sign out user
 */
auth.post('/signout', async (c) => {
  try {
    await signOut(c.env);

    return c.json({
      message: 'Signed out successfully',
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Signout error:', error);
    return c.json(
      {
        error: 'Signout failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      400
    );
  }
});

/**
 * POST /api/auth/reset-password
 * Send password reset email
 */
auth.post('/reset-password', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email required' }, 400);
    }

    await resetPassword(email, c.env);

    return c.json({
      message: 'Password reset email sent',
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return c.json(
      {
        error: 'Reset password failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      400
    );
  }
});

/**
 * POST /api/auth/update-password
 * Update user password
 */
auth.post('/update-password', async (c) => {
  try {
    const { newPassword } = await c.req.json();

    if (!newPassword) {
      return c.json({ error: 'New password required' }, 400);
    }

    await updatePassword(newPassword, c.env);

    // Get current user after password update
    const user = await getCurrentUser(c.env);

    return c.json({
      message: 'Password updated successfully',
      ubuntu: 'I am because we are',
      user: user
        ? {
            id: user.id,
            email: user.email,
          }
        : null,
    });
  } catch (error) {
    console.error('Update password error:', error);
    return c.json(
      {
        error: 'Update password failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      400
    );
  }
});

export default auth;
