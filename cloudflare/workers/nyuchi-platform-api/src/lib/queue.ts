/**
 * Queue helpers for sending messages to background workers
 */

import type { ApiEnv, QueueMessage, JobType, NotificationType } from '@nyuchi/workers-shared';
import type {
  IncrementViewCountPayload,
  LogActivityPayload,
  AwardUbuntuPointsPayload,
  EmailNotificationPayload,
} from '@nyuchi/workers-shared';

/**
 * Send a job to the background jobs queue
 */
export async function enqueueJob<T>(
  env: ApiEnv,
  type: JobType,
  payload: T
): Promise<void> {
  const message: QueueMessage<T> = {
    type,
    payload,
    timestamp: new Date().toISOString(),
  };

  await env.JOBS_QUEUE.send(message);
}

/**
 * Send a notification to the notifications queue
 */
export async function enqueueNotification<T>(
  env: ApiEnv,
  type: NotificationType,
  payload: T
): Promise<void> {
  const message: QueueMessage<T> = {
    type,
    payload,
    timestamp: new Date().toISOString(),
  };

  await env.NOTIFICATIONS_QUEUE.send(message);
}

/**
 * Queue a view count increment (replaces fire-and-forget pattern)
 */
export async function queueViewCountIncrement(
  env: ApiEnv,
  table: 'directory_listings' | 'content_submissions' | 'travel_businesses',
  id: string
): Promise<void> {
  await enqueueJob<IncrementViewCountPayload>(env, 'increment-view-count', { table, id });
}

/**
 * Queue an activity log entry
 */
export async function queueActivityLog(
  env: ApiEnv,
  userId: string,
  activityType: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await enqueueJob<LogActivityPayload>(env, 'log-activity', {
    userId,
    activityType,
    metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Queue Ubuntu points award
 */
export async function queueUbuntuPointsAward(
  env: ApiEnv,
  userId: string,
  contributionType: string,
  points: number,
  details?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await enqueueJob<AwardUbuntuPointsPayload>(env, 'award-ubuntu-points', {
    userId,
    contributionType,
    points,
    details,
    metadata,
  });
}

/**
 * Queue an email notification
 */
export async function queueEmailNotification(
  env: ApiEnv,
  to: string,
  type: NotificationType,
  data: Record<string, unknown>
): Promise<void> {
  await enqueueNotification<EmailNotificationPayload>(env, type, {
    to,
    type,
    data,
  });
}
