import React from 'react';
import { Metadata } from 'next';
import { getHomeInitialData, getPublicSettings } from '@/lib/publicData';
import { StoreProvider } from '@/lib/storeContext';
import { DubaiPreorderPage } from '@/components/DubaiPreorderPage';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { CartToast } from '@/components/CartToast';
import { FloatingChatWidget } from '@/components/FloatingChatWidget';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const storeName = settings?.storeName || 'Ivoire Djassa';
  const canonicalUrl = `${(settings?.seoCanonicalUrl || 'https://www.ivoireci.com').replace(/\/+$/, '')}/dubai`;

  return {
    title: `Espace Dubaï VIP | Précommandes & Arrivages Directs à Abidjan — ${storeName}`,
    description: `Précommandez vos articles authentiques importés directement de Dubaï : parfums orientaux Lattafa, montres de prestige, mode et high-tech. Paiement sécurisé Wave, Orange Money, MTN et livraison garantie à Abidjan sous 7 à 10 jours ouvrés.`,
    keywords: `dubaï abidjan, précommande dubaï, arrivage dubaï abidjan, parfum dubaï original abidjan, lattafa abidjan, montre dubaï abidjan, import dubaï côte d'ivoire, fret aérien dubaï abidjan, shopping dubaï abidjan`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Espace Dubaï VIP | Précommandes & Arrivages Directs à Abidjan — ${storeName}`,
      description: `Articles exclusifs et parfums d'Orient importés de Dubaï. Paiement sécurisé en ligne et livraison express à Abidjan sous 7 à 10 jours.`,
      url: canonicalUrl,
      siteName: storeName,
      type: 'website',
      images: [
        {
          url: settings?.seoOgImage || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&auto=format&fit=crop&q=80',
          width: 1200,
          height: 630,
          alt: `Espace Dubaï VIP — ${storeName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Espace Dubaï VIP | Précommandes & Arrivages Directs à Abidjan — ${storeName}`,
      description: `Commandez vos articles authentiques de Dubaï avec livraison garantie à Abidjan.`,
      images: [settings?.seoOgImage || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&auto=format&fit=crop&q=80'],
    },
  };
}

export default async function DubaiPage() {
  const initialData = await getHomeInitialData();

  return (
    <StoreProvider initialData={initialData}>
      <AnalyticsTracker />
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
        <main className="flex-1">
          <DubaiPreorderPage />
        </main>
        <ProductDetailModal />
        <CartDrawer />
        <CheckoutModal />
        <OrderSuccessModal />
        <CartToast />
        <FloatingChatWidget />
      </div>
    </StoreProvider>
  );
}
