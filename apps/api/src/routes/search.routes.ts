import { Router } from 'express';
import { search, suggestions, aggregations } from '../controllers/search.controller';

const router = Router();

// GET /api/search?q=volvo&categorySlug=trucks&brand=Volvo&minPrice=5000&sortBy=price_asc&page=1
router.get('/', search);

// GET /api/search/suggestions?q=vol
router.get('/suggestions', suggestions);

// GET /api/search/aggregations?categorySlug=trucks
router.get('/aggregations', aggregations);

export default router;
