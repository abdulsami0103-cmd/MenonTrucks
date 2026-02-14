import { prisma } from '@menon/db';
import {
  indexListing,
  updateListingIndex,
  deleteListingIndex,
  bulkIndexListings,
  createListingIndex,
} from './elasticsearch.service';
import { invalidateListingCache } from './redis.service';

// ==========================================
// REAL-TIME SYNC (SRS 15.1)
// Index on create, update, delete
// ==========================================

export async function syncListingToES(listingId: string): Promise<void> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      category: true,
      seller: { select: { name: true, companyName: true } },
      images: { take: 1, orderBy: { order: 'asc' } },
      specifications: true,
    },
  });

  if (!listing) return;

  await indexListing(listing);
  await invalidateListingCache(listing.slug, listing.categoryId);
}

export async function syncListingUpdateToES(listingId: string, updates: any): Promise<void> {
  await updateListingIndex(listingId, updates);

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { slug: true, categoryId: true },
  });

  if (listing) {
    await invalidateListingCache(listing.slug, listing.categoryId);
  }
}

export async function syncListingDeleteFromES(listingId: string, slug: string, categoryId: string): Promise<void> {
  await deleteListingIndex(listingId);
  await invalidateListingCache(slug, categoryId);
}

// ==========================================
// BULK RE-INDEX (SRS 15.1)
// For data migrations
// ==========================================

export async function reindexAllListings(): Promise<void> {
  console.log('Starting full re-index...');

  await createListingIndex();

  const batchSize = 500;
  let skip = 0;
  let total = 0;

  while (true) {
    const listings = await prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      include: {
        category: true,
        seller: { select: { name: true, companyName: true } },
        images: { take: 1, orderBy: { order: 'asc' } },
        specifications: true,
      },
      skip,
      take: batchSize,
    });

    if (listings.length === 0) break;

    await bulkIndexListings(listings);
    total += listings.length;
    skip += batchSize;

    console.log(`Re-indexed ${total} listings...`);
  }

  console.log(`✅ Full re-index complete: ${total} listings`);
}
