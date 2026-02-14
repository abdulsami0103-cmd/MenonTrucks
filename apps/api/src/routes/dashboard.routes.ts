import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, requireRole('SELLER', 'ADMIN'), getDashboardStats);

export default router;
