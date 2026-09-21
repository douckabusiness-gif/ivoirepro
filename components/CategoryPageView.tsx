'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product, Category, Subcategory } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { 
  ChevronRight, 
  Home, 
  Layers, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Flame,
  Star,
  Check,
  PackageOpen,
  Smartphone,
  Shirt,
  Laptop,
  Watch,
  Headphones,
  ShoppingBag,
  RotateCcw
} from 'lucide-react';

interface CategoryTheme {
  icon: React.ReactNode;
  iconBg: string;
  badgeBg: string;
  glowColor: string;
  topGradient: string;
  buttonGradient: string;
  tagline: string;
  subTitle: string;
}

function getCategoryTheme(category: { id: string; name: string; iconName?: string | null }): CategoryTheme {
  const name = (category.name || '').toLowerCase();

  // 1. Smartphones & High-Tech
  if (name.includes('phone') || name.includes('téléphone') || category.iconName === 'Smartphone') {
    return { 
      icon: <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />, 
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/30',
      badgeBg: 'bg-blue-50/90 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60',
      glowColor: 'bg-blue-500/15',
      topGradient: 'from-blue-600 via-indigo-500 to-sky-400',
      buttonGradient: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500',
      tagline: 'High-Tech & Mobilité 100% Authentique',
      subTitle: 'Smartphones de pointe, tablettes & accessoires sous garantie'
    };
  }

  // 2. Mode, Vêtements & Chaussures
  if (name.includes('mode') || name.includes('vêtement') || name.includes('chaussure') || category.iconName === 'Shirt') {
    return { 
      icon: <Shirt className="w-6 h-6 text-rose-600 dark:text-rose-400" />, 
      iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/30',
      badgeBg: 'bg-rose-50/90 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
      glowColor: 'bg-rose-500/15',
      topGradient: 'from-rose-600 via-pink-500 to-amber-400',
      buttonGradient: 'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500',
      tagline: 'Style & Tendance Abidjan',
      subTitle: 'Sneakers, tenues habillées & collections streetwear branchées'
    };
  }

  // 3. Électroménager & Climatisation
  if (name.includes('électroménager') || name.includes('maison') || category.iconName === 'Home') {
    return { 
      icon: <Home className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />, 
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/30',
      badgeBg: 'bg-emerald-50/90 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
      glowColor: 'bg-emerald-500/15',
      topGradient: 'from-emerald-600 via-teal-500 to-emerald-400',
      buttonGradient: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
      tagline: 'Équipement Maison & Confort',
      subTitle: 'Appareils testés, puissants et prêts à l’emploi'
    };
  }

  // 4. Informatique & Bureautique
  if (name.includes('informatique') || name.includes('ordinateur') || category.iconName === 'Laptop') {
    return { 
      icon: <Laptop className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />, 
      iconBg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/30',
      badgeBg: 'bg-cyan-50/90 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/60',
      glowColor: 'bg-cyan-500/15',
      topGradient: 'from-cyan-600 via-blue-500 to-indigo-400',
      buttonGradient: 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500',
      tagline: 'Performance & Bureautique Pro',
      subTitle: 'PC portables, périphériques et solutions de productivité'
    };
  }

  // 5. Beauté, Parfums & Bien-Être
  if (name.includes('beauté') || name.includes('parfum') || category.iconName === 'Sparkles') {
    return { 
      icon: <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />, 
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-2 ring-purple-500/30',
      badgeBg: 'bg-purple-50/90 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60',
      glowColor: 'bg-purple-500/15',
      topGradient: 'from-purple-600 via-fuchsia-500 to-pink-400',
      buttonGradient: 'from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500',
      tagline: 'Fragrances Rares & Soins de Luxe',
      subTitle: 'Parfums orientaux authentiques, soins du corps & bien-être'
    };
  }

  // 6. Montres & Bijouterie
  if (name.includes('montre') || name.includes('bijou') || category.iconName === 'Watch') {
    return { 
      icon: <Watch className="w-6 h-6 text-amber-600 dark:text-amber-400" />, 
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/30',
      badgeBg: 'bg-amber-50/90 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
      glowColor: 'bg-amber-500/15',
      topGradient: 'from-amber-500 via-yellow-400 to-orange-500',
      buttonGradient: 'from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950',
      tagline: 'Élégance, Précision & Joaillerie',
      subTitle: 'Montres automatiques squelettes et parures raffinées'
    };
  }

  // 7. Électronique & Son
  if (name.includes('son') || name.includes('électronique') || category.iconName === 'Headphones') {
    return { 
      icon: <Headphones className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, 
      iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/30',
      badgeBg: 'bg-indigo-50/90 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
      glowColor: 'bg-indigo-500/15',
      topGradient: 'from-indigo-600 via-violet-500 to-blue-400',
      buttonGradient: 'from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500',
      tagline: 'Son Haute-Fidélité & Immersion',
      subTitle: 'Enceintes Bluetooth, barres de son & casques audio immersifs'
    };
  }

  // Default Fallback
  return { 
    icon: <ShoppingBag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, 
    iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/30',
    badgeBg: 'bg-indigo-50/90 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
    glowColor: 'bg-indigo-500/15',
    topGradient: 'from-indigo-600 via-purple-500 to-sky-400',
    buttonGradient: 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500',
    tagline: 'Sélection Exclusive & Qualité Certifiée',
    subTitle: 'Nos meilleurs articles vérifiés en stock direct à Abidjan'
  };
}

