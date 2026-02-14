import { Client } from '@elastic/elasticsearch';
import { env } from '../config/env';

// Elasticsearch Client
const esClient = new Client({
  node: env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// Index name - use alias pattern for zero-downtime reindexing (SRS Section 15.5)
const LISTING_INDEX_ALIAS = 'listings';
const LISTING_INDEX_NAME = 'listings_v1';

// ==========================================
// INDEX MANAGEMENT
// ==========================================

export async function createListingIndex(): Promise<void> {
  const indexExists = await esClient.indices.exists({ index: LISTING_INDEX_NAME });

  if (!indexExists) {
    // Create index with 3 primary shards, 1 replica (SRS Section 15.4)
    await esClient.indices.create({
      index: LISTING_INDEX_NAME,
      body: {
        settings: {
          number_of_shards: 3,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              listing_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding', 'listing_synonym'],
              },
              autocomplete_analyzer: {
                type: 'custom',
                tokenizer: 'autocomplete_tokenizer',
                filter: ['lowercase', 'asciifolding'],
              },
            },
            tokenizer: {
              autocomplete_tokenizer: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 15,
                token_chars: ['letter', 'digit'],
              },
            },
            filter: {
              listing_synonym: {
                type: 'synonym',
                synonyms: [
                  'truck,lorry',
                  'trailer,semi-trailer',
                  'excavator,digger',
                  'forklift,fork lift,lift truck',
                ],
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            title: {
              type: 'text',
              analyzer: 'listing_analyzer',
              fields: {
                autocomplete: { type: 'text', analyzer: 'autocomplete_analyzer', search_analyzer: 'standard' },
                keyword: { type: 'keyword' },
              },
            },
            description: { type: 'text', analyzer: 'listing_analyzer' },
            slug: { type: 'keyword' },
            price: { type: 'float' },
            currency: { type: 'keyword' },
            condition: { type: 'keyword' },
            status: { type: 'keyword' },
            isFeatured: { type: 'boolean' },
            views: { type: 'integer' },

            // Vehicle details
            brand: {
              type: 'text',
              fields: {
                keyword: { type: 'keyword' },
                autocomplete: { type: 'text', analyzer: 'autocomplete_analyzer', search_analyzer: 'standard' },
              },
            },
            model: {
              type: 'text',
              fields: {
                keyword: { type: 'keyword' },
                autocomplete: { type: 'text', analyzer: 'autocomplete_analyzer', search_analyzer: 'standard' },
              },
            },
            year: { type: 'integer' },
            mileage: { type: 'integer' },
            fuelType: { type: 'keyword' },
            transmission: { type: 'keyword' },
            power: { type: 'keyword' },
            emissionClass: { type: 'keyword' },
            axles: { type: 'integer' },
            weight: { type: 'float' },
            color: { type: 'keyword' },

            // Location
            city: {
              type: 'text',
              fields: { keyword: { type: 'keyword' } },
            },
            country: {
              type: 'text',
              fields: { keyword: { type: 'keyword' } },
            },
            location: { type: 'geo_point' },

            // Relations
            categoryId: { type: 'keyword' },
            categoryName: { type: 'keyword' },
            categorySlug: { type: 'keyword' },
            sellerId: { type: 'keyword' },
            sellerName: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            companyName: { type: 'text', fields: { keyword: { type: 'keyword' } } },

            // Image
            thumbnailUrl: { type: 'keyword', index: false },

            // Specs (dynamic)
            specifications: {
              type: 'nested',
              properties: {
                key: { type: 'keyword' },
                value: { type: 'keyword' },
              },
            },

            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
          },
        },
      },
    });

    // Create alias pointing to the index
    await esClient.indices.putAlias({
      index: LISTING_INDEX_NAME,
      name: LISTING_INDEX_ALIAS,
    });

    console.log('✅ Elasticsearch listing index created with alias');
  }
}

// ==========================================
// DOCUMENT OPERATIONS (Real-time sync - SRS 15.1)
// ==========================================

export async function indexListing(listing: any): Promise<void> {
  const doc = transformListingToDoc(listing);

  await esClient.index({
    index: LISTING_INDEX_ALIAS,
    id: listing.id,
    body: doc,
  });
}

export async function updateListingIndex(id: string, partial: any): Promise<void> {
  try {
    await esClient.update({
      index: LISTING_INDEX_ALIAS,
      id,
      body: { doc: partial },
    });
  } catch (error: any) {
    if (error?.meta?.statusCode === 404) {
      console.warn(`Listing ${id} not found in ES, skipping update`);
    } else {
      throw error;
    }
  }
}

