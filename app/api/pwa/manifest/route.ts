import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initialStoreSettings } from '@/lib/initialData';

export const dynamic = 'force-dynamic';

const FALLBACK_ICON = '/icons/icon-192x192.svg';

function iconSource(iconUrl: string | null | undefined, size: number) {
  const value = iconUrl?.trim();
  if (!value) return FALLBACK_ICON;
  // Data URLs are too large and unreliable inside a manifest. The icon route
  // serves them as an ordinary same-origin image instead.
  if (value.startsWith('data:')) return `/api/pwa/icon?size=${size}`;
  return value;
}

function iconType(iconUrl: string | null | undefined) {
  const value = iconUrl?.trim().toLowerCase() || '';
  if (!value) return 'image/svg+xml';
  if (value.startsWith('data:image/jpeg') || value.endsWith('.jpg') || value.endsWith('.jpeg')) return 'image/jpeg';
  if (value.startsWith('data:image/webp') || value.endsWith('.webp')) return 'image/webp';
  if (value.startsWith('data:image/svg') || value.endsWith('.svg')) return 'image/svg+xml';
  return 'image/png';
}

export async function GET() {
  let settings: any = null;
  try {
    settings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
      select: { storeName: true, storeSlogan: true, pwaIconUrl: true },
    });
  } catch {
    // The storefront can still provide a valid installable manifest while the
    // database is unavailable by using the built-in defaults.
  }

  const source = settings || initialStoreSettings;
  const icon192 = iconSource(source.pwaIconUrl, 192);
  const icon512 = iconSource(source.pwaIconUrl, 512);
  const iconMimeType = iconType(source.pwaIconUrl);

  return NextResponse.json(
    {
      name: source.storeName || 'Boutique',
      short_name: source.storeName || 'Boutique',
      description: source.storeSlogan || 'Boutique en ligne',
      start_url: '/?source=pwa',
      scope: '/',
      id: '/?source=pwa',
      display: 'standalone',
      display_override: ['standalone', 'minimal-ui', 'window-controls-overlay'],
      orientation: 'portrait-primary',
      background_color: '#020617',
      theme_color: '#4f46e5',
      lang: 'fr-FR',
      dir: 'ltr',
      categories: ['shopping', 'lifestyle', 'business'],
      prefer_related_applications: false,
      icons: [
        { src: icon192, sizes: '192x192', type: iconMimeType, purpose: 'any' },
        { src: icon512, sizes: '512x512', type: iconMimeType, purpose: 'any' },
        { src: icon512, sizes: '512x512', type: iconMimeType, purpose: 'maskable' },
      ],
      shortcuts: [
        {
          name: 'Ventes Flash',
          short_name: 'Flash',
          description: 'Accéder directement aux promotions',
          url: '/?view=flash&source=pwa_shortcut',
          icons: [{ src: icon192, sizes: '192x192', type: iconMimeType }],
        },
        {
          name: 'Catalogue Produits',
          short_name: 'Catalogue',
          description: 'Explorer tous nos articles en stock',
          url: '/?view=shop&source=pwa_shortcut',
          icons: [{ src: icon192, sizes: '192x192', type: iconMimeType }],
        },
        {
          name: 'Mon Panier',
          short_name: 'Panier',
          description: 'Consulter vos articles enregistrés',
          url: '/?view=cart&source=pwa_shortcut',
          icons: [{ src: icon192, sizes: '192x192', type: iconMimeType }],
        },
        {
          name: 'Service WhatsApp',
          short_name: 'WhatsApp',
          description: 'Échanger avec notre conseiller client',
          url: '/?view=contact&source=pwa_shortcut',
          icons: [{ src: icon192, sizes: '192x192', type: iconMimeType }],
        },
      ],
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
