'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { FUEL_TYPES, TRANSMISSION_TYPES, EMISSION_CLASSES } from '@menon/shared';

interface FiltersSidebarProps {
  categories?: { id: string; name: string; slug: string }[];
  currentCategory?: string;
}

export function FiltersSidebar({ categories = [], currentCategory }: FiltersSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    year: true,
    condition: true,
    fuel: false,
    transmission: false,
    emission: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(currentCategory ? `/category/${currentCategory}` : '/listings');
  };

  const hasFilters = searchParams.toString().length > 0;

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-white rounded-xl border border-border p-5 sticky top-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </h3>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-accent hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Category */}
          {categories.length > 0 && (
            <FilterSection title="Category" isOpen={openSections.category} onToggle={() => toggleSection('category')}>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => router.push(`/category/${cat.slug}`)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                      currentCategory === cat.slug
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Price Range */}
          <FilterSection title="Price Range" isOpen={openSections.price} onToggle={() => toggleSection('price')}>
            <div className="flex gap-2">
              <Input
                placeholder="Min"
                type="number"
                defaultValue={searchParams.get('minPrice') || ''}
                onBlur={(e) => updateFilter('minPrice', e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Max"
                type="number"
                defaultValue={searchParams.get('maxPrice') || ''}
                onBlur={(e) => updateFilter('maxPrice', e.target.value)}
                className="text-sm"
              />
            </div>
          </FilterSection>

          {/* Year */}
          <FilterSection title="Year" isOpen={openSections.year} onToggle={() => toggleSection('year')}>
            <div className="flex gap-2">
              <Input
                placeholder="From"
                type="number"
                defaultValue={searchParams.get('minYear') || ''}
                onBlur={(e) => updateFilter('minYear', e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="To"
                type="number"
                defaultValue={searchParams.get('maxYear') || ''}
                onBlur={(e) => updateFilter('maxYear', e.target.value)}
                className="text-sm"
              />
            </div>
          </FilterSection>

          {/* Condition */}
          <FilterSection title="Condition" isOpen={openSections.condition} onToggle={() => toggleSection('condition')}>
            <div className="flex gap-2">
              {['NEW', 'USED'].map((cond) => (
                <button
                  key={cond}
                  onClick={() => updateFilter('condition', searchParams.get('condition') === cond ? '' : cond)}
                  className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${
                    searchParams.get('condition') === cond
                      ? 'border-accent bg-accent/10 text-accent-600 font-medium'
                      : 'border-border text-text-secondary hover:border-accent'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Fuel Type */}
          <FilterSection title="Fuel Type" isOpen={openSections.fuel} onToggle={() => toggleSection('fuel')}>
            <div className="space-y-1.5">
              {FUEL_TYPES.map((fuel) => (
                <button
                  key={fuel}
                  onClick={() => updateFilter('fuelType', searchParams.get('fuelType') === fuel ? '' : fuel)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                    searchParams.get('fuelType') === fuel
                      ? 'bg-accent/10 text-accent-600 font-medium'
                      : 'text-text-secondary hover:bg-gray-50'
                  }`}
                >
                  {fuel}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Transmission */}
          <FilterSection title="Transmission" isOpen={openSections.transmission} onToggle={() => toggleSection('transmission')}>
            <div className="space-y-1.5">
              {TRANSMISSION_TYPES.map((trans) => (
                <button
                  key={trans}
                  onClick={() => updateFilter('transmission', searchParams.get('transmission') === trans ? '' : trans)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                    searchParams.get('transmission') === trans
                      ? 'bg-accent/10 text-accent-600 font-medium'
                      : 'text-text-secondary hover:bg-gray-50'
                  }`}
                >
                  {trans}
                </button>
              ))}
            </div>
          </FilterSection>
        </div>
      </div>
    </aside>
  );
}

function FilterSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border pt-4">
      <button onClick={onToggle} className="flex items-center justify-between w-full mb-3">
        <span className="text-sm font-medium text-text-primary">{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
      </button>
      {isOpen && children}
    </div>
  );
}
