/**
 * Workflow client helpers for triggering durable workflows
 */

import type { ApiEnv } from '@nyuchi/workers-shared';
import type {
  ContentReviewPayload,
  ListingReviewPayload,
  VerificationPayload,
  ExpertApplicationPayload,
  OnboardingPayload,
} from '@nyuchi/workers-shared';

/**
 * Trigger a workflow via the workflows worker
 */
async function triggerWorkflow<T>(
  env: ApiEnv,
  workflowName: string,
  payload: T
): Promise<{ workflowId: string }> {
  const response = await env.WORKFLOWS.fetch(
    new Request(`http://workflows/trigger/${workflowName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to trigger workflow: ${error}`);
  }

  return response.json();
}

/**
 * Signal an event to a running workflow
 */
async function signalWorkflow<T>(
  env: ApiEnv,
  workflowId: string,
  eventName: string,
  payload: T
): Promise<void> {
  const response = await env.WORKFLOWS.fetch(
    new Request(`http://workflows/signal/${workflowId}/${eventName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to signal workflow: ${error}`);
  }
}

/**
 * Get workflow status
 */
async function getWorkflowStatus(
  env: ApiEnv,
  workflowId: string
): Promise<{ status: string; payload?: unknown }> {
  const response = await env.WORKFLOWS.fetch(
    new Request(`http://workflows/status/${workflowId}`, {
      method: 'GET',
    })
  );

  if (!response.ok) {
    throw new Error('Failed to get workflow status');
  }

  return response.json();
}

// Specific workflow triggers

/**
 * Start content review workflow
 */
export async function startContentReviewWorkflow(
  env: ApiEnv,
  payload: ContentReviewPayload
): Promise<{ workflowId: string }> {
  return triggerWorkflow(env, 'content-review', payload);
}

/**
 * Signal content approval decision
 */
export async function signalContentApproval(
  env: ApiEnv,
  workflowId: string,
  approved: boolean,
  feedback: string | undefined,
  reviewerId: string
): Promise<void> {
  return signalWorkflow(env, workflowId, 'approval-decision', {
    approved,
    feedback,
    reviewerId,
  });
}

/**
 * Start directory listing review workflow
 */
export async function startListingReviewWorkflow(
  env: ApiEnv,
  payload: ListingReviewPayload
): Promise<{ workflowId: string }> {
  return triggerWorkflow(env, 'listing-review', payload);
}

/**
 * Start business verification workflow
 */
export async function startVerificationWorkflow(
  env: ApiEnv,
  payload: VerificationPayload
): Promise<{ workflowId: string }> {
  return triggerWorkflow(env, 'business-verification', payload);
}

/**
 * Signal payment completed for verification
 */
export async function signalVerificationPayment(
  env: ApiEnv,
  workflowId: string,
  paymentIntentId: string,
  amount: number,
  currency: string
): Promise<void> {
  return signalWorkflow(env, workflowId, 'payment-completed', {
    paymentIntentId,
    amount,
    currency,
  });
}

/**
 * Start expert application workflow
 */
export async function startExpertApplicationWorkflow(
  env: ApiEnv,
  payload: ExpertApplicationPayload
): Promise<{ workflowId: string }> {
  return triggerWorkflow(env, 'expert-application', payload);
}

/**
 * Start user onboarding workflow
 */
export async function startOnboardingWorkflow(
  env: ApiEnv,
  payload: OnboardingPayload
): Promise<{ workflowId: string }> {
  return triggerWorkflow(env, 'user-onboarding', payload);
}

export { getWorkflowStatus, signalWorkflow };
