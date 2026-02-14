import Stripe from 'stripe';
import { env } from '../config/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-04-10',
});

export const PLAN_PRICES: Record<string, { priceId: string; amount: number; name: string; maxListings: number; featuredListings: number }> = {
  BASIC: {
    priceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
    amount: 2999,
    name: 'Basic',
    maxListings: 10,
    featuredListings: 2,
  },
  PREMIUM: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
    amount: 7999,
    name: 'Premium',
    maxListings: 50,
    featuredListings: 10,
  },
};

export const createCheckoutSession = async (
  userId: string,
  userEmail: string,
  plan: 'BASIC' | 'PREMIUM',
  customerId?: string
): Promise<Stripe.Checkout.Session> => {
  const planConfig = PLAN_PRICES[plan];

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `MenonTrucks ${planConfig.name} Plan`,
            description: `Up to ${planConfig.maxListings} listings, ${planConfig.featuredListings} featured`,
          },
          unit_amount: planConfig.amount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    success_url: `${env.FRONTEND_URL}/dashboard/subscription?success=true`,
    cancel_url: `${env.FRONTEND_URL}/dashboard/subscription?cancelled=true`,
    metadata: { userId, plan },
    customer_email: customerId ? undefined : userEmail,
    customer: customerId || undefined,
  };

  return stripe.checkout.sessions.create(sessionParams);
};

export const createBillingPortalSession = async (customerId: string): Promise<Stripe.BillingPortal.Session> => {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.FRONTEND_URL}/dashboard/subscription`,
  });
};

export const cancelSubscription = async (subscriptionId: string): Promise<Stripe.Subscription> => {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
};

export const reactivateSubscription = async (subscriptionId: string): Promise<Stripe.Subscription> => {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
};

export const constructWebhookEvent = (payload: Buffer, signature: string): Stripe.Event => {
  return stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
};

export { stripe };
