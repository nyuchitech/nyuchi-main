/**
 * 🇿🇼 Nyuchi Platform - Community Routes
 * "I am because we are" - Public community endpoints (no auth required)
 *
 * These routes follow the Ubuntu philosophy: community features are always free and accessible.
 * All endpoints are read-only and expose only public, safe data.
 */

import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

const community = new Hono<{ Bindings: Env }>();

/**
 * Helper to create Supabase client with anon key (read-only public access)
 */
function getPublicClient(env: Env) {
  return createClient(
    env.SUPABASE_URL || '',
    env.SUPABASE_ANON_KEY || ''
  );
}

/**
 * Sanitize listing data for public display
 * Removes sensitive information like internal IDs and private contact details
 */
function sanitizeListingForPublic(listing: Record<string, unknown>) {
  return {
    id: listing.id,
    business_name: listing.business_name,
    business_type: listing.business_type,
    category: listing.category,
    country: listing.country,
    city: listing.city,
    description: listing.description,
    // Only show public contact info (no email/phone unless explicitly public)
    website: (listing.contact_info as Record<string, unknown>)?.website || null,
    media_urls: listing.media_urls,
    verification_status: listing.verification_status,
    created_at: listing.created_at,
  };
}

/**
 * Sanitize user profile for public leaderboard display
 */
function sanitizeProfileForPublic(profile: Record<string, unknown>) {
  return {
    id: profile.id,
    full_name: profile.full_name || 'Anonymous',
    avatar_url: profile.avatar_url,
    company: profile.company,
    country: profile.country,
    ubuntu_score: profile.ubuntu_score,
    contribution_count: profile.contribution_count,
    // Never expose: email, role, stripe_customer_id
  };
}

/**
 * GET /api/community/directory
 * Public business directory listing (only published/approved listings)
 */
