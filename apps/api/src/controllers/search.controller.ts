import { Request, Response } from 'express';
import {
  searchListings,
  getSearchSuggestions,
  getFilterAggregations,
} from '../services/elasticsearch.service';
import {
  getCachedSearch,
  setCachedSearch,
  getCachedAggregations,
  setCachedAggregations,
} from '../services/redis.service';

// Full-text search with filters (SRS 15.2)
export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      q,
      categoryId,
      categorySlug,
      brand,
      model,
      condition,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      country,
      city,
      fuelType,
      transmission,
      emissionClass,
      sortBy = 'newest',
      page = '1',
      limit = '20',
    } = req.query;

    const params = {
      q: q as string,
      categoryId: categoryId as string,
      categorySlug: categorySlug as string,
      brand: brand as string,
      model: model as string,
      condition: condition as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      minYear: minYear ? parseInt(minYear as string, 10) : undefined,
      maxYear: maxYear ? parseInt(maxYear as string, 10) : undefined,
      country: country as string,
      city: city as string,
      fuelType: fuelType as string,
      transmission: transmission as string,
      emissionClass: emissionClass as string,
      sortBy: sortBy as string,
      page: parseInt(page as string, 10),
      limit: Math.min(parseInt(limit as string, 10), 100),
    };

    // Check Redis cache first (SRS 16.1 - 2min TTL for search)
    const cached = await getCachedSearch(params);
    if (cached) {
      res.json(cached);
      return;
    }

    const result = await searchListings(params);

    // Cache the result
    await setCachedSearch(params, result);

    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};

// Search suggestions / autocomplete (SRS 15.3)
export const suggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit = '8' } = req.query;

    if (!q || (q as string).length < 2) {
      res.json({ suggestions: [] });
      return;
    }

    const result = await getSearchSuggestions(q as string, parseInt(limit as string, 10));

    res.json({ suggestions: result });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Suggestions failed' });
  }
};

// Filter aggregations with counts (SRS 15.3)
// e.g., "Scania (42)", "Volvo (38)"
export const aggregations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categorySlug } = req.query;

    // Check cache (SRS 16.1 - 5min TTL)
    const cached = await getCachedAggregations(categorySlug as string);
    if (cached) {
      res.json(cached);
      return;
    }

    const aggs = await getFilterAggregations(categorySlug as string);

    // Format aggregations for frontend
    const formatted = formatAggregations(aggs);

    await setCachedAggregations(formatted, categorySlug as string);

    res.json(formatted);
  } catch (error) {
    console.error('Aggregations error:', error);
    res.status(500).json({ error: 'Aggregations failed' });
  }
};

function formatAggregations(aggs: any) {
  const format = (buckets: any[]) =>
    (buckets || []).map((b: any) => ({
      value: b.key,
      label: b.key,
      count: b.doc_count,
    }));

  return {
    categories: format(aggs?.categories?.buckets),
    brands: format(aggs?.brands?.buckets),
    countries: format(aggs?.countries?.buckets),
    conditions: format(aggs?.conditions?.buckets),
    fuelTypes: format(aggs?.fuelTypes?.buckets),
    transmissions: format(aggs?.transmissions?.buckets),
    emissionClasses: format(aggs?.emissionClasses?.buckets),
    priceRanges: format(aggs?.priceRanges?.buckets),
    yearRanges: format(aggs?.yearRanges?.buckets),
  };
}
