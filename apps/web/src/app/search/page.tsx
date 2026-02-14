import { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchBar } from '@/components/search/search-bar';
import { SearchFilters } from '@/components/search/search-filters';
import { ListingGrid } from '@/components/listings/listing-grid';
import { Pagination } from '@/components/listings/pagination';
import { apiClient } from '@/lib/api';
import { SlidersHorizontal } from 'lucide-react';

interface SearchPageProps {
  searchParams: Record<string, string>;
}

async function searchListings(params: Record<string, string>) {
  try {
    const queryString = new URLSearchParams(params).toString();
    return await apiClient<any>(`/search?${queryString}`);
  } catch {
    return {
      listings: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      aggregations: null,
    };
  }
}

async function getAggregations(categorySlug?: string) {
  try {
    const params = categorySlug ? `?categorySlug=${categorySlug}` : '';
    return await apiClient<any>(`/search/aggregations${params}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const q = searchParams.q || '';
  return {
    title: q ? `Search: ${q}` : 'Search Vehicles',
    description: `Search results for ${q || 'vehicles'} on MenonTrucks. Find trucks, trailers, construction machinery and more.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const [searchResult, aggregationsData] = await Promise.all([
    searchListings(searchParams),
    getAggregations(searchParams.categorySlug),
  ]);

  const { listings, pagination, aggregations } = searchResult;
  const filterAggs = aggregationsData || aggregations;

  return (
    <div className="bg-background-light min-h-screen">
      {/* Search Header */}
      <div className="bg-white border-b border-border">
        <div className="container-main py-6">
          <div className="max-w-2xl mx-auto mb-4">
            <SearchBar defaultValue={searchParams.q || ''} size="lg" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-text-secondary text-sm">
              {pagination.total > 0 ? (
                <>
                  <span className="font-semibold text-text-primary">{pagination.total.toLocaleString()}</span> results
                  {searchParams.q && <> for <span className="font-semibold text-text-primary">&quot;{searchParams.q}&quot;</span></>}
                </>
              ) : (
                'No results found'
              )}
            </p>
            <select
              className="px-3 py-2 rounded-lg border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              defaultValue={searchParams.sortBy || 'relevance'}
            >
              <option value="relevance">Most Relevant</option>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="year_desc">Year: Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-main py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar with Aggregation counts */}
          <Suspense fallback={<div className="w-72 animate-pulse bg-white rounded-xl h-96" />}>
            <SearchFilters aggregations={filterAggs} searchParams={searchParams} />
          </Suspense>

          {/* Results */}
          <div className="flex-1">
            {listings.length === 0 && searchParams.q ? (
              <div className="bg-white rounded-xl border border-border p-12 text-center">
                <SlidersHorizontal className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No results found</h3>
                <p className="text-text-secondary text-sm mb-4">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
                <div className="text-sm text-text-secondary space-y-1">
                  <p>Suggestions:</p>
                  <ul className="list-disc list-inside">
                    <li>Check your spelling</li>
                    <li>Try broader search terms</li>
                    <li>Remove some filters</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <ListingGrid listings={listings} />
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
