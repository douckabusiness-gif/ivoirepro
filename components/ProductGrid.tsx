'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/lib/storeContext';
import { ProductCard } from './ProductCard';
import { InGridPromoBanner } from './InGridPromoBanner';
import { 
  SlidersHorizontal, 
  Search, 
  ArrowUpDown, 
  Sparkles, 
  X, 
  PackageOpen, 
  Flame, 
  ShieldCheck, 
  Truck, 
  Zap, 
  Tag, 
  Star, 
  Check, 
  RotateCcw, 
  ChevronDown, 
  ChevronRight, 
  Boxes, 
  Percent, 
  TrendingUp, 
  Filter,
  ArrowRight
} from 'lucide-react';

interface ProductGridProps {
  showFilters?: boolean;
  title?: string;
  subtitle?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  showFilters,
  title,
  subtitle 
}) => {
  const { 
    products, 
    categories, 
    selectedCategoryFilter, 
    setSelectedCategoryFilter, 
    selectedSubcategoryFilter, 
    setSelectedSubcategoryFilter, 
    searchQuery, 
    setSearchQuery, 
    formatPrice, 
    currentView,
    setCurrentView,
    settings
  } = useStore();

  // Determine if filters should be displayed (hidden on home page by default)
  const shouldShowFilters = showFilters !== undefined 
    ? showFilters 
    : (currentView === 'shop');

  // Sort State
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  
  // Advanced Filter States
  const [onlyPromos, setOnlyPromos] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  
  // Price Range State
  const priceStats = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100000 };
    const prices = products.map(p => p.price);
    return {
      min: Math.floor(Math.min(...prices) / 1000) * 1000,
      max: Math.ceil(Math.max(...prices) / 1000) * 1000
    };
  }, [products]);

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(150000);

  // Initialize maxPrice once products load
  useEffect(() => {
    if (priceStats.max > 0) {
      setMaxPrice(priceStats.max);
    }
  }, [priceStats.max]);

  // Mobile Filter Drawer Toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Quick Price Range Presets
  const pricePresets = [
    { label: 'Tous les prix', min: 0, max: priceStats.max || 150000 },
    { label: `< ${formatPrice(10000)}`, min: 0, max: 10000 },
    { label: `${formatPrice(10000)} - ${formatPrice(25000)}`, min: 10000, max: 25000 },
    { label: `${formatPrice(25000)} - ${formatPrice(50000)}`, min: 25000, max: 50000 },
    { label: `> ${formatPrice(50000)}`, min: 50000, max: priceStats.max || 150000 },
  ];

  // Rating Filter Options
  const ratingOptions = [
    { label: 'Toutes les notes', min: null, stars: 0 },
    { label: '4.5 étoiles & plus', min: 4.5, stars: 4.5 },
    { label: '4.0 étoiles & plus', min: 4.0, stars: 4.0 },
    { label: '3.5 étoiles & plus', min: 3.5, stars: 3.5 },
  ];

  // Count Active Filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategoryFilter !== null) count++;
    if (selectedSubcategoryFilter !== null) count++;
    if (searchQuery.trim() !== '') count++;
    if (onlyPromos) count++;
    if (onlyInStock) count++;
    if (minRating !== null) count++;
    if (minPrice > 0 || (maxPrice < priceStats.max && maxPrice > 0)) count++;
    return count;
  }, [selectedCategoryFilter, selectedSubcategoryFilter, searchQuery, onlyPromos, onlyInStock, minRating, minPrice, maxPrice, priceStats.max]);

  // Reset All Filters
  const handleResetFilters = () => {
    setSelectedCategoryFilter(null);
    setSelectedSubcategoryFilter(null);
    setSearchQuery('');
    setOnlyPromos(false);
    setOnlyInStock(false);
    setMinRating(null);
    setMinPrice(0);
    setMaxPrice(priceStats.max || 150000);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategoryFilter && p.categoryId !== selectedCategoryFilter) {
        return false;
      }
      // Subcategory filter
      if (selectedSubcategoryFilter && p.subcategoryId !== selectedSubcategoryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchCategory = p.categoryName?.toLowerCase().includes(q);
        const matchSubcategory = p.subcategoryName?.toLowerCase().includes(q);
        const matchTags = p.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchCategory && !matchSubcategory && !matchTags) {
          return false;
        }
      }
      // Promos only
      if (onlyPromos && !p.isFlashSale && !p.discountPercent && !p.originalPrice) {
        return false;
      }
      // In stock only
      if (onlyInStock && !p.inStock) {
        return false;
      }
      // Min Rating filter
      if (minRating !== null && p.rating < minRating) {
        return false;
      }
      // Price Range filter
      if (p.price < minPrice || p.price > maxPrice) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [
    products, 
    selectedCategoryFilter, 
    selectedSubcategoryFilter, 
    searchQuery, 
    onlyPromos, 
    onlyInStock, 
    minRating, 
    minPrice, 
    maxPrice, 
    sortBy
  ]);

  const activeCategory = categories.find(c => c.id === selectedCategoryFilter);
  const activeSubcategory = activeCategory?.subcategories?.find(s => s.id === selectedSubcategoryFilter);

  // In-Stock Count
  const inStockCount = useMemo(() => products.filter(p => p.inStock).length, [products]);
  const promosCount = useMemo(() => products.filter(p => p.isFlashSale || p.discountPercent || p.originalPrice).length, [products]);

  // Sidebar Filter Content Node (Shared between Desktop and Mobile)
  const filterSidebarContent = (
    <div className="space-y-6">
      
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-black text-sm uppercase tracking-wide text-slate-900 dark:text-white">
            Filtres Avancés
          </span>
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>

      {/* 1. DISPONIBILITÉ EN STOCK */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Boxes className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Disponibilité</span>
        </h4>
        
        <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 bg-white dark:bg-slate-800/80 cursor-pointer transition shadow-2xs">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 dark:border-slate-600 focus:ring-indigo-500 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">En stock immédiat</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                <Truck className="w-2.5 h-2.5" /> Expédition 24h
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {inStockCount}
          </span>
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500 bg-white dark:bg-slate-800/80 cursor-pointer transition shadow-2xs">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={onlyPromos}
              onChange={(e) => setOnlyPromos(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded-md border-slate-300 dark:border-slate-600 focus:ring-rose-500 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Offres & Promos</span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5" /> Prix réduits
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
            {promosCount}
          </span>
        </label>
      </div>

      {/* 2. FILTRE DE PRIX (Slider & Inputs) */}
      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Budget & Prix</span>
          </h4>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            Max: {formatPrice(maxPrice)}
          </span>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={priceStats.min}
            max={priceStats.max || 150000}
            step={1000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500">
            <span>{formatPrice(priceStats.min)}</span>
            <span>{formatPrice(priceStats.max || 150000)}</span>
          </div>
        </div>

        {/* Min / Max Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Min (FCFA)</label>
            <input
              type="number"
              min={0}
              max={maxPrice}
              step={1000}
              value={minPrice}
              onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Max (FCFA)</label>
            <input
              type="number"
              min={minPrice}
              max={priceStats.max || 200000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Quick Price Range Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {pricePresets.map((preset, idx) => {
            const isSelected = minPrice === preset.min && maxPrice === preset.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMinPrice(preset.min);
                  setMaxPrice(preset.max);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. NOTE MOYENNE / AVIS CLIENTS */}
      <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
        <h4 className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Note Moyenne</span>
        </h4>

        <div className="space-y-1.5">
          {ratingOptions.map((opt, idx) => {
            const isSelected = minRating === opt.min;
            const count = opt.min 
              ? products.filter(p => p.rating >= opt.min!).length 
              : products.length;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setMinRating(isSelected && opt.min !== null ? null : opt.min)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 text-xs'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          opt.stars >= star
                            ? 'text-amber-500 fill-amber-500'
                            : opt.stars >= star - 0.5
                            ? 'text-amber-500 fill-amber-500/50'
                            : 'text-slate-200 dark:text-slate-600 fill-slate-200 dark:fill-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold">{opt.label}</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. RAYONS & CATÉGORIES */}
      <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
        <h4 className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Percent className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Rayons du Catalogue</span>
        </h4>

        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => {
              setSelectedCategoryFilter(null);
              setSelectedSubcategoryFilter(null);
            }}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategoryFilter === null
                ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Tous les rayons</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategoryFilter === null ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {products.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = products.filter(p => p.categoryId === cat.id).length;
            const isSelected = selectedCategoryFilter === cat.id;

            return (
              <div key={cat.id} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedCategoryFilter(null);
                      setSelectedSubcategoryFilter(null);
                    } else {
                      setSelectedCategoryFilter(cat.id);
                      setSelectedSubcategoryFilter(null);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate max-w-[140px] text-left">{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    {count}
                  </span>
                </button>

                {/* Subcategories list when category is selected */}
                {isSelected && cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="pl-3 py-1 space-y-1 border-l-2 border-indigo-200 dark:border-indigo-800 ml-2">
                    {cat.subcategories.map((sub) => {
                      const subCount = products.filter(p => p.subcategoryId === sub.id).length;
                      const isSubSelected = selectedSubcategoryFilter === sub.id;

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setSelectedSubcategoryFilter(isSubSelected ? null : sub.id)}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                            isSubSelected
                              ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-300 font-bold'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate max-w-[120px] text-left">• {sub.name}</span>
                          <span className="text-[9px] text-slate-400">{subCount}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );

  return (
    <section
      id="catalogue"
      className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-900/60 transition-colors"
      style={currentView === 'home' ? { backgroundColor: 'var(--home-muted-color, #f8fafc)' } : undefined}
    >
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Header Title & Sorting / Actions Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>{title ? 'Sélection Officielle' : 'Catalogue & Disponibilités Réelles'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {title || (activeCategory ? activeCategory.name : 'Tous Nos Articles Disponibles')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              {subtitle || activeCategory?.description || "Parcourez notre catalogue exclusif en stock réel, avec commande rapide et livraison express à domicile."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* If on home page, provide quick link to full Shop with Filters */}
            {!shouldShowFilters ? (
              <button
                type="button"
                onClick={() => {
                  setCurrentView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-indigo-100 dark:border-slate-700"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Ouvrir les filtres avancés</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              /* Mobile Filter Toggle Button (Shop view only) */
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filtres Avancés</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-indigo-700 text-[10px] font-black flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            )}

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-hidden cursor-pointer dark:text-slate-200"
              >
                <option value="featured" className="dark:bg-slate-800">Recommandations</option>
                <option value="price-asc" className="dark:bg-slate-800">Prix : Croissant</option>
                <option value="price-desc" className="dark:bg-slate-800">Prix : Décroissant</option>
                <option value="rating" className="dark:bg-slate-800">Mieux Notés (Avis)</option>
                <option value="newest" className="dark:bg-slate-800">Nouveautés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Badges Bar (Shown when filters are active on Shop page or when searching) */}
        {shouldShowFilters && activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs text-xs animate-in fade-in">
            <span className="text-slate-400 dark:text-slate-400 font-bold flex items-center gap-1">
              <Filter className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>Filtres actifs :</span>
            </span>

            {selectedCategoryFilter && activeCategory && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-lg font-bold">
                Rayon : {activeCategory.name}
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => { setSelectedCategoryFilter(null); setSelectedSubcategoryFilter(null); }} />
              </span>
            )}

            {selectedSubcategoryFilter && activeSubcategory && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700 px-2.5 py-1 rounded-lg font-bold">
                Sous-rayon : {activeSubcategory.name}
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setSelectedSubcategoryFilter(null)} />
              </span>
            )}

            {onlyInStock && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg font-bold">
                En stock seulement
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setOnlyInStock(false)} />
              </span>
            )}

            {onlyPromos && (
              <span className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-lg font-bold">
                Promos seulement
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setOnlyPromos(false)} />
              </span>
            )}

            {minRating !== null && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-lg font-bold">
                Note ≥ {minRating} ★
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setMinRating(null)} />
              </span>
            )}

            {(minPrice > 0 || (maxPrice < priceStats.max && maxPrice > 0)) && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-2.5 py-1 rounded-lg font-bold">
                Prix: {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => { setMinPrice(0); setMaxPrice(priceStats.max || 150000); }} />
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-2.5 py-1 rounded-lg font-bold">
                Recherche: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setSearchQuery('')} />
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline ml-auto flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Tout effacer</span>
            </button>
          </div>
        )}

        {/* Main Grid Layout (Adaptive when filters are hidden vs shown) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* DESKTOP STICKY FILTER SIDEBAR (Only rendered on Shop page) */}
          {shouldShowFilters && (
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              {filterSidebarContent}
            </aside>
          )}

          {/* PRODUCTS LISTING / GRID */}
          <div className="flex-1 w-full min-w-0">
            
            {/* Results Count & Quick Status */}
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white font-extrabold">{filteredProducts.length}</strong> article{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
              </span>
              
              {activeCategory && shouldShowFilters && (
                <button
                  onClick={() => setSelectedCategoryFilter(null)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Voir tous les rayons →
                </button>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className={`grid gap-3 sm:gap-5 ${
                shouldShowFilters 
                  ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6' 
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6'
              }`}>
                {filteredProducts.flatMap((product, idx) => {
                  const elements = [
                    <ProductCard key={product.id} product={product} />
                  ];

                  const frequency = Math.max(2, settings.inGridBannerFrequency || 8);
                  const dynamicBanners = Array.isArray(settings.inGridBannersList) && settings.inGridBannersList.length > 0
                    ? settings.inGridBannersList.filter(b => b.enabled !== false)
                    : null;

                  if (settings.inGridBannerEnabled !== false && dynamicBanners && dynamicBanners.length > 0) {
                    const bannerIdx = (idx + 1) % frequency === 0 ? Math.floor((idx + 1) / frequency) - 1 : -1;
                    if (bannerIdx >= 0 && bannerIdx < dynamicBanners.length) {
                      const banner = dynamicBanners[bannerIdx];
                      elements.push(
                        <div key={`in-grid-banner-${banner.id || bannerIdx}`} className="col-span-full my-3 sm:my-4 animate-in fade-in duration-300">
                          <InGridPromoBanner bannerItem={banner} />
                        </div>
                      );
                    }
                  }

                  return elements;
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 space-y-4 max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Aucun produit ne correspond à vos filtres</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Ajustez votre budget de prix, votre niveau de note minimale ou retirez certains critères pour voir plus d'articles.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition cursor-pointer shadow-sm"
                >
                  Réinitialiser tous les filtres
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* MOBILE FILTER MODAL / DRAWER (Shop view only) */}
      {shouldShowFilters && isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white">Filtrer les Produits</h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filter Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {filterSidebarContent}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-3 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer text-center"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md text-center"
              >
                Voir les {filteredProducts.length} articles
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

