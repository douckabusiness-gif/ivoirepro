import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  let baseUrl = process.env.APP_URL || 'http://localhost:3000';

  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
      select: { seoCanonicalUrl: true },
    });
    if (settings?.seoCanonicalUrl && settings.seoCanonicalUrl.startsWith('http')) {
      baseUrl = settings.seoCanonicalUrl.replace(/\/+$/, '');
    }
  } catch (e) {}

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/_next/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
