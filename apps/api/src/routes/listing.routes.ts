import { Router } from 'express';
import { createListing, getListings, getListingBySlug, updateListing, deleteListing, getSellerListings } from '../controllers/listing.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createListingSchema } from '@menon/shared';

const router = Router();

router.get('/', getListings);
router.get('/my-listings', authenticate, requireRole('SELLER', 'ADMIN'), getSellerListings);
router.get('/:slug', getListingBySlug);
router.post('/', authenticate, requireRole('SELLER', 'ADMIN'), validate(createListingSchema), createListing);
router.put('/:id', authenticate, requireRole('SELLER', 'ADMIN'), updateListing);
router.delete('/:id', authenticate, requireRole('SELLER', 'ADMIN'), deleteListing);

export default router;
