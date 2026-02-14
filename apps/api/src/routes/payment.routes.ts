import { Router } from 'express';
import { getPaymentHistory, getPaymentById } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getPaymentHistory);
router.get('/:id', authenticate, getPaymentById);

export default router;
