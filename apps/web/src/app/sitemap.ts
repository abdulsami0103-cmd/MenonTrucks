import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://menontrucks.com';

async function fetchSlugs(endpoint: string): Promise<string[]> {
  try {
    const res = await fetch(`${process.env.API_URL || 'http://localhost:5001/api'}${endpoint}`);
    const data = await res.json();
    return data.listings?.map((l: any) => l.slug) || data.categories?.map((c: any) => c.slug) || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Category pages
  const categorySlugs = await fetchSlugs('/categories');
  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${BASE_URL}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Listing pages (latest 1000)
  const listingSlugs = await fetchSlugs('/listings?limit=1000&status=ACTIVE');
  const listingPages: MetadataRoute.Sitemap = listingSlugs.map((slug) => ({
    url: `${BASE_URL}/listing/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...listingPages];
}
