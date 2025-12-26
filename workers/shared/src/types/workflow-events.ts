/**
 * Workflow event type definitions for Cloudflare Workflows
 */

// Content Review Workflow
export interface ContentReviewPayload {
  contentId: string;
  userId: string;
  contentType: 'article' | 'guide' | 'resource';
  title: string;
}

export interface ContentApprovalEvent {
  approved: boolean;
  feedback?: string;
  reviewerId: string;
}

// Directory Listing Workflow
export interface ListingReviewPayload {
  listingId: string;
  userId: string;
  businessName: string;
  category: string;
}

export interface ListingApprovalEvent {
  approved: boolean;
  reason?: string;
  reviewerId: string;
}

// Business Verification Workflow
export interface VerificationPayload {
  verificationId: string;
  listingId: string;
  userId: string;
  businessName: string;
}

export interface PaymentCompletedEvent {
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface VerificationReviewEvent {
  approved: boolean;
  reason?: string;
  reviewerId: string;
}

// Subscription Lifecycle Workflow
export interface SubscriptionPayload {
  userId: string;
  customerId: string;
  priceId: string;
  trialDays?: number;
}

export interface SubscriptionEvent {
  subscriptionId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodEnd?: string;
}

// Expert Application Workflow
export interface ExpertApplicationPayload {
  applicationId: string;
  userId: string;
  expertiseArea: string;
  fullName: string;
}

export interface ExpertApprovalEvent {
  approved: boolean;
  feedback?: string;
  reviewerId: string;
}

// Onboarding Workflow
export interface OnboardingPayload {
  userId: string;
  email: string;
  fullName: string;
  userType: 'individual' | 'business';
}

export interface OnboardingStepEvent {
  step: 'profile_completed' | 'first_listing' | 'first_contribution' | 'verified';
}

// Workflow status tracking
export type WorkflowStatus =
  | 'pending'
  | 'running'
  | 'waiting'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface WorkflowInstance {
  id: string;
  workflowName: string;
  status: WorkflowStatus;
  payload: unknown;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
}
