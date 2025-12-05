/**
 * 🇿🇼 Nyuchi Platform - Admin Routes
 * "I am because we are" - Admin interface endpoints
 */

import { Hono } from 'hono';
import { authMiddleware, requireAdmin, requireModerator } from '../lib/auth';
import { createSupabaseClient, createSupabaseAdminClient } from '../lib/database';
import type { UserRole } from '@nyuchi/database';
import { Env } from '../index';

const admin = new Hono<{ Bindings: Env }>();

/**
 * GET /api/admin/stats
 * Get platform statistics (moderator/admin)
 */
admin.get('/stats', authMiddleware, requireModerator, async (c) => {
  try {
    const client = createSupabaseClient(c.env);

    // Get user stats
    const { count: totalUsers } = await client
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get directory stats
    const { count: totalListings } = await client
      .from('directory_listings')
      .select('*', { count: 'exact', head: true });

    const { count: publishedListings } = await client
      .from('directory_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    const { count: pendingListings } = await client
      .from('directory_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get content stats
    const { count: totalContent } = await client
      .from('content_submissions')
      .select('*', { count: 'exact', head: true });

    const { count: publishedContent } = await client
      .from('content_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    const { count: pendingContent } = await client
      .from('content_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted');

    // Get Ubuntu stats
    const { data: topContributors } = await client
      .from('profiles')
      .select('id, email, ubuntu_score, contribution_count')
      .order('ubuntu_score', { ascending: false })
      .limit(10);

    return c.json({
      users: {
        total: totalUsers,
      },
      directory: {
        total: totalListings,
        published: publishedListings,
        pending: pendingListings,
      },
      content: {
        total: totalContent,
        published: publishedContent,
        pending: pendingContent,
      },
      ubuntuLeaders: {
        topContributors,
      },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

/**
 * GET /api/admin/users
 * List all users (admin)
 */
admin.get('/users', authMiddleware, requireAdmin, async (c) => {
  try {
    const client = createSupabaseClient(c.env);
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '25');
    const role = c.req.query('role');

    let query = client
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (role) {
      query = query.eq('role', role as UserRole);
    }

    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    return c.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

/**
 * PUT /api/admin/users/:id/role
 * Update user role (admin)
 */
admin.put('/users/:id/role', authMiddleware, requireAdmin, async (c) => {
  try {
    const adminClient = createSupabaseAdminClient(c.env);
    const userId = c.req.param('id');
    const { role } = await c.req.json();

    if (!['user', 'contributor', 'moderator', 'admin'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    const { data, error } = await adminClient
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return c.json({
      message: 'User role updated',
      ubuntu: 'I am because we are',
      data,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return c.json({ error: 'Failed to update user role' }, 500);
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user (admin)
 */
admin.delete('/users/:id', authMiddleware, requireAdmin, async (c) => {
  try {
    const adminClient = createSupabaseAdminClient(c.env);
    const userId = c.req.param('id');

    // Delete user profile (cascade will handle related records)
    const { error } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return c.json({
      message: 'User deleted successfully',
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

/**
 * GET /api/admin/profiles/:id
 * Get single profile by ID (users can access their own, admins can access any)
 */
admin.get('/profiles/:id', authMiddleware, async (c) => {
  try {
    const userId = c.req.param('id');
    const requestingUser = c.get('user');

    // Users can only access their own profile, admins can access any
    if (requestingUser.id !== userId && requestingUser.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const client = createSupabaseClient(c.env);
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

/**
 * PUT /api/admin/profiles/:id
 * Update profile (users can update their own, admins can update any)
 */
admin.put('/profiles/:id', authMiddleware, async (c) => {
  try {
    const userId = c.req.param('id');
    const requestingUser = c.get('user');

    // Users can only update their own profile, admins can update any
    if (requestingUser.id !== userId && requestingUser.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const updates = await c.req.json();

    // Filter allowed fields
    const allowedFields = ['full_name', 'avatar_url', 'company', 'country'] as const;
    const filteredUpdates: Record<string, string | null> = {};

    for (const field of allowedFields) {
      if (field in updates) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    const client = createSupabaseClient(c.env);
    const { data, error } = await client
      .from('profiles')
      .update(filteredUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return c.json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

/**
 * GET /api/admin/pending-reviews
 * Get items pending review (moderator/admin)
 */
admin.get('/pending-reviews', authMiddleware, requireModerator, async (c) => {
  try {
    const client = createSupabaseClient(c.env);

    // Get pending directory listings
    const { data: pendingListings } = await client
      .from('directory_listings')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50);

    // Get pending content
    const { data: pendingContent } = await client
      .from('content_submissions')
      .select('*')
      .eq('status', 'submitted')
      .order('created_at', { ascending: true })
      .limit(50);

    // Get pending verifications
    const { data: pendingVerifications } = await client
      .from('verification_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50);

    return c.json({
      directory_listings: pendingListings || [],
      content_submissions: pendingContent || [],
      verification_requests: pendingVerifications || [],
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    return c.json({ error: 'Failed to fetch pending reviews' }, 500);
  }
});

/**
 * PUT /api/admin/ubuntu-points/:userId
 * Manually adjust user's Ubuntu points (admin)
 */
admin.put('/ubuntu-points/:userId', authMiddleware, requireAdmin, async (c) => {
  try {
    const adminClient = createSupabaseAdminClient(c.env);
    const userId = c.req.param('userId');
    const { points, reason } = await c.req.json();

    if (typeof points !== 'number') {
      return c.json({ error: 'Points must be a number' }, 400);
    }

    // Update user's Ubuntu score
    const { data, error } = await adminClient
      .from('profiles')
      .update({
        ubuntu_score: points,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Record adjustment in contributions
    await adminClient.from('ubuntu_contributions').insert({
      user_id: userId,
      contribution_type: 'knowledge_sharing',
      ubuntu_points_earned: points,
      details: reason || 'Manual adjustment by admin',
      metadata: {
        type: 'manual_adjustment',
        adjusted_by: c.get('user').id,
      },
    });

    return c.json({
      message: 'Ubuntu points updated',
      ubuntu: 'I am because we are',
      data,
    });
  } catch (error) {
    console.error('Error updating Ubuntu points:', error);
    return c.json({ error: 'Failed to update Ubuntu points' }, 500);
  }
});

/**
 * GET /api/admin/system-config
 * Get system configuration (admin)
 */
admin.get('/system-config', authMiddleware, requireAdmin, async (c) => {
  return c.json({
    environment: c.env.ENVIRONMENT,
    features: {
      directory: true,
      content: true,
      ubuntu_scoring: true,
      stripe_payments: true,
      ai_integration: true,
    },
    ubuntu: 'I am because we are',
  });
});

export default admin;