export async function deleteListingIndex(id: string): Promise<void> {
  try {
    await esClient.delete({
      index: LISTING_INDEX_ALIAS,
      id,
    });
  } catch (error: any) {
    if (error?.meta?.statusCode === 404) {
      console.warn(`Listing ${id} not found in ES, skipping delete`);
    } else {
      throw error;
    }
  }
}

// Bulk re-indexing capability (SRS 15.1)
export async function bulkIndexListings(listings: any[]): Promise<void> {
  if (listings.length === 0) return;

  const body = listings.flatMap((listing) => [
    { index: { _index: LISTING_INDEX_ALIAS, _id: listing.id } },
    transformListingToDoc(listing),
  ]);

  const result = await esClient.bulk({ body, refresh: true });

  if (result.errors) {
    const errors = result.items.filter((item: any) => item.index?.error);
    console.error(`Bulk indexing had ${errors.length} errors`);
  } else {
    console.log(`✅ Bulk indexed ${listings.length} listings`);
  }
}

// ==========================================
// SEARCH (SRS 15.2)
// ==========================================

interface SearchParams {
  q?: string;
  categoryId?: string;
  categorySlug?: string;
  brand?: string;
  model?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  country?: string;
  city?: string;
  fuelType?: string;
  transmission?: string;
  emissionClass?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export async function searchListings(params: SearchParams) {
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
    page = 1,
    limit = 20,
  } = params;

  const must: any[] = [{ term: { status: 'ACTIVE' } }];
  const filter: any[] = [];

  // Full-text search
  if (q) {
    must.push({
      multi_match: {
        query: q,
        fields: ['title^3', 'description', 'brand^2', 'model^2', 'sellerName', 'companyName'],
        type: 'best_fields',
        fuzziness: 'AUTO',
      },
    });
  }

  // Filters
  if (categoryId) filter.push({ term: { categoryId } });
  if (categorySlug) filter.push({ term: { categorySlug } });
  if (brand) filter.push({ term: { 'brand.keyword': brand } });
  if (model) filter.push({ term: { 'model.keyword': model } });
  if (condition) filter.push({ term: { condition } });
  if (fuelType) filter.push({ term: { fuelType } });
  if (transmission) filter.push({ term: { transmission } });
  if (emissionClass) filter.push({ term: { emissionClass } });
  if (country) filter.push({ term: { 'country.keyword': country } });
  if (city) filter.push({ term: { 'city.keyword': city } });

  // Price range
  if (minPrice || maxPrice) {
    const range: any = {};
    if (minPrice) range.gte = minPrice;
    if (maxPrice) range.lte = maxPrice;
    filter.push({ range: { price: range } });
  }

  // Year range
  if (minYear || maxYear) {
    const range: any = {};
    if (minYear) range.gte = minYear;
    if (maxYear) range.lte = maxYear;
    filter.push({ range: { year: range } });
  }

  // Sorting (SRS 15.2)
  const sort: any[] = [{ isFeatured: { order: 'desc' } }];
  switch (sortBy) {
    case 'price_asc': sort.push({ price: 'asc' }); break;
    case 'price_desc': sort.push({ price: 'desc' }); break;
    case 'year_asc': sort.push({ year: 'asc' }); break;
    case 'year_desc': sort.push({ year: 'desc' }); break;
    case 'oldest': sort.push({ createdAt: 'asc' }); break;
    case 'relevance': if (q) { sort.push({ _score: 'desc' }); } else { sort.push({ createdAt: 'desc' }); } break;
    default: sort.push({ createdAt: 'desc' });
  }

  const from = (page - 1) * limit;

  const result = await esClient.search({
    index: LISTING_INDEX_ALIAS,
    body: {
      from,
      size: limit,
      query: {
        bool: {
          must,
          filter,
        },
      },
      sort,
      // Aggregations for filter counts (SRS 15.3)
      aggs: {
        categories: {
          terms: { field: 'categoryName', size: 50 },
        },
        brands: {
          terms: { field: 'brand.keyword', size: 50 },
        },
        countries: {
          terms: { field: 'country.keyword', size: 50 },
        },
        conditions: {
          terms: { field: 'condition', size: 5 },
        },
        fuelTypes: {
          terms: { field: 'fuelType', size: 20 },
        },
        transmissions: {
          terms: { field: 'transmission', size: 10 },
        },
        emissionClasses: {
          terms: { field: 'emissionClass', size: 10 },
        },
        priceStats: {
          stats: { field: 'price' },
        },
        yearStats: {
          stats: { field: 'year' },
        },
      },
    },
  });

  const hits = result.hits.hits.map((hit: any) => ({
    ...hit._source,
    _score: hit._score,
  }));

  const total = typeof result.hits.total === 'number'
    ? result.hits.total
    : result.hits.total?.value || 0;

  return {
    listings: hits,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    aggregations: result.aggregations,
  };
}

