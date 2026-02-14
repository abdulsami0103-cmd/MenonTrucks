import { Router } from 'express';
import { toggleFavorite, getFavorites, checkFavorite } from '../controllers/favorite.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getFavorites);
router.post('/:listingId', authenticate, toggleFavorite);
router.get('/:listingId/check', authenticate, checkFavorite);

export default router;
