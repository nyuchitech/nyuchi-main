/**
 * Directory Routes - Refactored with Workflows and Queues
 */

import { Hono } from 'hono';
import type { ApiEnv } from '@nyuchi/workers-shared';
import { createServiceClient, isValidUUID, parsePagination, sanitizeSearchQuery } from '@nyuchi/workers-shared';
import { authMiddleware, optionalAuthMiddleware, requireModerator } from '../middleware/auth';
import { queueViewCountIncrement, queueActivityLog, queueEmailNotification } from '../lib/queue';
import { startListingReviewWorkflow, signalWorkflow } from '../lib/workflows';

const directory = new Hono<{ Bindings: ApiEnv }>();

/**
 * GET /api/directory - List published listings (public)
 */
directory.get('/', async (c) => {
  try {
    const supabase = createServiceClient(c.env);

    const category = c.req.query('category');
    const location = c.req.query('location');
    const verified = c.req.query('verified');
    const search = c.req.query('search');
    const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

    let query = supabase
      .from('directory_listings')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq('category', category);
    if (location) query = query.ilike('country', `%${sanitizeSearchQuery(location)}%`);
    if (verified === 'true') query = query.eq('is_verified', true);
    if (search) query = query.ilike('business_name', `%${sanitizeSearchQuery(search)}%`);

    const { data, error, count } = await query;

    if (error) throw error;

    return c.json({
      data: data || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return c.json({ error: 'Failed to fetch listings' }, 500);
  }
});

/**
 * GET /api/directory/:id - Get single listing (public)
 */
directory.get('/:id', optionalAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    if (!isValidUUID(id)) {
      return c.json({ error: 'Invalid listing ID' }, 400);
    }

    const supabase = createServiceClient(c.env);

    const { data: listing, error } = await supabase
      .from('directory_listings')
      .select('*, profiles(full_name, avatar_url)')
      .eq('id', id)
      .single();

    if (error || !listing) {
      return c.json({ error: 'Listing not found' }, 404);
    }

    // Queue view count increment (replaces fire-and-forget)
    await queueViewCountIncrement(c.env, 'directory_listings', id);

    return c.json({
      data: listing,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return c.json({ error: 'Failed to fetch listing' }, 500);
  }
});

/**
 * POST /api/directory - Create listing and start review workflow
 */
directory.post('/', authMiddleware, async (c) => {
  try {
    const supabase = createServiceClient(c.env);
    const user = c.get('user');
    const body = await c.req.json();

    // Validate required fields
    if (!body.business_name || !body.category) {
      return c.json({ error: 'business_name and category are required' }, 400);
    }

    // Create the listing
    const { data: listing, error } = await supabase
      .from('directory_listings')
      .insert({
        user_id: user.id,
        business_name: body.business_name,
        business_type: body.business_type || 'general',
        category: body.category,
        description: body.description,
        country: body.country || 'Zimbabwe',
        city: body.city,
        contact_info: {
          email: body.contact_email,
          phone: body.contact_phone,
          website: body.website_url,
        },
        media_urls: body.media_urls || [],
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Start the review workflow
    const { workflowId } = await startListingReviewWorkflow(c.env, {
      listingId: listing.id,
      userId: user.id,
      businessName: listing.business_name,
      category: listing.category,
    });

    // Log activity
    await queueActivityLog(
      c.env,
      user.id,
      'CREATE_LISTING',
      { listingId: listing.id, workflowId },
      c.req.header('CF-Connecting-IP'),
      c.req.header('User-Agent')
    );

    return c.json({
      message: 'Your listing has been submitted for review',
      ubuntu: 'Every voice matters',
      data: { ...listing, workflowId },
    }, 201);
  } catch (error) {
    console.error('Error creating listing:', error);
    return c.json({ error: 'Failed to create listing' }, 500);
  }
});

/**
 * PUT /api/directory/:id - Update own listing
 */
directory.put('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    if (!isValidUUID(id)) {
      return c.json({ error: 'Invalid listing ID' }, 400);
    }

    const supabase = createServiceClient(c.env);
    const user = c.get('user');
    const body = await c.req.json();

    // Check ownership
    const { data: existing } = await supabase
      .from('directory_listings')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return c.json({ error: 'Listing not found' }, 404);
    }

    if (existing.user_id !== user.id && user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Update allowed fields
    const allowedFields = [
      'business_name', 'business_type', 'category', 'description',
      'country', 'city', 'contact_info', 'media_urls'
    ];
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data: listing, error } = await supabase
      .from('directory_listings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await queueActivityLog(c.env, user.id, 'UPDATE_LISTING', { listingId: id });

    return c.json({
      message: 'Listing updated successfully',
      ubuntu: 'I am because we are',
      data: listing,
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    return c.json({ error: 'Failed to update listing' }, 500);
  }
});

/**
 * DELETE /api/directory/:id - Delete own listing
 */
directory.delete('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    if (!isValidUUID(id)) {
      return c.json({ error: 'Invalid listing ID' }, 400);
    }

    const supabase = createServiceClient(c.env);
    const user = c.get('user');

    // Check ownership
    const { data: existing } = await supabase
      .from('directory_listings')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return c.json({ error: 'Listing not found' }, 404);
    }

    if (existing.user_id !== user.id && user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { error } = await supabase
      .from('directory_listings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await queueActivityLog(c.env, user.id, 'DELETE_LISTING', { listingId: id });

    return c.json({
      message: 'Listing deleted successfully',
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return c.json({ error: 'Failed to delete listing' }, 500);
  }
});

/**
 * POST /api/directory/:id/approve - Approve via workflow signal
 */
directory.post('/:id/approve', authMiddleware, requireModerator, async (c) => {
  try {
    const id = c.req.param('id');
    if (!isValidUUID(id)) {
      return c.json({ error: 'Invalid listing ID' }, 400);
    }

    const user = c.get('user');
    const { workflowId } = await c.req.json();

    if (workflowId) {
      // Signal the workflow
      await signalWorkflow(c.env, workflowId, 'approval-decision', {
        approved: true,
        reviewerId: user.id,
      });
    } else {
      // Direct approval (fallback for listings without workflow)
      const supabase = createServiceClient(c.env);

      const { data: listing, error } = await supabase
        .from('directory_listings')
        .update({
          status: 'published',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, profiles(email)')
        .single();

      if (error) throw error;

      // Queue notification
      if (listing.profiles?.email) {
        await queueEmailNotification(c.env, listing.profiles.email, 'listing-approved', {
          businessName: listing.business_name,
          listingId: id,
        });
      }
    }

    await queueActivityLog(c.env, user.id, 'APPROVE_LISTING', { listingId: id });

    return c.json({
      message: 'Listing approved and published',
      ubuntu: 'Your contribution strengthens our community',
    });
  } catch (error) {
    console.error('Error approving listing:', error);
    return c.json({ error: 'Failed to approve listing' }, 500);
  }
});

/**
 * POST /api/directory/:id/reject - Reject via workflow signal
 */
directory.post('/:id/reject', authMiddleware, requireModerator, async (c) => {
  try {
    const id = c.req.param('id');
    if (!isValidUUID(id)) {
      return c.json({ error: 'Invalid listing ID' }, 400);
    }

    const user = c.get('user');
    const { workflowId, reason } = await c.req.json();

    if (workflowId) {
      // Signal the workflow
      await signalWorkflow(c.env, workflowId, 'approval-decision', {
        approved: false,
        reason,
        reviewerId: user.id,
      });
    } else {
      // Direct rejection (fallback)
      const supabase = createServiceClient(c.env);

      const { data: listing, error } = await supabase
        .from('directory_listings')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, profiles(email)')
        .single();

      if (error) throw error;

      // Queue rejection notification
      if (listing.profiles?.email) {
        await queueEmailNotification(c.env, listing.profiles.email, 'listing-rejected', {
          businessName: listing.business_name,
          reason,
        });
      }
    }

    await queueActivityLog(c.env, user.id, 'REJECT_LISTING', { listingId: id, reason });

    return c.json({
      message: 'Listing rejected',
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error rejecting listing:', error);
    return c.json({ error: 'Failed to reject listing' }, 500);
  }
});

export default directory;
