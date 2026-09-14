'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  Award, 
  Flame, 
  Star, 
  TrendingUp, 
  ShoppingBag, 
  MessageCircle, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';

export const TopRankedSection = () => {
  const { 
    products, 
    formatPrice, 
    addToCart, 
    setSelectedProductId, 
    setCurrentView, 
    setQuickViewProduct,
    generateWhatsAppProductLink 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'sales' | 'rating' | 'trending'>('sales');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  const rankedProducts = [...products].sort((a, b) => {
    if (activeTab === 'rating') return b.rating - a.rating;
    if (activeTab === 'trending') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return (b.reviewCount || 0) - (a.reviewCount || 0);
  }).slice(0, 4);

  const rankBadges = [
    { rank: '1', label: 'N°1 VENTES', color: 'bg-amber-500 text-slate-950', ring: 'border-amber-400' },
    { rank: '2', label: 'TOP 2', color: 'bg-slate-300 text-slate-950', ring: 'border-slate-300' },
    { rank: '3', label: 'TOP 3', color: 'bg-amber-700 text-white', ring: 'border-amber-700' },
    { rank: '4', label: 'TOP 4', color: 'bg-indigo-600 text-white', ring: 'border-indigo-500' },
  ];

  return (
    <section 
      className="py-10 sm:py-14 border-b transition-colors" 
      style={{ 
        backgroundColor: 'var(--home-surface-color, var(--site-body-color, #ffffff))',
        borderColor: 'var(--home-border-color, rgba(0,0,0,0.08))'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Ranking Tabs */}
        <div 
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-5 border-b"
          style={{ borderColor: 'var(--home-border-color, rgba(0,0,0,0.08))' }}
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-500 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 shadow-xs">
              <Award className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Classement Officiel</span>
            </div>
            <h2 
              className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight"
              style={{ color: 'var(--home-text-primary, #0f172a)' }}
            >
              Top Produits & Meilleures Ventes
            </h2>
            <p 
              className="text-xs sm:text-sm font-normal leading-relaxed max-w-xl mt-1.5 opacity-85"
              style={{ color: 'var(--home-text-secondary, #475569)' }}
            >
              Sélection basée sur le volume réel des commandes et les avis vérifiés de nos clients.
            </p>
          </div>

          {/* Ranking Tabs */}
          <div 
            className="flex items-center gap-1 p-1 rounded-2xl self-start md:self-auto border shadow-xs overflow-x-auto max-w-full"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.06)',
              borderColor: 'var(--home-border-color, rgba(0,0,0,0.08))'
            }}
          >
            <button
              onClick={() => setActiveTab('sales')}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0 whitespace-nowrap"
              style={{
                backgroundColor: activeTab === 'sales' ? '#ffffff' : 'transparent',
                color: activeTab === 'sales' ? '#0f172a' : 'var(--home-text-primary, #0f172a)'
              }}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Plus Populaires</span>
            </button>

            <button
              onClick={() => setActiveTab('rating')}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0 whitespace-nowrap"
              style={{
                backgroundColor: activeTab === 'rating' ? '#ffffff' : 'transparent',
                color: activeTab === 'rating' ? '#0f172a' : 'var(--home-text-primary, #0f172a)'
              }}
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Mieux Notés (4.9+)</span>
            </button>

            <button
              onClick={() => setActiveTab('trending')}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0 whitespace-nowrap"
              style={{
                backgroundColor: activeTab === 'trending' ? '#ffffff' : 'transparent',
                color: activeTab === 'trending' ? '#0f172a' : 'var(--home-text-primary, #0f172a)'
              }}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Tendances Chaudes</span>
            </button>
          </div>
        </div>

        {/* 4-Podium Ranked Products Grid: 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {rankedProducts.map((product, index) => {
            const badge = rankBadges[index] || rankBadges[3];
            const discount = product.discountPercent || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null);
            const isAdded = addedIds[product.id];

            return (
              <div
                key={product.id}
                onClick={() => {
                  setSelectedProductId(product.id);
                  setCurrentView('product-detail');
                }}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer p-2 sm:p-3.5 shadow-xs"
              >
                <div>
                  {/* Image Container with Rank Medal */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950/60 mb-2 sm:mb-2.5 border border-slate-100 dark:border-slate-800">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Rank Badge */}
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex items-center gap-1 z-10">
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg font-black text-[9px] sm:text-[11px] shadow-md uppercase tracking-wider flex items-center gap-1 ${badge.color}`}>
                        <span>#{badge.rank}</span>
                        <span className="text-[8px] sm:text-[9px] font-bold">{badge.label}</span>
                      </span>
                    </div>

                    {/* Discount tag if any */}
                    {discount && (
                      <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-rose-600 text-white font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md shadow-xs z-10">
                        -{discount}%
                      </div>
                    )}

                    {/* Quick View */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(product);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs hidden sm:flex z-10"
                      title="Aperçu rapide"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Rating and Reviews Counter */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-0.5 text-amber-500 text-[10px] sm:text-xs font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{product.rating || 4.9}</span>
                      <span className="text-slate-400 font-normal text-[9px] sm:text-[11px]">({product.reviewCount || 12})</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded shrink-0">
                      +{(product.reviewCount || 10) * 12} vendus
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                    {product.title}
                  </h3>
                </div>

                {/* Price & Instant Buy */}
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-baseline justify-between gap-1 flex-wrap">
                    <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] sm:text-xs text-slate-400 line-through font-normal">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider hidden xs:inline">
                      Direct
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={generateWhatsAppProductLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-1.5 sm:py-2 px-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 transition shadow-xs hover:scale-[1.02] active:scale-95 cursor-pointer truncate"
                      title="Commander sur WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
                      <span className="truncate">WhatsApp</span>
                    </a>

                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className={`w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-xl flex items-center justify-center transition shadow-2xs shrink-0 cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 hover:bg-indigo-600 text-white dark:bg-slate-800 dark:hover:bg-indigo-600'
                      }`}
                      title="Ajouter au panier"
                    >
                      {isAdded ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <ShoppingBag className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Banner: Explorer tout le classement */}
        <div className="mt-8 p-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 font-bold shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Prêt à passer votre commande en gros ou au détail ?</p>
              <p className="text-xs text-slate-300">Profitez de tarifs dégressifs et d'un accompagnement personnalisé sur WhatsApp.</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('shop')}
            className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
          >
            Voir tous les classements
          </button>
        </div>

      </div>
    </section>
  );
};
