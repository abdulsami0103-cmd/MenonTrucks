'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, TrendingUp, Clock, Tag, Truck } from 'lucide-react';

interface Suggestion {
  text: string;
  count: number;
}

interface SuggestionsData {
  titles: Suggestion[];
  brands: Suggestion[];
  models: Suggestion[];
  categories: Suggestion[];
}

interface SearchBarProps {
  defaultValue?: string;
  size?: 'md' | 'lg';
  showSuggestions?: boolean;
  className?: string;
}

export function SearchBar({ defaultValue = '', size = 'md', showSuggestions = true, className = '' }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<SuggestionsData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions(null);
      setIsOpen(false);
      return;
    }

    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.suggestions);
      setIsOpen(true);
    } catch {
      setSuggestions(null);
    }
  }, []);

  useEffect(() => {
    if (!showSuggestions) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions, showSuggestions]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query;
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allItems = getAllSuggestionItems();

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && allItems[activeIndex]) {
        handleSearch(allItems[activeIndex].text);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getAllSuggestionItems = (): Suggestion[] => {
    if (!suggestions) return [];
    return [
      ...suggestions.brands,
      ...suggestions.models,
      ...suggestions.categories,
      ...suggestions.titles.slice(0, 5),
    ];
  };

  const isLg = size === 'lg';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className={`absolute left-3 text-text-secondary/50 ${isLg ? 'w-5 h-5' : 'w-4 h-4'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions) setIsOpen(true); }}
          placeholder="Search trucks, trailers, brands..."
          className={`w-full bg-white border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
            isLg ? 'pl-11 pr-20 py-3.5 text-base' : 'pl-10 pr-16 py-2.5 text-sm'
          }`}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSuggestions(null); setIsOpen(false); inputRef.current?.focus(); }}
            className="absolute right-12 p-1 text-text-secondary hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => handleSearch()}
          className={`absolute right-1.5 bg-accent hover:bg-accent-500 text-white font-medium rounded-md transition-colors ${
            isLg ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'
          }`}
        >
          Search
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {suggestions.brands.length > 0 && (
            <SuggestionSection
              title="Brands"
              icon={<Truck className="w-3.5 h-3.5" />}
              items={suggestions.brands}
              activeIndex={activeIndex}
              startIndex={0}
              onSelect={(text) => handleSearch(text)}
            />
          )}
          {suggestions.models.length > 0 && (
            <SuggestionSection
              title="Models"
              icon={<Tag className="w-3.5 h-3.5" />}
              items={suggestions.models}
              activeIndex={activeIndex}
              startIndex={suggestions.brands.length}
              onSelect={(text) => handleSearch(text)}
            />
          )}
          {suggestions.categories.length > 0 && (
            <SuggestionSection
              title="Categories"
              icon={<TrendingUp className="w-3.5 h-3.5" />}
              items={suggestions.categories}
              activeIndex={activeIndex}
              startIndex={suggestions.brands.length + suggestions.models.length}
              onSelect={(text) => handleSearch(text)}
            />
          )}
          {suggestions.titles.length > 0 && (
            <SuggestionSection
              title="Listings"
              icon={<Clock className="w-3.5 h-3.5" />}
              items={suggestions.titles.slice(0, 5)}
              activeIndex={activeIndex}
              startIndex={suggestions.brands.length + suggestions.models.length + suggestions.categories.length}
              onSelect={(text) => handleSearch(text)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionSection({
  title,
  icon,
  items,
  activeIndex,
  startIndex,
  onSelect,
}: {
  title: string;
  icon: React.ReactNode;
  items: Suggestion[];
  activeIndex: number;
  startIndex: number;
  onSelect: (text: string) => void;
}) {
  return (
    <div className="border-b border-border last:border-0">
      <div className="px-4 py-2 text-xs text-text-secondary font-medium uppercase tracking-wider bg-background-light flex items-center gap-1.5">
        {icon} {title}
      </div>
      {items.map((item, i) => (
        <button
          key={`${title}-${item.text}`}
          onClick={() => onSelect(item.text)}
          className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${
            startIndex + i === activeIndex ? 'bg-accent/5 text-accent' : 'text-text-primary'
          }`}
        >
          <span>{item.text}</span>
          <span className="text-xs text-text-secondary/60">{item.count}</span>
        </button>
      ))}
    </div>
  );
}
