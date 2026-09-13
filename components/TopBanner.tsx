'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storeContext';
import { Sparkles, X, ArrowRight } from 'lucide-react';

export const TopBanner = () => {
  const { settings, setCurrentView, setSelectedCategoryFilter } = useStore();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!settings.topBannerEnabled || isDismissed) return null;

  return (
    <div className="bg-slate-900 text-slate-100 text-xs sm:text-sm font-medium py-2.5 px-4 relative z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center overflow-hidden">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
          <span className="truncate">{settings.topBannerText}</span>
          <button
            onClick={() => {
              setCurrentView('shop');
              setSelectedCategoryFilter(null);
            }}
            className="hidden md:inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 ml-1 cursor-pointer transition-colors"
          >
            Profiter des offres <ArrowRight className="w-3 h-3" />
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
