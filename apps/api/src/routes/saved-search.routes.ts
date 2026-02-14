import { Router } from 'express';
import { createSavedSearch, getSavedSearches, updateSavedSearch, deleteSavedSearch } from '../controllers/saved-search.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getSavedSearches);
router.post('/', authenticate, createSavedSearch);
router.put('/:id', authenticate, updateSavedSearch);
router.delete('/:id', authenticate, deleteSavedSearch);

export default router;
