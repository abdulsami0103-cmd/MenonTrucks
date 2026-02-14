'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AggBucket {
  value: string;
  label: string;
  count: number;
}

interface AggregationsData {
  categories?: AggBucket[];
  brands?: AggBucket[];
  countries?: AggBucket[];
  conditions?: AggBucket[];
  fuelTypes?: AggBucket[];
  transmissions?: AggBucket[];
  emissionClasses?: AggBucket[];
  priceRanges?: AggBucket[];
  yearRanges?: AggBucket[];
}

interface SearchFiltersProps {
  aggregations: AggregationsData | null;
  searchParams: Record<string, string>;
}

export function SearchFilters({ aggregations, searchParams }: SearchFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    brands: true,
    price: true,
    year: true,
    condition: true,
    countries: false,
    fuel: false,
    transmission: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page');
    router.push(`/search?${newParams.toString()}`);
  };

  const clearFilters = () => {
    const q = params.get('q');
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  const activeFilters = Object.keys(searchParams).filter((k) => k !== 'q' && k !== 'page' && k !== 'limit' && k !== 'sortBy');

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-white rounded-xl border border-border p-5 sticky top-24">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </h3>
          {activeFilters.length > 0 && (
            <button onClick={clearFilters} className="text-xs text-accent hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear ({activeFilters.length})
            </button>
          )}
        </div>

        <div className="space-y-1">
          {/* Brands with counts - e.g., "Scania (42)" */}
          {aggregations?.brands && aggregations.brands.length > 0 && (
            <FilterSection title="Brand" isOpen={openSections.brands} onToggle={() => toggleSection('brands')}>
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                {aggregations.brands.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => updateFilter('brand', params.get('brand') === item.value ? '' : item.value)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors flex justify-between ${
                      params.get('brand') === item.value
                        ? 'bg-accent/10 text-accent-600 font-medium'
                        : 'text-text-secondary hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs opacity-60">({item.count})</span>
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Price Range */}
          <FilterSection title="Price" isOpen={openSections.price} onToggle={() => toggleSection('price')}>
            <div className="flex gap-2">
              <Input
                placeholder="Min €"
                type="number"
                defaultValue={params.get('minPrice') || ''}
                onBlur={(e) => updateFilter('minPrice', e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Max €"
                type="number"
                defaultValue={params.get('maxPrice') || ''}
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
                defaultValue={params.get('minYear') || ''}
                onBlur={(e) => updateFilter('minYear', e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="To"
                type="number"
                defaultValue={params.get('maxYear') || ''}
                onBlur={(e) => updateFilter('maxYear', e.target.value)}
                className="text-sm"
              />
            </div>
          </FilterSection>

          {/* Condition with counts */}
          {aggregations?.conditions && aggregations.conditions.length > 0 && (
            <FilterSection title="Condition" isOpen={openSections.condition} onToggle={() => toggleSection('condition')}>
              <div className="flex gap-2">
                {aggregations.conditions.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => updateFilter('condition', params.get('condition') === item.value ? '' : item.value)}
                    className={`flex-1 text-sm py-2 rounded-lg border transition-colors text-center ${
                      params.get('condition') === item.value
                        ? 'border-accent bg-accent/10 text-accent-600 font-medium'
                        : 'border-border text-text-secondary hover:border-accent'
                    }`}
                  >
                    {item.label} ({item.count})
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Countries with counts */}
          {aggregations?.countries && aggregations.countries.length > 0 && (
            <FilterSection title="Country" isOpen={openSections.countries} onToggle={() => toggleSection('countries')}>
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                {aggregations.countries.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => updateFilter('country', params.get('country') === item.value ? '' : item.value)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors flex justify-between ${
                      params.get('country') === item.value
                        ? 'bg-accent/10 text-accent-600 font-medium'
                        : 'text-text-secondary hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs opacity-60">({item.count})</span>
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Fuel Type */}
          {aggregations?.fuelTypes && aggregations.fuelTypes.length > 0 && (
            <FilterSection title="Fuel Type" isOpen={openSections.fuel} onToggle={() => toggleSection('fuel')}>
              <div className="space-y-0.5">
                {aggregations.fuelTypes.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => updateFilter('fuelType', params.get('fuelType') === item.value ? '' : item.value)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors flex justify-between ${
                      params.get('fuelType') === item.value
                        ? 'bg-accent/10 text-accent-600 font-medium'
                        : 'text-text-secondary hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs opacity-60">({item.count})</span>
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Transmission */}
          {aggregations?.transmissions && aggregations.transmissions.length > 0 && (
            <FilterSection title="Transmission" isOpen={openSections.transmission} onToggle={() => toggleSection('transmission')}>
              <div className="space-y-0.5">
                {aggregations.transmissions.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => updateFilter('transmission', params.get('transmission') === item.value ? '' : item.value)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors flex justify-between ${
                      params.get('transmission') === item.value
                        ? 'bg-accent/10 text-accent-600 font-medium'
                        : 'text-text-secondary hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs opacity-60">({item.count})</span>
                  </button>
                ))}
              </div>
            </FilterSection>
          )}
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
    <div className="border-t border-border pt-4 pb-1">
      <button onClick={onToggle} className="flex items-center justify-between w-full mb-3">
        <span className="text-sm font-medium text-text-primary">{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
      </button>
      {isOpen && children}
    </div>
  );
}
