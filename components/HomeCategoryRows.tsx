'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useStore } from '@/lib/storeContext';
import { ProductCard } from '@/components/ProductCard';
import { 
  Headphones, 
  Shirt, 
  Watch, 
  Sparkles, 
  Home, 
  Smartphone, 
  Laptop, 
  Baby, 
  Dumbbell, 
  Car, 
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Layers,
  Sparkle,
  Truck,
  ShieldCheck,
  Flame,
  Zap
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

function getCategoryTheme(category: { id: string; name: string; iconName?: string }): CategoryTheme {
  const name = (category.name || '').toLowerCase();

  // 1. Smartphones & High-Tech
  if (name.includes('phone') || name.includes('téléphone') || category.iconName === 'Smartphone') {
    return { 
      icon: <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />, 
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
      icon: <Shirt className="w-5 h-5 text-rose-600 dark:text-rose-400" />, 
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
      icon: <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, 
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
      icon: <Laptop className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />, 
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
      icon: <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />, 
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
      icon: <Watch className="w-5 h-5 text-amber-600 dark:text-amber-400" />, 
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
      icon: <Headphones className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />, 
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
    icon: <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />, 
    iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/30',
    badgeBg: 'bg-indigo-50/90 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
    glowColor: 'bg-indigo-500/15',
    topGradient: 'from-indigo-600 via-purple-500 to-sky-400',
    buttonGradient: 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500',
    tagline: 'Sélection Exclusive & Qualité Certifiée',
    subTitle: 'Nos meilleurs articles vérifiés en stock direct à Abidjan'
  };
}

export const HomeCategoryRows: React.FC = () => {
  const { categories, products, setSelectedCategoryFilter, setSelectedSubcategoryFilter, setCurrentView } = useStore();

  // Filtrer uniquement les articles de la boutique principale (exclure précommandes Dubaï)
  const regularProducts = useMemo(() => {
    return products.filter(p => !p.isDubaiPreorder);
  }, [products]);

  // Construire la liste des catégories qui contiennent au moins un produit
  const activeCategoryRows = useMemo(() => {
    const rows = categories
      .map(category => {
        const catProducts = regularProducts.filter(p => p.categoryId === category.id);
        return {
          category,
          products: catProducts,
        };
      })
      .filter(row => row.products.length > 0);

    // Vérifier s'il y a des articles orphelins (sans catégorie valide)
    const categoryIds = new Set(categories.map(c => c.id));
    const uncategorizedProducts = regularProducts.filter(p => !categoryIds.has(p.categoryId));
    if (uncategorizedProducts.length > 0) {
      rows.push({
        category: {
          id: 'uncategorized',
          name: 'Nouveautés & Découvertes',
          slug: 'nouveautes',
          description: 'Derniers arrivages et articles recommandés',
          itemCount: uncategorizedProducts.length,
          subcategories: []
        } as any,
        products: uncategorizedProducts,
      });
    }

    return rows;
  }, [categories, regularProducts]);

  const handleOpenCategory = (categoryId: string, subcategoryId?: string | null) => {
    setSelectedCategoryFilter(categoryId === 'uncategorized' ? null : categoryId);
    setSelectedSubcategoryFilter(subcategoryId || null);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (activeCategoryRows.length === 0) {
    return null;
  }

  return (
    <div className="site-category-rows space-y-8 sm:space-y-12 py-8 sm:py-14">
      {activeCategoryRows.map(({ category, products: catProducts }, rowIdx) => {
        const theme = getCategoryTheme(category);

        return (
          <section
            key={category.id}
            data-category-id={category.id}
            className="site-category-row relative max-w-7xl 2xl:max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 transition-all duration-300"
          >
            {/* Boîte Cadre Stylée avec Dégradé, Lueur Ambiante et Bordure Moderne */}
            <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
              
              {/* 1. Ligne Dégradée Décorative en Haut du Cadre (Animation Shimmer au survol) */}
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${theme.topGradient} opacity-85 group-hover:opacity-100 transition-opacity`} />
              
              {/* 2. Lueur d'Arrière-Plan Douce & Floutée */}
              <div 
                className={`absolute -top-16 -right-16 w-80 h-80 rounded-full blur-3xl pointer-events-none ${theme.glowColor} opacity-30 group-hover:opacity-60 transition-opacity duration-700`} 
              />

              {/* 3. Header de la Rangée avec Micro-Animations */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5 mb-4 sm:mb-6 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
                
                {/* Côté Gauche : Icône Flottante + Titre + Badges */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Boîte Icône avec Animation Douce (Float) */}
                  <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${theme.iconBg} group-hover:scale-110 transition-transform duration-300 animate-float-gentle`}>
                    {theme.icon}
                  </div>
                  
                  <div>
                    {/* Ligne Titre + Badges Directs */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 
                        onClick={() => handleOpenCategory(category.id)}
                        className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                      >
                        <span>{category.name}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-indigo-600 hidden sm:inline-block" />
                      </h2>
                      
                      {/* Badge Compteur d'articles */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border shadow-2xs ${theme.badgeBg}`}>
                        {catProducts.length} {catProducts.length > 1 ? 'articles disponibles' : 'article'}
                      </span>

                      {/* Radar Live "Stock Direct" */}
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>Stock Abidjan</span>
                      </span>
                    </div>

                    {/* Slogan & Description de la Catégorie */}
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{theme.tagline}</span> — {category.description || theme.subTitle}
                    </p>
                  </div>
                </div>

                {/* Côté Droit : Sous-Catégories en Puces Cliquables & Bouton d'Accès Catégorie */}
                <div className="flex items-center gap-2 self-end md:self-auto overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
                  
                  {/* Puces de sous-catégories interactives (ordinateur) */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="hidden lg:flex items-center gap-1.5 mr-2">
                      {category.subcategories.slice(0, 3).map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => handleOpenCategory(category.id, sub.id)}
                          className="text-[11px] font-semibold px-3 py-1 rounded-full bg-slate-100/80 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap shadow-2xs"
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Bouton d'Action avec Flèche Animée */}
                  <button
                    onClick={() => handleOpenCategory(category.id)}
                    className={`group/btn inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r ${theme.buttonGradient} shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer shrink-0`}
                  >
                    <span>Voir toute la catégorie</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>

              {/* 4. Grille de Produits Responsive & Stylée (3 col Mobile, 4-6 Desktop) */}
              <div className="relative z-10 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-4">
                {catProducts.slice(0, 12).map((product) => (
                  <div key={product.id} className="transition-transform duration-300 hover:-translate-y-1">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* 5. Mini Bannière de Réassurance & Avantages sous les Produits */}
              <div className="relative z-10 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <Truck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Livraison express 24h</span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Garantie conformité</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Paiement Wave & Espèces</span>
                  </span>
                </div>

                {catProducts.length > 12 && (
                  <button
                    onClick={() => handleOpenCategory(category.id)}
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <span>+ {catProducts.length - 12} autres articles dans cette catégorie</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

            </div>
          </section>
        );
      })}

      {/* 6. Grand Pavillon d'Exploration Global en Fin de Page */}
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl border border-indigo-800/40 overflow-hidden group">
          
          {/* Lueur d'ambiance CTA */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-400/30">
              <Layers className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Catalogue Intégral ivoireci.com</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Trouvez l'article idéal parmi toutes nos catégories
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Filtrez facilement par gamme de prix, note client et catégorie avec commande instantanée par WhatsApp ou en ligne.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCategoryFilter(null);
              setSelectedSubcategoryFilter(null);
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="relative z-10 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
          >
            <span>Explorer tout le catalogue ({regularProducts.length} articles)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
