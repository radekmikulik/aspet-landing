'use client';
import React from 'react';
import type { Offer } from '@/lib/offers.storage';
import Link from "next/link";

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

function getMainImage(o: Offer): string {
  if (Array.isArray(o.img)) {
    const heroIndex = o.heroIndex ?? 0;
    return o.img[heroIndex] || o.img[0];
  }
  return o.img;
}

export function VipCard({ o }: { o: Offer }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-[#DDE6E1] bg-white shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <img src={getMainImage(o)} alt={o.title} className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="p-4 space-y-2">
        {(o.discount || o.promo) && (
          <span className="inline-block rounded-none bg-[#7F9B8E]/92 text-white text-[11px] font-semibold px-3 py-1 ring-1 ring-black/15">
            {o.discount || o.promo}
          </span>
        )}
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">{o.title}</h3>
          <span className="inline-flex items-center rounded bg-[#E7EFEA] px-2 py-0.5 text[10px] font-semibold text-[#2F4B40] ring-1 ring-[#C8D6CF]">VIP</span>
          {!o.vip && isNew(o) && (
            <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text[10px] font-semibold text-blue-700 ring-1 ring-blue-200">
              NEW
            </span>
          )}
        </div>
        <p className="text-sm text-gray-700 line-clamp-2 md:line-clamp-3">{o.description}</p>
        <div className="text-sm text-gray-600">{o.provider} • {o.city}</div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {o.oldPrice && <span className="text-sm text-gray-400 line-through">{o.oldPrice}</span>}
            <span className="text-base font-semibold text-blue-900">{o.newPrice || o.price}</span>
          </div>
          <Link href={`/offer/${o.id}`} className="rounded-md border border-[#C8D6CF] bg-white px-3 py-1.5 text-sm text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F4B40]">
            Detail
          </Link>
        </div>
      </div>
    </article>
  );
}

export function StdCard({ o }: { o: Offer }) {
  return (
    <article className="group overflow-hidden rounded-md border border-[#DDE6E1] bg-white shadow-md h-full flex flex-col transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      <img src={getMainImage(o)} alt={o.title} className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="p-3 space-y-2">
        {(o.discount || o.promo) && (
          <span className="inline-block rounded-none bg-[#7F9B8E]/92 text-white text-[10px] font-semibold px-2.5 py-0.5 ring-1 ring-black/15">
            {o.discount || o.promo}
          </span>
        )}
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{o.title}</h3>
          {!o.vip && isNew(o) && (
            <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-200">
              NEW
            </span>
          )}
        </div>
        <p className="text-xs text-gray-700 line-clamp-1 md:line-clamp-2">{o.description}</p>
        <div className="text-xs text-gray-600">{o.provider} • {o.city}</div>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {o.oldPrice && <span className="text-xs text-gray-400 line-through">{o.oldPrice}</span>}
            <span className="text-sm font-semibold text-blue-900">{o.newPrice || o.price}</span>
          </div>
          <Link href={`/offer/${o.id}`} className="rounded border border-[#C8D6CF] bg-white px-2 py-1 text-xs text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F4B40]">
            Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
