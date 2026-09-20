'use client';

import React from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  Headphones, 
  Shirt, 
  Watch, 
  Sparkles, 
  Home, 
  Grid, 
  ArrowRight,
  Layers,
  ChevronRight,
  Smartphone,
  Laptop,
  Baby,
  Dumbbell,
  Car,
  ShoppingBag
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Headphones: <Headphones className="w-5 h-5 text-indigo-600" />,
  Shirt: <Shirt className="w-5 h-5 text-rose-600" />,
  Watch: <Watch className="w-5 h-5 text-amber-600" />,
  Sparkles: <Sparkles className="w-5 h-5 text-sky-600" />,
  Home: <Home className="w-5 h-5 text-emerald-600" />,
  Smartphone: <Smartphone className="w-5 h-5 text-blue-600" />,
  Laptop: <Laptop className="w-5 h-5 text-cyan-600" />,
  Baby: <Baby className="w-5 h-5 text-pink-600" />,
  Dumbbell: <Dumbbell className="w-5 h-5 text-orange-600" />,
  Car: <Car className="w-5 h-5 text-red-600" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5 text-teal-600" />,
  Grid: <Grid className="w-5 h-5 text-slate-600" />,
};

export const CategoryShowcase = () => {
  const { categories, products, setSelectedCategoryFilter, setSelectedSubcategoryFilter, setCurrentView } = useStore();

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryFilter(categoryId);
    setSelectedSubcategoryFilter(null);
    setCurrentView('shop');
  };

  return (
    <section className="py-10 sm:py-14 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              <Layers className="w-4 h-4" />
              <span>Pavillons & Univers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Explorer par Secteur d'Activité
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Parcourez nos catégories spécialisées avec photos d'articles réels et sous-catégories détaillées.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCategoryFilter(null);
              setSelectedSubcategoryFilter(null);
              setCurrentView('shop');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-xs transition self-start sm:self-auto cursor-pointer"
          >
            <span>Voir toutes les catégories ({products.filter(p => !p.isDubaiPreorder).length} articles)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Alibaba Category Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => {
            const count = products.filter(p => !p.isDubaiPreorder && p.categoryId === category.id).length;
            const categoryProducts = products.filter(p => !p.isDubaiPreorder && p.categoryId === category.id).slice(0, 3);
            const icon = iconMap[category.iconName || ''] || <Grid className="w-5 h-5 text-slate-700 dark:text-slate-300" />;

            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="group bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 p-4 transition-all duration-300 hover:shadow-xl flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Category Top Banner & Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/60 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 flex items-center justify-center transition-colors">
                        {icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {category.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                          {count} {count > 1 ? 'articles référencés' : 'article'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3-Thumbnail Preview Grid */}
                  <div className="grid grid-cols-3 gap-1.5 my-3">
                    {categoryProducts.length > 0 ? (
                      categoryProducts.map((p, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-100 dark:border-slate-700">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 h-20 bg-slate-50 dark:bg-slate-700/40 rounded-lg flex items-center justify-center text-xs text-slate-400">
                        Nouveautés en cours
                      </div>
                    )}
                  </div>

                  {/* Subcategories Tags */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {category.subcategories.slice(0, 3).map(sub => (
                        <span
                          key={sub.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategoryFilter(category.id);
                            setSelectedSubcategoryFilter(sub.id);
                            setCurrentView('shop');
                          }}
                          className="text-[10px] font-medium bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md transition"
                        >
                          {sub.name}
                        </span>
                      ))}
                      {category.subcategories.length > 3 && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold px-1 py-0.5">
                          +{category.subcategories.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom CTA */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <span>Accéder à la catégorie</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

