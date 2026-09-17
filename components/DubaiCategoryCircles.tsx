'use client';

import React from 'react';
import { Sparkles, Flame, Plane, MessageCircle } from 'lucide-react';

interface DubaiCategoryCirclesProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

export const DubaiCategoryCircles: React.FC<DubaiCategoryCirclesProps> = ({
  onSelectCategory,
  selectedCategory
}) => {
  const circles = [
    { id: 'all', label: 'Tous les Arrivages', icon: '✨', badge: 'DXB' },
    { id: 'parfum', label: "Parfums & Ouds", icon: '🏺', badge: 'Top Vente' },
    { id: 'montre', label: 'Montres & Or 24K', icon: '⌚', badge: 'Gold Souk' },
    { id: 'mode', label: 'Abayas & Soie', icon: '🧕', badge: 'Médine' },
    { id: 'high-tech', label: 'High-Tech DXB', icon: '📱', badge: 'Apple' },
    { id: 'bakhoor', label: 'Bakhoors Royaux', icon: '🪵', badge: 'Encens' },
    { id: 'flash', label: 'Ventes Flash', icon: '⚡', badge: '-30%' },
    { id: 'shopper', label: 'Sur Mesure', icon: '💬', badge: 'Devis' }
  ];

  const handleClick = (id: string) => {
    if (id === 'flash') {
      const el = document.getElementById('dubai-flash-sales');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'shopper') {
      const el = document.getElementById('dubai-personal-shopper');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onSelectCategory(id);
      const el = document.getElementById('dubai-catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-4 sm:py-6 bg-slate-950 border-b border-amber-500/10">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        
        {/* Horizontal Scrollable Row of Category Circles (Jumia Style) */}
        <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          {circles.map((item) => {
            const isActive = selectedCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className="group flex flex-col items-center gap-1.5 shrink-0 focus:outline-none cursor-pointer transition transform hover:-translate-y-1"
              >
                {/* Outer Circle Ring */}
                <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
                  isActive
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 ring-3 ring-amber-400/50 shadow-amber-500/30 scale-105'
                    : 'bg-slate-900 border border-slate-800 hover:border-amber-400/60 text-white'
                }`}>
                  <span className="text-2xl sm:text-3xl filter drop-shadow">{item.icon}</span>

                  {/* Micro badge on top right */}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 text-[8.5px] font-black uppercase tracking-tight px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 shadow border border-slate-950">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Circle Label */}
                <span className={`text-[10px] sm:text-xs font-bold text-center whitespace-nowrap transition ${
                  isActive ? 'text-amber-400 font-black' : 'text-slate-300 group-hover:text-white'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
