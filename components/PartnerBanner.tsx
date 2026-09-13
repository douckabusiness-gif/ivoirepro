'use client';

import React from 'react';
import { useStore } from '@/lib/storeContext';
import { Sparkles, CheckCircle2, X, Store, ExternalLink } from 'lucide-react';

export const PartnerBanner = () => {
  const { activeReferral, clearActiveReferral, settings } = useStore();

  if (!activeReferral) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-indigo-600 text-white shadow-md text-xs relative z-40 animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {activeReferral.avatarUrl ? (
            <img
              src={activeReferral.avatarUrl}
              alt={activeReferral.name}
              className="w-7 h-7 rounded-full border border-white/40 object-cover shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30 font-bold">
              <Store className="w-3.5 h-3.5 text-white" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 truncate">
            <span className="font-extrabold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-300 shrink-0" />
              Vitrine Recommandée :
            </span>
            <span className="font-black bg-white/20 px-2 py-0.5 rounded-full text-white backdrop-blur-xs">
              {activeReferral.storeName || activeReferral.name}
            </span>
            <span className="hidden md:inline text-amber-100 text-[11px]">
              • Bénéficiez des offres exclusives et du service premium {settings.storeName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-[11px] bg-black/20 px-2.5 py-1 rounded-lg border border-white/10">
            <CheckCircle2 className="w-3 h-3 text-emerald-300" />
            <span>Ambassadeur Officiel</span>
          </div>
          <button
            onClick={clearActiveReferral}
            className="p-1 rounded-md hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            title="Masquer le bandeau"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
