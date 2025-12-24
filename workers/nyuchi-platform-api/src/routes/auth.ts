/**
 * Auth Routes - Authentication endpoints
 */

import { Hono } from 'hono';
import type { ApiEnv } from '@nyuchi/workers-shared';
import { createAnonClient, createServiceClient } from '@nyuchi/workers-shared';
import { authMiddleware } from '../middleware/auth';
import { queueActivityLog, queueEmailNotification } from '../lib/queue';
import { startOnboardingWorkflow } from '../lib/workflows';

const auth = new Hono<{ Bindings: ApiEnv }>();

/**
 * POST /api/auth/signup - Register new user
 */
auth.post('/signup', async (c) => {
  try {
    const supabase = createAnonClient(c.env);
    const { email, password, full_name } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
      },
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    if (data.user) {
      // Start onboarding workflow
      await startOnboardingWorkflow(c.env, {
        userId: data.user.id,
        email,
        fullName: full_name || '',
        userType: 'individual',
      });

      // Queue welcome email
      await queueEmailNotification(c.env, email, 'welcome-email', {
        fullName: full_name,
      });

      await queueActivityLog(
        c.env,
        data.user.id,
        'SIGN_UP',
        {},
        c.req.header('CF-Connecting-IP'),
        c.req.header('User-Agent')
      );
    }

    return c.json({
      message: 'Account created successfully',
      user: data.user,
      session: data.session,
      ubuntu: 'Welcome to the community',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

/**
 * POST /api/auth/signin - Sign in user
 */
auth.post('/signin', async (c) => {
  try {
    const supabase = createAnonClient(c.env);
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return c.json({ error: error.message }, 401);
    }

    if (data.user) {
      await queueActivityLog(
        c.env,
        data.user.id,
        'SIGN_IN',
        {},
        c.req.header('CF-Connecting-IP'),
        c.req.header('User-Agent')
      );
    }

    return c.json({
      user: data.user,
      session: data.session,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Signin error:', error);
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

/**
 * POST /api/auth/signout - Sign out user
 */
auth.post('/signout', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const token = c.get('token');
    const supabase = createServiceClient(c.env);

    await supabase.auth.admin.signOut(token);

    await queueActivityLog(c.env, user.id, 'SIGN_OUT', {});

    return c.json({
      message: 'Signed out successfully',
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Signout error:', error);
    return c.json({ error: 'Failed to sign out' }, 500);
  }
});

/**
 * GET /api/auth/me - Get current user profile
 */
auth.get('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const supabase = createServiceClient(c.env);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return c.json({
      data: profile,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

/**
 * PUT /api/auth/me - Update current user profile
 */
auth.put('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const supabase = createServiceClient(c.env);

    const allowedFields = ['full_name', 'avatar_url', 'bio', 'location', 'website'];
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    await queueActivityLog(c.env, user.id, 'UPDATE_ACCOUNT', { fields: Object.keys(updateData) });

    return c.json({
      data: profile,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

/**
 * POST /api/auth/forgot-password - Send password reset email
 */
auth.post('/forgot-password', async (c) => {
  try {
    const supabase = createAnonClient(c.env);
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email required' }, 400);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${c.req.header('origin')}/reset-password`,
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({
      message: 'Password reset email sent',
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return c.json({ error: 'Failed to send reset email' }, 500);
  }
});

/**
 * POST /api/auth/reset-password - Reset password with token
 */
auth.post('/reset-password', async (c) => {
  try {
    const supabase = createAnonClient(c.env);
    const { access_token, password } = await c.req.json();

    if (!access_token || !password) {
      return c.json({ error: 'Token and password required' }, 400);
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({
      message: 'Password updated successfully',
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return c.json({ error: 'Failed to reset password' }, 500);
  }
});

export default auth;
