/**
 * Expert Application Workflow
 * Handles expert application review process
 */

import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import type { WorkflowsEnv, ExpertApplicationPayload, ExpertApprovalEvent, QueueMessage } from '@nyuchi/workers-shared';
import { createServiceClient } from '@nyuchi/workers-shared';

export class ExpertApplicationWorkflow extends WorkflowEntrypoint<WorkflowsEnv, ExpertApplicationPayload> {
  async run(event: WorkflowEvent<ExpertApplicationPayload>, step: WorkflowStep) {
    const { applicationId, userId, expertiseArea, fullName } = event.payload;

    // Step 1: Initialize and notify reviewers
    await step.do('initialize', async () => {
      const supabase = createServiceClient(this.env);

      await supabase.from('unified_submissions').upsert(
        {
          reference_id: applicationId,
          submission_type: 'expert_application',
          user_id: userId,
          title: `Expert: ${fullName} - ${expertiseArea}`,
          status: 'submitted',
          metadata: { expertiseArea },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'reference_id,submission_type' }
      );
    });

    // Step 2: Notify reviewers
    await step.do('notify-reviewers', async () => {
      await this.env.NOTIFICATIONS_QUEUE.send({
        type: 'expert-application-submitted',
        payload: {
          applicationId,
          fullName,
          expertiseArea,
          userId,
        },
        timestamp: new Date().toISOString(),
      } as QueueMessage);
    });

    // Step 3: Wait for approval (up to 14 days)
    const approvalEvent = await step.waitForEvent<ExpertApprovalEvent>('approval-decision', {
      type: 'approval',
      timeout: '14 days',
    });
    const approval = approvalEvent.payload;

    // Step 4: Process decision
    if (approval.approved) {
      await step.do('approve-expert', async () => {
        const supabase = createServiceClient(this.env);

        await supabase
          .from('experts')
          .update({
            status: 'approved',
            reviewed_by: approval.reviewerId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', applicationId);

        // Add expert capability to user
        const { data: profile } = await supabase
          .from('profiles')
          .select('capabilities')
          .eq('id', userId)
          .single();

        const capabilities = profile?.capabilities || [];
        if (!capabilities.includes('expert')) {
          await supabase
            .from('profiles')
            .update({
              capabilities: [...capabilities, 'expert'],
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }

        await supabase
          .from('unified_submissions')
          .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('reference_id', applicationId)
          .eq('submission_type', 'expert_application');
      });

      // Notify user
      await step.do('notify-approval', async () => {
        const supabase = createServiceClient(this.env);
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();

        if (profile?.email) {
          await this.env.NOTIFICATIONS_QUEUE.send({
            type: 'expert-approved',
            payload: {
              to: profile.email,
              type: 'expert-approved',
              data: { fullName, expertiseArea },
            },
            timestamp: new Date().toISOString(),
          } as QueueMessage);
        }
      });

      return { status: 'approved', applicationId };
    } else {
      await step.do('reject-expert', async () => {
        const supabase = createServiceClient(this.env);

        await supabase
          .from('experts')
          .update({
            status: 'rejected',
            updated_at: new Date().toISOString(),
          })
          .eq('id', applicationId);

        await supabase
          .from('unified_submissions')
          .update({
            status: 'rejected',
            reviewer_notes: approval.feedback,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('reference_id', applicationId)
          .eq('submission_type', 'expert_application');
      });

      await step.do('notify-rejection', async () => {
        const supabase = createServiceClient(this.env);
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();

        if (profile?.email) {
          await this.env.NOTIFICATIONS_QUEUE.send({
            type: 'expert-rejected',
            payload: {
              to: profile.email,
              type: 'expert-rejected',
              data: { fullName, feedback: approval.feedback },
            },
            timestamp: new Date().toISOString(),
          } as QueueMessage);
        }
      });

      return { status: 'rejected', applicationId, feedback: approval.feedback };
    }
  }
}
