'use client';

import React, { useEffect, use } from 'react';
import { StoreProvider, useStore } from '@/lib/storeContext';
import { TopBanner } from '@/components/TopBanner';
import { PartnerBanner } from '@/components/PartnerBanner';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { FlashSaleSection } from '@/components/FlashSaleSection';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductDetailPage } from '@/components/ProductDetailPage';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { CartToast } from '@/components/CartToast';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { TrustBadges } from '@/components/TrustBadges';
import { FloatingChatWidget } from '@/components/FloatingChatWidget';
import { CmsPages } from '@/components/CmsPages';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';

function PartnerStorefrontContent({ slug }: { slug: string }) {
  const { currentView, setActiveReferral, settings } = useStore();

  useEffect(() => {
    if (settings?.partnerProgramEnabled === false) return;
    if (slug) {
      fetch('/api/partners/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && data.success && data.partner) {
            setActiveReferral(data.partner);
            try {
              localStorage.setItem('boutique_partner_ref', data.partner.slug);
            } catch (e) {}
          }
        })
        .catch(() => {});
    }
  }, [slug, setActiveReferral]);

  return (
    <div 
      className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors pb-16 sm:pb-0"
      style={{ backgroundColor: settings.siteBodyColor || undefined }}
    >
      
      {/* Top Banner Announcement */}
      <TopBanner />

      {/* Partner Branded Referral Banner */}
      <PartnerBanner />

      {/* Main Sticky Navbar */}
      <Navbar />

      {/* Main Dynamic Viewport */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <HeroBanner />
            <FlashSaleSection />
            <ProductGrid 
              showFilters={false} 
              title="Nos Produits & Meilleures Ventes" 
              subtitle="Découvrez notre sélection exclusive recommandée par notre ambassadeur officiel." 
            />
            <TrustBadges />
          </>
        )}

        {currentView === 'shop' && (
          <div className="py-6">
            <ProductGrid showFilters={true} />
          </div>
        )}

        {currentView === 'product-detail' && <ProductDetailPage />}

        {currentView === 'order-success' && <OrderSuccessModal />}

        {(currentView === 'about' ||
          currentView === 'faq' ||
          currentView === 'contact' ||
          currentView === 'delivery' ||
          currentView === 'terms') && <CmsPages />}
      </main>

      {/* Global Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <CartToast />
      <FloatingChatWidget />
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default function PartnerStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <StoreProvider initialView="home">
      <AnalyticsTracker />
      <PartnerStorefrontContent slug={resolvedParams.slug} />
    </StoreProvider>
  );
}
