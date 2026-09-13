import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  answerTelegramCallbackQuery, 
  editTelegramMessageText, 
  sendTelegramMessage, 
  escapeTelegramHtml 
} from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Body vide' }, { status: 400 });
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
    });

    if (!settings || !settings.telegramEnabled || !settings.telegramBotToken) {
      return NextResponse.json({ ok: true, skipped: 'Telegram non activé' });
    }

    const botToken = settings.telegramBotToken.trim();
    const authorizedChatId = settings.telegramChatId?.trim();

    // 1. GESTION DES CLICS SUR LES BOUTONS INTERACTIFS (callback_query)
    if (body.callback_query) {
      const cb = body.callback_query;
      const callbackId = cb.id;
      const data = String(cb.data || '');
      const chatId = cb.message?.chat?.id;
      const messageId = cb.message?.message_id;
      const originalText = cb.message?.text || '';

      // Vérification de sécurité de l'administrateur
      if (authorizedChatId && String(chatId) !== String(authorizedChatId)) {
        await answerTelegramCallbackQuery(callbackId, 'Accès non autorisé', true, botToken);
        return NextResponse.json({ ok: true });
      }

      // Action: Valider la commande
      if (data.startsWith('confirm:')) {
        const orderId = data.replace('confirm:', '');
        const updated = await prisma.order.update({
          where: { id: orderId },
          data: { orderStatus: 'processing' },
          include: { items: true },
        }).catch(() => null);

        if (updated) {
          await answerTelegramCallbackQuery(callbackId, `Commande #${updated.orderNumber} validée avec succès ! ✅`, false, botToken);
          const updatedNotice = `\n\n🟢 <b>STATUT MIS À JOUR :</b> ✅ Confirmée par l'administrateur via Telegram`;
          await editTelegramMessageText(
            chatId,
            messageId,
            `${originalText}${updatedNotice}`,
            undefined,
            botToken
          );
        } else {
          await answerTelegramCallbackQuery(callbackId, 'Commande introuvable ou déjà traitée', true, botToken);
        }
        return NextResponse.json({ ok: true });
      }

      // Action: Assigner automatiquement un livreur
      if (data.startsWith('assign:')) {
        const orderId = data.replace('assign:', '');

        // Chercher le nom d'un livreur précédemment assigné ou utiliser le livreur express par défaut
        const lastAssignedOrder = await prisma.order.findFirst({
          where: { deliveryPersonName: { not: null } },
          orderBy: { createdAt: 'desc' },
          select: { deliveryPersonName: true, deliveryPersonPhone: true },
        }).catch(() => null);

        const courierName = lastAssignedOrder?.deliveryPersonName || 'Koffi Kouamé (Coursier Express)';
        const courierPhone = lastAssignedOrder?.deliveryPersonPhone || '+225 07 11 22 33 44';

        const updated = await prisma.order.update({
          where: { id: orderId },
          data: { 
            orderStatus: 'confirmed',
            deliveryStatus: 'assigned',
            deliveryPersonName: courierName,
            deliveryPersonPhone: courierPhone,
            deliveryAssignedAt: new Date(),
          },
        }).catch(() => null);

        if (updated) {
          await answerTelegramCallbackQuery(callbackId, `Livreur assigné : ${courierName} 🛵`, false, botToken);
          const updatedNotice = `\n\n🛵 <b>EXPÉDITION EN COURS :</b> Livreur assigné (${escapeTelegramHtml(courierName)})`;
          await editTelegramMessageText(
            chatId,
            messageId,
            `${originalText}${updatedNotice}`,
            undefined,
            botToken
          );
        } else {
          await answerTelegramCallbackQuery(callbackId, 'Impossible d\'assigner le livreur', true, botToken);
        }
        return NextResponse.json({ ok: true });
      }

      // Action: Annuler la commande
      if (data.startsWith('cancel:')) {
        const orderId = data.replace('cancel:', '');
        const updated = await prisma.order.update({
          where: { id: orderId },
          data: { orderStatus: 'cancelled' },
        }).catch(() => null);

        if (updated) {
          await answerTelegramCallbackQuery(callbackId, `Commande #${updated.orderNumber} annulée ❌`, false, botToken);
          const updatedNotice = `\n\n🔴 <b>STATUT MIS À JOUR :</b> ❌ Commande refusée / annulée`;
          await editTelegramMessageText(
            chatId,
            messageId,
            `${originalText}${updatedNotice}`,
            undefined,
            botToken
          );
        }
        return NextResponse.json({ ok: true });
      }

      // Action: Raccourci Stats
      if (data === 'cmd:stats') {
        await answerTelegramCallbackQuery(callbackId, 'Chargement des statistiques...', false, botToken);
        await handleStatsCommand(settings, chatId);
        return NextResponse.json({ ok: true });
      }

      // Action: Raccourci Stock
      if (data === 'cmd:stock') {
        await answerTelegramCallbackQuery(callbackId, 'Vérification des stocks...', false, botToken);
        await handleStockCommand(settings, chatId);
        return NextResponse.json({ ok: true });
      }

      await answerTelegramCallbackQuery(callbackId, 'Action reçue', false, botToken);
      return NextResponse.json({ ok: true });
    }

    // 2. GESTION DES COMMANDES TEXTES (/stats, /stock, /commandes, /aide)
    if (body.message && body.message.text) {
      const msg = body.message;
      const chatId = msg.chat?.id;
      const text = msg.text.trim().toLowerCase();

      // Sécurité : autoriser uniquement le chat ID configuré
      if (authorizedChatId && String(chatId) !== String(authorizedChatId)) {
        return NextResponse.json({ ok: true, ignored: 'Chat non autorisé' });
      }

      if (text.startsWith('/stats') || text.startsWith('/bilan') || text.startsWith('stats') || text.startsWith('bilan')) {
        await handleStatsCommand(settings, chatId);
        return NextResponse.json({ ok: true });
      }

      if (text.startsWith('/stock') || text.startsWith('stock')) {
        await handleStockCommand(settings, chatId);
        return NextResponse.json({ ok: true });
      }

      if (text.startsWith('/commandes') || text.startsWith('/orders') || text.startsWith('commandes')) {
        await handleOrdersCommand(settings, chatId);
        return NextResponse.json({ ok: true });
      }

      // Message d'aide par défaut
      const helpText = [
        `🤖 <b>ASSISTANT AUTONOME — ${escapeTelegramHtml(settings.storeName || 'Ivoire Djassa')}</b>`,
        '',
        `Voici les commandes rapides disponibles :`,
        `📊 <b>/stats</b> ou <b>/bilan</b> — Chiffre d'affaires et récapitulatif du jour`,
        `📦 <b>/stock</b> — Articles en rupture ou stock faible (≤ 3 unités)`,
        `🛍️ <b>/commandes</b> — Les 5 dernières commandes en attente`,
        `❓ <b>/aide</b> — Afficher ce message d'aide`,
        '',
        `💡 <i>Vous pouvez aussi interagir directement avec les boutons cliquables sous chaque alerte de commande.</i>`,
      ].join('\n');

      await sendTelegramMessage(helpText, settings as any, {
        inline_keyboard: [
          [
            { text: '📊 Bilan du Jour', callback_data: 'cmd:stats' },
            { text: '📦 État des Stocks', callback_data: 'cmd:stock' },
          ],
          [
            { text: '🖥️ Ouvrir la Console Admin', url: 'https://www.ivoireci.com/admin' }
          ]
        ]
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Erreur Telegram Webhook:', err);
    return NextResponse.json({ error: err?.message || 'Erreur interne' }, { status: 500 });
  }
}

/** Commande /stats */
async function handleStatsCommand(settings: any, chatId: string | number) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfDay },
    },
    include: { items: true },
  }).catch(() => []);

  const totalSales = todayOrders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const deliveredCount = todayOrders.filter(o => o.orderStatus === 'delivered' || o.deliveryStatus === 'delivered').length;
  const pendingCount = todayOrders.filter(o => o.orderStatus === 'pending').length;
  const confirmedCount = todayOrders.filter(o => o.orderStatus === 'confirmed').length;

  const cashCollected = todayOrders
    .filter(o => o.paymentMethod === 'cod' && (o.orderStatus === 'delivered' || o.deliveryStatus === 'delivered'))
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    timeZone: 'Africa/Abidjan',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const responseText = [
    `📊 <b>BILAN EN DIRECT DU JOUR</b>`,
    `📅 <i>${escapeTelegramHtml(dateStr)}</i>`,
    '',
    `💰 <b>Chiffre d'affaires :</b> <b>${totalSales.toLocaleString('fr-FR')} ${settings.currency || 'FCFA'}</b>`,
    `🛍️ <b>Total commandes reçues :</b> <b>${todayOrders.length}</b>`,
    `🟡 En attente : <b>${pendingCount}</b>`,
    `✅ Confirmées : <b>${confirmedCount}</b>`,
    `📦 Livrées avec succès : <b>${deliveredCount}</b>`,
    `💵 <b>Espèces collectées (Livreurs) :</b> <b>${cashCollected.toLocaleString('fr-FR')} ${settings.currency || 'FCFA'}</b>`,
    '',
    `🏪 <i>${escapeTelegramHtml(settings.storeName || 'Ivoire Djassa')}</i>`
  ].join('\n');

  await sendTelegramMessage(responseText, settings, {
    inline_keyboard: [
      [
        { text: '🔄 Rafraîchir les Stats', callback_data: 'cmd:stats' },
        { text: '📦 Stocks', callback_data: 'cmd:stock' },
      ]
    ]
  });
}

