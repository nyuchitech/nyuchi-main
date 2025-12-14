/**
 * Community Routes - Public community data
 */

import { Hono } from 'hono';
import type { ApiEnv } from '@nyuchi/workers-shared';
import { createServiceClient, getUbuntuLevel, parsePagination } from '@nyuchi/workers-shared';

const community = new Hono<{ Bindings: ApiEnv }>();

/**
 * GET /api/community/directory - Public directory listings
 */
community.get('/directory', async (c) => {
  try {
    const supabase = createServiceClient(c.env);
    const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));
    const category = c.req.query('category');
    const featured = c.req.query('featured');

    let query = supabase
      .from('directory_listings')
      .select('id, business_name, category, description, country, city, is_verified, media_urls', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq('category', category);
    if (featured === 'true') query = query.eq('is_featured', true);

    const { data, error, count } = await query;

    if (error) throw error;

    return c.json({
      data: data || [],
      pagination: { limit, offset, total: count || 0 },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching directory:', error);
    return c.json({ error: 'Failed to fetch directory' }, 500);
  }
});

/**
 * GET /api/community/content - Public content
 */
community.get('/content', async (c) => {
  try {
    const supabase = createServiceClient(c.env);
    const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));
    const type = c.req.query('type');

    let query = supabase
      .from('content_submissions')
      .select('id, title, slug, content_type, category, featured_image_url, created_at', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('content_type', type);

    const { data, error, count } = await query;

    if (error) throw error;

    return c.json({
      data: data || [],
      pagination: { limit, offset, total: count || 0 },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

/**
 * GET /api/community/leaderboard - Public Ubuntu leaderboard
 */
community.get('/leaderboard', async (c) => {
  try {
    const supabase = createServiceClient(c.env);
    const { limit } = parsePagination(c.req.query('limit') || '10');

    const { data: leaders, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, ubuntu_score')
      .gt('ubuntu_score', 0)
      .order('ubuntu_score', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const leaderboard = (leaders || []).map((leader, index) => ({
      rank: index + 1,
      ...leader,
      level: getUbuntuLevel(leader.ubuntu_score),
    }));

    return c.json({
      data: leaderboard,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

/**
 * GET /api/community/activity - Recent community activity
 */
community.get('/activity', async (c) => {
  try {
    const supabase = createServiceClient(c.env);
    const { limit } = parsePagination(c.req.query('limit') || '20');

    // Get recent contributions
    const { data: contributions, error } = await supabase
      .from('ubuntu_contributions')
      .select('id, contribution_type, points_earned, details, created_at, profiles(full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return c.json({
      data: contributions || [],
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return c.json({ error: 'Failed to fetch activity' }, 500);
  }
});

/**
 * GET /api/community/stats - Community statistics
 */
community.get('/stats', async (c) => {
  try {
    const supabase = createServiceClient(c.env);

    const [listings, content, contributors] = await Promise.all([
      supabase.from('directory_listings').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('content_submissions').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('ubuntu_score', 0),
    ]);

    return c.json({
      data: {
        totalListings: listings.count || 0,
        totalContent: content.count || 0,
        totalContributors: contributors.count || 0,
      },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

export default community;
