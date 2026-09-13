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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">Livraison Express</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Colis expédié sous 24-48h avec suivi et notification SMS / WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 fill-emerald-600/20" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">Support WhatsApp 7j/7</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Une question ? Notre équipe vous répond immédiatement sur WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="w-13 h-13 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">Paiement 100% Sécurisé</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Wave, Orange Money, Carte Bancaire ou Paiement à la livraison.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">Garantie & Retours</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                14 jours pour changer d'avis et garantie constructeur sur tout le catalogue.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
