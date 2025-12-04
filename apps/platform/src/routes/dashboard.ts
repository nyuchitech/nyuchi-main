/**
 * 🇿🇼 Nyuchi Platform - Dashboard Routes
 * "I am because we are" - Dashboard statistics and data
 */

import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

const dashboard = new Hono<{ Bindings: Env }>();

/**
 * Helper to create Supabase client
 */
function getServiceClient(env: Env) {
  return createClient(env.SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY || '');
}

/**
 * GET /api/dashboard/stats
 * Dashboard statistics (authenticated)
 */
dashboard.get('/stats', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getServiceClient(c.env);

    // Verify token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Fetch user profile for ubuntu score
    const { data: profile } = await supabase
      .from('profiles')
      .select('ubuntu_score')
      .eq('id', user.id)
      .single();

    // Fetch counts in parallel
    const [
      directoryResult,
      contentResult,
      memberResult,
    ] = await Promise.all([
      supabase.from('directory_listings').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('content_submissions').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ]);

    // Fetch travel count separately (table may not exist)
    let travelCount = 0;
    try {
      const { count } = await supabase.from('travel_businesses').select('*', { count: 'exact', head: true }).eq('status', 'published');
      travelCount = count || 0;
    } catch {
      // Table may not exist
    }

    const stats = {
      directory_listings: directoryResult.count || 0,
      published_content: contentResult.count || 0,
      community_members: memberResult.count || 1,
      travel_businesses: travelCount,
      ubuntu_score: profile?.ubuntu_score || 0,
      monthly_growth: 0,
      total_ubuntu_points: profile?.ubuntu_score || 0,
    };

    return c.json({
      stats,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return c.json({
      stats: {
        directory_listings: 0,
        published_content: 0,
        community_members: 1,
        travel_businesses: 0,
        ubuntu_score: 0,
        monthly_growth: 0,
        total_ubuntu_points: 0,
      },
    });
  }
});

/**
 * GET /api/dashboard/my-listings
 * User's own listings
 */
dashboard.get('/my-listings', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getServiceClient(c.env);

    // Verify token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Fetch user's listings
    const { data: directoryListings } = await supabase
      .from('directory_listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch travel listings (table may not exist)
    let travelListings: unknown[] = [];
    try {
      const { data } = await supabase
        .from('travel_businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      travelListings = data || [];
    } catch {
      // Table may not exist
    }

    const { data: contentSubmissions } = await supabase
      .from('content_submissions')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    return c.json({
      directory: directoryListings || [],
      travel: travelListings,
      content: contentSubmissions || [],
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('My listings error:', error);
    return c.json({ directory: [], travel: [], content: [] });
  }
});

export default dashboard;
