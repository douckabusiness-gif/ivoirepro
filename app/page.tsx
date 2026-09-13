'use client';

import React from 'react';
import { StoreProvider, useStore } from '@/lib/storeContext';
import { TopBanner } from '@/components/TopBanner';
import { PartnerBanner } from '@/components/PartnerBanner';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { FlashSaleSection } from '@/components/FlashSaleSection';
import { TopRankedSection } from '@/components/TopRankedSection';
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
import { AdminPanel } from '@/components/AdminPanel';
import { MarketingPage } from '@/components/MarketingPage';
import { CustomerPortal } from '@/components/CustomerPortal';
import { CustomerAuthModal } from '@/components/CustomerAuthModal';
import { DeliveryPortal } from '@/components/DeliveryPortal';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { FloatingFeedButton } from '@/components/FloatingFeedButton';
import { TikTokFeedModal } from '@/components/TikTokFeedModal';
import { WebCallModal } from '@/components/WebCallModal';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { getSiteThemePreset, normalizeHexColor } from '@/lib/siteTheme';

function MainAppContent() {
  const { currentView, settings } = useStore();
  const homePreset = getSiteThemePreset(settings.homeTheme);
  const bodyColor = normalizeHexColor(settings.siteBodyColor, homePreset.bodyColor);
  const homeVisuals = settings.homeTheme === 'custom'
    ? { ...homePreset, bodyColor, mutedColor: bodyColor }
    : homePreset;
  const themeStyle = {
    '--site-body-color': bodyColor,
    '--home-surface-color': homeVisuals.surfaceColor,
    '--home-muted-color': homeVisuals.mutedColor,
    '--home-flash-start': homeVisuals.flashStart,
    '--home-flash-mid': homeVisuals.flashMid,
    '--home-flash-end': homeVisuals.flashEnd,
  } as React.CSSProperties;

  return (
    <div
      className="site-app-shell min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors pb-16 sm:pb-0"
      style={{ ...themeStyle, backgroundColor: bodyColor }}
    >
      
      {/* Top Banner Announcement */}
      <TopBanner />

      {/* Partner Branded Referral Banner */}
      <PartnerBanner />

      {/* Main Sticky Navbar */}
      <Navbar />

      {/* Main Dynamic Viewport */}
      <main className="flex-1" style={{ backgroundColor: bodyColor }}>
        {currentView === 'home' && (
          <div className="site-home-theme" data-home-theme={settings.homeTheme || 'midnight'}>
            <HeroBanner />
            <FlashSaleSection />
            <TopRankedSection />
            <ProductGrid showFilters={false} title="Nos Articles en Stock" subtitle="Découvrez nos meilleures ventes et articles disponibles immédiatement avec livraison rapide." />
            <TrustBadges />
          </div>
        )}

        {currentView === 'shop' && (
          <div className="py-6">
            <ProductGrid showFilters={true} />
          </div>
        )}

        {currentView === 'product-detail' && (
          <ProductDetailPage />
        )}

        {currentView === 'order-success' && <OrderSuccessModal />}

        {(currentView === 'about' ||
          currentView === 'faq' ||
          currentView === 'contact' ||
          currentView === 'delivery' ||
          currentView === 'terms' ||
          currentView === 'privacy') && <CmsPages />}

        {currentView === 'marketing' && <MarketingPage />}

        {currentView === 'compte' && <CustomerPortal />}

        {currentView === 'livreur' && <DeliveryPortal />}
      </main>


      {/* Global Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <CustomerAuthModal />
      <CartToast />
      <WebCallModal />
      {settings?.tiktokFeedEnabled !== false && <TikTokFeedModal />}

      {/* Floating Action Buttons */}
      {settings?.tiktokFeedEnabled !== false && (currentView === 'home' || currentView === 'shop') && <FloatingFeedButton />}
      <FloatingChatWidget />

      {/* Comprehensive French E-Commerce Footer */}
      <Footer />

      {/* Native Mobile PWA Bottom Navigation Bar */}
      <MobileBottomNav />

    </div>
  );
}

export default function Page() {
  return (
    <StoreProvider>
      <AnalyticsTracker />
      <MainAppContent />
    </StoreProvider>
  );
}
