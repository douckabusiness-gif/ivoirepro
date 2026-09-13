'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { StoreProvider, useStore, type StoreInitialData } from '@/lib/storeContext';
import { getSiteThemePreset, normalizeHexColor } from '@/lib/siteTheme';

// --- Chemin critique de la home : chargé immédiatement ---
import { TopBanner } from '@/components/TopBanner';
import { PartnerBanner } from '@/components/PartnerBanner';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { FlashSaleSection } from '@/components/FlashSaleSection';
import { TopRankedSection } from '@/components/TopRankedSection';
import { ProductGrid } from '@/components/ProductGrid';
import { TrustBadges } from '@/components/TrustBadges';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { CartToast } from '@/components/CartToast';

// --- Vues secondaires et modales : chargées à la demande (code splitting) ---
// Elles ne pèsent plus sur le JS téléchargé par un visiteur qui arrive sur la home.
const lazy = <T extends React.ComponentType<any>>(loader: () => Promise<{ default: T }>) =>
  dynamic(loader, { ssr: false, loading: () => null });

const ProductDetailPage = lazy(() => import('@/components/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const ProductDetailModal = lazy(() => import('@/components/ProductDetailModal').then(m => ({ default: m.ProductDetailModal })));
const CartDrawer = lazy(() => import('@/components/CartDrawer').then(m => ({ default: m.CartDrawer })));
const CheckoutModal = lazy(() => import('@/components/CheckoutModal').then(m => ({ default: m.CheckoutModal })));
const OrderSuccessModal = lazy(() => import('@/components/OrderSuccessModal').then(m => ({ default: m.OrderSuccessModal })));
const CmsPages = lazy(() => import('@/components/CmsPages').then(m => ({ default: m.CmsPages })));
const MarketingPage = lazy(() => import('@/components/MarketingPage').then(m => ({ default: m.MarketingPage })));
const CustomerPortal = lazy(() => import('@/components/CustomerPortal').then(m => ({ default: m.CustomerPortal })));
const CustomerAuthModal = lazy(() => import('@/components/CustomerAuthModal').then(m => ({ default: m.CustomerAuthModal })));
const DeliveryPortal = lazy(() => import('@/components/DeliveryPortal').then(m => ({ default: m.DeliveryPortal })));
const FloatingChatWidget = lazy(() => import('@/components/FloatingChatWidget').then(m => ({ default: m.FloatingChatWidget })));
const FloatingFeedButton = lazy(() => import('@/components/FloatingFeedButton').then(m => ({ default: m.FloatingFeedButton })));
const TikTokFeedModal = lazy(() => import('@/components/TikTokFeedModal').then(m => ({ default: m.TikTokFeedModal })));
const WebCallModal = lazy(() => import('@/components/WebCallModal').then(m => ({ default: m.WebCallModal })));

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
            <ProductGrid showFilters={false} title="Nos Articles & Collections en Stock" subtitle="Découvrez nos meilleures ventes et sélections exclusives, disponibles immédiatement avec commande directe et livraison express." />
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

export function HomeApp({ initialData }: { initialData: StoreInitialData | null }) {
  return (
    <StoreProvider initialData={initialData}>
      <AnalyticsTracker />
      <MainAppContent />
    </StoreProvider>
  );
}
