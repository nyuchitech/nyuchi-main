/**
 * 🇿🇼 Stripe utilities
 */

import Stripe from 'stripe';

export function createStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  return new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia' as any,
    typescript: true,
  });
}

export async function listProductsWithPrices() {
  const stripe = createStripeClient();
  const products = await stripe.products.list({ active: true });

  const productsWithPrices = await Promise.all(
    products.data.map(async (product) => {
      const prices = await stripe.prices.list({ product: product.id, active: true });
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        metadata: product.metadata,
        prices: prices.data,
      };
    })
  );

  return productsWithPrices;
}

export async function getVerificationPrice() {
  const priceId = process.env.STRIPE_VERIFICATION_PRICE_ID;
  if (!priceId) return null;

  const stripe = createStripeClient();
  const price = await stripe.prices.retrieve(priceId);
  return price;
}

export async function createCheckoutSession(params: Stripe.Checkout.SessionCreateParams) {
  const stripe = createStripeClient();
  return stripe.checkout.sessions.create(params);
}

interface VerificationCheckoutParams {
  successUrl: string;
  cancelUrl: string;
  userEmail: string;
  userId: string;
  businessName: string;
}

export async function createVerificationCheckout(params: VerificationCheckoutParams) {
  const stripe = createStripeClient();
  const verificationPriceId = process.env.STRIPE_VERIFICATION_PRICE_ID;

  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: verificationPriceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.userEmail,
    metadata: {
      type: 'verification',
      user_id: params.userId,
      business_name: params.businessName,
    },
  });
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  const stripe = createStripeClient();
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

interface CustomerParams {
  email: string;
  userId: string;
}

export async function getOrCreateCustomer(params: CustomerParams) {
  const stripe = createStripeClient();

  // Try to find existing
  const customers = await stripe.customers.list({ email: params.email, limit: 1 });
  if (customers.data[0]) {
    return customers.data[0];
  }

  // Create new
  return stripe.customers.create({
    email: params.email,
    metadata: { user_id: params.userId },
  });
}

export async function getCustomerActiveSubscriptions(customerId: string) {
  const stripe = createStripeClient();
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
  });
  return subscriptions.data;
}

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  const stripe = createStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export async function processWebhook(payload: string | Buffer, signature: string) {
  try {
    const event = constructWebhookEvent(payload, signature);
    // Webhook event type is logged for debugging
    return { success: true, eventType: event.type };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function registerDefaultWebhookHandlers() {
  // Placeholder for webhook handlers
}
