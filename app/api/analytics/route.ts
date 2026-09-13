import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';

const EVENT_TYPES = new Set([
  'page_view',
  'click',
  'product_view',
  'add_to_cart',
  'checkout_started',
  'purchase',
  'whatsapp_click',
  'wishlist_toggle',
  'search',
]);

const MAX_BODY_BYTES = 16_000;

function cleanString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : undefined;
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, { keyPrefix: 'analytics-event', max: 120, windowMs: 60 * 1000 });
    if (limited) return new NextResponse(null, { status: 204 });
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Événement trop volumineux.' }, { status: 413 });
    }

    const body = await request.json();
    const eventType = cleanString(body?.eventType, 40);
    const path = cleanString(body?.path, 240) || '/';
    const visitorId = cleanString(body?.visitorId, 120);
    const sessionId = cleanString(body?.sessionId, 120);
    if (!eventType || !EVENT_TYPES.has(eventType) || !visitorId || !sessionId) {
      return NextResponse.json({ error: 'Événement analytique invalide.' }, { status: 400 });
    }
    if (path === '/admin' || path.startsWith('/admin/')) {
      return new NextResponse(null, { status: 204 });
    }

    let metadata: Record<string, unknown> | undefined;
    if (body?.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)) {
      const serialized = JSON.stringify(body.metadata);
      if (serialized.length <= 2_000) metadata = body.metadata;
    }

    await prisma.analyticsEvent.create({
      data: {
        eventType,
        path,
        visitorId,
        sessionId,
        productId: cleanString(body?.productId, 120),
        productTitle: cleanString(body?.productTitle, 180),
        label: cleanString(body?.label, 180),
        referrer: cleanString(body?.referrer, 500),
        metadata: metadata ? (metadata as Prisma.InputJsonObject) : undefined,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Tracking is best-effort and must not create errors in the storefront.
    console.warn('Analytics event could not be recorded:', error);
    return new NextResponse(null, { status: 204 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    if (!session || !hasAdminRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawDays = Number(searchParams.get('days') || 30);
    const days = [7, 30, 90].includes(rawDays) ? rawDays : 30;
    const now = new Date();
    const startDate = startOfDay(new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000));
    const todayStart = startOfDay(now);
    const rangeWhere = { createdAt: { gte: startDate } };

    const [
      totalEvents,
      pageViews,
      clicks,
      productViews,
      addToCart,
      checkoutStarted,
      purchases,
      visitsToday,
      uniqueVisitors,
      uniqueVisitorsToday,
      uniqueSessionsToday,
      topPages,
      topProducts,
      recentEvents,
      dailyRows,
    ] = await Promise.all([
      prisma.analyticsEvent.count({ where: rangeWhere }),
      prisma.analyticsEvent.count({ where: { ...rangeWhere, eventType: 'page_view' } }),
      prisma.analyticsEvent.count({ where: { ...rangeWhere, eventType: 'click' } }),
      prisma.analyticsEvent.count({ where: { ...rangeWhere, eventType: 'product_view' } }),
      prisma.analyticsEvent.count({ where: { ...rangeWhere, eventType: 'add_to_cart' } }),
      prisma.analyticsEvent.count({ where: { ...rangeWhere, eventType: 'checkout_started' } }),
      prisma.analyticsEvent.count({ where: { ...rangeWhere, eventType: 'purchase' } }),
      prisma.analyticsEvent.count({ where: { createdAt: { gte: todayStart }, eventType: 'page_view' } }),
      prisma.analyticsEvent.findMany({
        where: rangeWhere,
        distinct: ['visitorId'],
        select: { visitorId: true },
      }),
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: todayStart } },
        distinct: ['visitorId'],
        select: { visitorId: true },
      }),
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: todayStart } },
        distinct: ['sessionId'],
        select: { sessionId: true },
      }),
      prisma.analyticsEvent.groupBy({
        by: ['path'],
        where: { ...rangeWhere, eventType: 'page_view' },
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
      }),
      prisma.analyticsEvent.findMany({
        where: { ...rangeWhere, productId: { not: null } },
        select: { productId: true, productTitle: true },
      }),
      prisma.analyticsEvent.findMany({
        where: rangeWhere,
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: {
          id: true,
          eventType: true,
          path: true,
          productId: true,
          productTitle: true,
          label: true,
          createdAt: true,
        },
      }),
      prisma.$queryRaw<Array<{
        day: Date;
        page_views: bigint;
        clicks: bigint;
        product_views: bigint;
        add_to_cart: bigint;
      }>>(Prisma.sql`
        SELECT DATE("createdAt") AS day,
          COUNT(*) FILTER (WHERE "eventType" = 'page_view') AS page_views,
          COUNT(*) FILTER (WHERE "eventType" = 'click') AS clicks,
          COUNT(*) FILTER (WHERE "eventType" = 'product_view') AS product_views,
          COUNT(*) FILTER (WHERE "eventType" = 'add_to_cart') AS add_to_cart
        FROM "AnalyticsEvent"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY day ASC
      `),
    ]);

    const dailyMap = new Map(dailyRows.map((row) => [
      new Date(row.day).toISOString().slice(0, 10),
      {
        date: new Date(row.day).toISOString().slice(0, 10),
        visits: Number(row.page_views),
        clicks: Number(row.clicks),
        productViews: Number(row.product_views),
        addToCart: Number(row.add_to_cart),
      },
    ]));
    const daily = Array.from({ length: days }, (_, index) => {
      const date = new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000);
      const key = date.toISOString().slice(0, 10);
      return dailyMap.get(key) || { date: key, visits: 0, clicks: 0, productViews: 0, addToCart: 0 };
    });

    return NextResponse.json({
      range: { days, startDate, endDate: now },
      metrics: {
        totalEvents,
        visitsToday: uniqueSessionsToday.length,
        uniqueVisitors: uniqueVisitors.length,
        uniqueVisitorsToday: uniqueVisitorsToday.length,
        pageViews,
        clicks,
        productViews,
        addToCart,
        checkoutStarted,
        purchases,
      },
      topPages: topPages.map((row) => ({ path: row.path, count: row._count.path })),
      topProducts: Object.entries(topProducts.reduce<Record<string, { productId: string; productTitle: string; interactions: number }>>((acc, row) => {
        if (!row.productId) return acc;
        const key = row.productId;
        acc[key] = acc[key] || { productId: key, productTitle: row.productTitle || 'Produit sans nom', interactions: 0 };
        acc[key].interactions += 1;
        return acc;
      }, {})).map(([, value]) => value).sort((a, b) => b.interactions - a.interactions).slice(0, 10),
      daily,
      recentEvents,
    });
  } catch (error: any) {
    console.error('Analytics dashboard error:', error);
    return NextResponse.json({ error: error?.message || 'Impossible de charger les analytics.' }, { status: 500 });
  }
}
