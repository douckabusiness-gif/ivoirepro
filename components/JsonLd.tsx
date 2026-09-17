import React from 'react';
import { StoreSettings } from '@/lib/types';

interface JsonLdProps {
  settings: StoreSettings;
}

// Prevent attacker-controlled values from closing the script element when JSON-LD
// contains product or store data managed from the admin panel.
function serializeJsonLd(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function StoreJsonLd({ settings }: JsonLdProps) {
  const baseUrl = settings.seoCanonicalUrl || 'https://www.ivoireci.com';
  const storeName = settings.storeName || 'Ivoire Djassa';
  const description = settings.seoDescription || settings.storeSlogan || 'Boutique en ligne premium';
  const logo = settings.storeLogoUrl || settings.seoOgImage || `${baseUrl}/icons/icon-512x512.svg`;

  const sameAsLinks = [
    settings.facebookUrl,
    settings.instagramUrl,
    settings.tiktokUrl,
  ].filter(Boolean);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': `${baseUrl}/#store`,
    name: storeName,
    url: baseUrl,
    logo: logo,
    image: settings.seoOgImage || logo,
    description: description,
    telephone: settings.contactPhone || undefined,
    email: settings.contactEmail || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.contactAddress || 'Cocody',
      addressLocality: 'Abidjan',
      addressCountry: 'CI',
    },
    currenciesAccepted: 'XOF',
    paymentAccepted: 'Wave, Orange Money, MTN MoMo, Moov Money, Cash, Credit Card',
    priceRange: 'FCFA',
    sameAs: sameAsLinks.length > 0 ? sameAsLinks : undefined,
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: storeName,
    description: description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteSchema) }}
      />
    </>
  );
}

export function ProductJsonLd({ product, storeSettings }: { product: any; storeSettings: StoreSettings }) {
  const baseUrl = storeSettings.seoCanonicalUrl || 'https://www.ivoireci.com';
  const currency = storeSettings.currency || 'FCFA';

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images && product.images.length > 0 ? product.images : [storeSettings.seoOgImage],
    description: product.description || product.shortDescription || product.title,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: storeSettings.storeName || 'Ivoire Djassa',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/produit/${product.slug}`,
      priceCurrency: 'XOF',
      price: product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock !== false 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: storeSettings.storeName || 'ELITE BOUTIQUE',
      },
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 12,
      bestRating: '5',
      worstRating: '1',
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(productSchema) }}
    />
  );
}
