import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { StoreProvider } from '@/lib/storeContext';
import { TopBanner } from '@/components/TopBanner';
import { Navbar } from '@/components/Navbar';
import { CategoryPageView } from '@/components/CategoryPageView';
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

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Dynamic SEO Metadata Generator for Category Pages
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const [category, settings] = await Promise.all([
    prisma.category.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug }
        ]
      }
    }),
    prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
      select: { storeName: true, seoCanonicalUrl: true, seoOgImage: true }
    })
  ]);

  if (!category) {
    return {
      title: 'Catégorie introuvable — Boutique',
      description: 'La catégorie recherchée n\'existe pas ou a été déplacée.',
    };
  }

  const storeName = settings?.storeName || 'Ivoire Djassa';
  const baseUrl = (settings?.seoCanonicalUrl || process.env.APP_URL || 'https://www.ivoireci.com').replace(/\/+$/, '');
  const canonicalUrl = `${baseUrl}/categorie/${category.slug || category.id}`;
  const primaryImage = category.image || settings?.seoOgImage || '';

  const metaTitle = `${category.name} — Vente en Ligne & Stock Abidjan | ${storeName}`;
  const metaDescription = category.description 
    ? `${category.description.slice(0, 160)} — Commandez en ligne ou via WhatsApp avec livraison express 24h à Abidjan.`
    : `Achetez vos articles ${category.name} au meilleur prix chez ${storeName}. Livraison express 24h et paiement sécurisé Wave ou à la livraison.`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: storeName,
      images: primaryImage ? [{ url: primaryImage, width: 1200, height: 630, alt: category.name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function DedicatedCategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const initialSub = typeof search.sub === 'string' ? search.sub : undefined;

  const [category, settings, allCategories, categoryProducts] = await Promise.all([
    prisma.category.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug }
        ]
      },
      include: {
        subcategories: {
          orderBy: { name: 'asc' }
        }
      }
    }),
    getPublicSettings(),
    getPublicCategories(),
    prisma.product.findMany({
      where: {
        OR: [
          { category: { slug: slug } },
          { categoryId: slug }
        ],
        isDubaiPreorder: false
      },
      include: {
        category: true,
        subcategory: true
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  if (!category) {
    notFound();
  }

  const effectiveSettings = settings || initialStoreSettings;
  const baseUrl = (effectiveSettings.seoCanonicalUrl || process.env.APP_URL || 'https://www.ivoireci.com').replace(/\/+$/, '');

  // JSON-LD Structured Data (Breadcrumbs)
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
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `${baseUrl}/categorie/${category.slug || category.id}`,
      },
    ],
  };

  return (
    <>
      {/* Schema.org Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <StoreProvider 
        initialView="shop" 
        initialCategoryFilter={category.id}
        initialSubcategoryFilter={initialSub || null}
        initialData={{
          settings: effectiveSettings,
          categories: allCategories,
          products: categoryProducts as any
        }}
      >
        <AnalyticsTracker />
        
        <div 
          className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors pb-16 sm:pb-0"
          style={{ backgroundColor: effectiveSettings.siteBodyColor || undefined }}
        >
          {/* Top Banner Announcement */}
          <TopBanner />

          {/* Sticky Navbar */}
          <Navbar />

          {/* Main Category Content */}
          <main className="flex-1 max-w-7xl 2xl:max-w-screen-2xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            <CategoryPageView
              category={category as any}
              products={categoryProducts as any}
              initialSubcategorySlug={initialSub}
            />
          </main>

          {/* Global Modals & Drawers */}
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
