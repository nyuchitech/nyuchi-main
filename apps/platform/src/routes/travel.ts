/**
 * 🇿🇼 Nyuchi Platform - Travel Routes
 * "I am because we are" - Travel business directory endpoints
 */

import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

const travel = new Hono<{ Bindings: Env }>();

/**
 * Helper to create Supabase client
 */
function getClient(env: Env) {
  return createClient(env.SUPABASE_URL || '', env.SUPABASE_ANON_KEY || '');
}

function getServiceClient(env: Env) {
  return createClient(env.SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY || '');
}

/**
 * Sanitize travel business for public display
 */
function sanitizeTravelBusiness(business: Record<string, unknown>) {
  return {
    id: business.id,
    business_name: business.business_name,
    business_type: business.business_type,
    country: business.country,
    city: business.city,
    description: business.description,
    website: business.website,
    services: business.services,
    verification_status: business.verification_status,
    created_at: business.created_at,
  };
}

/**
 * GET /api/travel/businesses
 * List published travel businesses (public)
 */
travel.get('/businesses', async (c) => {
  try {
    const supabase = getClient(c.env);

    const type = c.req.query('type');
    const country = c.req.query('country');
    const search = c.req.query('search');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
    const offset = parseInt(c.req.query('offset') || '0');

    let query = supabase
      .from('travel_businesses')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('business_type', type);
    }
    if (country) {
      query = query.eq('country', country);
    }
    if (search) {
      const sanitizedSearch = search.replace(/[%_]/g, '\\$&');
      query = query.or(`business_name.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Travel businesses error:', error);
      // Return empty array if table doesn't exist
      return c.json({ businesses: [], total: 0 });
    }

    return c.json({
      businesses: (data || []).map(sanitizeTravelBusiness),
      total: count || 0,
      limit,
      offset,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Travel businesses error:', error);
    return c.json({ businesses: [] });
  }
});

/**
 * GET /api/travel/businesses/:id
 * Get single travel business
 */
travel.get('/businesses/:id', async (c) => {
  try {
    const id = c.req.param('id');

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return c.json({ error: 'Invalid ID format' }, 400);
    }

    const supabase = getClient(c.env);

    const { data, error } = await supabase
      .from('travel_businesses')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error || !data) {
      return c.json({ error: 'Business not found' }, 404);
    }

    return c.json({
      business: sanitizeTravelBusiness(data),
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Travel business error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /api/travel/businesses
 * Create travel business listing (authenticated)
 */
travel.post('/businesses', async (c) => {
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

    const body = await c.req.json();
    const {
      business_name,
      business_type,
      description,
      country,
      city,
      address,
      phone,
      email,
      website,
      services,
      specialties,
    } = body;

    if (!business_name || !business_type || !country) {
      return c.json({ error: 'Business name, type, and country are required' }, 400);
    }

    const { data, error } = await supabase
      .from('travel_businesses')
      .insert({
        owner_id: user.id,
        business_name,
        business_type,
        description,
        country,
        city,
        address,
        phone,
        email,
        website,
        services,
        specialties,
        status: 'pending',
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Travel business create error:', error);
      return c.json({ error: 'Failed to create listing' }, 500);
    }

    return c.json({
      success: true,
      message: 'Listing submitted for review. You will earn +75 Ubuntu Points upon approval.',
      business: data,
      ubuntu: 'I am because we are',
    }, 201);
  } catch (error) {
    console.error('Travel business create error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/travel/destinations
 * Featured destinations (public)
 */
travel.get('/destinations', async (c) => {
  // Static featured destinations
  return c.json({
    destinations: [
      {
        id: 'victoria-falls',
        name: 'Victoria Falls',
        country: 'Zimbabwe',
        description: 'One of the Seven Natural Wonders of the World, known locally as "Mosi-oa-Tunya" - The Smoke That Thunders.',
        highlights: ['Bungee jumping', 'White water rafting', 'Safari tours', 'Helicopter flights'],
      },
      {
        id: 'great-zimbabwe',
        name: 'Great Zimbabwe',
        country: 'Zimbabwe',
        description: 'Ancient stone city and UNESCO World Heritage Site.',
        highlights: ['Historical tours', 'Archaeological sites', 'Cultural experiences'],
      },
      {
        id: 'hwange',
        name: 'Hwange National Park',
        country: 'Zimbabwe',
        description: "Zimbabwe's largest game reserve with Africa's largest elephant population.",
        highlights: ['Big Five safaris', 'Night drives', 'Walking safaris'],
      },
      {
        id: 'cape-town',
        name: 'Cape Town',
        country: 'South Africa',
        description: 'Mother City at the foot of Table Mountain.',
        highlights: ['Table Mountain', 'Wine tours', 'Beaches'],
      },
      {
        id: 'masai-mara',
        name: 'Masai Mara',
        country: 'Kenya',
        description: "Africa's most famous wildlife reserve.",
        highlights: ['Great Migration', 'Big Five', 'Balloon safaris'],
      },
      {
        id: 'serengeti',
        name: 'Serengeti',
        country: 'Tanzania',
        description: 'World-famous for the great wildebeest migration.',
        highlights: ['Wildlife safaris', 'Hot air balloons', 'Luxury camps'],
      },
    ],
    ubuntu: 'I am because we are',
  });
});

/**
 * GET /api/travel/categories
 * Travel business categories
 */
travel.get('/categories', async (c) => {
  return c.json({
    business_types: [
      'Tour Operator',
      'Safari Guide',
      'Accommodation',
      'Restaurant',
      'Transport',
      'Activity Provider',
      'Travel Agency',
      'Cultural Experience',
    ],
    countries: [
      'Zimbabwe',
      'South Africa',
      'Kenya',
      'Tanzania',
      'Botswana',
      'Zambia',
      'Namibia',
      'Mozambique',
      'Ghana',
      'Nigeria',
    ],
    ubuntu: 'I am because we are',
  });
});

export default travel;
