/**
 * Dashboard Routes - User dashboard data
 */

import { Hono } from 'hono';
import type { ApiEnv } from '@nyuchi/workers-shared';
import { createServiceClient, getUbuntuLevel } from '@nyuchi/workers-shared';
import { authMiddleware } from '../middleware/auth';

const dashboard = new Hono<{ Bindings: ApiEnv }>();

// All dashboard routes require authentication
dashboard.use('*', authMiddleware);

/**
 * GET /api/dashboard - User dashboard overview
 */
dashboard.get('/', async (c) => {
  try {
    const user = c.get('user');
    const supabase = createServiceClient(c.env);

    // Fetch user data in parallel
    const [profile, listings, content, contributions] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('directory_listings').select('id, status', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('content_submissions').select('id, status', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('ubuntu_contributions').select('points_earned').eq('user_id', user.id),
    ]);

    const ubuntuScore = profile.data?.ubuntu_score || 0;
    const level = getUbuntuLevel(ubuntuScore);

    // Calculate stats
    const listingStats = {
      total: listings.count || 0,
      published: listings.data?.filter((l) => l.status === 'published').length || 0,
      pending: listings.data?.filter((l) => l.status === 'pending').length || 0,
    };

    const contentStats = {
      total: content.count || 0,
      published: content.data?.filter((c) => c.status === 'published').length || 0,
      pending: content.data?.filter((c) => c.status === 'submitted').length || 0,
    };

    const totalPoints = (contributions.data || []).reduce(
      (sum, c) => sum + (c.points_earned || 0),
      0
    );

    return c.json({
      data: {
        profile: profile.data,
        ubuntu: {
          score: ubuntuScore,
          level,
          totalPointsEarned: totalPoints,
        },
        listings: listingStats,
        content: contentStats,
      },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return c.json({ error: 'Failed to fetch dashboard' }, 500);
  }
});

/**
 * GET /api/dashboard/activity - User's recent activity
 */
dashboard.get('/activity', async (c) => {
  try {
    const user = c.get('user');
    const supabase = createServiceClient(c.env);

    const { data: activity, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return c.json({
      data: activity || [],
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return c.json({ error: 'Failed to fetch activity' }, 500);
  }
});

/**
 * GET /api/dashboard/notifications - User's notifications
 */
dashboard.get('/notifications', async (c) => {
  try {
    const user = c.get('user');
    const supabase = createServiceClient(c.env);

    // Check if notifications table exists, return empty if not
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Table might not exist yet
    if (error?.code === '42P01') {
      return c.json({ data: [], ubuntu: 'I am because we are' });
    }

    if (error) throw error;

    return c.json({
      data: notifications || [],
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ data: [], ubuntu: 'I am because we are' });
  }
});

export default dashboard;
