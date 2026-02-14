import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import listingRoutes from './listing.routes';
import sellerRoutes from './seller.routes';
import imageRoutes from './image.routes';
import searchRoutes from './search.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/listings', listingRoutes);
router.use('/sellers', sellerRoutes);
router.use('/search', searchRoutes);
router.use('/', imageRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
