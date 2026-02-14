import { Router } from 'express';
import {
  getPlans,
  getMySubscription,
  createSubscription,
  getBillingPortal,
  cancelMySubscription,
  toggleFeaturedListing,
  handleStripeWebhook,
} from '../controllers/subscription.controller';
import { authenticate, requireRole } from '../middleware/auth';
import express from 'express';

const router = Router();

// Public - get plans
router.get('/plans', getPlans);

// Stripe webhook (needs raw body, no auth)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Authenticated
router.get('/my', authenticate, getMySubscription);
router.post('/checkout', authenticate, requireRole('SELLER'), createSubscription);
router.post('/billing-portal', authenticate, getBillingPortal);
router.post('/cancel', authenticate, cancelMySubscription);

// Featured listing toggle
router.patch('/featured/:listingId', authenticate, requireRole('SELLER'), toggleFeaturedListing);

export default router;
