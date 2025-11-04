// components/SiteHeader.tsx
"use client";

import Link from "next/link";

export default function SiteHeader() {
  const handleOffersClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const offersSection = document.getElementById('offers');
    if (offersSection) {
      offersSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#D2DED8] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-xl font-bold text-[#2F4B40] hover:opacity-80 transition-opacity"
          >
            ASPETi
          </Link>

          {/* Navigation Menu */}
          <nav className="flex items-center space-x-6">
            <a
              href="/#offers"
              onClick={handleOffersClick}
              className="text-sm font-medium text-gray-700 hover:text-[#2F4B40] transition-colors"
            >
              Nabídky
            </a>
            <Link
              href="/providers"
              className="text-sm font-medium text-gray-700 hover:text-[#2F4B40] transition-colors"
            >
              Poskytovatelé
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-700 hover:text-[#2F4B40] transition-colors"
            >
              O projektu
            </Link>
            <Link
              href="/account/offers"
              className="text-sm font-medium text-gray-700 hover:text-[#2F4B40] transition-colors"
            >
              Můj účet
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-700 hover:text-[#2F4B40] transition-colors"
            >
              Přihlásit se
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm font-medium text-white bg-[#2F4B40] hover:bg-[#1F3B30] rounded-xl transition-colors shadow-sm"
            >
              Registrovat
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
