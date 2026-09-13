import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramDailyReport } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleDailyReport(request);
}

export async function POST(request: Request) {
  return handleDailyReport(request);
}

async function handleDailyReport(request: Request) {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
    });

    if (!settings || !settings.telegramEnabled || !settings.telegramBotToken) {
      return NextResponse.json({ skipped: true, reason: 'Telegram non activé' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfDay },
      },
      include: { items: true },
    }).catch(() => []);

    const totalSales = orders
      .filter(o => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const deliveredCount = orders.filter(o => o.orderStatus === 'delivered' || o.deliveryStatus === 'delivered').length;
    const pendingCount = orders.filter(o => o.orderStatus === 'pending').length;

    const cashCollected = orders
      .filter(o => o.paymentMethod === 'cod' && (o.orderStatus === 'delivered' || o.deliveryStatus === 'delivered'))
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Produits vendus
    const productCounts: Record<string, number> = {};
    for (const o of orders) {
      for (const item of o.items) {
        productCounts[item.productTitle] = (productCounts[item.productTitle] || 0) + item.quantity;
      }
    }

    const topProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, qty]) => `${title} (${qty} vendu${qty > 1 ? 's' : ''})`);

    const dateStr = new Date().toLocaleDateString('fr-FR', {
      timeZone: 'Africa/Abidjan',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const result = await sendTelegramDailyReport({
      dateStr,
      totalSales,
      ordersCount: orders.length,
      deliveredCount,
      pendingCount,
      cashCollected,
      topProducts,
      currency: settings.currency || 'FCFA',
    }, settings as any);

    return NextResponse.json({
      success: true,
      result,
      stats: { totalSales, ordersCount: orders.length, deliveredCount, pendingCount },
    });
  } catch (err: any) {
    console.error('Erreur rapport quotidien Telegram:', err);
    return NextResponse.json({ error: err?.message || 'Erreur serveur' }, { status: 500 });
  }
}