interface CategoryPageViewProps {
  category: Category;
  products: Product[];
  initialSubcategorySlug?: string | null;
}

export const CategoryPageView: React.FC<CategoryPageViewProps> = ({
  category,
  products,
  initialSubcategorySlug
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = getCategoryTheme(category);

  // Subcategory filter state: from initial prop, URL query param, or null
  const querySub = searchParams.get('sub') || initialSubcategorySlug || null;
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(querySub);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyPromos, setOnlyPromos] = useState(false);

  // Handle subcategory click
  const handleSelectSubcategory = (subSlugOrId: string | null) => {
    setActiveSubcategory(subSlugOrId);
    // Sync URL cleanly without full page refresh
    const targetUrl = subSlugOrId 
      ? `/categorie/${category.slug || category.id}?sub=${encodeURIComponent(subSlugOrId)}`
      : `/categorie/${category.slug || category.id}`;
    window.history.replaceState(null, '', targetUrl);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Exclude Dubai preorders from normal category page
        if (p.isDubaiPreorder) return false;

        // Subcategory filter: match by subcategoryId or subcategory slug
        if (activeSubcategory) {
          const matchId = p.subcategoryId === activeSubcategory;
          const matchSlug = p.subcategory?.slug === activeSubcategory;
          if (!matchId && !matchSlug) return false;
        }

        // Search query
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchSub = (p.subcategoryName || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchSub) return false;
        }

        // In-stock filter
        if (onlyInStock && !p.inStock) return false;

        // Promo filter
        if (onlyPromos && !p.discountPercent && !p.originalPrice && !p.isFlashSale) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 4.5) - (a.rating || 4.5);
        if (sortBy === 'newest') {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }
        // Featured default: featured items first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [products, activeSubcategory, searchQuery, onlyInStock, onlyPromos, sortBy]);

  const activeSubcategoryObj = useMemo(() => {
    if (!activeSubcategory || !category.subcategories) return null;
    return category.subcategories.find(s => s.id === activeSubcategory || s.slug === activeSubcategory);
  }, [category.subcategories, activeSubcategory]);

  return (
    <div className="space-y-6 sm:space-y-10 pb-16">
      
      {/* 1. Fil d'Ariane & Navigation Rapide */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto scrollbar-none py-1">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1 shrink-0 font-medium">
          <Home className="w-3.5 h-3.5" />
          <span>Accueil</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link href="/categories" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1 shrink-0 font-medium">
          <Layers className="w-3.5 h-3.5" />
          <span>Toutes les catégories</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 dark:text-white font-bold truncate max-w-[200px] sm:max-w-none">
          {category.name}
        </span>
        {activeSubcategoryObj && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold truncate max-w-[150px]">
              {activeSubcategoryObj.name}
            </span>
          </>
        )}
      </nav>

      {/* 2. Hero Banner de la Catégorie avec Effets Premium */}
      <section className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-5 sm:p-8 lg:p-10 border border-slate-200/90 dark:border-slate-800 shadow-lg overflow-hidden">
        {/* Ligne Dégradée Décorative en Haut */}
        <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${theme.topGradient}`} />
        
        {/* Lueur d'ambiance douce */}
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none ${theme.glowColor} opacity-40`} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Côté Gauche : Icône + Titre + Badges & Description */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className={`w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl flex items-center justify-center shrink-0 shadow-md ${theme.iconBg} animate-float-gentle`}>
              {theme.icon}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {category.name}
                </h1>
                
                {/* Badge Total d'articles */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${theme.badgeBg}`}>
                  {products.length} {products.length > 1 ? 'articles disponibles' : 'article'}
                </span>

                {/* Radar Stock Abidjan */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>En stock direct à Abidjan</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                <span className="font-bold text-slate-900 dark:text-white">{theme.tagline}</span> — {category.description || theme.subTitle}
              </p>
            </div>
          </div>

          {/* Côté Droit : Avantages Express */}
          <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-300 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-6">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Livraison express 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Garantie 100% testé</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Paiement Wave & Espèces</span>
            </div>
          </div>

        </div>

        {/* Puces de Sous-Catégories Filtrables */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="relative z-10 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5">
              <span>Rayons & Sous-catégories :</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => handleSelectSubcategory(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shadow-2xs ${
                  !activeSubcategory
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm scale-105'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                Tous les rayons ({products.length})
              </button>

              {category.subcategories.map((sub) => {
                const isSelected = activeSubcategory === sub.id || activeSubcategory === sub.slug;
                const subCount = products.filter(p => p.subcategoryId === sub.id || p.subcategory?.slug === sub.slug).length;

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSelectSubcategory(sub.slug || sub.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shadow-2xs flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{sub.name}</span>
                    {subCount > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {subCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 3. Barre d'outils de Filtrage & Recherche dans cette Catégorie */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Recherche locale */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Rechercher dans ${category.name}...`}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtres Rapides & Tri */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Toggle En Stock */}
          <button
            type="button"
            onClick={() => setOnlyInStock(!onlyInStock)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              onlyInStock
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${onlyInStock ? 'stroke-3' : 'opacity-40'}`} />
            <span>En stock</span>
          </button>

          {/* Toggle Promos */}
          <button
            type="button"
            onClick={() => setOnlyPromos(!onlyPromos)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              onlyPromos
                ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${onlyPromos ? 'fill-white' : 'text-rose-500'}`} />
            <span>Promotions</span>
          </button>

          {/* Sélecteur de Tri */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="featured">En vedette</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="rating">Meilleures notes</option>
              <option value="newest">Nouveautés</option>
            </select>
          </div>
        </div>

      </section>

      {/* 4. Grille de Produits Responsive */}
      {filteredProducts.length > 0 ? (
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="transition-transform duration-300 hover:-translate-y-1">
              <ProductCard product={product} />
            </div>
          ))}
        </section>
      ) : (
        /* État vide si aucun article ne correspond aux filtres */
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Aucun article trouvé
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchQuery || activeSubcategory || onlyInStock || onlyPromos
                ? 'Aucun article ne correspond aux filtres appliqués dans ce rayon.'
                : 'Cette catégorie ne contient pas encore d’articles disponibles en stock direct.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {(searchQuery || activeSubcategory || onlyInStock || onlyPromos) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  handleSelectSubcategory(null);
                  setOnlyInStock(false);
                  setOnlyPromos(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser les filtres</span>
              </button>
            )}
            <Link
              href="/categories"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span>Voir tout le catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* 5. Pavillon de Redirection vers Toutes les Catégories */}
      <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
            Explorez plus de rayons
          </span>
          <h3 className="text-lg sm:text-xl font-black">
            Envie de découvrir d'autres univers ?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Retrouvez tous nos univers High-Tech, Mode, Électroménager et Beauté avec commande instantanée en 1 clic.
          </p>
        </div>

        <Link
          href="/categories"
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <span>Toutes les catégories</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

    </div>
  );
};
