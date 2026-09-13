'use client';

import React from 'react';
import { 
  ShieldCheck, 
  MessageCircle, 
  Truck, 
  RotateCcw, 
  Headphones, 
  CreditCard 
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export const TrustBadges = () => {
  const { settings } = useStore();

  return (
    <section className="py-14 sm:py-16 bg-white dark:bg-slate-950/40 border-y border-slate-200/80 dark:border-slate-800" style={{ backgroundColor: 'var(--home-surface-color, #ffffff)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group">
            <div className="w-13 h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white tracking-tight">Livraison Express</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Colis expédié sous 24-48h avec suivi et notification SMS / WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 fill-emerald-600/20" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white tracking-tight">Support WhatsApp 7j/7</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Une question ? Notre équipe vous répond immédiatement sur WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group">
            <div className="w-13 h-13 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white tracking-tight">Paiement 100% Sécurisé</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Wave, Orange Money, Carte Bancaire ou Paiement à la livraison.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group">
            <div className="w-13 h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white tracking-tight">Garantie & Retours</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                14 jours pour changer d'avis et garantie constructeur sur tout le catalogue.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
