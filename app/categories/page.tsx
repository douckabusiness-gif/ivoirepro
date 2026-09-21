import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { StoreProvider } from '@/lib/storeContext';
import { TopBanner } from '@/components/TopBanner';
import { Navbar } from '@/components/Navbar';
import { ProductGrid } from '@/components/ProductGrid';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { CartToast } from '@/components/CartToast';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { FloatingChatWidget } from '@/components/FloatingChatWidget';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { getPublicSettings, getPublicProducts, getPublicCategories } from '@/lib/publicData';
import { initialStoreSettings } from '@/lib/initialData';
import { 
  ChevronRight, 
  Home, 
  Layers, 
  ArrowRight, 
  ShoppingBag, 
  Smartphone, 
  Shirt, 
  Laptop, 
  Watch, 
  Headphones, 
  Sparkles,
  Truck,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function getCategoryIcon(name: string, iconName?: string | null) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('phone') || lower.includes('téléphone') || iconName === 'Smartphone') {
    return <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
  }
  if (lower.includes('mode') || lower.includes('vêtement') || lower.includes('chaussure') || iconName === 'Shirt') {
    return <Shirt className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
  }
  if (lower.includes('électroménager') || lower.includes('maison') || iconName === 'Home') {
    return <Home className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
  }
  if (lower.includes('informatique') || lower.includes('ordinateur') || iconName === 'Laptop') {
    return <Laptop className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />;
  }
  if (lower.includes('beauté') || lower.includes('parfum') || iconName === 'Sparkles') {
    return <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
  }
  if (lower.includes('montre') || lower.includes('bijou') || iconName === 'Watch') {
    return <Watch className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
  }
  if (lower.includes('son') || lower.includes('électronique') || iconName === 'Headphones') {
    return <Headphones className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
  }
  return <ShoppingBag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: 'default_settings' },
    select: { storeName: true, seoCanonicalUrl: true, seoOgImage: true }
  });

  const storeName = settings?.storeName || 'Ivoire Djassa';
  const baseUrl = (settings?.seoCanonicalUrl || process.env.APP_URL || 'https://www.ivoireci.com').replace(/\/+$/, '');
  const canonicalUrl = `${baseUrl}/categories`;

  return {
    title: `Toutes les Catégories & Rayons | ${storeName}`,
    description: `Découvrez l'ensemble de notre catalogue par catégorie : Smartphones, High-Tech, Mode, Électroménager, Informatique et Beauté avec livraison express 24h à Abidjan.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Toutes les Catégories & Rayons | ${storeName}`,
      description: `Parcourez tous nos univers de produits en stock direct à Abidjan.`,
      url: canonicalUrl,
      siteName: storeName,
      images: settings?.seoOgImage ? [{ url: settings.seoOgImage, width: 1200, height: 630, alt: 'Catégories' }] : [],
      type: 'website',
    },
  };
}

export default async function AllCategoriesPage() {
  const [settings, categories, products] = await Promise.all([
    getPublicSettings(),
    getPublicCategories(),
    getPublicProducts()
  ]);

  const effectiveSettings = settings || initialStoreSettings;
  const baseUrl = (effectiveSettings.seoCanonicalUrl || process.env.APP_URL || 'https://www.ivoireci.com').replace(/\/+$/, '');

  // Only non-Dubai products for the standard catalogue
  const regularProducts = products.filter(p => !p.isDubaiPreorder);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Toutes les catégories',
        item: `${baseUrl}/categories`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <StoreProvider 
        initialView="shop" 
        initialCategoryFilter={null}
        initialData={{
          settings: effectiveSettings,
          categories: categories,
          products: regularProducts as any
        }}
      >
        <AnalyticsTracker />

        <div 
          className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors pb-16 sm:pb-0"
          style={{ backgroundColor: effectiveSettings.siteBodyColor || undefined }}
        >
          <TopBanner />
          <Navbar />

          <main className="flex-1 max-w-7xl 2xl:max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8 sm:space-y-12">
            
            {/* 1. Breadcrumbs */}
            <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1 font-medium">
                <Home className="w-3.5 h-3.5" />
                <span>Accueil</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 dark:text-white font-bold">
                Toutes les catégories
              </span>
            </nav>

            {/* 2. Header Hero */}
            <section className="relative bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-indigo-800/40 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-400/30">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Rayons & Univers</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                  Toutes nos Catégories
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Explorez nos sélections exclusives par rayon. Chaque article est minutieusement vérifié et disponible en stock direct avec livraison express 24h partout à Abidjan.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-indigo-400" />
                    <span>Livraison 24h</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Articles garantis</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Paiement Wave & Cash</span>
                  </span>
                </div>
              </div>
            </section>

            {/* 3. Grille Visuelle des Catégories */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Sélectionnez un rayon
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Cliquez sur une catégorie pour accéder à sa page dédiée avec tous ses articles et sous-rayons.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
                  {categories.length} catégories
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {categories.map((category) => {
                  const catProducts = regularProducts.filter(p => p.categoryId === category.id);
                  const icon = getCategoryIcon(category.name, category.iconName);

                  return (
                    <Link
                      key={category.id}
                      href={`/categorie/${category.slug || category.id}`}
                      className="group bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
                    >
                      {/* Top Accent Line */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="space-y-3">
                        {/* Header: Icon + Product Count Badge */}
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                            {icon}
                          </div>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {catProducts.length} {catProducts.length > 1 ? 'articles' : 'article'}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                            <span>{category.name}</span>
                            <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                            {category.description || 'Découvrez tous les articles et nouveautés en stock direct.'}
                          </p>
                        </div>

                        {/* Subcategories preview */}
                        {category.subcategories && category.subcategories.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {category.subcategories.slice(0, 3).map((sub) => (
                              <span
                                key={sub.id}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              >
                                {sub.name}
                              </span>
                            ))}
                            {category.subcategories.length > 3 && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 text-slate-400">
                                +{category.subcategories.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Button */}
                      <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                        <span>Voir toute la catégorie</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* 4. Catalogue Intégral avec Filtres */}
            <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Catalogue Complet de la Boutique
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Filtrez et triez l'ensemble des articles disponibles en temps réel.
                </p>
              </div>

              <ProductGrid showFilters={true} />
            </section>

          </main>

          <CartDrawer />
          <CheckoutModal />
          <CartToast />
          <OrderSuccessModal />
          <FloatingChatWidget />
          <Footer />
          <MobileBottomNav />
        </div>
      </StoreProvider>
    </>
  );
}
