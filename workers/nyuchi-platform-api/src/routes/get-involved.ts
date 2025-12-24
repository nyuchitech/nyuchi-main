/**
 * Get Involved Routes - Expert and business partner applications
 */

import { Hono } from 'hono';
import type { ApiEnv } from '@nyuchi/workers-shared';
import { createServiceClient, parsePagination } from '@nyuchi/workers-shared';
import { authMiddleware } from '../middleware/auth';
import { queueActivityLog } from '../lib/queue';
import { startExpertApplicationWorkflow } from '../lib/workflows';

const getInvolved = new Hono<{ Bindings: ApiEnv }>();

/**
 * GET /api/get-involved/experts - List approved experts
 */
getInvolved.get('/experts', async (c) => {
  try {
    const supabase = createServiceClient(c.env);
    const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));
    const expertise = c.req.query('expertise');

    let query = supabase
      .from('experts')
      .select('id, full_name, expertise_area, bio, avatar_url, is_featured', { count: 'exact' })
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (expertise) query = query.eq('expertise_area', expertise);

    const { data, error, count } = await query;

    if (error) throw error;

    return c.json({
      data: data || [],
      pagination: { limit, offset, total: count || 0 },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching experts:', error);
    return c.json({ error: 'Failed to fetch experts' }, 500);
  }
});

/**
 * POST /api/get-involved/experts/apply - Apply to be an expert
 */
getInvolved.post('/experts/apply', authMiddleware, async (c) => {
  try {
    const supabase = createServiceClient(c.env);
    const user = c.get('user');
    const body = await c.req.json();

    if (!body.expertise_area || !body.bio) {
      return c.json({ error: 'expertise_area and bio required' }, 400);
    }

    // Check for existing application
    const { data: existing } = await supabase
      .from('experts')
      .select('id, status')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return c.json({
        error: `You already have an application (status: ${existing.status})`,
      }, 400);
    }

    const { data: application, error } = await supabase
      .from('experts')
      .insert({
        user_id: user.id,
        full_name: body.full_name || user.email.split('@')[0],
        expertise_area: body.expertise_area,
        bio: body.bio,
        experience_years: body.experience_years,
        linkedin_url: body.linkedin_url,
        portfolio_url: body.portfolio_url,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Start expert application workflow
    const { workflowId } = await startExpertApplicationWorkflow(c.env, {
      applicationId: application.id,
      userId: user.id,
      expertiseArea: application.expertise_area,
      fullName: application.full_name,
    });

    await queueActivityLog(c.env, user.id, 'APPLY_EXPERT', {
      applicationId: application.id,
      workflowId,
    });

    return c.json({
      message: 'Expert application submitted',
      data: { ...application, workflowId },
      ubuntu: 'I am because we are',
    }, 201);
  } catch (error) {
    console.error('Error applying as expert:', error);
    return c.json({ error: 'Failed to submit application' }, 500);
  }
});

/**
 * GET /api/get-involved/businesses - List business partners
 */
getInvolved.get('/businesses', async (c) => {
  try {
    const supabase = createServiceClient(c.env);
    const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

    const { data, error, count } = await supabase
      .from('businesses')
      .select('id, business_name, industry, description, logo_url', { count: 'exact' })
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return c.json({
      data: data || [],
      pagination: { limit, offset, total: count || 0 },
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return c.json({ error: 'Failed to fetch businesses' }, 500);
  }
});

/**
 * POST /api/get-involved/businesses/apply - Apply as business partner
 */
getInvolved.post('/businesses/apply', authMiddleware, async (c) => {
  try {
    const supabase = createServiceClient(c.env);
    const user = c.get('user');
    const body = await c.req.json();

    if (!body.business_name || !body.industry) {
      return c.json({ error: 'business_name and industry required' }, 400);
    }

    const { data: application, error } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        business_name: body.business_name,
        industry: body.industry,
        description: body.description,
        website_url: body.website_url,
        contact_email: body.contact_email || user.email,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    await queueActivityLog(c.env, user.id, 'APPLY_BUSINESS', {
      applicationId: application.id,
    });

    return c.json({
      message: 'Business application submitted',
      data: application,
      ubuntu: 'I am because we are',
    }, 201);
  } catch (error) {
    console.error('Error applying as business:', error);
    return c.json({ error: 'Failed to submit application' }, 500);
  }
});

/**
 * GET /api/get-involved/expertise-areas - List expertise areas
 */
getInvolved.get('/expertise-areas', async (c) => {
  return c.json({
    data: [
      'technology',
      'finance',
      'marketing',
      'agriculture',
      'healthcare',
      'education',
      'manufacturing',
      'retail',
      'tourism',
      'creative',
    ],
    ubuntu: 'I am because we are',
  });
});

export default getInvolved;