// ==========================================
// AUTOCOMPLETE & SUGGESTIONS (SRS 15.3)
// ==========================================

export async function getSearchSuggestions(query: string, limit: number = 8) {
  const result = await esClient.search({
    index: LISTING_INDEX_ALIAS,
    body: {
      size: 0,
      query: {
        bool: {
          must: [{ term: { status: 'ACTIVE' } }],
          should: [
            { match: { 'title.autocomplete': { query, boost: 3 } } },
            { match: { 'brand.autocomplete': { query, boost: 2 } } },
            { match: { 'model.autocomplete': { query, boost: 2 } } },
          ],
          minimum_should_match: 1,
        },
      },
      aggs: {
        title_suggestions: {
          terms: { field: 'title.keyword', size: limit },
        },
        brand_suggestions: {
          terms: { field: 'brand.keyword', size: 5 },
        },
        model_suggestions: {
          terms: { field: 'model.keyword', size: 5 },
        },
        category_suggestions: {
          terms: { field: 'categoryName', size: 5 },
        },
      },
    },
  });

  const aggs = result.aggregations as any;

  return {
    titles: aggs?.title_suggestions?.buckets?.map((b: any) => ({ text: b.key, count: b.doc_count })) || [],
    brands: aggs?.brand_suggestions?.buckets?.map((b: any) => ({ text: b.key, count: b.doc_count })) || [],
    models: aggs?.model_suggestions?.buckets?.map((b: any) => ({ text: b.key, count: b.doc_count })) || [],
    categories: aggs?.category_suggestions?.buckets?.map((b: any) => ({ text: b.key, count: b.doc_count })) || [],
  };
}

// ==========================================
// AGGREGATIONS (SRS 15.3)
// ==========================================

export async function getFilterAggregations(categorySlug?: string) {
  const filter: any[] = [{ term: { status: 'ACTIVE' } }];
  if (categorySlug) filter.push({ term: { categorySlug } });

  const result = await esClient.search({
    index: LISTING_INDEX_ALIAS,
    body: {
      size: 0,
      query: { bool: { filter } },
      aggs: {
        categories: { terms: { field: 'categoryName', size: 50 } },
        brands: { terms: { field: 'brand.keyword', size: 100 } },
        countries: { terms: { field: 'country.keyword', size: 50 } },
        conditions: { terms: { field: 'condition', size: 5 } },
        fuelTypes: { terms: { field: 'fuelType', size: 20 } },
        transmissions: { terms: { field: 'transmission', size: 10 } },
        emissionClasses: { terms: { field: 'emissionClass', size: 10 } },
        priceRanges: {
          range: {
            field: 'price',
            ranges: [
              { key: 'Under €5,000', to: 5000 },
              { key: '€5,000 - €15,000', from: 5000, to: 15000 },
              { key: '€15,000 - €30,000', from: 15000, to: 30000 },
              { key: '€30,000 - €50,000', from: 30000, to: 50000 },
              { key: '€50,000 - €100,000', from: 50000, to: 100000 },
              { key: 'Over €100,000', from: 100000 },
            ],
          },
        },
        yearRanges: {
          range: {
            field: 'year',
            ranges: [
              { key: '2020+', from: 2020 },
              { key: '2015-2019', from: 2015, to: 2020 },
              { key: '2010-2014', from: 2010, to: 2015 },
              { key: 'Before 2010', to: 2010 },
            ],
          },
        },
      },
    },
  });

  return result.aggregations;
}

// ==========================================
// HELPERS
// ==========================================

function transformListingToDoc(listing: any) {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    slug: listing.slug,
    price: Number(listing.price),
    currency: listing.currency,
    condition: listing.condition,
    status: listing.status,
    isFeatured: listing.isFeatured,
    views: listing.views,
    brand: listing.brand,
    model: listing.model,
    year: listing.year,
    mileage: listing.mileage,
    fuelType: listing.fuelType,
    transmission: listing.transmission,
    power: listing.power,
    emissionClass: listing.emissionClass,
    axles: listing.axles,
    weight: listing.weight ? Number(listing.weight) : null,
    color: listing.color,
    city: listing.city,
    country: listing.country,
    location: listing.latitude && listing.longitude
      ? { lat: listing.latitude, lon: listing.longitude }
      : null,
    categoryId: listing.categoryId,
    categoryName: listing.category?.name,
    categorySlug: listing.category?.slug,
    sellerId: listing.sellerId,
    sellerName: listing.seller?.name,
    companyName: listing.seller?.companyName,
    thumbnailUrl: listing.images?.[0]?.thumbnailUrl || listing.images?.[0]?.url,
    specifications: listing.specifications?.map((s: any) => ({ key: s.key, value: s.value })),
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

export { esClient, LISTING_INDEX_ALIAS };
