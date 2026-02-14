import { Router } from 'express';
import { addImages, deleteImage, reorderImages } from '../controllers/image.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/listings/:listingId/images', authenticate, requireRole('SELLER', 'ADMIN'), addImages);
router.put('/listings/:listingId/images/reorder', authenticate, requireRole('SELLER', 'ADMIN'), reorderImages);
router.delete('/images/:id', authenticate, requireRole('SELLER', 'ADMIN'), deleteImage);

export default router;
