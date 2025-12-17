/**
 * Queue message type definitions
 */

// Job queue message types
export type JobType =
  | 'increment-view-count'
  | 'log-activity'
  | 'award-ubuntu-points'
  | 'sync-stripe-subscription'
  | 'update-search-index'
  | 'cleanup-expired-sessions'
  | 'recalculate-ubuntu-levels';

export interface IncrementViewCountPayload {
  table: 'directory_listings' | 'content_submissions' | 'travel_businesses';
  id: string;
}

export interface LogActivityPayload {
  userId: string;
  activityType: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AwardUbuntuPointsPayload {
  userId: string;
  contributionType: string;
  points: number;
  details?: string;
  metadata?: Record<string, unknown>;
}

export interface SyncStripeSubscriptionPayload {
  customerId: string;
  subscriptionId: string;
  status: string;
}

// Notification queue message types
export type NotificationType =
  | 'content-submitted'
  | 'content-approved'
  | 'content-rejected'
  | 'listing-approved'
  | 'listing-rejected'
  | 'verification-started'
  | 'verification-payment-received'
  | 'verification-approved'
  | 'verification-rejected'
  | 'subscription-created'
  | 'subscription-cancelled'
  | 'ubuntu-level-up'
  | 'welcome-email';

export interface EmailNotificationPayload {
  to: string;
  type: NotificationType;
  data: Record<string, unknown>;
}

export interface InAppNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}

// Type guards for job messages
export function isIncrementViewCount(payload: unknown): payload is IncrementViewCountPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'table' in payload &&
    'id' in payload
  );
}

export function isLogActivity(payload: unknown): payload is LogActivityPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'userId' in payload &&
    'activityType' in payload
  );
}

export function isAwardUbuntuPoints(payload: unknown): payload is AwardUbuntuPointsPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'userId' in payload &&
    'contributionType' in payload &&
    'points' in payload
  );
}
