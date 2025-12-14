/**
 * Travel Routes - Travel directory
 */

import { Hono } from 'hono';
import type { ApiEnv } from '@nyuchi/workers-shared';
import { createServiceClient, isValidUUID, parsePagination } from '@nyuchi/workers-shared';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { queueViewCountIncrement, queueActivityLog } from '../lib/queue';

const travel = new Hono<{ Bindings: ApiEnv }>();

/**
 * GET /api/travel - List travel businesses
 */
travel.get('/', async (c) => {
  try {
    const supabase = createServiceClient(c.env);
    const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));
    const category = c.req.query('category');
    const country = c.req.query('country');

    let query = supabase
      .from('travel_businesses')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq('category', category);
    if (country) query = query.ilike('country', `%${country}%`);

    const { data, error, count } = await query;

    if (error) throw error;

    return c.json({
      data: data || [],
      pagination: { limit, offset, total: count || 0 },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching travel businesses:', error);
    return c.json({ error: 'Failed to fetch travel businesses' }, 500);
  }
});

/**
 * GET /api/travel/:id - Get single travel business
 */
travel.get('/:id', optionalAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    if (!isValidUUID(id)) {
      return c.json({ error: 'Invalid ID' }, 400);
    }

    const supabase = createServiceClient(c.env);

    const { data: business, error } = await supabase
      .from('travel_businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !business) {
      return c.json({ error: 'Travel business not found' }, 404);
    }

    // Queue view count increment
    await queueViewCountIncrement(c.env, 'travel_businesses', id);

    return c.json({
      data: business,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching travel business:', error);
    return c.json({ error: 'Failed to fetch travel business' }, 500);
  }
});

/**
 * POST /api/travel - Create travel business
 */
travel.post('/', authMiddleware, async (c) => {
  try {
    const supabase = createServiceClient(c.env);
    const user = c.get('user');
    const body = await c.req.json();

    if (!body.business_name || !body.category) {
      return c.json({ error: 'business_name and category required' }, 400);
    }

    const { data: business, error } = await supabase
      .from('travel_businesses')
      .insert({
        user_id: user.id,
        business_name: body.business_name,
        category: body.category,
        description: body.description,
        country: body.country || 'Zimbabwe',
        city: body.city,
        contact_info: body.contact_info,
        services: body.services || [],
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    await queueActivityLog(c.env, user.id, 'CREATE_TRAVEL_BUSINESS', { businessId: business.id });

    return c.json({
      message: 'Travel business submitted for review',
      data: business,
      ubuntu: 'I am because we are',
    }, 201);
  } catch (error) {
    console.error('Error creating travel business:', error);
    return c.json({ error: 'Failed to create travel business' }, 500);
  }
});

/**
 * GET /api/travel/categories - List categories
 */
travel.get('/meta/categories', async (c) => {
  return c.json({
    data: [
      'accommodation',
      'tours',
      'transport',
      'restaurants',
      'attractions',
      'activities',
      'guides',
      'rentals',
    ],
    ubuntu: 'I am because we are',
  });
});

export default travel;
