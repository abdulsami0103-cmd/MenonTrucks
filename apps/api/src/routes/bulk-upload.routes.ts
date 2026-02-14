import { Router } from 'express';
import { bulkUpload, getBulkTemplate } from '../controllers/bulk-upload.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, requireRole('SELLER', 'ADMIN'), bulkUpload);
router.get('/template', authenticate, getBulkTemplate);

export default router;
