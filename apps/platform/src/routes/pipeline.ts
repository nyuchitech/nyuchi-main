/**
 * 🇿🇼 Nyuchi Platform - Pipeline Routes
 * "I am because we are" - Unified submission pipeline management
 *
 * Role-based access:
 * - Admin: Full access to all pipelines
 * - Reviewer: Access to expert and business applications
 * - Moderator: Access to content submissions
 */

import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

const pipeline = new Hono<{ Bindings: Env }>();

/**
 * Helper to create Supabase client
 */
function getServiceClient(env: Env) {
  return createClient(env.SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY || '');
}

/**
 * Pipeline type to capability mapping
 */
const PIPELINE_ACCESS: Record<string, string[]> = {
  content: ['moderator', 'admin'],
  expert_application: ['reviewer', 'admin'],
  business_application: ['reviewer', 'admin'],
  directory_listing: ['moderator', 'admin'],
  travel_business: ['reviewer', 'admin'],
};

/**
 * Check if user has access to pipeline type
 */
function hasAccess(userCapabilities: string[], pipelineType: string): boolean {
  const requiredCaps = PIPELINE_ACCESS[pipelineType] || ['admin'];
  return userCapabilities.some(cap => requiredCaps.includes(cap));
}

/**
 * GET /api/pipeline/submissions
 * Get submissions based on user's role and capabilities
 */
pipeline.get('/submissions', async (c) => {
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

    // Get user profile with capabilities
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, capabilities')
      .eq('id', user.id)
      .single();

    const userCaps = profile?.capabilities || [];
    const userRole = profile?.role || 'user';

    // Admin sees all
    if (userRole === 'admin' || userCaps.includes('admin')) {
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

    // Filter by accessible pipeline types
    const accessibleTypes = Object.entries(PIPELINE_ACCESS)
      .filter(([, caps]) => userCaps.some(cap => caps.includes(cap)))
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
 * GET /api/pipeline/submissions/:type
 * Get submissions for a specific pipeline type
 */
pipeline.get('/submissions/:type', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const pipelineType = c.req.param('type');
    const status = c.req.query('status');
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
    const offset = parseInt(c.req.query('offset') || '0');

    const supabase = getServiceClient(c.env);

    // Verify token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user profile with capabilities
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, capabilities')
      .eq('id', user.id)
      .single();

    const userCaps = profile?.capabilities || [];
    const userRole = profile?.role || 'user';

    // Check access
    if (userRole !== 'admin' && !hasAccess(userCaps, pipelineType)) {
      return c.json({ error: 'Access denied to this pipeline' }, 403);
    }

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
 * PATCH /api/pipeline/submissions/:id
 * Update submission status (assign, review, approve, reject)
 */
pipeline.patch('/submissions/:id', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const submissionId = c.req.param('id');

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submissionId)) {
      return c.json({ error: 'Invalid ID format' }, 400);
    }

    const supabase = getServiceClient(c.env);

    // Verify token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user profile with capabilities
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, capabilities')
      .eq('id', user.id)
      .single();

    const userCaps = profile?.capabilities || [];
    const userRole = profile?.role || 'user';

    // Get the submission
    const { data: submission, error: fetchError } = await supabase
      .from('unified_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return c.json({ error: 'Submission not found' }, 404);
    }

    // Check access
    if (userRole !== 'admin' && !hasAccess(userCaps, submission.submission_type)) {
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

    // If approved/rejected, update the source table too
    if (status === 'approved' || status === 'rejected' || status === 'published') {
      await updateSourceTable(supabase, submission.submission_type, submission.reference_id, status);
    }

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
 * Update the source table when submission status changes
 */
async function updateSourceTable(supabase: ReturnType<typeof createClient>, type: string, refId: string, status: string) {
  const tableMap: Record<string, { table: string; statusField: string; publishedValue: string }> = {
    content: { table: 'content_submissions', statusField: 'status', publishedValue: 'published' },
    expert_application: { table: 'experts', statusField: 'status', publishedValue: 'approved' },
    business_application: { table: 'businesses', statusField: 'status', publishedValue: 'approved' },
    directory_listing: { table: 'directory_listings', statusField: 'status', publishedValue: 'published' },
    travel_business: { table: 'travel_businesses', statusField: 'status', publishedValue: 'published' },
  };

  const mapping = tableMap[type];
  if (!mapping) return;

  let sourceStatus = status;
  if (status === 'published') {
    sourceStatus = mapping.publishedValue;
  }

  try {
    await supabase
      .from(mapping.table)
      .update({ [mapping.statusField]: sourceStatus, updated_at: new Date().toISOString() })
      .eq('id', refId);
  } catch (error) {
    console.error('Source table update error:', error);
  }
}

/**
 * GET /api/pipeline/stats
 * Get pipeline statistics for admin dashboard
 */
pipeline.get('/stats', async (c) => {
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

    // Get user profile with capabilities
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, capabilities')
      .eq('id', user.id)
      .single();

    const userCaps = profile?.capabilities || [];
    const userRole = profile?.role || 'user';

    // Must be at least moderator/reviewer
    if (userRole === 'user' && !userCaps.some(cap => ['moderator', 'reviewer', 'admin'].includes(cap))) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Get counts by status for accessible pipelines
    const accessibleTypes = userRole === 'admin' || userCaps.includes('admin')
      ? Object.keys(PIPELINE_ACCESS)
      : Object.entries(PIPELINE_ACCESS)
          .filter(([, caps]) => userCaps.some(cap => caps.includes(cap)))
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
 * GET /api/pipeline/my-submissions
 * Get current user's own submissions across all types
 */
pipeline.get('/my-submissions', async (c) => {
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
