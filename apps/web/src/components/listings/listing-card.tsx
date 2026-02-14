import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Calendar, Gauge, Fuel } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatNumber } from '@/lib/utils';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    slug: string;
    price: number;
    currency: string;
    condition: string;
    brand?: string;
    model?: string;
    year?: number;
    mileage?: number;
    fuelType?: string;
    city?: string;
    country?: string;
    isFeatured: boolean;
    images: { url: string; thumbnailUrl?: string; altText?: string }[];
    category: { name: string; slug: string };
    seller: { name: string; companyName?: string };
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.images[0]?.thumbnailUrl || listing.images[0]?.url || '/placeholder-vehicle.jpg';
  const location = [listing.city, listing.country].filter(Boolean).join(', ');

  return (
    <Link
      href={`/listing/${listing.slug}`}
      className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-200 group block ${
        listing.isFeatured ? 'border-accent/40 ring-1 ring-accent/20 shadow-sm' : 'border-border'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {listing.isFeatured && (
            <Badge variant="accent" className="shadow-sm">Featured</Badge>
          )}
          <Badge variant="default" className="shadow-sm">{listing.category.name}</Badge>
        </div>

        {/* Favorite */}
        <button
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm"
          onClick={(e) => { e.preventDefault(); }}
        >
          <Heart className="w-4 h-4 text-text-secondary hover:text-red-500" />
        </button>

        {/* Condition */}
        <div className="absolute bottom-3 left-3">
          <Badge variant={listing.condition === 'NEW' ? 'success' : 'outline'} className="shadow-sm">
            {listing.condition}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-text-primary text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {listing.title}
        </h3>

        {/* Price */}
        <div className="text-lg font-bold text-accent mb-3">
          {formatPrice(listing.price, listing.currency)}
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-secondary mb-3">
          {listing.year && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {listing.year}
            </span>
          )}
          {listing.mileage != null && (
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              {formatNumber(listing.mileage)} km
            </span>
          )}
          {listing.fuelType && (
            <span className="flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5" />
              {listing.fuelType}
            </span>
          )}
        </div>

        {/* Location & Seller */}
        <div className="flex items-center justify-between text-xs text-text-secondary pt-3 border-t border-border">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </span>
          )}
          <span className="truncate ml-2">{listing.seller.companyName || listing.seller.name}</span>
        </div>
      </div>
    </Link>
  );
}
