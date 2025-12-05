/**
 * 🇿🇼 Nyuchi Platform - Stripe Webhooks
 * "I am because we are" - Webhook event handling
 */

import Stripe from 'stripe';
import { createStripeClient, getStripeWebhookSecret } from './client';

/**
 * Webhook event types we handle
 */
export type WebhookEventType =
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'customer.subscription.trial_will_end'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed';

/**
 * Webhook event handler function
 */
export type WebhookEventHandler<T = any> = (
  event: Stripe.Event,
  data: T
) => Promise<void> | void;

/**
 * Webhook handlers registry
 */
const webhookHandlers = new Map<string, WebhookEventHandler>();

/**
 * Register webhook event handler
 */
export function onWebhookEvent<T = any>(
  eventType: WebhookEventType | string,
  handler: WebhookEventHandler<T>
): void {
  webhookHandlers.set(eventType, handler as WebhookEventHandler);
}

/**
 * Verify and construct webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = createStripeClient();
  const webhookSecret = getStripeWebhookSecret();

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    return event;
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error}`);
  }
}

/**
 * Handle webhook event
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  const handler = webhookHandlers.get(event.type);

  if (handler) {
    try {
      await handler(event, event.data.object);
    } catch (error) {
      console.error(`Error handling webhook event ${event.type}:`, error);
      throw error;
    }
  }
  // Unhandled events are silently ignored
}

/**
 * Process webhook request (for Hono/Workers)
 */
export async function processWebhook(
  payload: string | Buffer,
  signature: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify and construct event
    const event = constructWebhookEvent(payload, signature);

    // Handle event
    await handleWebhookEvent(event);

    return { success: true };
  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Default webhook handlers for common events
 */

/**
 * Handle checkout session completed
 */
export async function handleCheckoutCompleted(
  event: Stripe.Event
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;

  // TODO: Implement checkout completion logic
  // - Update user subscription status in database
  // - Send confirmation email
  // - Award Ubuntu points for verification
  void session; // Use session data here
}

/**
 * Handle subscription created
 */
export async function handleSubscriptionCreated(
  event: Stripe.Event
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;

  // TODO: Implement subscription creation logic
  // - Update user subscription in database
  // - Grant access to features
  // - Send welcome email
  void subscription; // Use subscription data here
}

/**
 * Handle subscription updated
 */
export async function handleSubscriptionUpdated(
  event: Stripe.Event
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;

  // TODO: Implement subscription update logic
  // - Update subscription status in database
  // - Handle plan changes
  // - Send notification emails
  void subscription; // Use subscription data here
}

/**
 * Handle subscription deleted/canceled
 */
export async function handleSubscriptionDeleted(
  event: Stripe.Event
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;

  // TODO: Implement subscription deletion logic
  // - Revoke access to features
  // - Update user status in database
  // - Send cancellation confirmation
  void subscription; // Use subscription data here
}

/**
 * Handle trial ending soon (3 days before)
 */
export async function handleTrialWillEnd(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;

  // TODO: Implement trial ending logic
  // - Send trial ending reminder email
  // - Show in-app notification
  void subscription; // Use subscription data here
}

/**
 * Handle invoice paid
 */
export async function handleInvoicePaid(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;

  // TODO: Implement invoice paid logic
  // - Send payment receipt
  // - Update billing history
  // - Award Ubuntu points for subscription renewal
  void invoice; // Use invoice data here
}

/**
 * Handle invoice payment failed
 */
export async function handleInvoicePaymentFailed(
  event: Stripe.Event
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;

  // TODO: Implement payment failed logic
  // - Send payment failed notification
  // - Suspend account if needed
  // - Prompt user to update payment method
  void invoice; // Use invoice data here
}

/**
 * Handle payment succeeded
 */
export async function handlePaymentSucceeded(event: Stripe.Event): Promise<void> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  // TODO: Implement payment success logic
  // - Handle one-time payments (verification)
  // - Update verification status
  // - Award Ubuntu points
  void paymentIntent; // Use payment intent data here
}

/**
 * Handle payment failed
 */
export async function handlePaymentFailed(event: Stripe.Event): Promise<void> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  // TODO: Implement payment failed logic
  // - Send payment failed notification
  // - Log for admin review
  void paymentIntent; // Use payment intent data here
}

/**
 * Register default webhook handlers
 */
export function registerDefaultWebhookHandlers(): void {
  onWebhookEvent('checkout.session.completed', handleCheckoutCompleted);
  onWebhookEvent('customer.subscription.created', handleSubscriptionCreated);
  onWebhookEvent('customer.subscription.updated', handleSubscriptionUpdated);
  onWebhookEvent('customer.subscription.deleted', handleSubscriptionDeleted);
  onWebhookEvent('customer.subscription.trial_will_end', handleTrialWillEnd);
  onWebhookEvent('invoice.paid', handleInvoicePaid);
  onWebhookEvent('invoice.payment_failed', handleInvoicePaymentFailed);
  onWebhookEvent('payment_intent.succeeded', handlePaymentSucceeded);
  onWebhookEvent('payment_intent.payment_failed', handlePaymentFailed);
}
