'use client';

import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusBadge: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'outline'> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  DRAFT: 'outline',
  SOLD: 'default',
  EXPIRED: 'danger',
  REJECTED: 'danger',
};

export default function MyListingsPage() {
  // In production, this would fetch from API
  const listings: any[] = [];

  return (
    <div className="bg-background-light min-h-screen">
      <div className="container-main py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">My Listings</h1>
          <Link href="/dashboard/listings/new">
            <Button variant="accent" className="gap-2">
              <Plus className="w-4 h-4" /> New Listing
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['All', 'Active', 'Pending', 'Draft', 'Sold', 'Expired'].map((tab) => (
            <button
              key={tab}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border border-border text-text-secondary hover:border-primary hover:text-primary transition-colors first:bg-primary first:text-white first:border-primary"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Listings Table */}
        {listings.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <p className="text-text-secondary mb-4">You haven&apos;t created any listings yet</p>
            <Link href="/dashboard/listings/new">
              <Button variant="accent" className="gap-2">
                <Plus className="w-4 h-4" /> Create Your First Listing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-background-light">
                <tr className="text-left text-xs text-text-secondary uppercase tracking-wider">
                  <th className="px-5 py-3">Listing</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Views</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listings.map((listing: any) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-sm text-text-primary">{listing.title}</p>
                      <p className="text-xs text-text-secondary">{listing.category?.name}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-accent">
                      {listing.price} {listing.currency}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={statusBadge[listing.status] || 'outline'}>{listing.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-text-secondary">{listing.views}</td>
                    <td className="px-5 py-4 text-sm text-text-secondary">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/listing/${listing.slug}`}>
                          <button className="p-1.5 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-text-secondary" /></button>
                        </Link>
                        <Link href={`/dashboard/listings/${listing.id}/edit`}>
                          <button className="p-1.5 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-text-secondary" /></button>
                        </Link>
                        <button className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
