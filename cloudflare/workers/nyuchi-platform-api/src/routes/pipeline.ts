/**
 * Pipeline Routes - Unified submission pipeline management
 */

import { Hono } from 'hono';
import type { ApiEnv } from '@nyuchi/workers-shared';
import { createServiceClient, isValidUUID, parsePagination } from '@nyuchi/workers-shared';
import { authMiddleware, requireRole } from '../middleware/auth';

const pipeline = new Hono<{ Bindings: ApiEnv }>();

const PIPELINE_ACCESS: Record<string, string[]> = {
  content: ['moderator', 'admin'],
  expert_application: ['reviewer', 'admin'],
  business_application: ['reviewer', 'admin'],
  directory_listing: ['moderator', 'admin'],
  travel_business: ['reviewer', 'admin'],
};

function hasAccess(userCapabilities: string[], pipelineType: string): boolean {
  const requiredCaps = PIPELINE_ACCESS[pipelineType] || ['admin'];
  return userCapabilities.some((cap) => requiredCaps.includes(cap));
}

/**
 * GET /api/pipeline/submissions - Get all submissions for user's role
 */
pipeline.get('/submissions', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const supabase = createServiceClient(c.env);

    const isAdmin = user.role === 'admin' || user.capabilities.includes('admin');

    if (isAdmin) {
      const { data: submissions, error } = await supabase
        .from('unified_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return c.json({
        submissions: submissions || [],
        pipelines: Object.keys(PIPELINE_ACCESS),
        ubuntu: 'I am because we are',
      });
    }

    const accessibleTypes = Object.entries(PIPELINE_ACCESS)
      .filter(([, caps]) => user.capabilities.some((cap) => caps.includes(cap)))
      .map(([type]) => type);

    if (accessibleTypes.length === 0) {
      return c.json({ submissions: [], pipelines: [], ubuntu: 'I am because we are' });
    }

    const { data: submissions, error } = await supabase
      .from('unified_submissions')
      .select('*')
      .in('submission_type', accessibleTypes)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return c.json({
      submissions: submissions || [],
      pipelines: accessibleTypes,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Pipeline submissions error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/pipeline/submissions/:type - Get submissions by type
 */
pipeline.get('/submissions/:type', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const pipelineType = c.req.param('type');
    const status = c.req.query('status');
    const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

    const isAdmin = user.role === 'admin' || user.capabilities.includes('admin');

    if (!isAdmin && !hasAccess(user.capabilities, pipelineType)) {
      return c.json({ error: 'Access denied to this pipeline' }, 403);
    }

    const supabase = createServiceClient(c.env);

    let query = supabase
      .from('unified_submissions')
      .select('*', { count: 'exact' })
      .eq('submission_type', pipelineType)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: submissions, error, count } = await query;

    if (error) throw error;

    return c.json({
      submissions: submissions || [],
      total: count || 0,
      limit,
      offset,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Pipeline submissions by type error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * PATCH /api/pipeline/submissions/:id - Update submission status
 */
pipeline.patch('/submissions/:id', authMiddleware, async (c) => {
  try {
    const submissionId = c.req.param('id');
    if (!isValidUUID(submissionId)) {
      return c.json({ error: 'Invalid ID format' }, 400);
    }

    const user = c.get('user');
    const supabase = createServiceClient(c.env);

    const { data: submission, error: fetchError } = await supabase
      .from('unified_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return c.json({ error: 'Submission not found' }, 404);
    }

    const isAdmin = user.role === 'admin' || user.capabilities.includes('admin');
    if (!isAdmin && !hasAccess(user.capabilities, submission.submission_type)) {
      return c.json({ error: 'Access denied to this pipeline' }, 403);
    }

    const body = await c.req.json();
    const { status, reviewer_notes, assigned_to } = body;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
      if (status === 'in_review') {
        updateData.assigned_to = assigned_to || user.id;
      }
      if (status === 'approved' || status === 'rejected') {
        updateData.reviewed_at = new Date().toISOString();
      }
      if (status === 'published') {
        updateData.published_at = new Date().toISOString();
      }
    }

    if (reviewer_notes !== undefined) {
      updateData.reviewer_notes = reviewer_notes;
    }

    if (assigned_to !== undefined) {
      updateData.assigned_to = assigned_to;
    }

    const { data: updated, error: updateError } = await supabase
      .from('unified_submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select()
      .single();

    if (updateError) throw updateError;

    return c.json({
      success: true,
      submission: updated,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Pipeline update error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/pipeline/stats - Pipeline statistics
 */
pipeline.get('/stats', authMiddleware, requireRole('moderator', 'reviewer', 'admin'), async (c) => {
  try {
    const user = c.get('user');
    const supabase = createServiceClient(c.env);

    const isAdmin = user.role === 'admin' || user.capabilities.includes('admin');

    const accessibleTypes = isAdmin
      ? Object.keys(PIPELINE_ACCESS)
      : Object.entries(PIPELINE_ACCESS)
          .filter(([, caps]) => user.capabilities.some((cap) => caps.includes(cap)))
          .map(([type]) => type);

    const stats: Record<string, Record<string, number>> = {};

    for (const type of accessibleTypes) {
      const { data: counts } = await supabase
        .from('unified_submissions')
        .select('status')
        .eq('submission_type', type);

      stats[type] = {
        submitted: 0,
        in_review: 0,
        needs_changes: 0,
        approved: 0,
        rejected: 0,
        published: 0,
      };

      (counts || []).forEach((item: { status: string }) => {
        if (stats[type][item.status] !== undefined) {
          stats[type][item.status]++;
        }
      });
    }

    return c.json({
      stats,
      pipelines: accessibleTypes,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Pipeline stats error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/pipeline/my-submissions - User's own submissions
 */
pipeline.get('/my-submissions', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const supabase = createServiceClient(c.env);

    const { data: submissions, error } = await supabase
      .from('unified_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return c.json({
      submissions: submissions || [],
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('My submissions error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default pipeline;
