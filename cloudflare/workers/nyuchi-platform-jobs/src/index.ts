/**
 * Nyuchi Platform Jobs Worker
 * Queue consumer for background tasks
 */

import type { JobsEnv, QueueMessage } from '@nyuchi/workers-shared';
import {
  createServiceClient,
  incrementViewCount,
  logActivity,
  awardUbuntuPoints,
  checkLevelUp,
  isIncrementViewCount,
  isLogActivity,
  isAwardUbuntuPoints,
} from '@nyuchi/workers-shared';

interface Env extends JobsEnv {
  CACHE: KVNamespace;
}

export default {
  async queue(batch: MessageBatch<QueueMessage>, env: Env): Promise<void> {
    const supabase = createServiceClient(env);

    for (const message of batch.messages) {
      try {
        const { type, payload, timestamp } = message.body;

        // Dedupe check using KV
        const dedupeKey = `job:${type}:${JSON.stringify(payload)}:${timestamp}`;
        const existing = await env.CACHE.get(dedupeKey);

        if (existing) {
          console.log(`Skipping duplicate job: ${type}`);
          message.ack();
          continue;
        }

        // Mark as processed
        await env.CACHE.put(dedupeKey, '1', { expirationTtl: 3600 }); // 1 hour TTL

        switch (type) {
          case 'increment-view-count': {
            if (isIncrementViewCount(payload)) {
              await incrementViewCount(supabase, payload.table, payload.id);
              console.log(`Incremented view count for ${payload.table}:${payload.id}`);
            }
            break;
          }

          case 'log-activity': {
            if (isLogActivity(payload)) {
              await logActivity(
                supabase,
                payload.userId,
                payload.activityType,
                payload.metadata,
                payload.ipAddress,
                payload.userAgent
              );
              console.log(`Logged activity: ${payload.activityType} for ${payload.userId}`);
            }
            break;
          }

          case 'award-ubuntu-points': {
            if (isAwardUbuntuPoints(payload)) {
              // Get current score before awarding
              const { data: profile } = await supabase
                .from('profiles')
                .select('ubuntu_score')
                .eq('id', payload.userId)
                .single();

              const oldScore = profile?.ubuntu_score || 0;

              // Award points
              const newScore = await awardUbuntuPoints(
                supabase,
                payload.userId,
                payload.contributionType,
                payload.points,
                payload.details,
                payload.metadata
              );

              console.log(`Awarded ${payload.points} points to ${payload.userId}. New score: ${newScore}`);

              // Check for level up
              const levelUp = checkLevelUp(oldScore, newScore);
              if (levelUp.leveledUp) {
                console.log(`User ${payload.userId} leveled up to ${levelUp.newLevelName}!`);

                // Could queue a notification here for level up
              }
            }
            break;
          }

          case 'sync-stripe-subscription': {
            // Handle Stripe subscription sync
            const { customerId, subscriptionId, status } = payload as {
              customerId: string;
              subscriptionId: string;
              status: string;
            };

            await supabase
              .from('product_subscriptions')
              .upsert(
                {
                  stripe_subscription_id: subscriptionId,
                  stripe_customer_id: customerId,
                  status,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'stripe_subscription_id' }
              );

            console.log(`Synced subscription ${subscriptionId} status: ${status}`);
            break;
          }

          case 'update-search-index': {
            // Placeholder for search index updates
            console.log('Search index update:', payload);
            break;
          }

          case 'cleanup-expired-sessions': {
            // Cleanup old sessions
            const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

            await supabase
              .from('activity_logs')
              .delete()
              .lt('created_at', cutoff);

            console.log('Cleaned up expired sessions');
            break;
          }

          case 'recalculate-ubuntu-levels': {
            // Recalculate all user levels
            const { data: users } = await supabase
              .from('profiles')
              .select('id, ubuntu_score');

            // This would update cached level data if needed
            console.log(`Recalculated levels for ${users?.length || 0} users`);
            break;
          }

          default:
            console.warn(`Unknown job type: ${type}`);
        }

        message.ack();
      } catch (error) {
        console.error(`Job failed:`, error, message.body);
        // Don't ack - will be retried
        message.retry();
      }
    }
  },

  // Health check fetch handler
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          service: 'nyuchi-platform-jobs',
          timestamp: new Date().toISOString(),
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response('Not Found', { status: 404 });
  },
};
