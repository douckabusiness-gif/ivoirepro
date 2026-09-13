import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let baseUrl = process.env.APP_URL || 'http://localhost:3000';

  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
      select: { seoCanonicalUrl: true },
    });
    if (settings?.seoCanonicalUrl && settings.seoCanonicalUrl.startsWith('http')) {
      baseUrl = settings.seoCanonicalUrl.replace(/\/+$/, '');
    }
  } catch (e) {
    // fallback to env
  }

  const now = new Date();

  // 1. Static Core Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/marketing`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/partenaire`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/livreur`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 2. Dynamic Products
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      select: {
        slug: true,
        updatedAt: true,
        featured: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 2000,
    });

    productEntries = products.map((prod) => ({
      url: `${baseUrl}/produit/${prod.slug}`,
      lastModified: prod.updatedAt || now,
      changeFrequency: 'daily',
      priority: prod.featured ? 0.9 : 0.8,
    }));
  } catch (err) {
    console.error('Erreur génération sitemap produits:', err);
  }

  // 3. Dynamic Partner Storefronts
  let partnerEntries: MetadataRoute.Sitemap = [];
  try {
    const partners = await prisma.partner.findMany({
      where: { status: 'active' },
      select: {
        slug: true,
        updatedAt: true,
      },
      take: 500,
    });

    partnerEntries = partners.map((partner) => ({
      url: `${baseUrl}/p/${partner.slug}`,
      lastModified: partner.updatedAt || now,
      changeFrequency: 'weekly',
      priority: 0.65,
    }));
  } catch (err) {
    console.error('Erreur génération sitemap partenaires:', err);
  }

  return [...staticPages, ...productEntries, ...partnerEntries];
}
