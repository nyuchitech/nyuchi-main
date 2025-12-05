/**
 * 🇿🇼 Nyuchi Platform - Directory Routes
 * "I am because we are" - Community Directory endpoints
 */

import { Hono } from 'hono';
import { authMiddleware, requireRole, requireModerator } from '../lib/auth';
import {
  createSupabaseClient,
  getPublishedListings,
  getDirectoryListing,
  createDirectoryListing,
  updateDirectoryListing,
  deleteDirectoryListing,
  approveDirectoryListing,
  rejectDirectoryListing,
  recordUbuntuContribution,
} from '../lib/database';
import { UBUNTU_POINTS } from '../lib/ubuntu';
import { Env } from '../index';

const directory = new Hono<{ Bindings: Env }>();

/**
 * GET /api/directory
 * List published directory listings (public)
 */
directory.get('/', async (c) => {
  try {
    const client = createSupabaseClient(c.env);

    // Parse query params
    const category = c.req.query('category');
    const location = c.req.query('location');
    const verified = c.req.query('verified');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '25');

    const filters = {
      category,
      location,
      verified: verified === 'true' ? true : undefined,
      page,
      limit,
    };

    const { data, count } = await getPublishedListings(client, filters);

    return c.json({
      data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return c.json({ error: 'Failed to fetch listings' }, 500);
  }
});

/**
 * GET /api/directory/:id
 * Get single listing (public)
 */
directory.get('/:id', async (c) => {
  try {
    const client = createSupabaseClient(c.env);
    const id = c.req.param('id');

    const listing = await getDirectoryListing(client, id);

    if (!listing) {
      return c.json({ error: 'Listing not found' }, 404);
    }

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
 * POST /api/directory
 * Create directory listing (authenticated)
 */
directory.post('/', authMiddleware, async (c) => {
  try {
    const client = createSupabaseClient(c.env);
    const user = c.get('user');
    const body = await c.req.json();

    const listing = await createDirectoryListing(client, {
      user_id: user.id,
      business_name: body.business_name,
      business_type: body.business_type || 'general',
      category: body.category,
      description: body.description,
      country: body.country || body.location || 'Zimbabwe',
      city: body.city,
      contact_info: {
        email: body.contact_email,
        phone: body.contact_phone,
        website: body.website_url,
      },
      media_urls: body.logo_url ? [body.logo_url] : [],
    });

    if (!listing) {
      return c.json({ error: 'Failed to create listing' }, 500);
    }

    return c.json({
      message: 'Your listing has been submitted for review',
      ubuntu: 'Every voice matters',
      data: listing,
    }, 201);
  } catch (error) {
    console.error('Error creating listing:', error);
    return c.json({ error: 'Failed to create listing' }, 500);
  }
});

/**
 * PUT /api/directory/:id
 * Update own listing (authenticated)
 */
directory.put('/:id', authMiddleware, async (c) => {
  try {
    const client = createSupabaseClient(c.env);
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json();

    // Check ownership
    const existing = await getDirectoryListing(client, id);
    if (!existing) {
      return c.json({ error: 'Listing not found' }, 404);
    }

    if (existing.user_id !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const listing = await updateDirectoryListing(client, id, body);

    if (!listing) {
      return c.json({ error: 'Failed to update listing' }, 500);
    }

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
 * DELETE /api/directory/:id
 * Delete own listing (authenticated)
 */
directory.delete('/:id', authMiddleware, async (c) => {
  try {
    const client = createSupabaseClient(c.env);
    const user = c.get('user');
    const id = c.req.param('id');

    // Check ownership
    const existing = await getDirectoryListing(client, id);
    if (!existing) {
      return c.json({ error: 'Listing not found' }, 404);
    }

    if (existing.user_id !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const success = await deleteDirectoryListing(client, id);

    if (!success) {
      return c.json({ error: 'Failed to delete listing' }, 500);
    }

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
 * POST /api/directory/:id/approve
 * Approve listing (moderator/admin)
 */
directory.post('/:id/approve', authMiddleware, requireModerator, async (c) => {
  try {
    const client = createSupabaseClient(c.env);
    const user = c.get('user');
    const id = c.req.param('id');

    // Get listing first to get the user_id for point award
    const existingListing = await getDirectoryListing(client, id);
    if (!existingListing) {
      return c.json({ error: 'Listing not found' }, 404);
    }

    const listing = await approveDirectoryListing(client, id, user.id);

    if (!listing) {
      return c.json({ error: 'Failed to approve listing' }, 500);
    }

    // Award Ubuntu points to listing creator
    const points = UBUNTU_POINTS.listing_created;
    await recordUbuntuContribution(
      client,
      existingListing.user_id,
      'listing_created',
      points,
      `Directory listing "${listing.business_name}" approved`,
      { listing_id: id }
    );

    return c.json({
      message: 'Listing approved and published',
      ubuntu: 'Your contribution strengthens our community',
      ubuntu_points_awarded: points,
      data: listing,
    });
  } catch (error) {
    console.error('Error approving listing:', error);
    return c.json({ error: 'Failed to approve listing' }, 500);
  }
});

/**
 * POST /api/directory/:id/reject
 * Reject listing (moderator/admin)
 */
directory.post('/:id/reject', authMiddleware, requireModerator, async (c) => {
  try {
    const client = createSupabaseClient(c.env);
    const user = c.get('user');
    const id = c.req.param('id');
    const { reason } = await c.req.json();

    // Note: rejection reason not stored in current schema
    void reason; // Acknowledge but not store for now
    const listing = await rejectDirectoryListing(client, id, user.id);

    if (!listing) {
      return c.json({ error: 'Failed to reject listing' }, 500);
    }

    // TODO: Send rejection notification email with reason

    return c.json({
      message: 'Listing rejected',
      ubuntu: 'I am because we are',
      data: listing,
    });
  } catch (error) {
    console.error('Error rejecting listing:', error);
    return c.json({ error: 'Failed to reject listing' }, 500);
  }
});

export default directory;
