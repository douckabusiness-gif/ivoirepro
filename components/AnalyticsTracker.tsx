'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/storeContext';
import { getAnalyticsPath, trackAnalyticsEvent } from '@/lib/analytics';
import type { Product } from '@/lib/types';

function getClickableElement(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const clickable = target.closest<HTMLElement>('button, a, [role="button"], [data-analytics-label], [data-analytics-product-id]');
  if (clickable) return clickable;
  return target instanceof HTMLElement ? target : target.parentElement;
}

export function AnalyticsTracker({ initialProduct }: { initialProduct?: Pick<Product, 'id' | 'title' | 'slug'> }) {
  const { currentView, selectedProductId, quickViewProduct, products } = useStore();
  const lastPageKey = useRef<string | null>(null);
  const lastQuickViewId = useRef<string | null>(null);

  useEffect(() => {
    if (currentView === 'admin') return;
    const productId = currentView === 'product-detail' ? selectedProductId : null;
    const pageKey = `${currentView}:${productId || ''}`;
    if (lastPageKey.current === pageKey) return;
    lastPageKey.current = pageKey;

    const product = productId ? products.find((item) => item.id === productId) || initialProduct : initialProduct;
    const path = getAnalyticsPath(currentView, product?.slug || productId);
    trackAnalyticsEvent({
      eventType: 'page_view',
      path,
      productId: product?.id,
      productTitle: product?.title,
      metadata: { view: currentView },
    });
    if (product) {
      trackAnalyticsEvent({
        eventType: 'product_view',
        path,
        productId: product.id,
        productTitle: product.title,
        metadata: { surface: 'product_page' },
      });
    }
  }, [currentView, selectedProductId, products, initialProduct]);

  useEffect(() => {
    const product = quickViewProduct;
    if (!product || currentView === 'admin' || lastQuickViewId.current === product.id) return;
    lastQuickViewId.current = product.id;
    trackAnalyticsEvent({
      eventType: 'product_view',
      path: getAnalyticsPath(currentView, selectedProductId),
      productId: product.id,
      productTitle: product.title,
      metadata: { surface: 'quick_view' },
    });
  }, [quickViewProduct, currentView, selectedProductId]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (currentView === 'admin') return;
      const element = getClickableElement(event.target);
      if (!element) return;

      const productElement = element.closest<HTMLElement>('[data-analytics-product-id]');
      const productId = productElement?.dataset.analyticsProductId;
      const productTitle = productElement?.dataset.analyticsProductTitle;
      const isInteractive = Boolean(element.closest('button, a, [role="button"], [data-analytics-label]'));
      const label = element.dataset.analyticsLabel || element.getAttribute('aria-label') || element.getAttribute('title') || (isInteractive ? element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 180) : element.tagName.toLowerCase());

      trackAnalyticsEvent({
        eventType: 'click',
        path: getAnalyticsPath(currentView, selectedProductId),
        productId,
        productTitle,
        label,
        metadata: { tag: element.tagName.toLowerCase(), isInteractive },
      });
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [currentView, selectedProductId]);

  return null;
}
