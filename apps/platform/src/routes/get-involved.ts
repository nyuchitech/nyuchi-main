/**
 * 🇿🇼 Nyuchi Platform - Get Involved Routes
 * "I am because we are" - ZTI expert and business partner API
 */

import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

const getInvolved = new Hono<{ Bindings: Env }>();

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
 * Sanitize expert for public display
 */
function sanitizeExpert(expert: Record<string, unknown>) {
  return {
    id: expert.id,
    full_name: expert.full_name,
    location: expert.location,
    category: expert.category,
    years_experience: expert.years_experience,
    certifications: expert.certifications,
    languages: expert.languages,
    services: expert.services,
    bio: expert.bio,
    website: expert.website,
    profile_image: expert.profile_image,
    verified: expert.verified,
    featured: expert.featured,
  };
}

/**
 * Sanitize business for public display
 */
function sanitizeBusiness(business: Record<string, unknown>) {
  return {
    id: business.id,
    business_name: business.business_name,
    category: business.category,
    subcategory: business.subcategory,
    location: business.location,
    description: business.description,
    website: business.website,
    listing_type: business.listing_type,
    verified: business.verified,
    featured: business.featured,
    logo_url: business.logo_url,
    images: business.images,
    amenities: business.amenities,
    price_range: business.price_range,
    rating: business.rating,
  };
}

// ============================================
// EXPERTS ENDPOINTS
// ============================================

/**
 * GET /api/get-involved/experts
 * List approved experts (public)
 */
