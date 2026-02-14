import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import listingRoutes from './listing.routes';
import sellerRoutes from './seller.routes';
import imageRoutes from './image.routes';
import searchRoutes from './search.routes';
import favoriteRoutes from './favorite.routes';
import messageRoutes from './message.routes';
import savedSearchRoutes from './saved-search.routes';
import dashboardRoutes from './dashboard.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/listings', listingRoutes);
router.use('/sellers', sellerRoutes);
router.use('/search', searchRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/messages', messageRoutes);
router.use('/saved-searches', savedSearchRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);
router.use('/', imageRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
