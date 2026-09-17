'use client';

import React from 'react';
import { Plane, ShieldCheck, CreditCard, MessageCircle } from 'lucide-react';

export const DubaiReassuranceRibbon: React.FC = () => {
  const items = [
    {
      icon: <Plane className="w-5 h-5 text-amber-400" />,
      title: 'Fret Aérien Express',
      desc: 'Départs réguliers DXB ➔ ABJ sous 7 à 10 jours ouvrés.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: '100% Authentique Certifié',
      desc: 'Acheté dans les boutiques officielles et souks de Dubaï.'
    },
    {
      icon: <CreditCard className="w-5 h-5 text-indigo-400" />,
      title: 'Règlement Sécurisé',
      desc: 'Wave, Orange Money, MTN, Moov & Carte sans frais cachés.'
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-amber-400" />,
      title: 'Conciergerie WhatsApp',
      desc: 'Photos de votre colis à Dubaï avant embarquement.'
    }
  ];

  return (
    <section className="py-6 sm:py-8 bg-slate-950 border-y border-amber-500/10">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        
        {/* Jumia 4-Pillar Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 transition hover:border-amber-500/40"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
