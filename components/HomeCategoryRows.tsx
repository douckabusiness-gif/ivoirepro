'use client';

import React, { useMemo } from 'react';
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
  ArrowRight,
  Layers,
  Sparkle
} from 'lucide-react';

function getCategoryVisuals(category: { id: string; name: string; iconName?: string }) {
  const name = (category.name || '').toLowerCase();
  if (name.includes('phone') || name.includes('téléphone') || category.iconName === 'Smartphone') {
    return { 
      icon: <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />, 
      badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-900/50',
      iconBoxBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    };
  }
  if (name.includes('mode') || name.includes('vêtement') || name.includes('chaussure') || category.iconName === 'Shirt') {
    return { 
      icon: <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 dark:text-rose-400" />, 
      badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/50',
      iconBoxBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
    };
  }
  if (name.includes('électroménager') || name.includes('maison') || category.iconName === 'Home') {
    return { 
      icon: <Home className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />, 
      badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/50',
      iconBoxBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    };
  }
  if (name.includes('informatique') || name.includes('ordinateur') || category.iconName === 'Laptop') {
    return { 
      icon: <Laptop className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />, 
      badgeBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-900/50',
      iconBoxBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
    };
  }
  if (name.includes('beauté') || name.includes('parfum') || category.iconName === 'Sparkles') {
    return { 
      icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />, 
      badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-900/50',
      iconBoxBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    };
  }
  if (name.includes('montre') || name.includes('bijou') || category.iconName === 'Watch') {
    return { 
      icon: <Watch className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />, 
      badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/50',
      iconBoxBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    };
  }
  if (name.includes('son') || name.includes('électronique') || category.iconName === 'Headphones') {
    return { 
      icon: <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />, 
      badgeBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-900/50',
      iconBoxBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
    };
  }
  if (name.includes('bébé') || name.includes('enfant') || category.iconName === 'Baby') {
    return { 
      icon: <Baby className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 dark:text-pink-400" />, 
      badgeBg: 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200/60 dark:border-pink-900/50',
      iconBoxBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
    };
  }
  if (name.includes('sport') || category.iconName === 'Dumbbell') {
    return { 
      icon: <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />, 
      badgeBg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/60 dark:border-orange-900/50',
      iconBoxBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
    };
  }
  if (name.includes('auto') || category.iconName === 'Car') {
    return { 
      icon: <Car className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />, 
      badgeBg: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200/60 dark:border-red-900/50',
      iconBoxBg: 'bg-red-500/10 text-red-600 dark:text-red-400'
    };
  }
  return { 
    icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />, 
    badgeBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-900/50',
    iconBoxBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
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
          description: 'Derniers arrivages et produits disponibles',
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
    <div className="site-category-rows space-y-8 sm:space-y-12 py-8 sm:py-12">
      {activeCategoryRows.map(({ category, products: catProducts }, idx) => {
        const visuals = getCategoryVisuals(category);

        return (
          <section
            key={category.id}
            data-category-id={category.id}
            className={`site-category-row relative max-w-7xl 2xl:max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8`}
          >
            {/* Header de la rangée de catégorie */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              
              {/* Côté Gauche : Icône + Titre + Compteur */}
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${visuals.iconBoxBg}`}>
                  {visuals.icon}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h2 
                      onClick={() => handleOpenCategory(category.id)}
                      className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {category.name}
                    </h2>
                    
                    <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${visuals.badgeBg}`}>
                      {catProducts.length} {catProducts.length > 1 ? 'articles' : 'article'}
                    </span>
                  </div>
                  
                  {category.description && (
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Côté Droit : Sous-catégories & Bouton "Voir tout" */}
              <div className="flex items-center gap-2 self-end sm:self-auto overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="hidden md:flex items-center gap-1.5 mr-2">
                    {category.subcategories.slice(0, 3).map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => handleOpenCategory(category.id, sub.id)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer whitespace-nowrap"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleOpenCategory(category.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-xs transition cursor-pointer shrink-0"
                >
                  <span>Voir tout le rayon</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Rangée de produits : Grille compacte responsive (3 col mobile, 4-6 col desktop) */}
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-4">
              {catProducts.slice(0, 12).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Bouton "Voir plus" si la catégorie a plus de 12 articles */}
            {catProducts.length > 12 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => handleOpenCategory(category.id)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  <span>Voir les {catProducts.length - 12} autres articles de {category.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </section>
        );
      })}

      {/* CTA Global vers le catalogue complet */}
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-indigo-900/40">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Catalogue ivoireci.com</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Vous recherchez un article particulier ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Parcourez l'ensemble de notre boutique avec filtres de prix, recherche rapide et livraison express partout à Abidjan sous 24h.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCategoryFilter(null);
              setSelectedSubcategoryFilter(null);
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all duration-200 cursor-pointer shrink-0"
          >
            <span>Explorer tout le catalogue ({regularProducts.length} articles)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
