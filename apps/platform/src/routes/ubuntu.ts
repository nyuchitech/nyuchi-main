/**
 * 🇿🇼 Nyuchi Platform - Ubuntu Routes
 * "I am because we are" - Ubuntu scoring endpoints
 */

import { Hono } from 'hono';
import { authMiddleware } from '../lib/auth';
import {
  createSupabaseClient,
  getUserUbuntuContributions,
  getUbuntuLeaderboard,
  recordUbuntuContribution,
} from '../lib/database';
import { calculateUbuntuLevel, UBUNTU_POINTS, type ContributionType } from '../lib/ubuntu';
import { Env } from '../index';

const ubuntu = new Hono<{ Bindings: Env }>();

/**
 * GET /api/ubuntu/leaderboard
 * Get Ubuntu leaderboard (public)
 */
ubuntu.get('/leaderboard', async (c) => {
  try {
    const client = createSupabaseClient(c.env);
    const limit = parseInt(c.req.query('limit') || '100');

    const leaders = await getUbuntuLeaderboard(client, limit);

    return c.json({
      data: leaders.map((user, index) => ({
        rank: index + 1,
        user_id: user.id,
        display_name: user.full_name || 'Community Member',
        avatar_url: user.avatar_url || null,
        ubuntu_score: user.ubuntu_score,
        ubuntu_level: calculateUbuntuLevel(user.ubuntu_score),
        contribution_count: user.contribution_count,
      })),
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

/**
 * GET /api/ubuntu/my-score
 * Get current user's Ubuntu score (authenticated)
 */
ubuntu.get('/my-score', authMiddleware, async (c) => {
  try {
    const client = createSupabaseClient(c.env);
    const user = c.get('user');

    const contributions = await getUserUbuntuContributions(client, user.id);

    const totalPoints = contributions.reduce(
      (sum, contrib) => sum + contrib.ubuntu_points_earned,
      0
    );

    return c.json({
      user_id: user.id,
      ubuntu_score: totalPoints,
      ubuntu_level: calculateUbuntuLevel(totalPoints),
      contribution_count: contributions.length,
      recent_contributions: contributions.slice(0, 10),
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching score:', error);
    return c.json({ error: 'Failed to fetch score' }, 500);
  }
});

/**
 * GET /api/ubuntu/my-contributions
 * Get current user's contributions (authenticated)
 */
ubuntu.get('/my-contributions', authMiddleware, async (c) => {
  try {
    const client = createSupabaseClient(c.env);
    const user = c.get('user');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '25');

    const contributions = await getUserUbuntuContributions(client, user.id);

    // Simple pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = contributions.slice(start, end);

    return c.json({
      data: paginated,
      pagination: {
        page,
        limit,
        total: contributions.length,
        pages: Math.ceil(contributions.length / limit),
      },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return c.json({ error: 'Failed to fetch contributions' }, 500);
  }
});

/**
 * POST /api/ubuntu/record
 * Record Ubuntu contribution (internal use / admin)
 */
ubuntu.post('/record', authMiddleware, async (c) => {
  try {
    const client = createSupabaseClient(c.env);
    const user = c.get('user');

    // Only admins can record contributions manually
    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { userId, contributionType, points, details, metadata } = await c.req.json();

    if (!userId || !contributionType) {
      return c.json({ error: 'userId and contributionType required' }, 400);
    }

    const contribution = await recordUbuntuContribution(
      client,
      userId,
      contributionType as ContributionType,
      points || UBUNTU_POINTS[contributionType as ContributionType],
      details,
      metadata
    );

    if (!contribution) {
      return c.json({ error: 'Failed to record contribution' }, 500);
    }

    return c.json({
      message: 'Ubuntu contribution recorded',
      ubuntu: 'Your contribution strengthens our community',
      data: contribution,
    });
  } catch (error) {
    console.error('Error recording contribution:', error);
    return c.json({ error: 'Failed to record contribution' }, 500);
  }
});

/**
 * GET /api/ubuntu/points-guide
 * Get Ubuntu points guide (public)
 */
ubuntu.get('/points-guide', (c) => {
  return c.json({
    ubuntu: 'I am because we are',
    philosophy: 'Every contribution strengthens our community',
    points: UBUNTU_POINTS,
    levels: {
      Newcomer: '0-499 points',
      Contributor: '500-1999 points',
      'Community Leader': '2000-4999 points',
      'Ubuntu Champion': '5000+ points',
    },
    how_to_earn: {
      content_published: {
        points: UBUNTU_POINTS.content_published,
        description: 'Publish quality content that helps the community',
      },
      listing_created: {
        points: UBUNTU_POINTS.listing_created,
        description: 'Create a verified directory listing',
      },
      listing_verified: {
        points: UBUNTU_POINTS.listing_verified,
        description: 'Get your listing verified',
      },
      community_help: {
        points: UBUNTU_POINTS.community_help,
        description: 'Help other community members',
      },
      review_completed: {
        points: UBUNTU_POINTS.review_completed,
        description: 'Complete moderation reviews',
      },
      collaboration: {
        points: UBUNTU_POINTS.collaboration,
        description: 'Collaborate with other members',
      },
      knowledge_sharing: {
        points: UBUNTU_POINTS.knowledge_sharing,
        description: 'Share knowledge and expertise',
      },
    },
  });
});

export default ubuntu;
