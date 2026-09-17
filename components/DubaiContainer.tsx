'use client';

import React, { useEffect } from 'react';
import { useStore } from '@/lib/storeContext';
import { DubaiPreorderPage } from '@/components/DubaiPreorderPage';
import { DubaiProductDetailPage } from '@/components/DubaiProductDetailPage';

export const DubaiContainer: React.FC = () => {
  const { currentView, setCurrentView, selectedProductId, setSelectedProductId, products } = useStore();

  // Handle URL params if any (e.g. ?product=id or ?phone=id)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const prodParam = params.get('product') || params.get('phone');
      if (prodParam) {
        const found = products.find(p => p.id === prodParam || p.slug === prodParam);
        if (found) {
          setSelectedProductId(found.id);
          setCurrentView('product-detail');
        }
      }
    }
  }, [products, setSelectedProductId, setCurrentView]);

  if (currentView === 'product-detail') {
    return <DubaiProductDetailPage />;
  }

  return <DubaiPreorderPage />;
};
