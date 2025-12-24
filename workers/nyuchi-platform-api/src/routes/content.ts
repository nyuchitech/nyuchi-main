/**
 * Content Routes - Refactored with Workflows and Queues
 */

import { Hono } from 'hono';
import type { ApiEnv } from '@nyuchi/workers-shared';
import { createServiceClient, isValidUUID, parsePagination, sanitizeSearchQuery } from '@nyuchi/workers-shared';
import { authMiddleware, optionalAuthMiddleware, requireModerator, requireRole } from '../middleware/auth';
import { queueViewCountIncrement, queueActivityLog, queueEmailNotification } from '../lib/queue';
import { startContentReviewWorkflow, signalContentApproval } from '../lib/workflows';

const content = new Hono<{ Bindings: ApiEnv }>();

/**
 * GET /api/content - List published content (public)
 */
content.get('/', async (c) => {
  try {
    const supabase = createServiceClient(c.env);

    const type = c.req.query('type');
    const category = c.req.query('category');
    const search = c.req.query('search');
    const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

    let query = supabase
      .from('content_submissions')
      .select('id, title, slug, content_type, category, featured_image_url, created_at, profiles(full_name, avatar_url)', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('content_type', type);
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${sanitizeSearchQuery(search)}%`);

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
 * GET /api/content/:slug - Get single content by slug (public)
 */
content.get('/:slug', optionalAuthMiddleware, async (c) => {
  try {
    const slug = c.req.param('slug');
    const supabase = createServiceClient(c.env);

    // Try slug first, then ID
    let query = supabase
      .from('content_submissions')
      .select('*, profiles(full_name, avatar_url)')
      .eq('status', 'published');

    if (isValidUUID(slug)) {
      query = query.eq('id', slug);
    } else {
      query = query.eq('slug', slug);
    }

    const { data: submission, error } = await query.single();

    if (error || !submission) {
      return c.json({ error: 'Content not found' }, 404);
    }

    // Queue view count increment
    await queueViewCountIncrement(c.env, 'content_submissions', submission.id);

    return c.json({
      data: submission,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

/**
 * POST /api/content - Submit content and start review workflow
 */
content.post('/', authMiddleware, requireRole('contributor', 'moderator', 'admin'), async (c) => {
  try {
    const supabase = createServiceClient(c.env);
    const user = c.get('user');
    const body = await c.req.json();

    // Validate required fields
    if (!body.title || !body.content_type) {
      return c.json({ error: 'title and content_type are required' }, 400);
    }

    // Generate slug if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    // Create the content submission
    const { data: submission, error } = await supabase
      .from('content_submissions')
      .insert({
        user_id: user.id,
        title: body.title,
        slug,
        content_type: body.content_type,
        content: body.content || body.content_body,
        featured_image_url: body.featured_image_url,
        category: body.category,
        tags: body.tags || [],
        status: 'submitted',
      })
      .select()
      .single();

    if (error) throw error;

    // Start the review workflow
    const { workflowId } = await startContentReviewWorkflow(c.env, {
      contentId: submission.id,
      userId: user.id,
      contentType: submission.content_type,
      title: submission.title,
    });

    // Log activity
    await queueActivityLog(
      c.env,
      user.id,
      'SUBMIT_CONTENT',
      { contentId: submission.id, workflowId },
      c.req.header('CF-Connecting-IP'),
      c.req.header('User-Agent')
    );

    return c.json({
      message: 'Content submitted for review',
      ubuntu: 'Your contribution strengthens our community',
      data: { ...submission, workflowId },
    }, 201);
  } catch (error) {
    console.error('Error creating content:', error);
    return c.json({ error: 'Failed to create content' }, 500);
  }
});

/**
 * PUT /api/content/:id - Update own content
 */
content.put('/:id', authMiddleware, requireRole('contributor', 'moderator', 'admin'), async (c) => {
  try {
    const id = c.req.param('id');
    if (!isValidUUID(id)) {
      return c.json({ error: 'Invalid content ID' }, 400);
    }

    const supabase = createServiceClient(c.env);
    const user = c.get('user');
    const body = await c.req.json();

    // Check ownership
    const { data: existing } = await supabase
      .from('content_submissions')
      .select('user_id, status')
      .eq('id', id)
      .single();

    if (!existing) {
      return c.json({ error: 'Content not found' }, 404);
    }

    if (existing.user_id !== user.id && user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Update allowed fields
    const allowedFields = ['title', 'content', 'featured_image_url', 'category', 'tags'];
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // If content was rejected, allow resubmission
    if (existing.status === 'rejected' || existing.status === 'needs_changes') {
      updateData.status = 'submitted';
    }

    const { data: submission, error } = await supabase
      .from('content_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await queueActivityLog(c.env, user.id, 'UPDATE_CONTENT', { contentId: id });

    return c.json({
      message: 'Content updated successfully',
      ubuntu: 'I am because we are',
      data: submission,
    });
  } catch (error) {
    console.error('Error updating content:', error);
    return c.json({ error: 'Failed to update content' }, 500);
  }
});

/**
 * DELETE /api/content/:id - Delete own content
 */
content.delete('/:id', authMiddleware, requireRole('contributor', 'moderator', 'admin'), async (c) => {
  try {
    const id = c.req.param('id');
    if (!isValidUUID(id)) {
      return c.json({ error: 'Invalid content ID' }, 400);
    }

    const supabase = createServiceClient(c.env);
    const user = c.get('user');

    // Check ownership
    const { data: existing } = await supabase
      .from('content_submissions')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return c.json({ error: 'Content not found' }, 404);
    }

    if (existing.user_id !== user.id && user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { error } = await supabase
      .from('content_submissions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await queueActivityLog(c.env, user.id, 'DELETE_CONTENT', { contentId: id });

    return c.json({
      message: 'Content deleted successfully',
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    return c.json({ error: 'Failed to delete content' }, 500);
  }
});

/**
 * POST /api/content/:id/publish - Publish via workflow signal
 */
content.post('/:id/publish', authMiddleware, requireModerator, async (c) => {
  try {
    const id = c.req.param('id');
    if (!isValidUUID(id)) {
      return c.json({ error: 'Invalid content ID' }, 400);
    }

    const user = c.get('user');
    const { workflowId } = await c.req.json();

    if (workflowId) {
      // Signal the workflow
      await signalContentApproval(c.env, workflowId, true, undefined, user.id);
    } else {
      // Direct publish (fallback)
      const supabase = createServiceClient(c.env);

      const { data: submission, error } = await supabase
        .from('content_submissions')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, profiles(email)')
        .single();

      if (error) throw error;

      // Queue notification
      if (submission.profiles?.email) {
        await queueEmailNotification(c.env, submission.profiles.email, 'content-approved', {
          title: submission.title,
          contentId: id,
        });
      }
    }

    await queueActivityLog(c.env, user.id, 'APPROVE_CONTENT', { contentId: id });

    return c.json({
      message: 'Content published successfully',
      ubuntu: 'Your contribution strengthens our community',
    });
  } catch (error) {
    console.error('Error publishing content:', error);
    return c.json({ error: 'Failed to publish content' }, 500);
  }
});

/**
 * POST /api/content/:id/reject - Reject via workflow signal
 */
content.post('/:id/reject', authMiddleware, requireModerator, async (c) => {
  try {
    const id = c.req.param('id');
    if (!isValidUUID(id)) {
      return c.json({ error: 'Invalid content ID' }, 400);
    }

    const user = c.get('user');
    const { workflowId, feedback } = await c.req.json();

    if (workflowId) {
      // Signal the workflow
      await signalContentApproval(c.env, workflowId, false, feedback, user.id);
    } else {
      // Direct rejection (fallback)
      const supabase = createServiceClient(c.env);

      const { data: submission, error } = await supabase
        .from('content_submissions')
        .update({
          status: 'rejected',
          ai_analysis: { reviewer_feedback: feedback },
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, profiles(email)')
        .single();

      if (error) throw error;

      // Queue rejection notification
      if (submission.profiles?.email) {
        await queueEmailNotification(c.env, submission.profiles.email, 'content-rejected', {
          title: submission.title,
          feedback,
        });
      }
    }

    await queueActivityLog(c.env, user.id, 'REJECT_CONTENT', { contentId: id, feedback });

    return c.json({
      message: 'Content rejected',
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error rejecting content:', error);
    return c.json({ error: 'Failed to reject content' }, 500);
  }
});

export default content;
