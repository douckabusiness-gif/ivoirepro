import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  answerTelegramCallbackQuery, 
  editTelegramMessageText, 
  sendTelegramMessage, 
  escapeTelegramHtml,
  verifyTelegramWebhookSecret
} from '@/lib/telegram';
import { handleTelegramProductPhoto } from '@/lib/telegramProductPublisher';

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

    // Sécurité : rejeter toute requête qui ne provient pas de Telegram
    const providedSecret = request.headers.get('x-telegram-bot-api-secret-token');
    const msg = body.message || body.channel_post;
    const incomingChatId = body.callback_query?.message?.chat?.id ?? msg?.chat?.id;

    const isSecretValid = verifyTelegramWebhookSecret(botToken, providedSecret);
    const isAuthorizedAdmin = Boolean(authorizedChatId && incomingChatId !== undefined && String(incomingChatId) === String(authorizedChatId));

    if (!isSecretValid && !isAuthorizedAdmin) {
      console.warn(`[Telegram Webhook] Rejet 401: secret invalide et chat ${incomingChatId} non admin.`);
      return NextResponse.json({ error: 'Webhook non autorisé.' }, { status: 401 });
    }

    // Sécurité : si un chat administrateur est défini, ignorer tous les autres chats
    if (authorizedChatId && incomingChatId !== undefined && String(incomingChatId) !== String(authorizedChatId)) {
      console.log(`[Telegram Webhook] Update ignorée: chat ${incomingChatId} != admin ${authorizedChatId}`);
      return NextResponse.json({ ok: true, skipped: 'Chat non autorisé' });
    }

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

      // Action: Supprimer un produit créé via Telegram
      if (data.startsWith('tgprod_del:')) {
        const prodId = data.replace('tgprod_del:', '');
        const deleted = await prisma.product.delete({
          where: { id: prodId }
        }).catch(() => null);

        if (deleted) {
          await answerTelegramCallbackQuery(callbackId, 'Produit retiré de la boutique avec succès ! 🗑️', true, botToken);
          await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/editMessageCaption`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              caption: `🗑️ <b>PRODUIT SUPPRIMÉ :</b> <s>${escapeTelegramHtml(deleted.title)}</s> a été retiré du catalogue en ligne.`,
              parse_mode: 'HTML',
            }),
          }).catch(() => null);
        } else {
          await answerTelegramCallbackQuery(callbackId, 'Produit déjà supprimé ou introuvable.', true, botToken);
        }
        return NextResponse.json({ ok: true });
      }

      // Action: Basculer le stock d'un produit (En stock / Hors stock)
      if (data.startsWith('tgprod_stock:')) {
        const prodId = data.replace('tgprod_stock:', '');
        const prod = await prisma.product.findUnique({ where: { id: prodId } });
        if (prod) {
          const nextStock = !prod.inStock;
          await prisma.product.update({
            where: { id: prodId },
            data: { inStock: nextStock, stockCount: nextStock ? 10 : 0 }
          });
          const statusText = nextStock ? 'Remis en stock ✅' : 'Défini hors stock ⏸️';
          await answerTelegramCallbackQuery(callbackId, statusText, false, botToken);
        }
        return NextResponse.json({ ok: true });
      }

      // Action: Appliquer une réduction de prix (-X%)
      if (data.startsWith('tgprod_discount:')) {
        const parts = data.split(':');
        const prodId = parts[1];
        const percent = parseInt(parts[2] || '10', 10);
        const prod = await prisma.product.findUnique({ where: { id: prodId } });
        if (prod) {
          const newPrice = Math.max(500, Math.round((prod.price * (1 - percent / 100)) / 500) * 500);
          await prisma.product.update({
            where: { id: prodId },
            data: {
              price: newPrice,
              originalPrice: prod.originalPrice || prod.price,
              discountPercent: percent,
              badgeText: `-${percent}%`
            }
          });
          await answerTelegramCallbackQuery(callbackId, `Nouveau prix: ${newPrice.toLocaleString('fr-FR')} FCFA (-${percent}%) ✨`, true, botToken);
        }
        return NextResponse.json({ ok: true });
      }

      // Action: Ajuster le prix (+X FCFA)
      if (data.startsWith('tgprod_adjprice:')) {
        const parts = data.split(':');
        const prodId = parts[1];
        const delta = parseInt(parts[2] || '5000', 10);
        const prod = await prisma.product.findUnique({ where: { id: prodId } });
        if (prod) {
          const newPrice = Math.max(500, prod.price + delta);
          await prisma.product.update({
            where: { id: prodId },
            data: { price: newPrice }
          });
          await answerTelegramCallbackQuery(callbackId, `Prix ajusté à: ${newPrice.toLocaleString('fr-FR')} FCFA 💰`, true, botToken);
        }
        return NextResponse.json({ ok: true });
      }

      await answerTelegramCallbackQuery(callbackId, 'Action reçue', false, botToken);
      return NextResponse.json({ ok: true });
    }

    // 2. GESTION DES PHOTOS DE PRODUITS PAR L'AGENT IA (PUBLICATION DIRECTE SUR IVOIRECI.COM)
    const isPhotoMessage = Boolean(
      msg && (
        (Array.isArray(msg.photo) && msg.photo.length > 0) ||
        (msg.document && (
          msg.document.mime_type?.startsWith('image/') ||
          /\.(jpg|jpeg|png|webp)$/i.test(msg.document.file_name || '')
        ))
      )
    );

    if (isPhotoMessage) {
      console.log(`[Telegram Webhook] Photo reçue de l'administrateur (${incomingChatId}), lancement de la publication IA sur ivoireci.com...`);
      await handleTelegramProductPhoto(msg, settings as any);
      return NextResponse.json({ ok: true });
    }

    // 3. GESTION DES COMMANDES TEXTES (/stats, /stock, /commandes, /aide)
    if (msg && msg.text) {
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
        `🤖 <b>ASSISTANT AUTONOME & IA — ${escapeTelegramHtml(settings.storeName || 'Ivoire Djassa')}</b>`,
        '',
        `📸 <b>PUBLICATION ULTRA-RAPIDE SUR IVOIRECI.COM :</b>`,
        `👉 <b>Envoyez simplement une photo de produit</b> dans ce chat !`,
        `L'Agent IA analyse votre photo, identifie le produit, rédige la fiche technique et le publie instantanément en ligne sur ivoireci.com !`,
        `<i>Astuce : Écrivez simplement votre prix dans la légende (ex: <code>45000</code> ou <code>45 000 FCFA pointure 42</code>). Le produit sera immédiatement mis en ligne avec lien direct !</i>`,
        '',
        `⚡ <b>COMMANDES DE GESTION :</b>`,
        `📊 <b>/stats</b> ou <b>/bilan</b> — Chiffre d'affaires et récapitulatif du jour`,
        `📦 <b>/stock</b> — Articles en rupture ou stock faible (≤ 3 unités)`,
        `🛍️ <b>/commandes</b> — Les 5 dernières commandes en attente`,
        `❓ <b>/aide</b> — Afficher ce message d'aide`,
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
