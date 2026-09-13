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
    <section className="py-12 bg-white border-y border-slate-100" style={{ backgroundColor: 'var(--home-surface-color, #ffffff)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-slate-900">Livraison Express</h3>
              <p className="text-xs text-slate-500">
                Colis expédié sous 24-48h avec suivi et notification SMS / WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6 fill-emerald-600/20" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-slate-900">Support WhatsApp 7j/7</h3>
              <p className="text-xs text-slate-500">
                Une question ? Notre équipe vous répond immédiatement sur WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-slate-900">Paiement 100% Sécurisé</h3>
              <p className="text-xs text-slate-500">
                Wave, Orange Money, Carte Bancaire ou Paiement à la livraison.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-slate-900">Garantie & Retours</h3>
              <p className="text-xs text-slate-500">
                14 jours pour changer d'avis et garantie constructeur sur tout le catalogue.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
