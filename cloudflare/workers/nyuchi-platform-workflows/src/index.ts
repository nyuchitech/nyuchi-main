/**
 * Nyuchi Platform Workflows Worker
 * Handles durable multi-step workflows using Cloudflare Workflows
 */

import { Hono } from 'hono';
import type { WorkflowsEnv, QueueMessage } from '@nyuchi/workers-shared';

// Re-export workflow classes for Cloudflare to bind
export { ContentReviewWorkflow } from './workflows/content-review';
export { ListingReviewWorkflow } from './workflows/listing-review';
export { VerificationWorkflow } from './workflows/verification';
export { ExpertApplicationWorkflow } from './workflows/expert-application';
export { OnboardingWorkflow } from './workflows/onboarding';

// Extend environment with workflow bindings
interface Env extends WorkflowsEnv {
  CONTENT_REVIEW: Workflow;
  LISTING_REVIEW: Workflow;
  VERIFICATION: Workflow;
  EXPERT_APPLICATION: Workflow;
  ONBOARDING: Workflow;
  JOBS_QUEUE: Queue<QueueMessage>;
  NOTIFICATIONS_QUEUE: Queue<QueueMessage>;
}

const app = new Hono<{ Bindings: Env }>();

/**
 * POST /trigger/:workflowName - Trigger a workflow
 */
app.post('/trigger/:workflowName', async (c) => {
  try {
    const workflowName = c.req.param('workflowName');
    const payload = await c.req.json();

    let workflow: Workflow;

    switch (workflowName) {
      case 'content-review':
        workflow = c.env.CONTENT_REVIEW;
        break;
      case 'listing-review':
        workflow = c.env.LISTING_REVIEW;
        break;
      case 'business-verification':
        workflow = c.env.VERIFICATION;
        break;
      case 'expert-application':
        workflow = c.env.EXPERT_APPLICATION;
        break;
      case 'user-onboarding':
        workflow = c.env.ONBOARDING;
        break;
      default:
        return c.json({ error: `Unknown workflow: ${workflowName}` }, 400);
    }

    const instance = await workflow.create({
      params: payload,
    });

    return c.json({
      workflowId: instance.id,
      status: 'started',
    });
  } catch (error) {
    console.error('Workflow trigger error:', error);
    return c.json({ error: 'Failed to trigger workflow' }, 500);
  }
});

/**
 * POST /signal/:workflowId/:eventName - Signal an event to a workflow
 */
app.post('/signal/:workflowId/:eventName', async (c) => {
  try {
    const workflowId = c.req.param('workflowId');
    const eventName = c.req.param('eventName');
    const payload = await c.req.json();

    // Try to find the workflow instance
    // Note: In production, you'd store workflow type with ID
    const workflows = [
      c.env.CONTENT_REVIEW,
      c.env.LISTING_REVIEW,
      c.env.VERIFICATION,
      c.env.EXPERT_APPLICATION,
      c.env.ONBOARDING,
    ];

    for (const workflow of workflows) {
      try {
        const instance = await workflow.get(workflowId);
        if (instance) {
          await instance.sendEvent(eventName, payload);
          return c.json({ success: true });
        }
      } catch {
        // Instance not found in this workflow, try next
      }
    }

    return c.json({ error: 'Workflow instance not found' }, 404);
  } catch (error) {
    console.error('Workflow signal error:', error);
    return c.json({ error: 'Failed to signal workflow' }, 500);
  }
});

/**
 * GET /status/:workflowId - Get workflow status
 */
app.get('/status/:workflowId', async (c) => {
  try {
    const workflowId = c.req.param('workflowId');

    const workflows = [
      c.env.CONTENT_REVIEW,
      c.env.LISTING_REVIEW,
      c.env.VERIFICATION,
      c.env.EXPERT_APPLICATION,
      c.env.ONBOARDING,
    ];

    for (const workflow of workflows) {
      try {
        const instance = await workflow.get(workflowId);
        if (instance) {
          const status = await instance.status();
          return c.json({
            id: workflowId,
            status: status.status,
            output: status.output,
            error: status.error,
          });
        }
      } catch {
        // Instance not found in this workflow, try next
      }
    }

    return c.json({ error: 'Workflow instance not found' }, 404);
  } catch (error) {
    console.error('Workflow status error:', error);
    return c.json({ error: 'Failed to get workflow status' }, 500);
  }
});

/**
 * POST /cancel/:workflowId - Cancel a workflow
 */
app.post('/cancel/:workflowId', async (c) => {
  try {
    const workflowId = c.req.param('workflowId');

    const workflows = [
      c.env.CONTENT_REVIEW,
      c.env.LISTING_REVIEW,
      c.env.VERIFICATION,
      c.env.EXPERT_APPLICATION,
      c.env.ONBOARDING,
    ];

    for (const workflow of workflows) {
      try {
        const instance = await workflow.get(workflowId);
        if (instance) {
          await instance.abort();
          return c.json({ success: true });
        }
      } catch {
        // Instance not found in this workflow, try next
      }
    }

    return c.json({ error: 'Workflow instance not found' }, 404);
  } catch (error) {
    console.error('Workflow cancel error:', error);
    return c.json({ error: 'Failed to cancel workflow' }, 500);
  }
});

/**
 * GET /active - List active workflows (admin)
 */
app.get('/active', async (c) => {
  // Note: Cloudflare Workflows doesn't have a built-in list API yet
  // This would need to be implemented with a separate tracking system
  return c.json({
    message: 'Active workflow listing requires custom tracking implementation',
    workflows: [],
  });
});

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'nyuchi-platform-workflows',
    timestamp: new Date().toISOString(),
  });
});

export default app;
