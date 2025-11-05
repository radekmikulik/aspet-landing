'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';

type Offer = {
  id: string;
  title: string;
  city?: string;
  priceFrom?: number;
  category?: string;
  isVip?: boolean;
  discountPct?: number;
  createdAt?: string | number;
  images?: string[];
};

const PANELS = [
  { key: 'beauty', label: 'Krása a pohoda' },
  { key: 'gastro', label: 'Gastro' },
  { key: 'ubytovani', label: 'Ubytování' },
  { key: 'realita', label: 'Realita' },
  { key: 'remesla', label: 'Řemesla' },
];

function isNew(o: Offer) {
  if (!o.createdAt) return false;
  const ms = typeof o.createdAt === 'string' ? Date.parse(o.createdAt) : o.createdAt;
  const now = Date.now();
  const windowHrs = (o.category === 'realita' || o.category === 'remesla') ? 72 : 24;
  return now - ms < windowHrs * 3600 * 1000;
}

function Card(o: Offer) {
  return (
    <Link
      key={o.id}
      href={`/offer/${o.id}`}
      className="block rounded-xl border border-[#D2DED8] bg-white shadow-sm overflow-hidden"
    >
      <div className="aspect-[16/9] bg-[#E9F0EC] flex items-center justify-center text-[#2F4B40]">ASPETi</div>
      <div className="px-3 pt-2 pb-3">
        <div className="font-semibold text-[#0B1F2A]">{o.title}</div>
        <div className="text-sm text-gray-600">
          {o.city ? o.city : ''}{o.priceFrom ? ` • od ${o.priceFrom} Kč` : ''}
        </div>
        {/* badges under image (no overlays) */}
        <div className="mt-2 flex items-center gap-2">
          {o.discountPct ? (
            <span className="text-xs rounded ring-1 ring-[#C8D6CF] bg-[#E7EFEA] text-[#2F4B40] px-2 py-1">
              Sleva {o.discountPct}%
            </span>
          ) : null}
          {isNew(o) ? (
            <span className="text-xs rounded ring-1 ring-[#C8D6CF] bg-[#E7EFEA] text-[#2F4B40] px-2 py-1">
              NEW
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export default function App() {
  // UI stav filtru (žádný router, žádné window)
  const [searchQuery, setSearchQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [addrQuery, setAddrQuery] = useState(''); // jen vizuálně; v demu se nerozhoduje
  const [type, setType] = useState<'vše' | 'beauty' | 'gastro' | 'ubytovani' | 'realita' | 'remesla'>('vše');
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [sort, setSort] = useState<'doporučené' | 'nejnovější' | 'nejlevnější'>('doporučené');
  const [pin, setPin] = useState<{ lat?: number; lng?: number }>({});

  // Mock data for demo
  const offers: Offer[] = [
    {
      id: '1',
      title: 'Masáž a spa procedury',
      city: 'Praha',
      priceFrom: 899,
      category: 'beauty',
      isVip: true,
      discountPct: 20,
      createdAt: Date.now() - 12 * 3600 * 1000,
    },
    {
      id: '2',
      title: 'Restaurace U Green',
      city: 'Brno',
      priceFrom: 350,
      category: 'gastro',
      isVip: false,
      createdAt: Date.now() - 48 * 3600 * 1000,
    },
    {
      id: '3',
      title: 'Hotel Prague Center',
      city: 'Praha',
      priceFrom: 2500,
      category: 'ubytovani',
      isVip: true,
      discountPct: 15,
      createdAt: Date.now() - 18 * 3600 * 1000,
    },
    {
      id: '4',
      title: 'Byt na prodej',
      city: 'Ostrava',
      priceFrom: 3500000,
      category: 'realita',
      isVip: false,
      createdAt: Date.now() - 96 * 3600 * 1000,
    },
    {
      id: '5',
      title: 'Truhlářské práce',
      city: 'České Budějovice',
      priceFrom: 500,
      category: 'remesla',
      isVip: false,
      createdAt: Date.now() - 8 * 3600 * 1000,
    },
  ];

  // Filtrování a řazení čistě v paměti (statický export-friendly)
  const filteredOffers = useMemo(() => {
    let list = [...offers];

    // kategorie
    if (type !== 'vše') {
      list = list.filter(o => o.category === type);
    }

    // hledání v názvu a městě
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        o =>
          o.title.toLowerCase().includes(q) ||
          (o.city ? o.city.toLowerCase().includes(q) : false),
      );
    }

    // město
    const cq = cityQuery.trim().toLowerCase();
    if (cq) {
      list = list.filter(o => (o.city ? o.city.toLowerCase().includes(cq) : false));
    }

    // adresa (demo: jen vizuálně – filtr neděláme)
    // radiusKm (demo: jen vizuálně – filtr neděláme)

    // řazení
    if (sort === 'nejnovější') {
      list.sort((a, b) => (b.createdAt ? +b.createdAt : 0) - (a.createdAt ? +a.createdAt : 0));
    } else if (sort === 'nejlevnější') {
      list.sort((a, b) => (a.priceFrom ?? Infinity) - (b.priceFrom ?? Infinity));
    } else {
      // doporučené: VIP se slevou první, pak ostatní
      list.sort((a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0));
    }

    return list;
  }, [offers, type, searchQuery, cityQuery, addrQuery, radiusKm, sort]);

  const vip = filteredOffers
    .filter(o => o.isVip)
    .sort((a, b) => (b.discountPct || 0) - (a.discountPct || 0));
  const standard = filteredOffers.filter(o => !o.isVip);
  const foundCount = filteredOffers.length;

  return (
    <main className="bg-[#F5F7F6] text-gray-900">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="mt-6 sm:mt-8" />

        {/* Category Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PANELS.map(p => (
            <Link
              key={p.key}
              href={`/#offers`}
              onClick={() => setType(p.key as typeof type)}
              className="group block rounded-2xl shadow-sm ring-1 ring-[#D2DED8] bg-white overflow-hidden"
            >
              <div className="aspect-[16/9] bg-[#E9F0EC] flex items-center justify-center text-[#2F4B40] font-medium opacity-70">
                ASPETi
              </div>
              <div className="relative">
                <div className="absolute inset-x-0 -bottom-1"></div>
                <div className="bg-[#CAD8D0]/80 text-[#2F4B40] text-sm font-semibold text-center px-2 py-1 rounded-b-md">
                  {p.label}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4" />

        {/* Sticky Filter */}
        <div className="sticky top-[56px] z-30 bg-[#F5F7F6] pt-3 pb-2">
          {/* chip row */}
          <div className="flex items-center gap-3 text-sm px-1">
            <button className="h-7 px-3 py-1 rounded-md border border-[#C8D6CF] bg-white shadow-sm">Filtr</button>
            <span className="h-7 rounded-full bg-white border border-[#D2DED8] px-3 py-1 flex items-center">Nalezeno: {foundCount}</span>
            <span className="h-7 rounded-full bg-white border border-[#D2DED8] px-3 py-1 flex items-center">Radius: {radiusKm} km</span>
          </div>
          {/* inputs row */}
          <div className="mt-2 grid grid-cols-12 gap-2">
            <input
              placeholder="Hledat…"
              className="h-7 col-span-12 sm:col-span-3 rounded-md border border-[#D2DED8] px-3 py-2 bg-white text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <input
              placeholder="Město"
              className="h-7 col-span-6 sm:col-span-2 rounded-md border border-[#D2DED8] px-3 py-2 bg-white text-sm"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
            />
            <input
              placeholder="Adresa"
              className="h-7 col-span-6 sm:col-span-3 rounded-md border border-[#D2DED8] px-3 py-2 bg-white text-sm"
              value={addrQuery}
              onChange={(e) => setAddrQuery(e.target.value)}
            />
            <select
              className="h-7 col-span-4 sm:col-span-1 rounded-md border border-[#D2DED8] px-2 py-2 bg-white text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
            >
              <option value="vše">vše</option>
              <option value="beauty">beauty</option>
              <option value="gastro">gastro</option>
              <option value="ubytovani">ubytování</option>
              <option value="realita">realita</option>
              <option value="remesla">řemesla</option>
            </select>
            <select
              className="h-7 col-span-4 sm:col-span-1 rounded-md border border-[#D2DED8] px-2 py-2 bg-white text-sm"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
            >
              {[1, 2, 3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n} km</option>)}
            </select>
            <select
              className="h-7 col-span-4 sm:col-span-1 rounded-md border border-[#D2DED8] px-2 py-2 bg-white text-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
            >
              <option value="doporučené">doporučené</option>
              <option value="nejnovější">nejnovější</option>
              <option value="nejlevnější">nejlevnější</option>
            </select>
            <button
              className="h-7 col-span-12 sm:col-span-1 rounded-md border border-[#C8D6CF] bg-white shadow-sm text-sm"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setPin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                  });
                }
              }}
              title={pin.lat ? `Pin: ${pin.lat?.toFixed(4)}, ${pin.lng?.toFixed(4)}` : 'Pin podle polohy'}
            >
              Pin
            </button>
          </div>
        </div>

        <div className="mt-4" />

        {/* Offers Feed */}
        <div id="offers" className="space-y-8">
          {/* VIP */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[#0B1F2A]">VIP nabídky</h2>
              <span className="text-sm text-gray-600">Nalezeno: {vip.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vip.length ? vip.map(Card) : <div className="text-sm text-gray-600">Žádné VIP nabídky pro zadaný filtr.</div>}
            </div>
          </section>

          {/* Standard */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[#0B1F2A]">Aktuální nabídky</h2>
              <span className="text-sm text-gray-600">Nalezeno: {standard.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {standard.length ? standard.map(Card) : <div className="text-sm text-gray-600">Nic jsme nenašli</div>}
            </div>
          </section>

          {/* Celkový počet */}
          <div className="text-center py-4 border-t border-[#E0E8E3]">
            <span className="text-sm font-medium text-gray-700">Celkem nalezeno: {foundCount} nabídek</span>
          </div>
        </div>

        <div className="mb-10" />
      </div>
    </main>
  );
}
