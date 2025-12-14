/**
 * Listing Review Workflow
 * Handles directory listing submission review
 */

import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import type { WorkflowsEnv, ListingReviewPayload, ListingApprovalEvent, QueueMessage } from '@nyuchi/workers-shared';
import { createServiceClient, UBUNTU_POINTS } from '@nyuchi/workers-shared';

export class ListingReviewWorkflow extends WorkflowEntrypoint<WorkflowsEnv, ListingReviewPayload> {
  async run(event: WorkflowEvent<ListingReviewPayload>, step: WorkflowStep) {
    const { listingId, userId, businessName, category } = event.payload;

    // Step 1: Mark as pending and create unified submission
    await step.do('initialize-review', async () => {
      const supabase = createServiceClient(this.env);

      await supabase
        .from('directory_listings')
        .update({
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId);

      await supabase.from('unified_submissions').upsert(
        {
          reference_id: listingId,
          submission_type: 'directory_listing',
          user_id: userId,
          title: businessName,
          status: 'submitted',
          metadata: { category },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'reference_id,submission_type' }
      );
    });

    // Step 2: Notify moderators
    await step.do('notify-moderators', async () => {
      await this.env.NOTIFICATIONS_QUEUE.send({
        type: 'listing-submitted',
        payload: {
          listingId,
          businessName,
          category,
          userId,
        },
        timestamp: new Date().toISOString(),
      } as QueueMessage);
    });

    // Step 3: Wait for approval (up to 7 days)
    const approval = await step.waitForEvent<ListingApprovalEvent>('approval-decision', {
      timeout: '7 days',
    });

    // Step 4: Process decision
    if (approval.approved) {
      await step.do('publish-listing', async () => {
        const supabase = createServiceClient(this.env);

        await supabase
          .from('directory_listings')
          .update({
            status: 'published',
            updated_at: new Date().toISOString(),
          })
          .eq('id', listingId);

        await supabase
          .from('unified_submissions')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('reference_id', listingId)
          .eq('submission_type', 'directory_listing');
      });

      // Award points
      await step.do('award-points', async () => {
        await this.env.JOBS_QUEUE.send({
          type: 'award-ubuntu-points',
          payload: {
            userId,
            contributionType: 'listing_approved',
            points: UBUNTU_POINTS.listing_approved,
            details: `Listing "${businessName}" approved`,
            metadata: { listingId },
          },
          timestamp: new Date().toISOString(),
        } as QueueMessage);
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
            type: 'listing-approved',
            payload: {
              to: profile.email,
              type: 'listing-approved',
              data: { businessName, listingId },
            },
            timestamp: new Date().toISOString(),
          } as QueueMessage);
        }
      });

      return { status: 'published', listingId };
    } else {
      await step.do('reject-listing', async () => {
        const supabase = createServiceClient(this.env);

        await supabase
          .from('directory_listings')
          .update({
            status: 'rejected',
            updated_at: new Date().toISOString(),
          })
          .eq('id', listingId);

        await supabase
          .from('unified_submissions')
          .update({
            status: 'rejected',
            reviewer_notes: approval.reason,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('reference_id', listingId)
          .eq('submission_type', 'directory_listing');
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
            type: 'listing-rejected',
            payload: {
              to: profile.email,
              type: 'listing-rejected',
              data: { businessName, reason: approval.reason },
            },
            timestamp: new Date().toISOString(),
          } as QueueMessage);
        }
      });

      return { status: 'rejected', listingId, reason: approval.reason };
    }
  }
}
