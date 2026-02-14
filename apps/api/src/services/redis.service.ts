import Redis from 'ioredis';
import { env } from '../config/env';
import crypto from 'crypto';

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 200, 2000),
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err.message));

// TTL values in seconds (SRS Section 16.1)
const TTL = {
  categories: 5 * 60,         // 5 minutes
  categoryListings: 5 * 60,   // 5 minutes
  search: 2 * 60,             // 2 minutes
  aggregations: 5 * 60,       // 5 minutes
  listingDetail: 10 * 60,     // 10 minutes
  sellerProfile: 15 * 60,     // 15 minutes
  homepageFeatured: 5 * 60,   // 5 minutes
} as const;

// ==========================================
// CACHE OPERATIONS
// ==========================================

// Normalized cache keys - sort params & hash to avoid key explosion (SRS 16.3)
function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sorted = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');

  const hash = crypto.createHash('md5').update(sorted).digest('hex').substring(0, 12);
  return `${prefix}:${hash}`;
}

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
}

export async function setCache(key: string, data: any, ttl: number): Promise<void> {
  await redis.set(key, JSON.stringify(data), 'EX', ttl);
}

// ==========================================
// CACHED ENDPOINTS (SRS 16.1)
// ==========================================

export async function getCachedCategories(): Promise<any | null> {
  return getCache('categories:all');
}

export async function setCachedCategories(data: any): Promise<void> {
  await setCache('categories:all', data, TTL.categories);
}

export async function getCachedSearch(params: Record<string, any>): Promise<any | null> {
  const key = generateCacheKey('search', params);
  return getCache(key);
}

export async function setCachedSearch(params: Record<string, any>, data: any): Promise<void> {
  const key = generateCacheKey('search', params);
  await setCache(key, data, TTL.search);
}

export async function getCachedAggregations(categorySlug?: string): Promise<any | null> {
  const key = categorySlug ? `aggs:${categorySlug}` : 'aggs:all';
  return getCache(key);
}

export async function setCachedAggregations(data: any, categorySlug?: string): Promise<void> {
  const key = categorySlug ? `aggs:${categorySlug}` : 'aggs:all';
  await setCache(key, data, TTL.aggregations);
}

export async function getCachedListing(slug: string): Promise<any | null> {
  return getCache(`listing:${slug}`);
}

export async function setCachedListing(slug: string, data: any): Promise<void> {
  await setCache(`listing:${slug}`, data, TTL.listingDetail);
}

export async function getCachedSeller(id: string): Promise<any | null> {
  return getCache(`seller:${id}`);
}

export async function setCachedSeller(id: string, data: any): Promise<void> {
  await setCache(`seller:${id}`, data, TTL.sellerProfile);
}

// ==========================================
// CACHE INVALIDATION (SRS 16.2)
// Pattern-based deletion for related keys
// ==========================================

export async function invalidateListingCache(listingSlug: string, categoryId?: string): Promise<void> {
  // Delete specific listing cache
  await redis.del(`listing:${listingSlug}`);

  // Pattern-based deletion for search caches
  const searchKeys = await redis.keys('search:*');
  if (searchKeys.length > 0) {
    await redis.del(...searchKeys);
  }

  // Invalidate aggregation caches
  const aggKeys = await redis.keys('aggs:*');
  if (aggKeys.length > 0) {
    await redis.del(...aggKeys);
  }

  // Invalidate category listings caches
  if (categoryId) {
    const catKeys = await redis.keys(`catlistings:${categoryId}:*`);
    if (catKeys.length > 0) {
      await redis.del(...catKeys);
    }
  }
}

export async function invalidateSellerCache(sellerId: string): Promise<void> {
  await redis.del(`seller:${sellerId}`);
}

export async function invalidateCategoryCache(): Promise<void> {
  await redis.del('categories:all');
}

export { redis, TTL, generateCacheKey };
