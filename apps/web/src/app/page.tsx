import Link from 'next/link';
import { Truck, Container, Tractor, Wrench, CarFront, Bus } from 'lucide-react';
import { SearchBar } from '@/components/search/search-bar';

const categories = [
  { name: 'Trucks', slug: 'trucks', icon: Truck, count: '15,000+' },
  { name: 'Semi Trailers', slug: 'semi-trailers', icon: Container, count: '8,000+' },
  { name: 'Construction', slug: 'construction-machinery', icon: Wrench, count: '5,000+' },
  { name: 'Agricultural', slug: 'agricultural-machinery', icon: Tractor, count: '3,000+' },
  { name: 'Vans & Buses', slug: 'vans-lcv-buses', icon: Bus, count: '4,000+' },
  { name: 'Cars', slug: 'cars-campers', icon: CarFront, count: '6,000+' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary text-white">
        <div className="container-main py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Find Your Perfect
            <span className="text-accent"> Vehicle</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
            Europe&apos;s growing marketplace for trucks, trailers, construction machinery,
            and commercial vehicles. 150,000+ listings worldwide.
          </p>

          {/* Search Bar with Autocomplete */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-2xl max-w-4xl">
            <SearchBar size="lg" />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container-main py-16">
        <h2 className="text-3xl font-bold text-text-primary mb-8">
          Browse Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow border border-border group"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <Icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="font-semibold text-text-primary text-sm">{category.name}</h3>
                <p className="text-xs text-text-secondary mt-1">{category.count} ads</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-white py-16">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent">150K+</div>
              <div className="text-gray-300 mt-1">Listings</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent">180+</div>
              <div className="text-gray-300 mt-1">Countries</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent">1,700+</div>
              <div className="text-gray-300 mt-1">Sellers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent">44+</div>
              <div className="text-gray-300 mt-1">Categories</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
