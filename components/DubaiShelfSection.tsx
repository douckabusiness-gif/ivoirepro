'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { ChevronRight, Sparkles } from 'lucide-react';

interface DubaiShelfSectionProps {
  title: string;
  subtitle?: string;
  icon: string;
  categoryKey: string;
  badgeText?: string;
  products: Product[];
  onViewAll: (categoryKey: string) => void;
}

export const DubaiShelfSection: React.FC<DubaiShelfSectionProps> = ({
  title,
  subtitle,
  icon,
  categoryKey,
  badgeText,
  products,
  onViewAll
}) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-5 sm:py-7 bg-slate-950">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        
        {/* Jumia-Style Section Shelf Container */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xl space-y-3 sm:space-y-4">
          
          {/* Jumia-Style Shelf Header Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="text-xl sm:text-2xl p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                {icon}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base md:text-lg font-black text-white">
                    {title}
                  </h3>
                  {badgeText && (
                    <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {badgeText}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* "VOIR PLUS >" Right Link (Jumia Style) */}
            <button
              type="button"
              onClick={() => onViewAll(categoryKey)}
              className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1 transition shrink-0 cursor-pointer"
            >
              <span>Voir tout</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Product Grid (3 cards per row on mobile, 4-6 on desktop) */}
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-4">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
