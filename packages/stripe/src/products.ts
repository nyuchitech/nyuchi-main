/**
 * 🇿🇼 Nyuchi Platform - Stripe Products & Prices
 * "I am because we are" - Product and pricing utilities
 */

import Stripe from 'stripe';
import { createStripeClient } from './client';

/**
 * Product with prices
 */
export interface ProductWithPrices {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  metadata: Stripe.Metadata;
  prices: Price[];
}

/**
 * Price information
 */
export interface Price {
  id: string;
  productId: string;
  active: boolean;
  currency: string;
  unitAmount: number;
  interval: 'day' | 'week' | 'month' | 'year' | null;
  intervalCount: number;
  trialPeriodDays: number | null;
  metadata: Stripe.Metadata;
}

/**
 * List all active products with prices
 */
export async function listProductsWithPrices(): Promise<ProductWithPrices[]> {
  const stripe = createStripeClient();

  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          active: product.active,
          metadata: product.metadata,
          prices: prices.data.map(mapPrice),
        };
      })
    );

    return productsWithPrices;
  } catch (error) {
    console.error('Error listing products:', error);
    return [];
  }
}

/**
 * Get product by ID
 */
export async function getProduct(
  productId: string
): Promise<Stripe.Product | null> {
  const stripe = createStripeClient();

  try {
    const product = await stripe.products.retrieve(productId);
    return product;
  } catch (error) {
    console.error('Error retrieving product:', error);
    return null;
  }
}

/**
 * Get product with prices
 */
export async function getProductWithPrices(
  productId: string
): Promise<ProductWithPrices | null> {
  const stripe = createStripeClient();

  try {
    const product = await stripe.products.retrieve(productId);
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      active: product.active,
      metadata: product.metadata,
      prices: prices.data.map(mapPrice),
    };
  } catch (error) {
    console.error('Error retrieving product:', error);
    return null;
  }
}

/**
 * Get price by ID
 */
export async function getPrice(priceId: string): Promise<Stripe.Price | null> {
  const stripe = createStripeClient();

  try {
    const price = await stripe.prices.retrieve(priceId);
    return price;
  } catch (error) {
    console.error('Error retrieving price:', error);
    return null;
  }
}

/**
 * List all prices for a product
 */
export async function listProductPrices(productId: string): Promise<Price[]> {
  const stripe = createStripeClient();

  try {
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    return prices.data.map(mapPrice);
  } catch (error) {
    console.error('Error listing prices:', error);
    return [];
  }
}

/**
 * Get verification product price
 */
export async function getVerificationPrice(): Promise<Price | null> {
  const priceId = process.env.STRIPE_VERIFICATION_PRICE_ID;

  if (!priceId) {
    console.error('STRIPE_VERIFICATION_PRICE_ID not configured');
    return null;
  }

  const stripePrice = await getPrice(priceId);

  if (!stripePrice) {
    return null;
  }

  return mapPrice(stripePrice);
}

/**
 * Format price for display
 */
export function formatPrice(price: Price): string {
  const amount = price.unitAmount / 100;
  const currency = price.currency.toUpperCase();

  if (price.interval) {
    return `${currency} ${amount.toFixed(2)} / ${price.interval}`;
  }

  return `${currency} ${amount.toFixed(2)}`;
}

/**
 * Format amount for display
 */
export function formatAmount(
  amount: number,
  currency: string = 'usd'
): string {
  const value = amount / 100;
  return `${currency.toUpperCase()} ${value.toFixed(2)}`;
}

/**
 * Map Stripe Price to Price interface
 */
function mapPrice(stripePrice: Stripe.Price): Price {
  return {
    id: stripePrice.id,
    productId:
      typeof stripePrice.product === 'string'
        ? stripePrice.product
        : stripePrice.product.id,
    active: stripePrice.active,
    currency: stripePrice.currency,
    unitAmount: stripePrice.unit_amount || 0,
    interval: stripePrice.recurring?.interval || null,
    intervalCount: stripePrice.recurring?.interval_count || 0,
    trialPeriodDays: stripePrice.recurring?.trial_period_days || null,
    metadata: stripePrice.metadata,
  };
}

/**
 * Get monthly and yearly prices for a product
 */
export async function getProductPricingPlans(productId: string): Promise<{
  monthly: Price | null;
  yearly: Price | null;
}> {
  const prices = await listProductPrices(productId);

  return {
    monthly: prices.find((p) => p.interval === 'month') || null,
    yearly: prices.find((p) => p.interval === 'year') || null,
  };
}

/**
 * Calculate yearly savings percentage
 */
export function calculateYearlySavings(
  monthlyPrice: Price,
  yearlyPrice: Price
): number {
  const monthlyYearlyCost = monthlyPrice.unitAmount * 12;
  const savings = monthlyYearlyCost - yearlyPrice.unitAmount;
  const percentage = (savings / monthlyYearlyCost) * 100;

  return Math.round(percentage);
}
