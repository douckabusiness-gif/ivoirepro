'use client';

import React from 'react';
import { ArrowRight, Sparkles, Award } from 'lucide-react';

interface DubaiDuoBannersProps {
  onSelectCategory: (category: string) => void;
}

export const DubaiDuoBanners: React.FC<DubaiDuoBannersProps> = ({ onSelectCategory }) => {
  const handleBannerClick = (cat: string) => {
    onSelectCategory(cat);
    const catalogEl = document.getElementById('dubai-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-6 sm:py-8 bg-slate-950">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        
        {/* Jumia-Style 2-Column Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
          
          {/* Banner 1: Parfums & Ouds */}
          <div
            onClick={() => handleBannerClick('parfum')}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col justify-between min-h-[190px] sm:min-h-[220px] shadow-xl hover:border-amber-400 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            {/* Background Image Accent */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-center opacity-35 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700 pointer-events-none"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80')"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
            </div>

            <div className="relative z-10 space-y-2 max-w-sm">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                <Sparkles className="w-3 h-3 text-amber-400" /> Parfumerie Royale Dubaï
              </span>
              <h3 className="text-base sm:text-xl font-black text-white leading-tight">
                Lattafa, Khamrah & Asad <br />
                <span className="text-amber-400 font-bold">À prix direct grossiste DXB</span>
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                Fragrances orientales puissantes, sillages durables 48h et packaging royal.
              </p>
            </div>

            <div className="relative z-10 pt-3 flex items-center gap-2 text-xs font-black text-amber-400 group-hover:text-amber-300 transition">
              <span>Commander vos parfums</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Banner 2: Montres & Or 24K */}
          <div
            onClick={() => handleBannerClick('montre')}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-950 p-6 sm:p-8 flex flex-col justify-between min-h-[190px] sm:min-h-[220px] shadow-xl hover:border-amber-400 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            {/* Background Image Accent */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-center opacity-35 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700 pointer-events-none"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80')"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
            </div>

            <div className="relative z-10 space-y-2 max-w-sm">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                <Award className="w-3 h-3 text-amber-400" /> Gold Souk de Deira
              </span>
              <h3 className="text-base sm:text-xl font-black text-white leading-tight">
                Montres Automatiques & Or 24K <br />
                <span className="text-amber-400 font-bold">Précision & Finition Horlogère</span>
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                Cadrans squelette dorés, parures complètes et écrins de luxe pour cérémonies.
              </p>
            </div>

            <div className="relative z-10 pt-3 flex items-center gap-2 text-xs font-black text-amber-400 group-hover:text-amber-300 transition">
              <span>Voir la collection Horlogerie</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
