'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface Category {
  key: string;
  title: string;
}

const categories: Category[] = [
  { key: 'beauty', title: 'Krása a pohoda' },
  { key: 'gastro', title: 'Gastro' },
  { key: 'ubytovani', title: 'Ubytování' },
  { key: 'reality', title: 'Realita' },
  { key: 'remesla', title: 'Řemesla' }
];

export default function CategoryPanels() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategorySelect = useCallback((categoryKey: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set('category', categoryKey);
    
    // Smooth scroll to offers section
    const offersSection = document.getElementById('offers');
    if (offersSection) {
      offersSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update URL with category parameter
    router.push(`/?${currentParams.toString()}`, { scroll: false });
  }, [router, searchParams]);

  return (
    <section className="py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => handleCategorySelect(category.key)}
            className="group relative rounded-xl ring-1 ring-[#D2DED8] bg-white/70 hover:shadow-sm transition-all duration-200 overflow-hidden h-[180px] md:h-[220px]"
          >
            {/* ASPETi text in center */}
            <div className="absolute inset-0 grid place-content-center">
              <div className="text-[#CAD8D0] text-xl tracking-wide">
                ASPETi
              </div>
            </div>
            
            {/* Translucent sage strip at bottom */}
            <div className="absolute left-0 right-0 bottom-1 px-2 py-1 text-center rounded-b-lg" style={{backgroundColor: 'rgba(202, 216, 208, 0.8)'}}>
              <div className="text-sm font-semibold text-[#2F4B40] text-center">
                {category.title}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
