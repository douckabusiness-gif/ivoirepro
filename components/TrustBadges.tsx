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
    <section className="py-14 sm:py-16 border-y border-black/5 dark:border-white/10" style={{ backgroundColor: 'var(--home-surface-color, var(--site-body-color, #ffffff))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          <div className="flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 group">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm sm:text-[15px] text-slate-900 tracking-tight">Livraison Express</h3>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Colis expédié sous 24-48h avec suivi WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 group">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5 fill-emerald-600/20" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm sm:text-[15px] text-slate-900 tracking-tight">Support WhatsApp 7j/7</h3>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Une question ? Notre équipe vous répond immédiatement.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 group">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm sm:text-[15px] text-slate-900 tracking-tight">Paiement 100% Sécurisé</h3>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Wave, Orange Money ou Paiement à la livraison.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 group">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm sm:text-[15px] text-slate-900 tracking-tight">Garantie & Retours</h3>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                14 jours pour changer d'avis et garantie produit.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
