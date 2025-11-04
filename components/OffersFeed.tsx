'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { mockOffers } from '@/data/mockOffers';
import { OffersStorage, type Offer } from '@/lib/offers.storage';
import { haversine, cityFallback, type LatLng } from '@/lib/geo';
import { VipCard, StdCard } from '@/components/OfferCards';

function parsePrice(v?: string) {
  if (!v) return Number.POSITIVE_INFINITY;
  const m = String(v).replace(/[^0-9]/g, '');
  return m ? parseInt(m, 10) : Number.POSITIVE_INFINITY;
}
function parseDiscount(v?: string) {
  if (!v) return 0;
  const s = String(v);
  const num = parseInt(s.replace(/[^0-9]/g, ''), 10);
  if (!num && num !== 0) return 0;
  return /%/.test(s) ? num * 100 : num;
}
function daysSince(dateStr?: string) {
  if (!dateStr) return 9999;
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return 9999;
  return Math.max(0, (Date.now() - t) / (1000*60*60*24));
}

function isNew(o: Offer) {
  const k = o.category;
  const winDays = (k === "reality" || k === "remesla") ? 3 : 1;
  return daysSince(o.publishedAt || o.createdAt) <= winDays;
}

export default function OffersFeed() {
  const search = useSearchParams();
  const [sortBy, setSortBy] = useState<'relevance'|'priceAsc'|'discount'>('relevance');
  const [localOffers, setLocalOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const q = (search.get('q') || '').trim().toLowerCase();
  const category = (search.get('category') || 'all').trim();
  const address = (search.get('address') || '').trim();
  const radiusKm = parseInt((search.get('radius_km') || '').trim(), 10);

  const addrCoords: LatLng | null = useMemo(() => {
    if (!address) return null;
    const key = Object.keys(cityFallback).find(k => k.toLowerCase() === address.toLowerCase());
    return key ? cityFallback[key] : null;
  }, [address]);

  // Load offers from localStorage or fallback to mock data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const allOffers = OffersStorage.getAll();
        // Filter only PUBLISHED offers for the feed
        const publishedOffers = allOffers.filter(o => o.status === 'published');
        setLocalOffers(publishedOffers);
      } catch (error) {
        console.warn('Failed to load from localStorage, using mock data:', error);
        // Fallback to mock data if localStorage fails
        const mockPublished = mockOffers.map(o => ({ 
          ...o, 
          status: 'published' as const,
          category: 'beauty' as const,
          createdAt: new Date().toISOString(),
          audienceMode: 'PUBLIC' as const,
          audienceTags: [],
          audienceClientIds: []
        }));
        setLocalOffers(mockPublished);
      }
    } else {
      // Server-side fallback
      const mockPublished = mockOffers.map(o => ({ 
        ...o, 
        status: 'published' as const,
        category: 'beauty' as const,
        createdAt: new Date().toISOString(),
        audienceMode: 'PUBLIC' as const,
        audienceTags: [],
        audienceClientIds: []
      }));
      setLocalOffers(mockPublished);
    }
    setLoading(false);
  }, []);

  const derived: Offer[] = useMemo(() => {
    const copy = localOffers.map(o => ({ ...o }));
    const std = copy.filter(o => !o.vip);
    std.sort((a,b) => (b.clicks || 0) - (a.clicks || 0));
    const nTop = Math.min(6, Math.max(1, Math.round(std.length * 0.2)));
    std.slice(0, nTop).forEach(o => { o.top = true; });
    return copy;
  }, [localOffers]);

  const filtered = useMemo(() => {
    const byCat = category === 'all' ? derived : derived.filter(o => o.category === category);
    const byQuery = q ? byCat.filter(o =>
      o.title.toLowerCase().includes(q) ||
      (o.provider || '').toLowerCase().includes(q) ||
      (o.city || '').toLowerCase().includes(q)
    ) : byCat;

    if (address && radiusKm && addrCoords) {
      return byQuery.filter(o => {
        if (!o.coords) return false;
        const d = haversine(addrCoords, o.coords);
        return d <= radiusKm;
      });
    }
    return byQuery;
  }, [derived, category, q, address, radiusKm, addrCoords]);

  const vip = filtered.filter(o => o.vip);
  const std = filtered.filter(o => !o.vip);

  const vipSorted = useMemo(() => {
    const arr = [...vip];
    arr.sort((a,b) => {
      const d = parseDiscount(b.discount || b.promo) - parseDiscount(a.discount || a.promo);
      if (d !== 0) return d;
      return daysSince(a.publishedAt || a.createdAt) - daysSince(b.publishedAt || b.createdAt);
    });
    return arr;
  }, [vip]);

  const stdSorted = useMemo(() => {
    const arr = [...std];
    if (sortBy === 'priceAsc') {
      arr.sort((a,b) => parsePrice(a.newPrice || a.price) - parsePrice(b.newPrice || b.price));
    } else if (sortBy === 'discount') {
      arr.sort((a,b) => parseDiscount(b.discount || b.promo) - parseDiscount(a.discount || a.promo));
    }
    return arr;
  }, [std, sortBy]);

  const foundCount = vipSorted.length + stdSorted.length;

  // Expose foundCount for FilterBar via custom event
  useEffect(() => {
    const event = new CustomEvent('offersFilterUpdate', { 
      detail: { foundCount, vipCount: vipSorted.length, stdCount: stdSorted.length }
    });
    window.dispatchEvent(event);
  }, [foundCount, vipSorted.length, stdSorted.length]);

  if (loading) {
    return (
      <section id="offers" className="mt-8">
        <div className="text-center py-8">
          <div className="text-blue-900">Načítám nabídky…</div>
        </div>
      </section>
    );
  }

  return (
    <section id="offers" className="mt-8">
      {/* VIP */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-blue-900">VIP nabídky</h2>
        <span className="text-xs text-gray-500">{vipSorted.length} v aktuálním filtru</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {vipSorted.slice(0, 2).map(o => <VipCard key={o.id} o={o} />)}
        {vipSorted.length === 0 && (
          <div className="text-sm text-gray-500">Žádné VIP nabídky pro zadaný filtr.</div>
        )}
      </div>

      {/* STD */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-3 gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-blue-900">Aktuální nabídky</h2>
            <span className="text-xs text-gray-500">Nalezeno: {foundCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 hidden sm:block">Seřadit:</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="rounded-md border border-sageBrd2 px-2 py-1 text-xs focus:outline-none"
            >
              <option value="relevance">Doporučené</option>
              <option value="priceAsc">Nejnižší cena</option>
              <option value="discount">Nejvyšší sleva</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stdSorted.map(o => <StdCard key={o.id} o={o} />)}
          {stdSorted.length === 0 && (
            <div className="rounded-md border border-sageBrd1 bg-white p-5 text-center text-sm text-gray-700">
              <h3 className="text-base font-semibold text-blue-900 mb-1">Nic jsme nenašli</h3>
              <p className="mb-3">Zkuste upravit filtr: rozšiřte lokalitu, zvolte širší kategorii nebo upravte hledaný text.</p>
              <ul className="mx-auto inline-block list-disc list-inside text-left text-gray-700 mb-2">
                <li>Odeberte přísnou podmínku</li>
                <li>Zvolte &bdquo;Všechny nabídky&ldquo;</li>
                <li>Vyzkoušejte jiné klíčové slovo</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
