// components/AccountTopbar.tsx
"use client";

import Link from "next/link";

export default function AccountTopbar() {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-[#E0E8E3]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-900 hover:opacity-80"
            aria-label="Zpět na hlavní stránku"
          >
            ◀ Domů
          </Link>
          <span className="hidden sm:inline text-xs text-gray-600">
            • poskytovatelský účet
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/account/settings"
            className="rounded-md border border-[#C8D6CF] bg-white px-2.5 py-1 text-xs text-blue-900 hover:bg-[#E7EFEA]"
          >
            Nastavení
          </Link>
        </div>
      </div>
    </header>
  );
}