import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Heart, Share2, Eye, Calendar, Gauge, Fuel, Cog, Weight, Palette, Shield, Hash } from 'lucide-react';
import { ImageGallery } from '@/components/listings/image-gallery';
import { ContactSeller } from '@/components/listings/contact-seller';
import { ListingGrid } from '@/components/listings/listing-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { formatPrice, formatNumber } from '@/lib/utils';

interface ListingPageProps {
  params: { slug: string };
}

async function getListing(slug: string) {
  try {
    return await apiClient<any>(`/listings/${slug}`);
  } catch {
    return null;
  }
}

async function getRelatedListings(categoryId: string, excludeId: string) {
  try {
    const data = await apiClient<any>(`/listings?categoryId=${categoryId}&limit=4`);
    return data.listings?.filter((l: any) => l.id !== excludeId) || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const data = await getListing(params.slug);
  const listing = data?.listing;

  if (!listing) return { title: 'Listing Not Found' };

  const title = `${listing.title} - ${formatPrice(Number(listing.price), listing.currency)}`;
  const description = `${listing.condition} ${listing.brand || ''} ${listing.model || ''} ${listing.year || ''} for sale. ${listing.description?.substring(0, 150) || ''}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: listing.images?.[0]?.url ? [listing.images[0].url] : [],
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const data = await getListing(params.slug);
  const listing = data?.listing;

  if (!listing) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Listing Not Found</h1>
        <p className="text-text-secondary mb-6">The listing you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/">
          <Button variant="primary">Browse Listings</Button>
        </Link>
      </div>
    );
  }

  const relatedListings = await getRelatedListings(listing.categoryId, listing.id);
  const location = [listing.city, listing.country].filter(Boolean).join(', ');

  // Build specs table
  const specs = [
    { icon: Calendar, label: 'Year', value: listing.year },
    { icon: Gauge, label: 'Mileage', value: listing.mileage ? `${formatNumber(listing.mileage)} km` : null },
    { icon: Fuel, label: 'Fuel Type', value: listing.fuelType },
    { icon: Cog, label: 'Transmission', value: listing.transmission },
    { icon: Shield, label: 'Emission Class', value: listing.emissionClass },
    { icon: Weight, label: 'Weight', value: listing.weight ? `${formatNumber(Number(listing.weight))} kg` : null },
    { icon: Hash, label: 'Axles', value: listing.axles },
    { icon: Palette, label: 'Color', value: listing.color },
    { icon: Hash, label: 'Power', value: listing.power },
    { icon: Hash, label: 'VIN', value: listing.vin },
  ].filter((s) => s.value);

  return (
    <div className="bg-background-light min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="container-main py-3">
          <nav className="flex items-center gap-2 text-sm text-text-secondary overflow-x-auto">
            <Link href="/" className="hover:text-primary shrink-0">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link href={`/category/${listing.category.slug}`} className="hover:text-primary shrink-0">
              {listing.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-text-primary font-medium truncate">{listing.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left - Main Content */}
          <div className="flex-1 space-y-6">
            {/* Image Gallery */}
            <ImageGallery images={listing.images || []} title={listing.title} />

            {/* Title & Price (Mobile) */}
            <div className="lg:hidden bg-white rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex gap-2 mb-2">
                    <Badge>{listing.category.name}</Badge>
                    <Badge variant={listing.condition === 'NEW' ? 'success' : 'outline'}>{listing.condition}</Badge>
                    {listing.isFeatured && <Badge variant="accent">Featured</Badge>}
                  </div>
                  <h1 className="text-xl font-bold text-text-primary">{listing.title}</h1>
                </div>
              </div>
              <div className="text-2xl font-bold text-accent mt-3">
                {formatPrice(Number(listing.price), listing.currency)}
              </div>
            </div>

            {/* Title & Price (Desktop) */}
            <div className="hidden lg:block bg-white rounded-xl border border-border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex gap-2 mb-3">
                    <Badge>{listing.category.name}</Badge>
                    <Badge variant={listing.condition === 'NEW' ? 'success' : 'outline'}>{listing.condition}</Badge>
                    {listing.isFeatured && <Badge variant="accent">Featured</Badge>}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{listing.title}</h1>
                  {location && (
                    <p className="text-text-secondary mt-2">{location}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-bold text-accent">
                    {formatPrice(Number(listing.price), listing.currency)}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <button className="p-2 rounded-lg border border-border hover:border-red-300 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg border border-border hover:border-primary hover:text-primary transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {listing.views} views</span>
                <span>Listed {new Date(listing.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Specifications */}
            {specs.length > 0 && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Specifications</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {specs.map((spec, i) => {
                    const Icon = spec.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 bg-background-light rounded-lg">
                        <Icon className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <p className="text-xs text-text-secondary">{spec.label}</p>
                          <p className="text-sm font-medium text-text-primary">{spec.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Specifications */}
            {listing.specifications?.length > 0 && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Additional Details</h2>
                <div className="grid grid-cols-2 gap-3">
                  {listing.specifications.map((spec: any) => (
                    <div key={spec.id} className="flex justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-text-secondary">{spec.label || spec.key}</span>
                      <span className="text-sm font-medium text-text-primary">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Description</h2>
                <div className="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap">
                  {listing.description}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Contact */}
          <div className="w-full lg:w-80 shrink-0">
            <ContactSeller seller={listing.seller} listingTitle={listing.title} />
          </div>
        </div>

        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-text-primary mb-6">Similar Listings</h2>
            <ListingGrid listings={relatedListings} />
          </div>
        )}
      </div>
    </div>
  );
}
