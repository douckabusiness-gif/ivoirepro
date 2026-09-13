'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  Flame, 
  Timer, 
  ShoppingBag, 
  MessageCircle, 
  Eye, 
  Sparkles,
  ArrowRight,
  Zap,
  Check,
  Heart,
  TrendingDown,
  Star,
  Percent,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export const FlashSaleSection = () => {
  const { 
    products, 
    categories,
    settings,
    formatPrice, 
    addToCart, 
    toggleWishlist,
    isInWishlist,
    generateWhatsAppProductLink, 
    setQuickViewProduct, 
    setSelectedProductId, 
    setCurrentView 
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  // Filter flash products: STRICTEMENT réservé aux produits dont l'administrateur a coché "isFlashSale"
  const allFlashProducts = useMemo(() => {
    return products.filter(p => Boolean(p.isFlashSale));
  }, [products]);

  const flashProducts = useMemo(() => {
    if (selectedCategory === 'all') return allFlashProducts;
    return allFlashProducts.filter(p => p.categoryId === selectedCategory);
  }, [allFlashProducts, selectedCategory]);

  // Live countdown timer (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (allFlashProducts.length === 0) return null;

  return (
    <section
      className="py-10 sm:py-16 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden border-b border-slate-800"
      style={{ backgroundImage: 'linear-gradient(to bottom, var(--home-flash-start, #020617), var(--home-flash-mid, #0f172a), var(--home-flash-end, #312e81))' }}
    >
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header with Flash Branding & Digital Countdown Timer */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-8 gap-4 pb-6 border-b border-slate-800/80">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/25 to-amber-500/25 text-rose-300 text-[11px] font-bold uppercase tracking-wider border border-rose-500/30 shadow-inner">
              <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>SUPER DEALS & VENTES FLASH</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            </div>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Ventes Flash du Jour</span>
              <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white uppercase shadow-sm">
                JUSQU'À -50%
              </span>
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300/80 max-w-xl font-normal leading-relaxed">
              Offres exclusives à durée limitée et quantités contingentées. Commandez immédiatement en ligne ou directement via WhatsApp.
            </p>
          </div>

          {/* Digital Countdown Timer */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-900/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-700/80 shadow-2xl self-start lg:self-auto">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Timer className="w-4 h-4 text-rose-400 animate-spin-slow" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-extrabold text-rose-400 tracking-wider">Temps Restant</p>
                <p className="text-xs font-bold text-white">Fin de la vente dans :</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="bg-slate-950 border border-rose-600/40 px-2.5 py-1.5 rounded-xl font-mono font-black text-rose-300 text-base sm:text-lg shadow-inner">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Heures</span>
              </div>

              <span className="font-black text-rose-400 text-base pb-3.5">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="bg-slate-950 border border-rose-600/40 px-2.5 py-1.5 rounded-xl font-mono font-black text-rose-300 text-base sm:text-lg shadow-inner">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Min</span>
              </div>

              <span className="font-black text-rose-400 text-base pb-3.5">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="bg-slate-950 border border-rose-600/40 px-2.5 py-1.5 rounded-xl font-mono font-black text-amber-300 text-base sm:text-lg shadow-inner animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Toutes les Offres ({allFlashProducts.length})</span>
          </button>

          {categories.map((cat) => {
            const count = allFlashProducts.filter(p => p.categoryId === cat.id).length;
            if (count === 0) return null;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                  selectedCategory === cat.id
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/20 scale-105'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 6-COLUMN FLASH SALE PRODUCT CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4">
          {flashProducts.map((product) => {
            const discount = product.discountPercent || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 25);
            const stockRemaining = product.stockCount || 5;
            const isAdded = addedIds[product.id];
            const inWishlist = isInWishlist(product.id);
            const claimedPercent = Math.min(95, Math.max(65, 100 - (stockRemaining * 2.5)));

            return (
              <div
                key={product.id}
                onClick={() => {
                  setSelectedProductId(product.id);
                  setCurrentView('product-detail');
                }}
                className="group bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-rose-500/70 p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-rose-950/40 cursor-pointer relative overflow-hidden"
              >
                <div>
                  {/* Image Area with Badges & Action Overlays */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 mb-2.5">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Discount & Flash Badge */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                      <div className="bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-lg flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-white" />
                        <span>-{discount}%</span>
                      </div>
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition shadow-md z-10 cursor-pointer ${
                        inWishlist 
                          ? 'bg-rose-600 text-white' 
                          : 'bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-rose-400'
                      }`}
                      title={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-white' : ''}`} />
                    </button>

                    {/* Stock Remaining Pill */}
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-xs text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded-md flex items-center justify-between border border-slate-800">
                      <span className="flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400 animate-pulse" />
                        <span>{stockRemaining} restants</span>
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold">{Math.round(claimedPercent)}% pris</span>
                    </div>

                    {/* Quick View Button on Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(product);
                      }}
                      className="absolute inset-0 m-auto w-9 h-9 bg-slate-900/90 hover:bg-rose-600 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-xl cursor-pointer"
                      title="Aperçu rapide"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Product Metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <span className="font-extrabold text-rose-400 uppercase tracking-wider truncate">
                        {product.categoryName}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-400 font-bold shrink-0">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{product.rating}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-rose-300 transition-colors line-clamp-1 leading-snug">
                      {product.title}
                    </h3>

                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {product.shortDescription || product.description}
                    </p>
                  </div>

                  {/* Price Comparison */}
                  <div className="flex items-baseline justify-between gap-1 pt-2">
                    <div className="flex flex-col">
                      <span className="text-sm sm:text-base font-black text-white leading-tight">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Claimed Progress Bar */}
                  <div className="pt-2 space-y-1">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 rounded-full transition-all duration-700" 
                        style={{ width: `${claimedPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions: Add to Cart & WhatsApp Link */}
                <div className="grid grid-cols-2 gap-1.5 pt-3 mt-2 border-t border-slate-800/80">
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer border ${
                      isAdded 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3 text-white" />
                        <span className="hidden sm:inline">Ajouté</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3 h-3 text-rose-400" />
                        <span>Panier</span>
                      </>
                    )}
                  </button>

                  <a
                    href={generateWhatsAppProductLink(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="py-2 px-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-sm"
                    title="Commander via WhatsApp"
                  >
                    <MessageCircle className="w-3 h-3 fill-white" />
                    <span>WhatsApp</span>
                  </a>
                </div>

              </div>
            );
          })}
        </div>

        {/* View all flash deals footer link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setCurrentView('shop');
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm border border-slate-700 hover:border-rose-500 transition-all duration-300 shadow-xl cursor-pointer group"
          >
            <span>Explorer toutes les promotions et ventes flash</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
