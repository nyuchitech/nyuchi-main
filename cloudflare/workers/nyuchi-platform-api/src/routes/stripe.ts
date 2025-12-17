/**
 * Stripe Routes - Payment endpoints with workflow integration
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import type { ApiEnv } from '@nyuchi/workers-shared';
import { createServiceClient } from '@nyuchi/workers-shared';
import { authMiddleware } from '../middleware/auth';
import { queueActivityLog, queueEmailNotification } from '../lib/queue';
import { startVerificationWorkflow, signalVerificationPayment } from '../lib/workflows';

const stripe = new Hono<{ Bindings: ApiEnv }>();

// Helper to get Stripe client
function getStripe(env: ApiEnv): Stripe {
  return new Stripe(env.STRIPE_SECRET_KEY);
}

/**
 * GET /api/stripe/products - List available products (public)
 */
stripe.get('/products', async (c) => {
  try {
    const stripeClient = getStripe(c.env);

    const products = await stripeClient.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    return c.json({
      data: products.data.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.default_price,
        metadata: product.metadata,
      })),
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

/**
 * POST /api/stripe/create-checkout - Create subscription checkout
 */
stripe.post('/create-checkout', authMiddleware, async (c) => {
  try {
    const stripeClient = getStripe(c.env);
    const user = c.get('user');
    const { priceId, trialDays } = await c.req.json();

    if (!priceId) {
      return c.json({ error: 'priceId required' }, 400);
    }

    // Get or create Stripe customer
    const supabase = createServiceClient(c.env);
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripeClient.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${c.req.header('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${c.req.header('origin')}/pricing`,
      metadata: { userId: user.id },
      ...(trialDays && {
        subscription_data: { trial_period_days: trialDays },
      }),
    });

    await queueActivityLog(c.env, user.id, 'SUBSCRIBE', { priceId });

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
 * POST /api/stripe/create-verification-checkout - Start verification workflow
 */
stripe.post('/create-verification-checkout', authMiddleware, async (c) => {
  try {
    const stripeClient = getStripe(c.env);
    const supabase = createServiceClient(c.env);
    const user = c.get('user');
    const { listingId, businessName } = await c.req.json();

    if (!listingId || !businessName) {
      return c.json({ error: 'listingId and businessName required' }, 400);
    }

    // Create verification request
    const { data: verification, error: verError } = await supabase
      .from('verification_requests')
      .insert({
        listing_id: listingId,
        user_id: user.id,
        status: 'payment_pending',
        amount: 1000, // $10.00
      })
      .select()
      .single();

    if (verError) throw verError;

    // Create Stripe session
    const session = await stripeClient.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Business Verification: ${businessName}` },
          unit_amount: 1000,
        },
        quantity: 1,
      }],
      success_url: `${c.req.header('origin')}/verification-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${c.req.header('origin')}/verify`,
      metadata: {
        userId: user.id,
        listingId,
        verificationId: verification.id,
      },
    });

    // Start verification workflow
    const { workflowId } = await startVerificationWorkflow(c.env, {
      verificationId: verification.id,
      listingId,
      userId: user.id,
      businessName,
    });

    // Store workflow ID
    await supabase
      .from('verification_requests')
      .update({ metadata: { workflowId, sessionId: session.id } })
      .eq('id', verification.id);

    await queueActivityLog(c.env, user.id, 'VERIFY_BUSINESS', { listingId, verificationId: verification.id });

    return c.json({
      url: session.url,
      sessionId: session.id,
      workflowId,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error creating verification checkout:', error);
    return c.json({ error: 'Failed to create verification checkout' }, 500);
  }
});

/**
 * POST /api/stripe/create-portal-session - Customer portal
 */
stripe.post('/create-portal-session', authMiddleware, async (c) => {
  try {
    const stripeClient = getStripe(c.env);
    const supabase = createServiceClient(c.env);
    const user = c.get('user');

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return c.json({ error: 'No subscription found' }, 400);
    }

    const session = await stripeClient.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${c.req.header('origin')}/account`,
    });

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
 * GET /api/stripe/my-subscriptions - Get user's subscriptions
 */
stripe.get('/my-subscriptions', authMiddleware, async (c) => {
  try {
    const stripeClient = getStripe(c.env);
    const supabase = createServiceClient(c.env);
    const user = c.get('user');

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return c.json({ data: [], ubuntu: 'I am because we are' });
    }

    const subscriptions = await stripeClient.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'all',
      expand: ['data.default_payment_method', 'data.items.data.price.product'],
    });

    return c.json({
      data: subscriptions.data,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return c.json({ error: 'Failed to fetch subscriptions' }, 500);
  }
});

/**
 * POST /api/stripe/webhook - Handle Stripe webhooks
 */
stripe.post('/webhook', async (c) => {
  try {
    const stripeClient = getStripe(c.env);
    const signature = c.req.header('stripe-signature');
    const payload = await c.req.text();

    if (!signature) {
      return c.json({ error: 'Missing stripe-signature header' }, 400);
    }

    const event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      c.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Handle verification payment
        if (session.metadata?.verificationId) {
          const supabase = createServiceClient(c.env);

          // Get workflow ID from verification request
          const { data: verification } = await supabase
            .from('verification_requests')
            .select('metadata')
            .eq('id', session.metadata.verificationId)
            .single();

          if (verification?.metadata?.workflowId) {
            // Signal the workflow that payment is complete
            await signalVerificationPayment(
              c.env,
              verification.metadata.workflowId,
              session.payment_intent as string,
              session.amount_total || 1000,
              session.currency || 'usd'
            );
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const supabase = createServiceClient(c.env);

        // Sync subscription status
        await supabase
          .from('product_subscriptions')
          .upsert({
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'stripe_subscription_id',
          });

        // Queue notification
        if (event.type === 'customer.subscription.created') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('stripe_customer_id', subscription.customer)
            .single();

          if (profile?.email) {
            await queueEmailNotification(c.env, profile.email, 'subscription-created', {
              subscriptionId: subscription.id,
            });
          }
        }
        break;
      }
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

export default stripe;
