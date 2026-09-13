import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Syne } from 'next/font/google';
import './globals.css';
import { PWARegister } from '@/components/PWARegister';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { StoreJsonLd } from '@/components/JsonLd';
import { prisma } from '@/lib/prisma';
import { initialStoreSettings } from '@/lib/initialData';
import { normalizeGoogleAnalyticsId } from '@/lib/googleAnalytics';

export const dynamic = 'force-dynamic';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export async function generateMetadata(): Promise<Metadata> {
  let settings = null;
  try {
    settings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
    });
  } catch (e) {}

  const s = settings || initialStoreSettings;
  const baseUrl = (s.seoCanonicalUrl?.trim() || 'https://eliteboutique.ci').replace(/\/+$/, '');
  const storeName = s.storeName?.trim() || 'Boutique';
  const title = s.seoTitle?.trim() || `${storeName} - Ventes Flash, Mode & Shopping`;
  const description = s.seoDescription?.trim() || s.storeSlogan?.trim() || 'Boutique en ligne en Côte d\'Ivoire avec livraison 24h.';
  const ogImage = s.seoOgImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80';
  const pwaIcon = s.pwaIconUrl?.trim() ? '/api/pwa/icon' : '/icons/icon-192x192.svg';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${storeName}`,
    },
    description,
    keywords: s.seoKeywords ? s.seoKeywords.split(',').map((k: string) => k.trim()) : undefined,
    applicationName: storeName,
    manifest: '/api/pwa/manifest',
    alternates: {
      canonical: baseUrl,
    },
    verification: s.seoGoogleVerification ? {
      google: s.seoGoogleVerification,
    } : undefined,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: storeName,
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: pwaIcon, sizes: '192x192' }
      ],
      apple: [
        { url: pwaIcon, sizes: '192x192' }
      ],
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: storeName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: storeName,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  let settings = null;
  try {
    settings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
    });
  } catch (e) {}

  const s = settings ? { ...(settings as any) } : initialStoreSettings;
  const pwaIcon = s.pwaIconUrl?.trim() ? '/api/pwa/icon' : '/icons/icon-192x192.svg';
  const storeName = s.storeName?.trim() || 'Boutique';
  const googleAnalyticsId = normalizeGoogleAnalyticsId(s.seoGoogleAnalyticsId);
  const facebookPixelId = typeof s.seoFacebookPixelId === 'string' && /^\d{5,20}$/.test(s.seoFacebookPixelId.trim())
    ? s.seoFacebookPixelId.trim()
    : '';

  return (
    <html lang="fr" className={`scroll-smooth ${plusJakarta.variable} ${syne.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={storeName} />
        <link rel="apple-touch-icon" href={pwaIcon} />
        <link rel="manifest" href="/api/pwa/manifest" />

        {/* Schema.org Structured Data (JSON-LD) */}
        <StoreJsonLd settings={s} />

        {/* Google Analytics 4 Script (if configured) */}
        {googleAnalyticsId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAnalyticsId)}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', ${JSON.stringify(googleAnalyticsId)}, { send_page_view: false });
                `,
              }}
            />
          </>
        )}

        {/* Facebook / Meta Pixel Script (if configured) */}
        {facebookPixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', ${JSON.stringify(facebookPixelId)});
                fbq('track', 'PageView');
              `,
            }}
          />
        )}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var origFetch = (typeof window !== 'undefined' && window.fetch) ? window.fetch.bind(window) : null;
                  var _fetch = origFetch;
                  Object.defineProperty(window, 'fetch', {
                    get: function() { return _fetch; },
                    set: function(val) { _fetch = val; },
                    configurable: true,
                    enumerable: true
                  });
                  var saved = localStorage.getItem('boutique_theme_mode') || localStorage.getItem('admin_dark_mode');
                  if (saved === 'dark' || saved === 'true' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 selection:bg-indigo-600 selection:text-white min-h-screen flex flex-col font-sans transition-colors duration-200" suppressHydrationWarning>
        <PWARegister />
        <OfflineIndicator />
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
