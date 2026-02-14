'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  slug: string;
  price: string;
  status: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  views: number;
  isFeatured: boolean;
  createdAt: string;
  seller: { id: string; name: string; companyName: string | null; email: string };
  category: { name: string };
  images: { url: string }[];
}

export default function AdminListingsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, [pagination.page, statusFilter]);

  const fetchListings = async (searchQuery?: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({ page: String(pagination.page), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery ?? search) params.set('search', searchQuery ?? search);

      const res = await fetch(`/api/admin/listings?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setListings(data.listings || []);
      setPagination(data.pagination || pagination);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchListings(search);
  };

  const moderateListing = async (listingId: string, action: 'approve' | 'reject') => {
    setActionLoading(listingId);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/admin/listings/${listingId}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId ? { ...l, status: action === 'approve' ? 'ACTIVE' : 'REJECTED' } : l
        )
      );
    } catch {
      // error
    } finally {
      setActionLoading(null);
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing permanently?')) return;
    setActionLoading(listingId);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch {
      // error
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: any }> = {
      ACTIVE: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      PENDING: { color: 'bg-amber-100 text-amber-700', icon: Clock },
      REJECTED: { color: 'bg-red-100 text-red-700', icon: XCircle },
      DRAFT: { color: 'bg-gray-100 text-gray-600', icon: Package },
      SOLD: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      EXPIRED: { color: 'bg-gray-100 text-gray-500', icon: AlertCircle },
    };
    const conf = map[status] || map.DRAFT;
    const Icon = conf.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${conf.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Package className="w-6 h-6" /> Listing Moderation
        </h1>
        <p className="text-text-secondary mt-1">{pagination.total} listings total</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, brand, seller..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <Button type="submit" variant="accent" size="sm">Search</Button>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="REJECTED">Rejected</option>
            <option value="DRAFT">Draft</option>
            <option value="SOLD">Sold</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">No listings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Listing</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary hidden md:table-cell">Seller</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary hidden lg:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary hidden md:table-cell">Views</th>
                  <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {listing.images?.[0] ? (
                            <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-text-primary truncate max-w-[200px]">{listing.title}</p>
                          <p className="text-xs text-text-secondary">
                            {[listing.brand, listing.model, listing.year].filter(Boolean).join(' ') || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-text-primary text-xs truncate max-w-[150px]">
                        {listing.seller.companyName || listing.seller.name}
                      </p>
                      <p className="text-xs text-text-secondary truncate">{listing.seller.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-text-secondary text-xs">
                      {listing.category.name}
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">
                      &euro;{Number(listing.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {statusBadge(listing.status)}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-text-secondary">
                      {listing.views}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/listing/${listing.slug}`} target="_blank">
                          <button className="p-1.5 rounded-lg text-text-secondary hover:bg-gray-100" title="View">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </Link>
                        {listing.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => moderateListing(listing.id, 'approve')}
                              disabled={actionLoading === listing.id}
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-30"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moderateListing(listing.id, 'reject')}
                              disabled={actionLoading === listing.id}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteListing(listing.id)}
                          disabled={actionLoading === listing.id}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-text-secondary">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
