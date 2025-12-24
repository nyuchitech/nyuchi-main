/**
 * Workflow Routes - Internal API for workflow status and management
 */

import { Hono } from 'hono';
import type { ApiEnv } from '@nyuchi/workers-shared';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { getWorkflowStatus } from '../lib/workflows';

const workflows = new Hono<{ Bindings: ApiEnv }>();

/**
 * GET /api/workflows/:id/status - Get workflow status
 */
workflows.get('/:id/status', authMiddleware, async (c) => {
  try {
    const workflowId = c.req.param('id');
    const status = await getWorkflowStatus(c.env, workflowId);

    return c.json({
      data: status,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error getting workflow status:', error);
    return c.json({ error: 'Failed to get workflow status' }, 500);
  }
});

/**
 * GET /api/workflows/active - List active workflows (admin only)
 */
workflows.get('/active', authMiddleware, requireAdmin, async (c) => {
  try {
    const response = await c.env.WORKFLOWS.fetch(
      new Request('http://workflows/active', { method: 'GET' })
    );

    if (!response.ok) {
      throw new Error('Failed to fetch active workflows');
    }

    const data = await response.json();

    return c.json({
      data,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error listing workflows:', error);
    return c.json({ error: 'Failed to list workflows' }, 500);
  }
});

/**
 * POST /api/workflows/:id/cancel - Cancel a workflow (admin only)
 */
workflows.post('/:id/cancel', authMiddleware, requireAdmin, async (c) => {
  try {
    const workflowId = c.req.param('id');

    const response = await c.env.WORKFLOWS.fetch(
      new Request(`http://workflows/cancel/${workflowId}`, { method: 'POST' })
    );

    if (!response.ok) {
      throw new Error('Failed to cancel workflow');
    }

    return c.json({
      message: 'Workflow cancelled',
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error cancelling workflow:', error);
    return c.json({ error: 'Failed to cancel workflow' }, 500);
  }
});

export default workflows;
