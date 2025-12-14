/**
 * Support Routes - Proxy to Help Scout worker
 */

import { Hono } from 'hono';
import type { ApiEnv } from '@nyuchi/workers-shared';

// Extend ApiEnv to include HELPSCOUT binding
interface SupportEnv extends ApiEnv {
  HELPSCOUT: Fetcher;
}

const support = new Hono<{ Bindings: SupportEnv }>();

/**
 * Proxy requests to Help Scout worker
 */
async function proxyToHelpScout(
  env: SupportEnv,
  request: Request,
  path: string
): Promise<Response> {
  const url = new URL(request.url);
  const newUrl = `http://helpscout${path}${url.search}`;

  return env.HELPSCOUT.fetch(
    new Request(newUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    })
  );
}

/**
 * GET /api/support/categories - List ticket categories
 */
support.get('/categories', async (c) => {
  return proxyToHelpScout(c.env, c.req.raw, '/categories');
});

/**
 * POST /api/support/ticket - Create support ticket
 */
support.post('/ticket', async (c) => {
  return proxyToHelpScout(c.env, c.req.raw, '/ticket');
});

/**
 * GET /api/support/tickets - Get user's tickets
 */
support.get('/tickets', async (c) => {
  return proxyToHelpScout(c.env, c.req.raw, '/tickets');
});

/**
 * GET /api/support/tickets/:id - Get ticket details
 */
support.get('/tickets/:id', async (c) => {
  const id = c.req.param('id');
  return proxyToHelpScout(c.env, c.req.raw, `/tickets/${id}`);
});

/**
 * POST /api/support/tickets/:id/reply - Reply to ticket
 */
support.post('/tickets/:id/reply', async (c) => {
  const id = c.req.param('id');
  return proxyToHelpScout(c.env, c.req.raw, `/tickets/${id}/reply`);
});

export default support;
