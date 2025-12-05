/**
 * 🇿🇼 Nyuchi Platform - Stripe Subscriptions
 * "I am because we are" - Subscription management utilities
 */

import Stripe from 'stripe';
import { createStripeClient } from './client';

/**
 * Subscription creation parameters
 */
export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  trialDays?: number;
  metadata?: Record<string, string>;
  quantity?: number;
}

/**
 * Create subscription
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<Stripe.Subscription> {
  const stripe = createStripeClient();

  const subscriptionParams: Stripe.SubscriptionCreateParams = {
    customer: params.customerId,
    items: [
      {
        price: params.priceId,
        quantity: params.quantity || 1,
      },
    ],
    metadata: params.metadata || {},
  };

  // Add trial period
  if (params.trialDays) {
    subscriptionParams.trial_period_days = params.trialDays;
  }

  const subscription = await stripe.subscriptions.create(subscriptionParams);

  return subscription;
}

/**
 * Get subscription by ID
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const stripe = createStripeClient();

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return null;
  }
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  updates: Stripe.SubscriptionUpdateParams
): Promise<Stripe.Subscription | null> {
  const stripe = createStripeClient();

  try {
    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      updates
    );
    return subscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    return null;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately: boolean = false
): Promise<Stripe.Subscription | null> {
  const stripe = createStripeClient();

  try {
    if (cancelImmediately) {
      // Cancel immediately
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } else {
      // Cancel at end of billing period
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      return subscription;
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return null;
  }
}

/**
 * Resume canceled subscription
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const stripe = createStripeClient();

  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return subscription;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    return null;
  }
}

/**
 * Change subscription plan
 */
export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string,
  proration: boolean = true
): Promise<Stripe.Subscription | null> {
  const stripe = createStripeClient();

  try {
    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription.items.data[0]) {
      throw new Error('Subscription has no items');
    }

    // Update subscription with new price
    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: proration ? 'create_prorations' : 'none',
    });

    return updated;
  } catch (error) {
    console.error('Error changing subscription plan:', error);
    return null;
  }
}

/**
 * Get subscription status
 */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | 'paused';

export async function getSubscriptionStatus(
  subscriptionId: string
): Promise<SubscriptionStatus | null> {
  const subscription = await getSubscription(subscriptionId);
  return subscription?.status || null;
}

/**
 * Check if subscription is active
 */
export async function isSubscriptionActive(
  subscriptionId: string
): Promise<boolean> {
  const status = await getSubscriptionStatus(subscriptionId);
  return status === 'active' || status === 'trialing';
}

/**
 * Get subscription current period end
 */
export async function getSubscriptionPeriodEnd(
  subscriptionId: string
): Promise<Date | null> {
  const subscription = await getSubscription(subscriptionId);

  if (!subscription) {
    return null;
  }

  return new Date(subscription.current_period_end * 1000);
}

/**
 * Check if subscription is in trial
 */
export async function isSubscriptionInTrial(
  subscriptionId: string
): Promise<boolean> {
  const subscription = await getSubscription(subscriptionId);
  return subscription?.status === 'trialing';
}

/**
 * Get trial end date
 */
export async function getTrialEndDate(
  subscriptionId: string
): Promise<Date | null> {
  const subscription = await getSubscription(subscriptionId);

  if (!subscription || !subscription.trial_end) {
    return null;
  }

  return new Date(subscription.trial_end * 1000);
}

/**
 * List all subscriptions for a customer
 */
export async function listCustomerSubscriptions(
  customerId: string,
  status?: SubscriptionStatus
): Promise<Stripe.Subscription[]> {
  const stripe = createStripeClient();

  try {
    const params: Stripe.SubscriptionListParams = {
      customer: customerId,
    };

    if (status) {
      params.status = status;
    } else {
      params.status = 'all';
    }

    const subscriptions = await stripe.subscriptions.list(params);
    return subscriptions.data;
  } catch (error) {
    console.error('Error listing subscriptions:', error);
    return [];
  }
}

/**
 * Get customer's active subscription for a product
 */
export async function getCustomerActiveSubscriptionForProduct(
  customerId: string,
  productId: string
): Promise<Stripe.Subscription | null> {
  const subscriptions = await listCustomerSubscriptions(customerId, 'active');

  const subscription = subscriptions.find((sub) =>
    sub.items.data.some((item) => {
      const price = item.price as Stripe.Price;
      return (
        typeof price.product === 'string'
          ? price.product === productId
          : price.product?.id === productId
      );
    })
  );

  return subscription || null;
}

/**
 * Pause subscription
 */
export async function pauseSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const stripe = createStripeClient();

  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      pause_collection: {
        behavior: 'mark_uncollectible',
      },
    });
    return subscription;
  } catch (error) {
    console.error('Error pausing subscription:', error);
    return null;
  }
}

/**
 * Resume paused subscription
 */
export async function resumePausedSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const stripe = createStripeClient();

  try {
    // null is valid to resume, but Stripe's types don't allow it directly
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      pause_collection: null as unknown as Stripe.SubscriptionUpdateParams['pause_collection'],
    });
    return subscription;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    return null;
  }
}
