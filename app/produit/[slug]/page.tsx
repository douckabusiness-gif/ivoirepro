import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { StoreProvider } from '@/lib/storeContext';
import { TopBanner } from '@/components/TopBanner';
import { Navbar } from '@/components/Navbar';
import { ProductDetailPage } from '@/components/ProductDetailPage';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { CartToast } from '@/components/CartToast';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { FloatingChatWidget } from '@/components/FloatingChatWidget';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ProductJsonLd } from '@/components/JsonLd';
import { initialStoreSettings } from '@/lib/initialData';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic SEO Metadata Generator for Google & Social Crawlers
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const [product, settings] = await Promise.all([
    prisma.product.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug }
        ]
      }
    }),
    prisma.storeSettings.findUnique({
      where: { id: 'default_settings' }
    })
  ]);

  if (!product) {
    return {
      title: 'Article introuvable — Boutique',
      description: 'L\'article recherché n\'est plus disponible ou a été déplacé.',
    };
  }

  const storeName = settings?.storeName || 'ELITE BOUTIQUE';
  const priceFormatted = `${product.price.toLocaleString('fr-FR')} FCFA`;
  const canonicalUrl = `${(settings?.seoCanonicalUrl || 'https://eliteboutique.ci').replace(/\/+$/, '')}/produit/${product.slug}`;
  const primaryImage = product.images && product.images.length > 0 ? product.images[0] : settings?.seoOgImage || '';

  const metaTitle = `${product.title} — ${priceFormatted} | ${storeName}`;
  const metaDescription = product.shortDescription || product.description.slice(0, 160);

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
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [primaryImage],
    },
  };
}

export default async function DedicatedProductPage({ params }: PageProps) {
  const { slug } = await params;

  const [product, dbSettings] = await Promise.all([
    prisma.product.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug }
        ]
      },
      include: {
        category: true,
        subcategory: true,
      }
    }),
    prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
      include: { faqList: true }
    })
  ]);

  if (!product) {
    notFound();
  }

  const effectiveSettings = dbSettings ? { ...(dbSettings as any) } : initialStoreSettings;

  return (
    <>
      {/* Schema.org Product Structured Data */}
      <ProductJsonLd product={product} storeSettings={effectiveSettings} />

      <StoreProvider initialView="product-detail">
        <AnalyticsTracker initialProduct={{ id: product.id, title: product.title, slug: product.slug }} />
        <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors pb-16 sm:pb-0">
          <TopBanner />
          <Navbar />

          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
            <ProductDetailPage initialProduct={product as any} />
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
