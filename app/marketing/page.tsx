'use client';

import React, { useEffect } from 'react';
import { StoreProvider, useStore } from '@/lib/storeContext';
import { TopBanner } from '@/components/TopBanner';
import { Navbar } from '@/components/Navbar';
import { MarketingPage } from '@/components/MarketingPage';
import { Footer } from '@/components/Footer';
import { FloatingChatWidget } from '@/components/FloatingChatWidget';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { CartToast } from '@/components/CartToast';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';

function MarketingContent() {
  const { setCurrentView } = useStore();

  useEffect(() => {
    setCurrentView('marketing');
  }, [setCurrentView]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors pb-16 sm:pb-0">
      <TopBanner />
      <Navbar />
      <main className="flex-1">
        <MarketingPage />
      </main>
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

export default function Page() {
  return (
    <StoreProvider initialView="marketing">
      <AnalyticsTracker />
      <MarketingContent />
    </StoreProvider>
  );
}