/** Commande /stock */
async function handleStockCommand(settings: any, chatId: string | number) {
  const lowStockProducts = await prisma.product.findMany({
    where: {
      OR: [
        { stockCount: { lte: 3 } },
        { inStock: false },
      ]
    },
    take: 15,
    orderBy: { stockCount: 'asc' },
  }).catch(() => []);

  if (lowStockProducts.length === 0) {
    await sendTelegramMessage(
      `✅ <b>Tous les stocks sont au vert !</b>\n\nAucun article en rupture ou sous le seuil d'alerte (3 unités).`,
      settings
    );
    return;
  }

  const list = lowStockProducts.map(p => {
    const stock = p.stockCount ?? 0;
    const badge = stock <= 0 ? '🚨 RUPTURE' : `⚠️ Reste ${stock}`;
    return `• <b>${escapeTelegramHtml(p.title)}</b> — [${badge}]`;
  }).join('\n');

  const stockText = [
    `⚠️ <b>ARTICLES EN STOCK CRITIQUE OU RUPTURE (${lowStockProducts.length})</b>`,
    '',
    list,
    '',
    `💡 <i>Pensez à réapprovisionner ou ajuster vos stocks depuis l'administration.</i>`
  ].join('\n');

  await sendTelegramMessage(stockText, settings, {
    inline_keyboard: [
      [
        { text: '✏️ Gérer les Produits', url: 'https://www.ivoireci.com/admin' }
      ]
    ]
  });
}

