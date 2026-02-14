'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, BellOff, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, any>;
  emailAlert: boolean;
  createdAt: string;
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }

      const res = await fetch('/api/saved-searches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSearches(data.savedSearches || []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const toggleAlert = async (id: string, currentAlert: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/saved-searches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ emailAlert: !currentAlert }),
      });
      setSearches((prev) =>
        prev.map((s) => (s.id === id ? { ...s, emailAlert: !currentAlert } : s))
      );
    } catch {
      // error
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/saved-searches/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearches((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // error
    } finally {
      setDeletingId(null);
    }
  };

  const buildSearchUrl = (filters: Record<string, any>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    return `/search?${params.toString()}`;
  };

  const formatFilters = (filters: Record<string, any>) => {
    const labels: string[] = [];
    if (filters.category) labels.push(filters.category);
    if (filters.q) labels.push(`"${filters.q}"`);
    if (filters.minPrice || filters.maxPrice) {
      labels.push(`€${filters.minPrice || 0} - €${filters.maxPrice || '∞'}`);
    }
    if (filters.yearFrom || filters.yearTo) {
      labels.push(`${filters.yearFrom || '...'} - ${filters.yearTo || '...'}`);
    }
    if (filters.fuelType) labels.push(filters.fuelType);
    if (filters.transmission) labels.push(filters.transmission);
    if (filters.location) labels.push(filters.location);
    return labels.length > 0 ? labels : ['All listings'];
  };

  return (
    <div className="bg-background-light min-h-screen">
      <div className="container-main py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <Search className="w-6 h-6" /> Saved Searches
        </h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : searches.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <Search className="w-16 h-16 text-text-secondary/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No saved searches</h3>
            <p className="text-text-secondary mb-6">Save your search criteria to get notified about new listings</p>
            <Link href="/">
              <Button variant="accent">Start Searching</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden divide-y divide-border">
            {searches.map((search) => (
              <div key={search.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary text-sm">{search.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {formatFilters(search.filters).map((label, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full">
                        {label}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Saved {new Date(search.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={buildSearchUrl(search.filters)}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </Button>
                  </Link>
                  <button
                    onClick={() => toggleAlert(search.id, search.emailAlert)}
                    className={`p-2 rounded-lg transition-colors ${
                      search.emailAlert
                        ? 'bg-accent/10 text-accent hover:bg-accent/20'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                    title={search.emailAlert ? 'Disable email alerts' : 'Enable email alerts'}
                  >
                    {search.emailAlert ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(search.id)}
                    disabled={deletingId === search.id}
                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                    title="Delete saved search"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
