import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, MapPin, Phone, MessageCircle, Globe, Mail, ChevronRight, Calendar } from 'lucide-react';
import { ListingGrid } from '@/components/listings/listing-grid';
import { Pagination } from '@/components/listings/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';

interface SellerPageProps {
  params: { slug: string };
  searchParams: Record<string, string>;
}

async function getSellerProfile(id: string) {
  try {
    return await apiClient<any>(`/sellers/${id}`);
  } catch {
    return null;
  }
}

async function getSellerListings(sellerId: string, searchParams: Record<string, string>) {
  try {
    const params = new URLSearchParams({ sellerId, ...searchParams, status: 'ACTIVE' });
    return await apiClient<any>(`/listings?${params.toString()}`);
  } catch {
    return { listings: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
}

export async function generateMetadata({ params }: SellerPageProps): Promise<Metadata> {
  const data = await getSellerProfile(params.slug);
  const seller = data?.seller;
  const name = seller?.companyName || seller?.name || 'Seller';

  return {
    title: `${name} - Dealer Profile`,
    description: `Browse all vehicles for sale by ${name} on MenonTrucks. Verified dealer on Europe's growing vehicle marketplace.`,
  };
}

export default async function SellerPage({ params, searchParams }: SellerPageProps) {
  const [sellerData, listingsData] = await Promise.all([
    getSellerProfile(params.slug),
    getSellerListings(params.slug, searchParams),
  ]);

  const seller = sellerData?.seller;
  const { listings, pagination } = listingsData;

  if (!seller) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Seller Not Found</h1>
        <p className="text-text-secondary mb-6">This seller profile doesn&apos;t exist.</p>
        <Link href="/">
          <Button variant="primary">Browse Listings</Button>
        </Link>
      </div>
    );
  }

  const location = [seller.city, seller.country].filter(Boolean).join(', ');
  const whatsappUrl = seller.whatsapp
    ? `https://wa.me/${seller.whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <div className="bg-background-light min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="container-main py-3">
          <nav className="flex items-center gap-2 text-sm text-text-secondary">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-primary font-medium">{seller.companyName || seller.name}</span>
          </nav>
        </div>
      </div>

      {/* Seller Header */}
      <div className="bg-primary text-white">
        <div className="container-main py-10">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Building2 className="w-10 h-10 text-accent" />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                {seller.companyName || seller.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-300">
                {location && (
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {location}</span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Member since {new Date(seller.createdAt).getFullYear()}
                </span>
                {seller.isVerified && <Badge variant="success">Verified</Badge>}
              </div>
              {seller.companyDesc && (
                <p className="mt-4 text-gray-300 max-w-2xl">{seller.companyDesc}</p>
              )}
            </div>

            {/* Contact Actions */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {seller.phone && (
                <a href={`tel:${seller.phone}`}>
                  <Button variant="accent" className="gap-2">
                    <Phone className="w-4 h-4" /> Call
                  </Button>
                </a>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2 bg-green-600 hover:bg-green-700">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </Button>
                </a>
              )}
              {seller.email && (
                <a href={`mailto:${seller.email}`}>
                  <Button variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                    <Mail className="w-4 h-4" /> Email
                  </Button>
                </a>
              )}
              {seller.website && (
                <a href={seller.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                    <Globe className="w-4 h-4" /> Website
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="container-main py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">
            All Listings ({pagination.total})
          </h2>
          <select className="px-3 py-2 rounded-lg border border-border text-sm">
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        <ListingGrid listings={listings} emptyMessage="No active listings from this seller" />
        <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} total={pagination.total} />
      </div>
    </div>
  );
}
