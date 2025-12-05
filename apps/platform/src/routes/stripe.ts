/**
 * 🇿🇼 Nyuchi Platform - Stripe Routes
 * "I am because we are" - Payment endpoints
 */

import { Hono } from 'hono';
import { authMiddleware } from '../lib/auth';
import {
  createCheckoutSession,
  createVerificationCheckout,
  createPortalSession,
  processWebhook,
  registerDefaultWebhookHandlers,
  listProductsWithPrices,
  getVerificationPrice,
  getOrCreateCustomer,
  getCustomerActiveSubscriptions,
} from '../lib/stripe';
import { Env } from '../index';

const stripe = new Hono<{ Bindings: Env }>();

// Register webhook handlers
registerDefaultWebhookHandlers();

/**
 * GET /api/stripe/products
 * List available products and pricing (public)
 */
stripe.get('/products', async (c) => {
  try {
    const products = await listProductsWithPrices();

    return c.json({
      data: products,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

/**
 * GET /api/stripe/verification-price
 * Get verification price (public)
 */
stripe.get('/verification-price', async (c) => {
  try {
    const price = await getVerificationPrice();

    if (!price) {
      return c.json({ error: 'Verification price not configured' }, 500);
    }

    return c.json({
      data: price,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching verification price:', error);
    return c.json({ error: 'Failed to fetch verification price' }, 500);
  }
});

/**
 * POST /api/stripe/create-checkout
 * Create subscription checkout session (authenticated)
 */
stripe.post('/create-checkout', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { priceId, trialDays } = await c.req.json();

    if (!priceId) {
      return c.json({ error: 'priceId required' }, 400);
    }

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer({
      email: user.email,
      userId: user.id,
    });

    const session = await createCheckoutSession({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customer.id,
      success_url: `${c.req.header('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${c.req.header('origin')}/pricing`,
      metadata: {
        userId: user.id,
      },
      ...(trialDays && {
        subscription_data: {
          trial_period_days: trialDays,
        },
      }),
    });

    return c.json({
      url: session.url,
      sessionId: session.id,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return c.json({ error: 'Failed to create checkout' }, 500);
  }
});

/**
 * POST /api/stripe/create-verification-checkout
 * Create verification checkout (one-time payment) (authenticated)
 */
stripe.post('/create-verification-checkout', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { businessName } = await c.req.json();

    if (!businessName) {
      return c.json({ error: 'businessName required' }, 400);
    }

    const session = await createVerificationCheckout({
      userId: user.id,
      userEmail: user.email,
      businessName,
      successUrl: `${c.req.header('origin')}/verification-success`,
      cancelUrl: `${c.req.header('origin')}/verify`,
    });

    return c.json({
      url: session.url,
      sessionId: session.id,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error creating verification checkout:', error);
    return c.json({ error: 'Failed to create verification checkout' }, 500);
  }
});

/**
 * POST /api/stripe/create-portal-session
 * Create customer portal session (authenticated)
 */
stripe.post('/create-portal-session', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Get or create customer
    const customer = await getOrCreateCustomer({
      email: user.email,
      userId: user.id,
    });

    const session = await createPortalSession(
      customer.id,
      `${c.req.header('origin')}/account`
    );

    return c.json({
      url: session.url,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return c.json({ error: 'Failed to create portal session' }, 500);
  }
});

/**
 * GET /api/stripe/my-subscriptions
 * Get current user's subscriptions (authenticated)
 */
stripe.get('/my-subscriptions', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Get or create customer
    const customer = await getOrCreateCustomer({
      email: user.email,
      userId: user.id,
    });

    const subscriptions = await getCustomerActiveSubscriptions(customer.id);

    return c.json({
      data: subscriptions,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return c.json({ error: 'Failed to fetch subscriptions' }, 500);
  }
});

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhooks
 */
stripe.post('/webhook', async (c) => {
  try {
    const signature = c.req.header('stripe-signature');
    const payload = await c.req.text();

    if (!signature) {
      return c.json({ error: 'Missing stripe-signature header' }, 400);
    }

    const result = await processWebhook(payload, signature);

    if (!result.success) {
      console.error('Webhook processing failed:', result.error);
      return c.json({ error: result.error }, 400);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

export default stripe;
