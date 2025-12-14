/**
 * Business Verification Workflow
 * Handles paid verification with payment + document review
 */

import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import type { WorkflowsEnv, VerificationPayload, PaymentCompletedEvent, VerificationReviewEvent, QueueMessage } from '@nyuchi/workers-shared';
import { createServiceClient, UBUNTU_POINTS } from '@nyuchi/workers-shared';

export class VerificationWorkflow extends WorkflowEntrypoint<WorkflowsEnv, VerificationPayload> {
  async run(event: WorkflowEvent<VerificationPayload>, step: WorkflowStep) {
    const { verificationId, listingId, userId, businessName } = event.payload;

    // Step 1: Initialize verification request
    await step.do('initialize', async () => {
      const supabase = createServiceClient(this.env);

      await supabase
        .from('verification_requests')
        .update({
          status: 'payment_pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', verificationId);
    });

    // Step 2: Notify user about payment
    await step.do('notify-payment-pending', async () => {
      await this.env.NOTIFICATIONS_QUEUE.send({
        type: 'verification-started',
        payload: {
          verificationId,
          businessName,
          userId,
        },
        timestamp: new Date().toISOString(),
      } as QueueMessage);
    });

    // Step 3: Wait for payment (up to 24 hours)
    const payment = await step.waitForEvent<PaymentCompletedEvent>('payment-completed', {
      timeout: '24 hours',
    });

    // Step 4: Mark payment received
    await step.do('mark-payment-received', async () => {
      const supabase = createServiceClient(this.env);

      await supabase
        .from('verification_requests')
        .update({
          status: 'payment_completed',
          payment_intent_id: payment.paymentIntentId,
          amount: payment.amount,
          currency: payment.currency,
          updated_at: new Date().toISOString(),
        })
        .eq('id', verificationId);
    });

    // Step 5: Notify user and reviewers
    await step.do('notify-payment-received', async () => {
      await this.env.NOTIFICATIONS_QUEUE.send({
        type: 'verification-payment-received',
        payload: {
          verificationId,
          businessName,
          userId,
        },
        timestamp: new Date().toISOString(),
      } as QueueMessage);
    });

    // Step 6: Move to review queue
    await step.do('queue-for-review', async () => {
      const supabase = createServiceClient(this.env);

      await supabase
        .from('verification_requests')
        .update({
          status: 'in_review',
          updated_at: new Date().toISOString(),
        })
        .eq('id', verificationId);

      // Create unified submission for pipeline
      await supabase.from('unified_submissions').upsert(
        {
          reference_id: verificationId,
          submission_type: 'verification',
          user_id: userId,
          title: `Verification: ${businessName}`,
          status: 'in_review',
          metadata: { listingId },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'reference_id,submission_type' }
      );
    });

    // Step 7: Wait for review decision (up to 14 days)
    const review = await step.waitForEvent<VerificationReviewEvent>('review-decision', {
      timeout: '14 days',
    });

    // Step 8: Process decision
    if (review.approved) {
      await step.do('approve-verification', async () => {
        const supabase = createServiceClient(this.env);

        // Update verification request
        await supabase
          .from('verification_requests')
          .update({
            status: 'approved',
            reviewed_by: review.reviewerId,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', verificationId);

        // Mark listing as verified
        await supabase
          .from('directory_listings')
          .update({
            is_verified: true,
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', listingId);

        // Update unified submission
        await supabase
          .from('unified_submissions')
          .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('reference_id', verificationId)
          .eq('submission_type', 'verification');
      });

      // Award points
      await step.do('award-points', async () => {
        await this.env.JOBS_QUEUE.send({
          type: 'award-ubuntu-points',
          payload: {
            userId,
            contributionType: 'listing_verified',
            points: UBUNTU_POINTS.listing_verified,
            details: `Business "${businessName}" verified`,
            metadata: { listingId, verificationId },
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
            type: 'verification-approved',
            payload: {
              to: profile.email,
              type: 'verification-approved',
              data: { businessName, listingId },
            },
            timestamp: new Date().toISOString(),
          } as QueueMessage);
        }
      });

      return { status: 'approved', verificationId, listingId };
    } else {
      await step.do('reject-verification', async () => {
        const supabase = createServiceClient(this.env);

        await supabase
          .from('verification_requests')
          .update({
            status: 'rejected',
            reviewer_notes: review.reason,
            reviewed_by: review.reviewerId,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', verificationId);

        await supabase
          .from('unified_submissions')
          .update({
            status: 'rejected',
            reviewer_notes: review.reason,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('reference_id', verificationId)
          .eq('submission_type', 'verification');
      });

      // Note: In rejection case, consider partial refund logic
      await step.do('notify-rejection', async () => {
        const supabase = createServiceClient(this.env);
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();

        if (profile?.email) {
          await this.env.NOTIFICATIONS_QUEUE.send({
            type: 'verification-rejected',
            payload: {
              to: profile.email,
              type: 'verification-rejected',
              data: { businessName, reason: review.reason },
            },
            timestamp: new Date().toISOString(),
          } as QueueMessage);
        }
      });

      return { status: 'rejected', verificationId, reason: review.reason };
    }
  }
}