getInvolved.get('/experts', async (c) => {
  try {
    const supabase = getClient(c.env);

    const category = c.req.query('category');
    const location = c.req.query('location');
    const verified = c.req.query('verified');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
    const offset = parseInt(c.req.query('offset') || '0');

    let query = supabase
      .from('experts')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }
    if (location) {
      const sanitizedLocation = location.replace(/[%_]/g, '\\$&');
      query = query.ilike('location', `%${sanitizedLocation}%`);
    }
    if (verified === 'true') {
      query = query.eq('verified', true);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Experts fetch error:', error);
      return c.json({ experts: [], total: 0 });
    }

    return c.json({
      experts: (data || []).map(sanitizeExpert),
      total: count || 0,
      limit,
      offset,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Experts error:', error);
    return c.json({ experts: [], total: 0 });
  }
});

/**
 * GET /api/get-involved/experts/:id
 * Get single expert (public)
 */
getInvolved.get('/experts/:id', async (c) => {
  try {
    const id = c.req.param('id');

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return c.json({ error: 'Invalid ID format' }, 400);
    }

    const supabase = getClient(c.env);

    const { data, error } = await supabase
      .from('experts')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (error || !data) {
      return c.json({ error: 'Expert not found' }, 404);
    }

    return c.json({
      expert: sanitizeExpert(data),
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Expert fetch error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /api/get-involved/experts
 * Submit expert application (public - no auth required)
 */
getInvolved.post('/experts', async (c) => {
  try {
    const supabase = getServiceClient(c.env);

    const body = await c.req.json();
    const {
      full_name,
      email,
      phone,
      location,
      category,
      years_experience,
      certifications,
      languages,
      services,
      bio,
      motivation,
      website,
    } = body;

    // Validate required fields
    if (!full_name || !email || !phone || !location || !category || !years_experience || !certifications || !languages || !services) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    // Validate category
    const validCategories = ['safari_guide', 'cultural_specialist', 'adventure_guide', 'urban_guide', 'photography_guide', 'bird_guide'];
    if (!validCategories.includes(category)) {
      return c.json({ error: 'Invalid expert category' }, 400);
    }

    const { data, error } = await supabase
      .from('experts')
      .insert({
        full_name,
        email,
        phone,
        location,
        category,
        years_experience,
        certifications,
        languages,
        services,
        bio,
        motivation,
        website,
        status: 'pending',
        verified: false,
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Expert application error:', error);
      return c.json({ error: 'Failed to submit application' }, 500);
    }

    return c.json({
      success: true,
      message: 'Application submitted successfully! We will review and contact you within 5-7 business days.',
      application_id: data.id,
      ubuntu: 'I am because we are',
    }, 201);
  } catch (error) {
    console.error('Expert application error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/get-involved/expert-categories
 * Get expert categories
 */
getInvolved.get('/expert-categories', async (c) => {
  return c.json({
    categories: [
      { id: 'safari_guide', name: 'Safari Guide', description: 'ZPGA certified wildlife guides' },
      { id: 'cultural_specialist', name: 'Cultural Specialist', description: 'Traditional culture and heritage experts' },
      { id: 'adventure_guide', name: 'Adventure Guide', description: 'Outdoor and adventure activity specialists' },
      { id: 'urban_guide', name: 'Urban & Food Guide', description: 'City tours and culinary experiences' },
      { id: 'photography_guide', name: 'Photography Guide', description: 'Wildlife and landscape photography experts' },
      { id: 'bird_guide', name: 'Bird Guide', description: 'Ornithology and birdwatching specialists' },
    ],
    ubuntu: 'I am because we are',
  });
});

// ============================================
// BUSINESS PARTNERS ENDPOINTS
// ============================================

/**
 * GET /api/get-involved/businesses
 * List approved businesses (public)
 */
getInvolved.get('/businesses', async (c) => {
  try {
    const supabase = getClient(c.env);

    const category = c.req.query('category');
    const location = c.req.query('location');
    const listing_type = c.req.query('listing_type');
    const verified = c.req.query('verified');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
    const offset = parseInt(c.req.query('offset') || '0');

    let query = supabase
      .from('businesses')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .order('featured', { ascending: false })
      .order('listing_type', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }
    if (location) {
      const sanitizedLocation = location.replace(/[%_]/g, '\\$&');
      query = query.ilike('location', `%${sanitizedLocation}%`);
    }
    if (listing_type) {
      query = query.eq('listing_type', listing_type);
    }
    if (verified === 'true') {
      query = query.eq('verified', true);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Businesses fetch error:', error);
      return c.json({ businesses: [], total: 0 });
    }

    return c.json({
      businesses: (data || []).map(sanitizeBusiness),
      total: count || 0,
      limit,
      offset,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Businesses error:', error);
    return c.json({ businesses: [], total: 0 });
  }
});

/**
 * GET /api/get-involved/businesses/:id
 * Get single business (public)
 */
getInvolved.get('/businesses/:id', async (c) => {
  try {
    const id = c.req.param('id');

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return c.json({ error: 'Invalid ID format' }, 400);
    }

    const supabase = getClient(c.env);

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (error || !data) {
      return c.json({ error: 'Business not found' }, 404);
    }

    return c.json({
      business: sanitizeBusiness(data),
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Business fetch error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /api/get-involved/businesses
 * Submit business partner application (public - no auth required)
 */
getInvolved.post('/businesses', async (c) => {
  try {
    const supabase = getServiceClient(c.env);

    const body = await c.req.json();
    const {
      business_name,
      contact_person,
      email,
      phone,
      website,
      category,
      subcategory,
      location,
      description,
      target_travelers,
      listing_type,
      promotion_interest,
      amenities,
      price_range,
    } = body;

    // Validate required fields
    if (!business_name || !contact_person || !email || !phone || !category || !location || !description) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    // Validate category
    const validCategories = ['accommodation', 'activities', 'dining', 'transport', 'shopping', 'services', 'attractions', 'wellness'];
    if (!validCategories.includes(category)) {
      return c.json({ error: 'Invalid business category' }, 400);
    }

    // Validate listing_type if provided
    const validListingTypes = ['free', 'verified', 'premium'];
    const finalListingType = listing_type && validListingTypes.includes(listing_type) ? listing_type : 'free';

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        business_name,
        contact_person,
        email,
        phone,
        website,
        category,
        subcategory,
        location,
        description,
        target_travelers,
        listing_type: finalListingType,
        promotion_interest: promotion_interest || false,
        amenities: amenities || [],
        price_range,
        status: 'pending',
        verified: false,
        featured: false,
        images: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Business application error:', error);
      return c.json({ error: 'Failed to submit application' }, 500);
    }

    return c.json({
      success: true,
      message: 'Business listing submitted successfully! We will review and publish your listing soon.',
      application_id: data.id,
      ubuntu: 'I am because we are',
    }, 201);
  } catch (error) {
    console.error('Business application error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/get-involved/business-categories
 * Get business categories
 */
getInvolved.get('/business-categories', async (c) => {
  return c.json({
    categories: [
      { id: 'accommodation', name: 'Accommodation', description: 'Hotels, lodges, guesthouses, campsites' },
      { id: 'activities', name: 'Activities', description: 'Tours, safaris, adventures, experiences' },
      { id: 'dining', name: 'Dining', description: 'Restaurants, cafes, food experiences' },
      { id: 'transport', name: 'Transport', description: 'Car hire, transfers, shuttles' },
      { id: 'shopping', name: 'Shopping', description: 'Souvenirs, crafts, markets' },
      { id: 'services', name: 'Services', description: 'Travel agents, guides, planning' },
      { id: 'attractions', name: 'Attractions', description: 'Museums, cultural sites, landmarks' },
      { id: 'wellness', name: 'Wellness', description: 'Spas, retreats, wellness centers' },
    ],
    listing_types: [
      { id: 'free', name: 'Free Listing', price: 0, features: ['Business name & contact', 'Map location', 'Basic description', 'Category listing'] },
      { id: 'verified', name: 'Verified Listing', price: 0, features: ['Everything in Free', 'Verification badge', 'Priority in search', 'Enhanced credibility'] },
      { id: 'premium', name: 'Business Promotion', price: 100, features: ['Everything in Verified', 'Custom social content', 'Destination guide placement', 'Professional imagery'] },
    ],
    ubuntu: 'I am because we are',
  });
});

/**
 * GET /api/get-involved/opportunities
 * Get all involvement opportunities
 */
getInvolved.get('/opportunities', async (c) => {
  return c.json({
    opportunities: [
      {
        id: 'business-partner',
        title: 'Business Partner Network',
        description: 'List your tourism business and connect with travelers seeking authentic Zimbabwe experiences.',
        benefits: ['Free perpetual listing', 'Targeted audience reach', 'Quality traffic', 'Platform authority'],
        cta: 'List Your Business',
        href: '/get-involved/business-partner',
      },
      {
        id: 'local-expert',
        title: 'Local Expert Program',
        description: 'Join our verified expert network as a safari guide, cultural specialist, or adventure expert.',
        benefits: ['Professional profile', 'Traveler connections', 'Verification badge', 'Community support'],
        cta: 'Apply as Expert',
        href: '/get-involved/local-expert',
      },
      {
        id: 'student-contributor',
        title: 'Student Contributors',
        description: 'University students can contribute travel content and build their portfolio with published work.',
        benefits: ['Published portfolio', 'Mentorship', 'Industry connections', 'Potential paid work'],
        cta: 'Apply Now',
        href: '/get-involved/student-program',
      },
      {
        id: 'travel-community',
        title: 'Travel Enthusiast Community',
        description: 'Connect with fellow travelers, share experiences, and discover hidden gems.',
        benefits: ['Trip planning support', 'Local insights', 'Community events', 'Exclusive content'],
        cta: 'Join Community',
        href: '/get-involved/community',
      },
      {
        id: 'volunteer',
        title: 'Volunteer Opportunities',
        description: 'Contribute your skills to sustainable tourism and community development initiatives.',
        benefits: ['Make an impact', 'Gain experience', 'Meet locals', 'Support conservation'],
        cta: 'Explore Roles',
        href: '/get-involved/volunteer',
      },
    ],
    ubuntu: 'I am because we are',
  });
});

export default getInvolved;
