/**
 * Admin Routes - Platform administration
 */

import { Hono } from 'hono';
import type { ApiEnv } from '@nyuchi/workers-shared';
import { createServiceClient, isValidUUID, UBUNTU_POINTS } from '@nyuchi/workers-shared';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { queueActivityLog, queueUbuntuPointsAward } from '../lib/queue';

const admin = new Hono<{ Bindings: ApiEnv }>();

// All admin routes require admin role
admin.use('*', authMiddleware, requireAdmin);

/**
 * GET /api/admin/stats - Platform statistics
 */
admin.get('/stats', async (c) => {
  try {
    const supabase = createServiceClient(c.env);

    const [users, listings, content, contributions] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('directory_listings').select('*', { count: 'exact', head: true }),
      supabase.from('content_submissions').select('*', { count: 'exact', head: true }),
      supabase.from('ubuntu_contributions').select('points_earned'),
    ]);

    const totalPoints = (contributions.data || []).reduce(
      (sum, c) => sum + (c.points_earned || 0),
      0
    );

    return c.json({
      data: {
        totalUsers: users.count || 0,
        totalListings: listings.count || 0,
        totalContent: content.count || 0,
        totalUbuntuPoints: totalPoints,
      },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

/**
 * GET /api/admin/users - List all users
 */
admin.get('/users', async (c) => {
  try {
    const supabase = createServiceClient(c.env);
    const search = c.req.query('search');
    const role = c.req.query('role');
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
    const offset = parseInt(c.req.query('offset') || '0');

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }
    if (role) {
      query = query.eq('role', role);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return c.json({
      data: data || [],
      pagination: { limit, offset, total: count || 0 },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

/**
 * PATCH /api/admin/users/:id - Update user
 */
admin.patch('/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    if (!isValidUUID(id)) {
      return c.json({ error: 'Invalid user ID' }, 400);
    }

    const supabase = createServiceClient(c.env);
    const adminUser = c.get('user');
    const body = await c.req.json();

    const allowedFields = ['role', 'capabilities', 'is_active'];
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data: user, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await queueActivityLog(c.env, adminUser.id, 'ADMIN_UPDATE_USER', {
      targetUserId: id,
      fields: Object.keys(updateData),
    });

    return c.json({
      data: user,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

/**
 * POST /api/admin/ubuntu-points/:userId - Manually adjust Ubuntu points
 */
admin.post('/ubuntu-points/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    if (!isValidUUID(userId)) {
      return c.json({ error: 'Invalid user ID' }, 400);
    }

    const adminUser = c.get('user');
    const { points, reason, contributionType } = await c.req.json();

    if (typeof points !== 'number' || !reason) {
      return c.json({ error: 'points (number) and reason required' }, 400);
    }

    // Queue the points award
    await queueUbuntuPointsAward(
      c.env,
      userId,
      contributionType || 'admin_adjustment',
      points,
      reason,
      { adjustedBy: adminUser.id }
    );

    await queueActivityLog(c.env, adminUser.id, 'ADMIN_ADJUST_POINTS', {
      targetUserId: userId,
      points,
      reason,
    });

    return c.json({
      message: `Queued ${points} Ubuntu points for user`,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error adjusting points:', error);
    return c.json({ error: 'Failed to adjust points' }, 500);
  }
});

/**
 * GET /api/admin/system-config - Get system configuration
 */
admin.get('/system-config', async (c) => {
  return c.json({
    data: {
      ubuntuPoints: UBUNTU_POINTS,
      environment: c.env.ENVIRONMENT,
    },
    ubuntu: 'I am because we are',
  });
});

export default admin;
