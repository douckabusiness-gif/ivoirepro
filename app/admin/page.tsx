'use client';

import React from 'react';
import { StoreProvider } from '@/lib/storeContext';
import { AdminPanel } from '@/components/AdminPanel';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { WebCallModal } from '@/components/WebCallModal';

function AdminViewContent() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <AdminPanel />
      <ProductDetailModal />
      <WebCallModal />
    </div>
  );
}

export default function AdminPage() {
  return (
    <StoreProvider initialView="admin">
      <AdminViewContent />
    </StoreProvider>
  );
}
