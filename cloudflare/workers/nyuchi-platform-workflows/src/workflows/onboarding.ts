/**
 * User Onboarding Workflow
 * Handles new user onboarding with milestones
 */

import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import type { WorkflowsEnv, OnboardingPayload, OnboardingStepEvent, QueueMessage } from '@nyuchi/workers-shared';
import { createServiceClient, UBUNTU_POINTS } from '@nyuchi/workers-shared';

export class OnboardingWorkflow extends WorkflowEntrypoint<WorkflowsEnv, OnboardingPayload> {
  async run(event: WorkflowEvent<OnboardingPayload>, step: WorkflowStep) {
    const { userId, email, fullName, userType } = event.payload;

    // Step 1: Send welcome email
    await step.do('send-welcome', async () => {
      await this.env.NOTIFICATIONS_QUEUE.send({
        type: 'welcome-email',
        payload: {
          to: email,
          type: 'welcome-email',
          data: { fullName, userType },
        },
        timestamp: new Date().toISOString(),
      } as QueueMessage);
    });

    // Step 2: Award first login points
    await step.do('award-first-login', async () => {
      await this.env.JOBS_QUEUE.send({
        type: 'award-ubuntu-points',
        payload: {
          userId,
          contributionType: 'first_login',
          points: UBUNTU_POINTS.first_login,
          details: 'Welcome to Nyuchi!',
        },
        timestamp: new Date().toISOString(),
      } as QueueMessage);
    });

    // Step 3: Wait for profile completion (up to 7 days)
    try {
      const profileCompleteEvent = await step.waitForEvent<OnboardingStepEvent>('profile_completed', {
        type: 'onboarding',
        timeout: '7 days',
      });

      if (profileCompleteEvent.payload.step === 'profile_completed') {
        await step.do('award-profile-points', async () => {
          await this.env.JOBS_QUEUE.send({
            type: 'award-ubuntu-points',
            payload: {
              userId,
              contributionType: 'profile_completed',
              points: UBUNTU_POINTS.profile_completed,
              details: 'Profile completed',
            },
            timestamp: new Date().toISOString(),
          } as QueueMessage);
        });
      }
    } catch {
      // Timeout - send reminder
      await step.do('send-profile-reminder', async () => {
        await this.env.NOTIFICATIONS_QUEUE.send({
          type: 'profile-reminder',
          payload: {
            to: email,
            type: 'profile-reminder',
            data: { fullName },
          },
          timestamp: new Date().toISOString(),
        } as QueueMessage);
      });
    }

    // Step 4: Wait for first contribution (up to 30 days)
    try {
      const firstContributionEvent = await step.waitForEvent<OnboardingStepEvent>('first_contribution', {
        type: 'onboarding',
        timeout: '30 days',
      });

      if (firstContributionEvent.payload.step === 'first_contribution') {
        await step.do('award-contribution-points', async () => {
          await this.env.JOBS_QUEUE.send({
            type: 'award-ubuntu-points',
            payload: {
              userId,
              contributionType: 'first_contribution',
              points: UBUNTU_POINTS.first_contribution,
              details: 'First community contribution',
            },
            timestamp: new Date().toISOString(),
          } as QueueMessage);
        });

        // Send congratulations
        await step.do('send-congrats', async () => {
          await this.env.NOTIFICATIONS_QUEUE.send({
            type: 'first-contribution-congrats',
            payload: {
              to: email,
              type: 'first-contribution-congrats',
              data: { fullName },
            },
            timestamp: new Date().toISOString(),
          } as QueueMessage);
        });
      }
    } catch {
      // Timeout - send engagement reminder
      await step.do('send-engagement-reminder', async () => {
        await this.env.NOTIFICATIONS_QUEUE.send({
          type: 'engagement-reminder',
          payload: {
            to: email,
            type: 'engagement-reminder',
            data: { fullName },
          },
          timestamp: new Date().toISOString(),
        } as QueueMessage);
      });
    }

    // Step 5: Mark onboarding complete
    await step.do('complete-onboarding', async () => {
      const supabase = createServiceClient(this.env);

      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    });

    return { status: 'completed', userId };
  }
}
