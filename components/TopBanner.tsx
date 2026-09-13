'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storeContext';
import { Sparkles, X, ArrowRight } from 'lucide-react';

export const TopBanner = () => {
  const { settings, setCurrentView, setSelectedCategoryFilter } = useStore();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!settings.topBannerEnabled || isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-slate-100 text-xs sm:text-[13px] font-medium py-2 px-4 relative z-40 border-b border-indigo-900/40 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center overflow-hidden">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse" />
          <span className="truncate tracking-wide text-white drop-shadow-xs">{settings.topBannerText}</span>
          <button
            onClick={() => {
              setCurrentView('shop');
              setSelectedCategoryFilter(null);
            }}
            className="hidden md:inline-flex items-center gap-1 font-bold text-amber-300 hover:text-white bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 px-2.5 py-0.5 rounded-full ml-1 cursor-pointer transition-all hover:scale-105 text-[11px]"
          >
            <span>Profiter des offres</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          aria-label="Fermer la bannière"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
