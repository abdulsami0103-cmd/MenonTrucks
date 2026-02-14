import { Router } from 'express';
import { getSellerProfile, getSellers } from '../controllers/seller.controller';

const router = Router();

router.get('/', getSellers);
router.get('/:id', getSellerProfile);

export default router;
