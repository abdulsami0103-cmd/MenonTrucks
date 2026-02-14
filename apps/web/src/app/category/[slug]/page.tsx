import { Metadata } from 'next';
import { Suspense } from 'react';
import { ListingGrid } from '@/components/listings/listing-grid';
import { FiltersSidebar } from '@/components/listings/filters-sidebar';
import { Pagination } from '@/components/listings/pagination';
import { apiClient } from '@/lib/api';
import { ChevronRight, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';

interface CategoryPageProps {
  params: { slug: string };
  searchParams: Record<string, string>;
}

async function getCategory(slug: string) {
  try {
    return await apiClient<any>(`/categories/${slug}`);
  } catch {
    return null;
  }
}

async function getCategories() {
  try {
    return await apiClient<any>('/categories');
  } catch {
    return { categories: [] };
  }
}

async function getListings(categoryId: string, searchParams: Record<string, string>) {
  try {
    const params = new URLSearchParams({ categoryId, ...searchParams });
    return await apiClient<any>(`/listings?${params.toString()}`);
  } catch {
    return { listings: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const data = await getCategory(params.slug);
  const name = data?.category?.name || 'Category';

  return {
    title: `${name} for Sale - Buy ${name} Online`,
    description: `Browse ${name} for sale on MenonTrucks. Find the best deals on used and new ${name.toLowerCase()} from verified sellers across Europe.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [categoryData, categoriesData] = await Promise.all([
    getCategory(params.slug),
    getCategories(),
  ]);

  const category = categoryData?.category;
  const allCategories = categoriesData?.categories || [];

  // Build subcategory list for filter
  const subcategories = category?.children || [];
  const filterCategories = subcategories.length > 0
    ? subcategories
    : allCategories.flatMap((c: any) => c.children || []);

  // Get listings
  const listingsData = category
    ? await getListings(category.id, searchParams)
    : { listings: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };

  const { listings, pagination } = listingsData;

  return (
    <div className="bg-background-light min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="container-main py-3">
          <nav className="flex items-center gap-2 text-sm text-text-secondary">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            {category?.parent && (
              <>
                <Link href={`/category/${category.parent.slug}`} className="hover:text-primary">
                  {category.parent.name}
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
            <span className="text-text-primary font-medium">{category?.name || 'Category'}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container-main py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                {category?.name || 'Listings'}
              </h1>
              <p className="text-text-secondary mt-1">
                {pagination.total.toLocaleString()} vehicles found
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <select
                className="px-3 py-2 rounded-lg border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                defaultValue={searchParams.sortBy || 'newest'}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="year_desc">Year: Newest</option>
                <option value="year_asc">Year: Oldest</option>
              </select>
            </div>
          </div>

          {/* Subcategories pills */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {subcategories.map((sub: any) => (
                <Link
                  key={sub.slug}
                  href={`/category/${sub.slug}`}
                  className="px-4 py-1.5 rounded-full border border-border text-sm text-text-secondary hover:border-accent hover:text-accent transition-colors"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container-main py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Suspense fallback={<div className="w-72 animate-pulse bg-white rounded-xl h-96" />}>
            <FiltersSidebar
              categories={filterCategories}
              currentCategory={params.slug}
            />
          </Suspense>

          <div className="flex-1">
            <ListingGrid listings={listings} emptyMessage="No vehicles found in this category" />
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