/** Commande /commandes */
async function handleOrdersCommand(settings: any, chatId: string | number) {
  const pendingOrders = await prisma.order.findMany({
    where: {
      orderStatus: { in: ['pending', 'confirmed'] },
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  }).catch(() => []);

  if (pendingOrders.length === 0) {
    await sendTelegramMessage(
      `🎉 <b>Aucune commande en attente !</b>\nToutes vos commandes ont été traitées ou livrées.`,
      settings
    );
    return;
  }

  const list = pendingOrders.map((o, idx) => {
    const status = o.orderStatus === 'confirmed' ? '✅ Confirmée' : '🟡 En attente';
    return `${idx + 1}. <b>N° ${escapeTelegramHtml(o.orderNumber)}</b> — ${escapeTelegramHtml(o.customerName)} (${escapeTelegramHtml(o.customerCity)})\n   💰 Total: <b>${o.totalAmount.toLocaleString('fr-FR')} ${o.currency}</b> | ${status}`;
  }).join('\n\n');

  const ordersText = [
    `🛍️ <b>DERNIÈRES COMMANDES EN COURS (${pendingOrders.length})</b>`,
    '',
    list,
  ].join('\n');

  await sendTelegramMessage(ordersText, settings, {
    inline_keyboard: [
      [
        { text: '🖥️ Voir toutes sur la Console Admin', url: 'https://www.ivoireci.com/admin' }
      ]
    ]
  });
}
