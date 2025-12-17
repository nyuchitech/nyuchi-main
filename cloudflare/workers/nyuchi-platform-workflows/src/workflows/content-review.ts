/**
 * Content Review Workflow
 * Handles the multi-step content submission review process
 */

import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import type { WorkflowsEnv, ContentReviewPayload, ContentApprovalEvent, QueueMessage } from '@nyuchi/workers-shared';
import { createServiceClient, UBUNTU_POINTS } from '@nyuchi/workers-shared';

export class ContentReviewWorkflow extends WorkflowEntrypoint<WorkflowsEnv, ContentReviewPayload> {
  async run(event: WorkflowEvent<ContentReviewPayload>, step: WorkflowStep) {
    const { contentId, userId, title, contentType } = event.payload;

    // Step 1: Mark as submitted and notify moderators
    await step.do('mark-submitted', async () => {
      const supabase = createServiceClient(this.env);

      await supabase
        .from('content_submissions')
        .update({
          status: 'submitted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', contentId);

      // Create unified submission entry
      await supabase.from('unified_submissions').upsert(
        {
          reference_id: contentId,
          submission_type: 'content',
          user_id: userId,
          title,
          status: 'submitted',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'reference_id,submission_type' }
      );
    });

    // Step 2: Queue notification to moderators
    await step.do('notify-moderators', async () => {
      await this.env.NOTIFICATIONS_QUEUE.send({
        type: 'content-submitted',
        payload: {
          contentId,
          title,
          contentType,
          userId,
        },
        timestamp: new Date().toISOString(),
      } as QueueMessage);
    });

    // Step 3: Optional AI analysis
    const aiAnalysis = await step.do('ai-analysis', async () => {
      // This would call AI for content analysis
      // For now, return placeholder
      return {
        qualityScore: 8,
        suggestions: [],
        categories: [contentType],
      };
    });

    // Step 4: Store AI analysis
    await step.do('store-analysis', async () => {
      const supabase = createServiceClient(this.env);

      await supabase
        .from('content_submissions')
        .update({
          ai_analysis: aiAnalysis,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contentId);
    });

    // Step 5: Wait for approval decision (up to 14 days)
    const approvalEvent = await step.waitForEvent<ContentApprovalEvent>('approval-decision', {
      type: 'approval',
      timeout: '14 days',
    });
    const approval = approvalEvent.payload;

    // Step 6: Process decision
    if (approval.approved) {
      // Approve and publish
      await step.do('publish-content', async () => {
        const supabase = createServiceClient(this.env);

        await supabase
          .from('content_submissions')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', contentId);

        await supabase
          .from('unified_submissions')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('reference_id', contentId)
          .eq('submission_type', 'content');
      });

      // Award Ubuntu points
      await step.do('award-points', async () => {
        await this.env.JOBS_QUEUE.send({
          type: 'award-ubuntu-points',
          payload: {
            userId,
            contributionType: 'content_published',
            points: UBUNTU_POINTS.content_published,
            details: `Content "${title}" published`,
            metadata: { contentId },
          },
          timestamp: new Date().toISOString(),
        } as QueueMessage);
      });

      // Send approval notification
      await step.do('notify-approval', async () => {
        const supabase = createServiceClient(this.env);
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();

        if (profile?.email) {
          await this.env.NOTIFICATIONS_QUEUE.send({
            type: 'content-approved',
            payload: {
              to: profile.email,
              type: 'content-approved',
              data: { title, contentId },
            },
            timestamp: new Date().toISOString(),
          } as QueueMessage);
        }
      });

      return { status: 'published', contentId };
    } else {
      // Reject content
      await step.do('reject-content', async () => {
        const supabase = createServiceClient(this.env);

        await supabase
          .from('content_submissions')
          .update({
            status: 'rejected',
            ai_analysis: {
              ...aiAnalysis,
              reviewer_feedback: approval.feedback,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', contentId);

        await supabase
          .from('unified_submissions')
          .update({
            status: 'rejected',
            reviewer_notes: approval.feedback,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('reference_id', contentId)
          .eq('submission_type', 'content');
      });

      // Send rejection notification
      await step.do('notify-rejection', async () => {
        const supabase = createServiceClient(this.env);
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();

        if (profile?.email) {
          await this.env.NOTIFICATIONS_QUEUE.send({
            type: 'content-rejected',
            payload: {
              to: profile.email,
              type: 'content-rejected',
              data: { title, feedback: approval.feedback },
            },
            timestamp: new Date().toISOString(),
          } as QueueMessage);
        }
      });

      return { status: 'rejected', contentId, feedback: approval.feedback };
    }
  }
}
