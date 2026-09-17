'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { useStore } from '@/lib/storeContext';
import { Flame, Clock, ChevronRight, ShoppingBag, Check, Star } from 'lucide-react';

interface DubaiFlashSaleBarProps {
  products: Product[];
}

export const DubaiFlashSaleBar: React.FC<DubaiFlashSaleBarProps> = ({ products }) => {
  const { formatPrice, addToCart, setSelectedProductId, setCurrentView } = useStore();
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  // Flash Sale countdown (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 15
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter flash products or discounted products
  const flashList = products.filter(
    (p) => p.isDubaiPreorder && (p.isFlashSale || (p.discountPercent && p.discountPercent > 0) || (p.originalPrice && p.originalPrice > p.price))
  );

  // If no explicit flash sale products, show top 6 Dubai products with a simulated promo badge
  const displayFlash = flashList.length >= 3 ? flashList : products.filter(p => p.isDubaiPreorder).slice(0, 6);

  if (displayFlash.length === 0) return null;

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const handleCardClick = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product-detail');
  };

  return (
    <section id="dubai-flash-sales" className="py-6 sm:py-8 bg-slate-950">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        
        {/* Main Jumia-Style Flash Container */}
        <div className="bg-slate-900 border-2 border-rose-500/40 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-rose-950/20">
          
          {/* 1. High-Contrast Flash Header Bar (Jumia Red/Amber Style) */}
          <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 text-white px-3 sm:px-6 py-3 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            
            {/* Left Title */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 animate-bounce">
                <Flame className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <span>⚡ Ventes Flash Dubaï Cargo</span>
                  <span className="hidden md:inline-block text-[10px] bg-slate-950/40 text-amber-200 px-2 py-0.5 rounded-full font-bold">
                    Places Limitées
                  </span>
                </h3>
                <p className="text-[10px] sm:text-xs text-amber-100 font-medium hidden sm:block">
                  Tarifs exclusifs garantis jusqu'au départ du prochain vol cargo
                </p>
              </div>
            </div>

            {/* Center Digital Timer (Jumia Style) */}
            <div className="flex items-center gap-2 bg-slate-950/40 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Clôture :
              </span>
              <div className="flex items-center gap-1 font-mono text-xs sm:text-sm font-black text-white">
                <span className="bg-slate-950 px-2 py-0.5 rounded text-amber-300">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span>:</span>
                <span className="bg-slate-950 px-2 py-0.5 rounded text-amber-300">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span>:</span>
                <span className="bg-slate-950 px-2 py-0.5 rounded text-amber-300">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>

            {/* Right "Voir Plus" Link */}
            <button
              onClick={() => {
                const el = document.getElementById('dubai-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-black uppercase tracking-wider text-white hover:text-amber-200 flex items-center gap-1 transition"
            >
              <span>Voir tout</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

          {/* 2. Horizontal Scrollable or Grid of Flash Products */}
          <div className="p-3 sm:p-5 bg-slate-900/60">
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
              {displayFlash.map((product, idx) => {
                const discount =
                  product.discountPercent ||
                  (product.originalPrice
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 25);
                const originalPrice = product.originalPrice || Math.ceil((product.price * 1.3) / 500) * 500;
                
                // Jumia Cargo progress bar simulation (7 to 9 slots filled out of 10)
                const reservedSlots = 6 + (idx % 4);
                const totalSlots = 10;
                const progressPct = (reservedSlots / totalSlots) * 100;
                const isAdded = Boolean(addedMap[product.id]);

                return (
                  <div
                    key={product.id}
                    onClick={() => handleCardClick(product.id)}
                    className="group bg-slate-950 border border-slate-800 hover:border-amber-400/60 rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-rose-950/20 cursor-pointer relative select-none"
                  >
                    {/* Image Area with Discount Badge */}
                    <div className="relative aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden bg-slate-900 mb-2">
                      <img
                        src={product.images[0] || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400&auto=format&fit=crop&q=80'}
                        alt={product.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Discount Tag (Jumia Style) */}
                      <span className="absolute top-1 left-1 bg-rose-600 text-white font-black text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded shadow-sm">
                        -{discount}%
                      </span>

                      {/* Dubai Cargo mini badge */}
                      <span className="absolute bottom-1 left-1 bg-slate-950/80 backdrop-blur-xs text-amber-300 text-[8px] sm:text-[9.5px] font-bold px-1.5 py-0.2 rounded">
                        ✈️ DXB
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1 sm:space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title 2 lines */}
                        <h4 className="text-[11px] sm:text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight min-h-[26px] sm:min-h-[32px]">
                          {product.title}
                        </h4>

                        {/* Price Block */}
                        <div className="pt-1">
                          <div className="text-xs sm:text-sm font-black text-amber-400 tracking-tight leading-tight">
                            {formatPrice(product.price)}
                          </div>
                          <div className="text-[9px] sm:text-[10px] text-slate-500 line-through font-normal">
                            {formatPrice(originalPrice)}
                          </div>
                        </div>
                      </div>

                      {/* JUMIA-STYLE STOCK / CARGO PROGRESS BAR */}
                      <div className="pt-1 space-y-1">
                        <div className="flex items-center justify-between text-[8px] sm:text-[9.5px] font-bold text-slate-400">
                          <span>Réservé</span>
                          <span className="text-amber-400">{reservedSlots}/{totalSlots} places</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* 1-Click Add to Cart / Preorder Button */}
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`w-full mt-2 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-500 text-slate-950 shadow'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Ajouté !</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3 h-3" />
                            <span>Précommander</span>
                          </>
                        )}
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