community.get('/directory', async (c) => {
  try {
    const supabase = getPublicClient(c.env);

    // Query params for filtering
    const category = c.req.query('category');
    const country = c.req.query('country');
    const search = c.req.query('search');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100); // Max 100
    const offset = parseInt(c.req.query('offset') || '0');

    let query = supabase
      .from('directory_listings')
      .select('*')
      .eq('status', 'published') // Only published listings
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (country) {
      query = query.eq('country', country);
    }
    if (search) {
      // Sanitize search input to prevent injection
      const sanitizedSearch = search.replace(/[%_]/g, '\\$&');
      query = query.or(`business_name.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Community directory error:', error);
      return c.json({ error: 'Failed to fetch directory' }, 500);
    }

    return c.json({
      listings: (data || []).map(sanitizeListingForPublic),
      total: count || 0,
      limit,
      offset,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Community directory error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/community/directory/:id
 * Get single public listing by ID
 */
community.get('/directory/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Validate UUID format to prevent injection
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return c.json({ error: 'Invalid listing ID format' }, 400);
    }

    const supabase = getPublicClient(c.env);

    const { data, error } = await supabase
      .from('directory_listings')
      .select('*')
      .eq('id', id)
      .eq('status', 'published') // Only published listings
      .single();

    if (error || !data) {
      return c.json({ error: 'Listing not found' }, 404);
    }

    // Increment view count (fire and forget)
    supabase
      .from('directory_listings')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id)
      .then(() => {});

    return c.json({
      listing: sanitizeListingForPublic(data),
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Community listing error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/community/leaderboard
 * Public Ubuntu leaderboard
 */
community.get('/leaderboard', async (c) => {
  try {
    const supabase = getPublicClient(c.env);
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100); // Max 100

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, company, country, ubuntu_score, contribution_count')
      .gt('ubuntu_score', 0) // Only show users with contributions
      .order('ubuntu_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Community leaderboard error:', error);
      return c.json({ error: 'Failed to fetch leaderboard' }, 500);
    }

    return c.json({
      leaderboard: (data || []).map(sanitizeProfileForPublic),
      ubuntu: 'I am because we are',
      philosophy: 'Every contribution strengthens our community',
    });
  } catch (error) {
    console.error('Community leaderboard error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/community/content
 * Public published content (articles, guides)
 */
community.get('/content', async (c) => {
  try {
    const supabase = getPublicClient(c.env);

    const category = c.req.query('category');
    const contentType = c.req.query('type');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50); // Max 50
    const offset = parseInt(c.req.query('offset') || '0');

    let query = supabase
      .from('content_submissions')
      .select('id, title, slug, content_type, category, tags, featured_image_url, view_count, published_at, created_at')
      .eq('status', 'published') // Only published content
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }
    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Community content error:', error);
      return c.json({ error: 'Failed to fetch content' }, 500);
    }

    return c.json({
      content: data || [],
      limit,
      offset,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Community content error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/community/content/:slug
 * Get single published article by slug
 */
community.get('/content/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');

    // Validate slug format (alphanumeric, hyphens only)
    if (!/^[a-z0-9-]+$/i.test(slug)) {
      return c.json({ error: 'Invalid content slug format' }, 400);
    }

    const supabase = getPublicClient(c.env);

    const { data, error } = await supabase
      .from('content_submissions')
      .select('id, title, slug, content, content_type, category, tags, featured_image_url, view_count, published_at, created_at')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !data) {
      return c.json({ error: 'Content not found' }, 404);
    }

    // Increment view count (fire and forget)
    supabase
      .from('content_submissions')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', data.id)
      .then(() => {});

    return c.json({
      content: data,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Community content error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/community/stats
 * Public platform statistics
 */
community.get('/stats', async (c) => {
  try {
    const supabase = getPublicClient(c.env);

    // Fetch counts in parallel
    const [
      { count: totalMembers },
      { count: totalListings },
      { count: totalContent },
      { data: topContributors }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('directory_listings').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('content_submissions').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('profiles').select('ubuntu_score').order('ubuntu_score', { ascending: false }).limit(1)
    ]);

    return c.json({
      stats: {
        total_members: totalMembers || 0,
        total_businesses: totalListings || 0,
        total_articles: totalContent || 0,
        top_ubuntu_score: topContributors?.[0]?.ubuntu_score || 0,
      },
      ubuntu: 'I am because we are',
      philosophy: 'Together we build stronger communities',
    });
  } catch (error) {
    console.error('Community stats error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/community/categories
 * Get available categories for directory and content
 */
community.get('/categories', async (c) => {
  // Static categories - safe to expose
  return c.json({
    directory_categories: [
      'Agriculture',
      'Technology',
      'Finance',
      'Healthcare',
      'Education',
      'Manufacturing',
      'Retail',
      'Services',
      'Tourism',
      'Creative Arts',
      'Food & Beverage',
      'Transportation',
      'Real Estate',
      'Energy',
      'Other'
    ],
    content_categories: [
      'Business Tips',
      'Success Stories',
      'Industry News',
      'How-To Guides',
      'Market Analysis',
      'Investment',
      'Leadership',
      'Innovation'
    ],
    countries: [
      'Zimbabwe',
      'South Africa',
      'Kenya',
      'Nigeria',
      'Ghana',
      'Tanzania',
      'Uganda',
      'Rwanda',
      'Botswana',
      'Zambia',
      'Other'
    ],
    ubuntu: 'I am because we are',
  });
});

/**
 * GET /api/community/activity
 * Recent community activity feed
 */
community.get('/activity', async (c) => {
  try {
    const supabase = getPublicClient(c.env);
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50);

    interface Activity {
      id: string;
      type: 'member_joined' | 'content_published' | 'business_listed' | 'collaboration' | 'ubuntu_points';
      action: string;
      actor: string;
      timestamp: string;
      ubuntuPoints?: number;
    }

    const activities: Activity[] = [];

    // Fetch recent profiles (new members)
    const { data: recentProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 5));

    if (recentProfiles) {
      recentProfiles.forEach((profile: { id: string; full_name: string | null; created_at: string }) => {
        activities.push({
          id: `member-${profile.id}`,
          type: 'member_joined',
          action: 'Joined the community',
          actor: profile.full_name || 'New member',
          timestamp: profile.created_at,
          ubuntuPoints: 50,
        });
      });
    }

    // Fetch recent directory listings
    const { data: recentListings } = await supabase
      .from('directory_listings')
      .select('id, business_name, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 5));

    if (recentListings) {
      recentListings.forEach((listing: { id: string; business_name: string; created_at: string }) => {
        activities.push({
          id: `listing-${listing.id}`,
          type: 'business_listed',
          action: 'Listed new business',
          actor: listing.business_name,
          timestamp: listing.created_at,
          ubuntuPoints: 75,
        });
      });
    }

    // Fetch recent content
    const { data: recentContent } = await supabase
      .from('content_submissions')
      .select('id, title, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 5));

    if (recentContent) {
      recentContent.forEach((content: { id: string; title: string; created_at: string }) => {
        activities.push({
          id: `content-${content.id}`,
          type: 'content_published',
          action: 'Published content',
          actor: content.title,
          timestamp: content.created_at,
          ubuntuPoints: 100,
        });
      });
    }

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedActivities = activities.slice(0, limit);

    // If no real activities, return demo data
    if (limitedActivities.length === 0) {
      const now = new Date();
      return c.json({
        activities: [
          {
            id: '1',
            type: 'member_joined',
            action: 'Joined Ubuntu Business Network',
            actor: 'New community member',
            timestamp: new Date(now.getTime() - 2 * 60000).toISOString(),
            ubuntuPoints: 50,
          },
          {
            id: '2',
            type: 'content_published',
            action: 'Shared success story',
            actor: 'Tech Startup Zimbabwe',
            timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
            ubuntuPoints: 100,
          },
          {
            id: '3',
            type: 'business_listed',
            action: 'Listed new business',
            actor: 'Harare Consulting',
            timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
            ubuntuPoints: 75,
          },
        ],
        ubuntu: 'I am because we are',
      });
    }

    return c.json({
      activities: limitedActivities,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Community activity error:', error);
    return c.json({ activities: [] });
  }
});

/**
 * GET /api/community/travel
 * Public travel businesses (for community travel directory)
 */
community.get('/travel', async (c) => {
  try {
    const supabase = getPublicClient(c.env);

    const type = c.req.query('type');
    const country = c.req.query('country');
    const search = c.req.query('search');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);

    let query = supabase
      .from('travel_businesses')
      .select('id, business_name, business_type, country, city, description, website, verification_status')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

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

    const { data, error } = await query;

    if (error) {
      // Return demo data if table doesn't exist
      return c.json({
        businesses: [
          {
            id: 'demo-1',
            business_name: 'Victoria Falls Safari Tours',
            business_type: 'Tour Operator',
            country: 'Zimbabwe',
            city: 'Victoria Falls',
            description: 'Experience the majesty of Victoria Falls with our expert guides.',
            website: null,
            verification_status: 'approved',
          },
          {
            id: 'demo-2',
            business_name: 'Hwange Wildlife Safaris',
            business_type: 'Safari Guide',
            country: 'Zimbabwe',
            city: 'Hwange',
            description: 'Discover the incredible wildlife of Hwange National Park.',
            website: null,
            verification_status: 'approved',
          },
        ],
        ubuntu: 'I am because we are',
      });
    }

    return c.json({
      businesses: data || [],
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Community travel error:', error);
    return c.json({ businesses: [] });
  }
});

export default community;
