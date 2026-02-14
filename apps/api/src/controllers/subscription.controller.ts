import { Request, Response } from 'express';
import { prisma } from '@menon/db';
import { AuthRequest } from '../middleware/auth';
import {
  createCheckoutSession,
  createBillingPortalSession,
  cancelSubscription,
  reactivateSubscription,
  constructWebhookEvent,
  PLAN_PRICES,
} from '../services/stripe.service';

// Get subscription plans info
export const getPlans = async (_req: Request, res: Response): Promise<void> => {
  const plans = [
    {
      id: 'FREE',
      name: 'Free',
      price: 0,
      currency: 'EUR',
      interval: 'month',
      maxListings: 1,
      featuredListings: 0,
      features: [
        '1 active listing',
        'Basic listing details',
        'Direct messaging',
        'Email support',
      ],
    },
    {
      id: 'BASIC',
      name: 'Basic',
      price: 29.99,
      currency: 'EUR',
      interval: 'month',
      maxListings: 10,
      featuredListings: 2,
      features: [
        'Up to 10 active listings',
        '2 featured listings',
        'Priority in search results',
        'Analytics dashboard',
        'Direct messaging',
        'Priority support',
      ],
      popular: true,
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      price: 79.99,
      currency: 'EUR',
      interval: 'month',
      maxListings: 50,
      featuredListings: 10,
      features: [
        'Up to 50 active listings',
        '10 featured listings',
        'Top placement in search',
        'Advanced analytics',
        'Direct messaging',
        'Company profile page',
        'Dedicated account manager',
        '24/7 priority support',
      ],
    },
  ];

  res.json({ plans });
};

// Get current user subscription
export const getMySubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      // Return free plan defaults
      res.json({
        subscription: {
          plan: 'FREE',
          status: 'ACTIVE',
          maxListings: 1,
          featuredListings: 0,
          startDate: null,
          endDate: null,
        },
      });
      return;
    }

    res.json({ subscription });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create checkout session for subscription
export const createSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { plan } = req.body;

    if (!['BASIC', 'PREMIUM'].includes(plan)) {
      res.status(400).json({ error: 'Invalid plan. Choose BASIC or PREMIUM.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if already has active paid subscription
    const existing = await prisma.subscription.findUnique({ where: { userId } });
    if (existing && existing.plan !== 'FREE' && existing.status === 'ACTIVE') {
      res.status(400).json({ error: 'You already have an active subscription. Manage it from your billing portal.' });
      return;
    }

    const session = await createCheckoutSession(
      userId,
      user.email,
      plan as 'BASIC' | 'PREMIUM',
      existing?.stripeCustomerId || undefined
    );

    res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get billing portal link
export const getBillingPortal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const subscription = await prisma.subscription.findUnique({ where: { userId } });
    if (!subscription?.stripeCustomerId) {
      res.status(400).json({ error: 'No active subscription found' });
      return;
    }

    const session = await createBillingPortalSession(subscription.stripeCustomerId);
    res.json({ portalUrl: session.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cancel subscription
export const cancelMySubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const subscription = await prisma.subscription.findUnique({ where: { userId } });
    if (!subscription?.stripeSubId) {
      res.status(400).json({ error: 'No active subscription to cancel' });
      return;
    }

    await cancelSubscription(subscription.stripeSubId);

    await prisma.subscription.update({
      where: { userId },
      data: { status: 'CANCELLED' },
    });

    res.json({ message: 'Subscription will be cancelled at the end of the billing period' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Toggle featured listing
export const toggleFeaturedListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { listingId } = req.params;

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.sellerId !== userId) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    // Check subscription featured limit
    const subscription = await prisma.subscription.findUnique({ where: { userId } });
    const maxFeatured = subscription?.featuredListings || 0;

    if (!listing.isFeatured) {
      const currentFeatured = await prisma.listing.count({
        where: { sellerId: userId, isFeatured: true },
      });

      if (currentFeatured >= maxFeatured) {
        res.status(400).json({
          error: `Your plan allows ${maxFeatured} featured listings. Upgrade to get more.`,
        });
        return;
      }
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: { isFeatured: !listing.isFeatured },
    });

    res.json({ listing: updated });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Stripe webhook handler
export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;

  let event;
  try {
    event = constructWebhookEvent(req.body, sig);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ error: 'Webhook signature verification failed' });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const { userId, plan } = session.metadata;
        const planConfig = PLAN_PRICES[plan];

        // Upsert subscription
        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            plan,
            status: 'ACTIVE',
            maxListings: planConfig.maxListings,
            featuredListings: planConfig.featuredListings,
            stripeCustomerId: session.customer,
            stripeSubId: session.subscription,
            startDate: new Date(),
          },
          update: {
            plan,
            status: 'ACTIVE',
            maxListings: planConfig.maxListings,
            featuredListings: planConfig.featuredListings,
            stripeCustomerId: session.customer,
            stripeSubId: session.subscription,
            startDate: new Date(),
            endDate: null,
          },
        });

        // Record payment
        await prisma.payment.create({
          data: {
            userId,
            amount: planConfig.amount / 100,
            currency: 'EUR',
            status: 'COMPLETED',
            stripePaymentId: session.payment_intent,
            description: `${planConfig.name} Plan - Monthly Subscription`,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const subscription = await prisma.subscription.findFirst({
          where: { stripeSubId: sub.id },
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'EXPIRED',
              plan: 'FREE',
              maxListings: 1,
              featuredListings: 0,
              endDate: new Date(),
            },
          });

          // Unfeature all listings
          await prisma.listing.updateMany({
            where: { sellerId: subscription.userId, isFeatured: true },
            data: { isFeatured: false },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const failedSub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: invoice.customer },
        });

        if (failedSub) {
          await prisma.payment.create({
            data: {
              userId: failedSub.userId,
              amount: invoice.amount_due / 100,
              currency: 'EUR',
              status: 'FAILED',
              stripePaymentId: invoice.payment_intent,
              description: 'Monthly subscription payment failed',
            },
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const successInvoice = event.data.object as any;
        // Only record renewal payments (not the initial one from checkout)
        if (successInvoice.billing_reason === 'subscription_cycle') {
          const renewSub = await prisma.subscription.findFirst({
            where: { stripeCustomerId: successInvoice.customer },
          });

          if (renewSub) {
            await prisma.payment.create({
              data: {
                userId: renewSub.userId,
                amount: successInvoice.amount_paid / 100,
                currency: 'EUR',
                status: 'COMPLETED',
                stripePaymentId: successInvoice.payment_intent,
                description: 'Monthly subscription renewal',
              },
            });
          }
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
