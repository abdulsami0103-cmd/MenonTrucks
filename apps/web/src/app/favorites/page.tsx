'use client';

import { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { ListingGrid } from '@/components/listings/listing-grid';
import { Pagination } from '@/components/listings/pagination';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }

      const res = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFavorites(data.favorites || []);
      setPagination(data.pagination || pagination);
    } catch {
      // not logged in
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background-light min-h-screen">
        <div className="container-main py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 bg-gray-200 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light min-h-screen">
      <div className="container-main py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" /> My Favorites
            </h1>
            <p className="text-text-secondary mt-1">{pagination.total} saved listings</p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <Heart className="w-16 h-16 text-text-secondary/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No favorites yet</h3>
            <p className="text-text-secondary mb-6">Save listings you like by clicking the heart icon</p>
            <Link href="/">
              <Button variant="accent">Browse Listings</Button>
            </Link>
          </div>
        ) : (
          <>
            <ListingGrid listings={favorites} />
            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} total={pagination.total} />
          </>
        )}
      </div>
    </div>
  );
}
