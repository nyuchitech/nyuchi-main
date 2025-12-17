/**
 * Ubuntu Routes - Community points and contributions
 */

import { Hono } from 'hono';
import type { ApiEnv } from '@nyuchi/workers-shared';
import { createServiceClient, getUbuntuLevel, UBUNTU_LEVELS, parsePagination } from '@nyuchi/workers-shared';
import { authMiddleware } from '../middleware/auth';

const ubuntu = new Hono<{ Bindings: ApiEnv }>();

/**
 * GET /api/ubuntu/leaderboard - Public leaderboard
 */
ubuntu.get('/leaderboard', async (c) => {
  try {
    const supabase = createServiceClient(c.env);
    const { limit } = parsePagination(c.req.query('limit') || '25');

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
      levels: UBUNTU_LEVELS,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

/**
 * GET /api/ubuntu/my-score - Get current user's score
 */
ubuntu.get('/my-score', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const supabase = createServiceClient(c.env);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('ubuntu_score')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    const score = profile?.ubuntu_score || 0;
    const level = getUbuntuLevel(score);

    // Get user's rank
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('ubuntu_score', score);

    return c.json({
      data: {
        score,
        level,
        rank: (count || 0) + 1,
      },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching score:', error);
    return c.json({ error: 'Failed to fetch score' }, 500);
  }
});

/**
 * GET /api/ubuntu/my-contributions - Get user's contribution history
 */
ubuntu.get('/my-contributions', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const supabase = createServiceClient(c.env);
    const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

    const { data: contributions, error, count } = await supabase
      .from('ubuntu_contributions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return c.json({
      data: contributions || [],
      pagination: { limit, offset, total: count || 0 },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return c.json({ error: 'Failed to fetch contributions' }, 500);
  }
});

/**
 * GET /api/ubuntu/stats - Community statistics
 */
ubuntu.get('/stats', async (c) => {
  try {
    const supabase = createServiceClient(c.env);

    // Get total points distributed
    const { data: pointsData } = await supabase
      .from('ubuntu_contributions')
      .select('points_earned');

    const totalPoints = (pointsData || []).reduce((sum, c) => sum + (c.points_earned || 0), 0);

    // Get contributor counts by level
    const { data: profiles } = await supabase
      .from('profiles')
      .select('ubuntu_score')
      .gt('ubuntu_score', 0);

    const levelCounts = {
      newcomer: 0,
      contributor: 0,
      community_leader: 0,
      ubuntu_champion: 0,
    };

    (profiles || []).forEach((p) => {
      const { level } = getUbuntuLevel(p.ubuntu_score);
      levelCounts[level]++;
    });

    return c.json({
      data: {
        totalPoints,
        totalContributors: profiles?.length || 0,
        levelCounts,
      },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

export default ubuntu;
