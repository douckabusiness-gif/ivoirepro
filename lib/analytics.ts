'use client';

export type AnalyticsEventType =
  | 'page_view'
  | 'click'
  | 'product_view'
  | 'add_to_cart'
  | 'checkout_started'
  | 'purchase'
  | 'whatsapp_click'
  | 'wishlist_toggle'
  | 'search';

export interface TrackAnalyticsEventInput {
  eventType: AnalyticsEventType;
  path?: string;
  productId?: string;
  productTitle?: string;
  label?: string;
  metadata?: Record<string, unknown>;
}

const VISITOR_KEY = 'boutique_analytics_visitor_id';
const SESSION_KEY = 'boutique_analytics_session_id';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getStoredId(storage: Storage, key: string, prefix: string) {
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const id = createId(prefix);
    storage.setItem(key, id);
    return id;
  } catch {
    return createId(prefix);
  }
}

export function getAnalyticsVisitorId() {
  if (typeof window === 'undefined') return 'server';
  return getStoredId(window.localStorage, VISITOR_KEY, 'visitor');
}

export function getAnalyticsSessionId() {
  if (typeof window === 'undefined') return 'server';
  return getStoredId(window.sessionStorage, SESSION_KEY, 'session');
}

export function getAnalyticsPath(view: string, productId?: string | null) {
  if (view === 'home') return '/';
  if (view === 'shop') return '/boutique';
  if (view === 'product-detail') return productId ? `/produit/${productId}` : '/produit';
  if (view === 'admin') return '/admin';
  return `/${view}`;
}

export function trackAnalyticsEvent(input: TrackAnalyticsEventInput) {
  if (typeof window === 'undefined') return;

  const path = (input.path || window.location.pathname || '/').slice(0, 240);
  if (path === '/admin' || path.startsWith('/admin/')) return;

  const payload = {
    eventType: input.eventType,
    path,
    visitorId: getAnalyticsVisitorId(),
    sessionId: getAnalyticsSessionId(),
    productId: input.productId?.slice(0, 120),
    productTitle: input.productTitle?.slice(0, 180),
    label: input.label?.slice(0, 180),
    metadata: input.metadata,
    referrer: document.referrer?.slice(0, 500) || undefined,
  };

  try {
    if (typeof window.gtag === 'function') {
      const eventParams = Object.fromEntries(
        Object.entries({
          event_category: 'engagement',
          event_label: input.label || input.productTitle || path,
          page_path: path,
          product_id: input.productId,
          product_name: input.productTitle,
          ...input.metadata,
        }).filter(([, value]) => value !== undefined && value !== null && typeof value !== 'object')
      );
      window.gtag('event', input.eventType, eventParams);
    }

    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon('/api/analytics', blob)) return;
    }
    void fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics must never interrupt the shopping experience.
  }
}
