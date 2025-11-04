'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cityFallback } from '@/lib/geo';

interface ActiveFilter {
  type: 'query' | 'city' | 'address' | 'category' | 'radius_km' | 'sort';
  label: string;
  value: string;
  key: string;
}

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Form state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [address, setAddress] = useState(searchParams.get('address') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [radiusKm, setRadiusKm] = useState(searchParams.get('radius_km') || '5');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [foundCount, setFoundCount] = useState(0);

  // Get unique cities for suggestions
  const citySuggestions = Object.keys(cityFallback).filter(cityName =>
    cityName.toLowerCase().includes(city.toLowerCase())
  ).slice(0, 5);

  // Update URL when filters change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    
    if (query) params.set('q', query);
    if (city) params.set('city', city);
    if (address) params.set('address', address);
    if (category !== 'all') params.set('category', category);
    if (radiusKm !== '5') params.set('radius_km', radiusKm);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    
    const newUrl = `/?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [query, city, address, category, radiusKm, sortBy, router]);

  // Auto-update URL when form values change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateUrl();
    }, 300); // Debounce
    
    return () => clearTimeout(timeoutId);
  }, [query, city, address, category, radiusKm, sortBy, updateUrl]);

  // Listen for offers count updates from OffersFeed
  useEffect(() => {
    const handleOffersFilterUpdate = (event: CustomEvent) => {
      setFoundCount(event.detail.foundCount);
    };

    window.addEventListener('offersFilterUpdate', handleOffersFilterUpdate as EventListener);
    return () => {
      window.removeEventListener('offersFilterUpdate', handleOffersFilterUpdate as EventListener);
    };
  }, []);

  // Get active filters for chips display
  const activeFilters: ActiveFilter[] = [];
  if (query) activeFilters.push({ type: 'query', label: 'Hledat', value: query, key: 'q' });
  if (city) activeFilters.push({ type: 'city', label: 'Město', value: city, key: 'city' });
  if (address) activeFilters.push({ type: 'address', label: 'Adresa', value: address, key: 'address' });
  if (category !== 'all') activeFilters.push({ type: 'category', label: 'Kategorie', value: category, key: 'category' });
  if (radiusKm !== '5') activeFilters.push({ type: 'radius_km', label: 'Radius', value: `${radiusKm}km`, key: 'radius_km' });
  if (sortBy !== 'relevance') activeFilters.push({ type: 'sort', label: 'Řazení', value: sortBy, key: 'sort' });

  const removeFilter = (filterKey: string) => {
    switch (filterKey) {
      case 'q': setQuery(''); break;
      case 'city': setCity(''); break;
      case 'address': setAddress(''); break;
      case 'category': setCategory('all'); break;
      case 'radius_km': setRadiusKm('5'); break;
      case 'sort': setSortBy('relevance'); break;
    }
  };

  const clearAllFilters = () => {
    setQuery('');
    setCity('');
    setAddress('');
    setCategory('all');
    setRadiusKm('5');
    setSortBy('relevance');
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Simple reverse geocoding - in real app you'd use a proper service
          const { latitude, longitude } = position.coords;
          // For demo, use nearest known city
          let nearestCity = '';
          let nearestDist = Number.POSITIVE_INFINITY;
          
          Object.entries(cityFallback).forEach(([name, coords]) => {
            const dist = Math.sqrt((coords.lat - latitude) ** 2 + (coords.lng - longitude) ** 2);
            if (dist < nearestDist) {
              nearestDist = dist;
              nearestCity = name;
            }
          });
          
          setCity(nearestCity);
        },
        (error) => {
          console.warn('Geolocation failed:', error);
        }
      );
    }
  };

  return (
    <div className="sticky top-16 z-40 bg-[#F5F7F6] border-y border-[#D2DED8]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Chips Row */}
        <div className="flex items-center gap-2 py-2 border-b border-[#D2DED8]/30">
          <button className="px-3 py-1 text-sm font-medium text-[#2F4B40] border border-[#C8D6CF] rounded-md hover:bg-[#D2DED8] transition-colors">
            Filtr
          </button>
          <div className="bg-[#2F4B40] text-white px-2 py-1 rounded-full text-xs font-medium">
            Nalezeno: {foundCount}
          </div>
          <div className="bg-[#D2DED8] text-[#2F4B40] px-2 py-1 rounded-full text-xs font-medium">
            Radius: {radiusKm} km
          </div>
          {activeFilters.map((filter) => (
            <div
              key={filter.key}
              className="inline-flex items-center gap-1 bg-[#D2DED8] text-[#2F4B40] px-2 py-1 rounded-full text-xs"
            >
              <span>{filter.value}</span>
              <button
                onClick={() => removeFilter(filter.key)}
                className="hover:text-[#1F3B30] transition-colors"
              >
                ×
              </button>
            </div>
          ))}
          {activeFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#2F4B40] hover:underline ml-1"
            >
              Vymazat
            </button>
          )}
        </div>

        {/* Inputs Row */}
        <div className="flex items-center h-7 gap-3 py-2">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Hledat..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-[120px] px-2 h-7 border border-[#C8D6CF] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#2F4B40] focus:border-transparent"
          />

          {/* City Input */}
          <div className="relative min-w-[80px]">
            <input
              type="text"
              placeholder="Město"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setShowCitySuggestions(true);
              }}
              onFocus={() => setShowCitySuggestions(true)}
              onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
              className="w-full px-2 h-7 border border-[#C8D6CF] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#2F4B40] focus:border-transparent"
            />
            {showCitySuggestions && citySuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#C8D6CF] rounded-md shadow-lg z-50">
                {citySuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setCity(suggestion);
                      setShowCitySuggestions(false);
                    }}
                    className="block w-full text-left px-2 py-1 text-xs hover:bg-[#F5F7F6] first:rounded-t-md last:rounded-b-md"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Address Input */}
          <input
            type="text"
            placeholder="Adresa"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="min-w-[100px] px-2 h-7 border border-[#C8D6CF] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#2F4B40] focus:border-transparent"
          />

          {/* Category Select */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="min-w-[120px] px-2 h-7 border border-[#C8D6CF] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#2F4B40] focus:border-transparent"
          >
            <option value="all">Všechny nabídky</option>
            <option value="beauty">Krása a pohoda</option>
            <option value="gastro">Gastro</option>
            <option value="ubytovani">Ubytování</option>
            <option value="reality">Realita</option>
            <option value="remesla">Řemesla</option>
          </select>

          {/* Radius Select */}
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(e.target.value)}
            className="min-w-[70px] px-2 h-7 border border-[#C8D6CF] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#2F4B40] focus:border-transparent"
          >
            <option value="1">1 km</option>
            <option value="2">2 km</option>
            <option value="3">3 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="15">15 km</option>
            <option value="20">20 km</option>
          </select>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="min-w-[100px] px-2 h-7 border border-[#C8D6CF] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#2F4B40] focus:border-transparent"
          >
            <option value="relevance">Doporučené</option>
            <option value="priceAsc">Nejnižší cena</option>
            <option value="discount">Nejvyšší sleva</option>
          </select>

          {/* Pin Button */}
          <button
            onClick={handleGeolocation}
            className="w-7 h-7 border border-[#C8D6CF] rounded-md text-xs hover:bg-[#D2DED8] transition-colors flex items-center justify-center"
            title="Použít moji polohu"
          >
            📍
          </button>
        </div>
      </div>
    </div>
  );
}