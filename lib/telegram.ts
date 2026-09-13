import type { Order, StoreSettings, Product } from './types';

const TELEGRAM_MESSAGE_LIMIT = 4096;

/** Escape user-controlled values before placing them in Telegram HTML messages. */
export function escapeTelegramHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatMoney(amount: number, currency = 'FCFA'): string {
  return `${Number(amount || 0).toLocaleString('fr-FR')} ${currency}`;
}

function cleanPhone(phone: string): string {
  return String(phone || '').replace(/[^0-9]/g, '');
}

function paymentLabel(paymentMethod: string): string {
  const labels: Record<string, string> = {
    whatsapp: 'WhatsApp Direct Pay',
    payment_link: 'Lien de paiement',
    wave: 'Wave Mobile Money',
    orange_money: 'Orange Money CI',
    mtn_money: 'MTN Mobile Money',
    moov_money: 'Moov Money CI',
    card: 'Carte bancaire',
    cod: 'Paiement à la livraison (Espèces)',
    bank_transfer: 'Virement bancaire',
  };
  return labels[paymentMethod] || paymentMethod;
}

export function formatTelegramNewOrderMessage(order: Order, settings: StoreSettings): string {
  const storeName = escapeTelegramHtml(settings.storeName || 'Ivoire Djassa');
  const items = (order.items || []).map((item) => {
    const variants = [item.selectedColor, item.selectedSize].filter(Boolean).join(' / ');
    const variantText = variants ? ` (${escapeTelegramHtml(variants)})` : '';
    return `• <b>${escapeTelegramHtml(item.productTitle)}</b>${variantText} × <b>${item.quantity}</b> — ${formatMoney(item.price * item.quantity, order.currency)}`;
  }).join('\n');

  const createdAt = new Date(order.createdAt || Date.now()).toLocaleString('fr-FR', {
    timeZone: 'Africa/Abidjan',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const statusStr = String(order.orderStatus || 'pending');
  const statusEmoji = statusStr === 'processing' || statusStr === 'confirmed' ? '✅ En cours / Confirmée' :
    statusStr === 'shipped' ? '🛵 En cours de livraison' :
    statusStr === 'delivered' ? '📦 Livrée' :
    statusStr === 'cancelled' ? '❌ Annulée' : '🟡 En attente';

  const message = [
    `🛍️ <b>NOUVELLE COMMANDE REÇUE !</b>`,
    `<b>N° ${escapeTelegramHtml(order.orderNumber)}</b> • ${createdAt}`,
    `📊 <b>Statut :</b> ${statusEmoji}`,
    '',
    `👤 <b>Client :</b> ${escapeTelegramHtml(order.customerName)}`,
    `📞 <b>Téléphone :</b> <code>${escapeTelegramHtml(order.customerPhone)}</code>`,
    order.customerEmail ? `📧 <b>Email :</b> ${escapeTelegramHtml(order.customerEmail)}` : '',
    `📍 <b>Ville / Adresse :</b> ${escapeTelegramHtml(order.customerCity)} — ${escapeTelegramHtml(order.customerAddress)}`,
    '',
    `📦 <b>Articles commandés :</b>`,
    items || '• Aucun article',
    '',
    `💰 <b>Sous-total :</b> ${formatMoney(order.subtotal, order.currency)}`,
    `🚚 <b>Frais livraison :</b> ${order.shippingFee === 0 ? 'Gratuite (Offerte)' : formatMoney(order.shippingFee, order.currency)}`,
    `💵 <b>TOTAL À ENCAISSER :</b> <b>${formatMoney(order.totalAmount, order.currency)}</b>`,
    `💳 <b>Moyen de paiement :</b> ${escapeTelegramHtml(paymentLabel(order.paymentMethod))}`,
    order.customerNotes ? `📝 <b>Note client :</b> ${escapeTelegramHtml(order.customerNotes)}` : '',
    '',
    `🏪 <i>${storeName}</i>`,
  ].filter(Boolean).join('\n');

  return message.length <= TELEGRAM_MESSAGE_LIMIT
    ? message
    : `${message.slice(0, TELEGRAM_MESSAGE_LIMIT - 30)}\n… (message tronqué)`;
}

export function buildOrderInlineKeyboard(order: Order, baseUrl = 'https://www.ivoireci.com') {
  const phone = cleanPhone(order.customerPhone);
  const waMessage = encodeURIComponent(`Bonjour ${order.customerName}, nous confirmons la réception de votre commande n° ${order.orderNumber} sur ${baseUrl}. Est-elle prête pour la livraison ?`);
  const waUrl = phone ? `https://wa.me/${phone}?text=${waMessage}` : `${baseUrl}/admin`;
  const telUrl = phone ? `tel:${phone}` : `${baseUrl}/admin`;

  return {
    inline_keyboard: [
      [
        { text: '✅ Valider Commande', callback_data: `confirm:${order.id}` },
        { text: '🛵 Assigner Livreur', callback_data: `assign:${order.id}` },
      ],
      [
        { text: '💬 WhatsApp Client', url: waUrl },
        { text: '📞 Appeler', url: telUrl },
      ],
      [
        { text: '❌ Refuser / Annuler', callback_data: `cancel:${order.id}` },
        { text: '🖥️ Console Admin', url: `${baseUrl}/admin` },
      ],
    ],
  };
}

function getTelegramConfig(settings: StoreSettings) {
  return {
    enabled: settings.telegramEnabled === true && settings.telegramNotifyNewOrder !== false,
    botToken: settings.telegramBotToken?.trim() || '',
    chatId: settings.telegramChatId?.trim() || '',
  };
}

/** Send a message through the Telegram Bot API with optional inline keyboard */
export async function sendTelegramMessage(
  text: string, 
  settings: StoreSettings,
  replyMarkup?: object
) {
  const config = getTelegramConfig(settings);
  if (!config.enabled) return { skipped: true, reason: 'Telegram notifications disabled' };
  if (!config.botToken || !config.chatId) {
    return { skipped: true, reason: 'Telegram bot token or chat ID not configured' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const body: Record<string, any> = {
      chat_id: config.chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }

    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(config.botToken)}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) {
      throw new Error(data?.description || `Telegram API HTTP ${response.status}`);
    }
    return { success: true, messageId: data.result?.message_id };
  } finally {
    clearTimeout(timeout);
  }
}

/** Answer a callback query (pop-up toast in Telegram) */
export async function answerTelegramCallbackQuery(
  callbackQueryId: string, 
  text: string, 
  showAlert = false, 
  botToken: string
) {
  if (!botToken || !callbackQueryId) return;
  try {
    await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });
  } catch (err) {
    console.warn('Erreur answerTelegramCallbackQuery:', err);
  }
}

/** Edit existing message text and inline buttons in Telegram */
export async function editTelegramMessageText(
  chatId: string | number,
  messageId: number,
  text: string,
  replyMarkup?: object,
  botToken?: string
) {
  if (!botToken || !chatId || !messageId) return;
  try {
    const body: Record<string, any> = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }

    await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn('Erreur editTelegramMessageText:', err);
  }
}

/** Send new order notification with interactive action buttons */
export async function sendTelegramNewOrderNotification(order: Order, settings: StoreSettings) {
  const text = formatTelegramNewOrderMessage(order, settings);
  const keyboard = buildOrderInlineKeyboard(order);
  return sendTelegramMessage(text, settings, keyboard);
}

/** Send test connection message */
export async function sendTelegramTestMessage(settings: StoreSettings) {
  const storeName = escapeTelegramHtml(settings.storeName || 'Ivoire Djassa');
  return sendTelegramMessage(
    `✅ <b>Telegram connecté avec succès !</b>\n\nLes alertes de commandes et automatisations de <b>${storeName}</b> sont opérationnelles. Vous pouvez maintenant piloter votre boutique directement depuis cette discussion.`,
    { ...settings, telegramEnabled: true, telegramNotifyNewOrder: true },
    {
      inline_keyboard: [
        [
          { text: '📊 Voir les Statistiques', callback_data: 'cmd:stats' },
          { text: '📦 État des Stocks', callback_data: 'cmd:stock' },
        ],
        [
          { text: '🖥️ Ouvrir la Console Admin', url: 'https://www.ivoireci.com/admin' }
        ]
      ]
    }
  );
}

/** Send low-stock alert when quantity <= 3 */
export async function sendTelegramLowStockAlert(
  product: { id: string; title: string; stockCount?: number | null; price?: number },
  remainingStock: number,
  settings: StoreSettings
) {
  const storeName = escapeTelegramHtml(settings.storeName || 'Ivoire Djassa');
  const alertText = [
    `⚠️ <b>ALERTE STOCK FAIBLE / RUPTURE</b>`,
    '',
    `📦 <b>Produit :</b> ${escapeTelegramHtml(product.title)}`,
    `🔢 <b>Stock restant :</b> <b>${remainingStock} unité(s)</b>`,
    product.price ? `💰 <b>Prix unitaire :</b> ${formatMoney(product.price, settings.currency)}` : '',
    '',
    remainingStock <= 0 
      ? `🚨 <i>Cet article est désormais en rupture de stock. Pensez à réapprovisionner !</i>`
      : `⚠️ <i>Ventes rapides en cours. Il ne reste plus que ${remainingStock} pièce(s) disponible(s).</i>`,
    '',
    `🏪 <i>${storeName}</i>`,
  ].filter(Boolean).join('\n');

  return sendTelegramMessage(alertText, settings, {
    inline_keyboard: [
      [
        { text: '✏️ Gérer le Stock sur l\'Admin', url: 'https://www.ivoireci.com/admin' }
      ]
    ]
  });
}

/** Send daily performance and sales briefing */
export async function sendTelegramDailyReport(
  stats: {
    dateStr: string;
    totalSales: number;
    ordersCount: number;
    deliveredCount: number;
    pendingCount: number;
    cashCollected: number;
    topProducts?: string[];
    currency?: string;
  },
  settings: StoreSettings
) {
  const curr = stats.currency || settings.currency || 'FCFA';
  const reportText = [
    `📊 <b>BILAN QUOTIDIEN DES VENTES — ${escapeTelegramHtml(stats.dateStr)}</b>`,
    '',
    `💰 <b>Chiffre d'affaires du jour :</b> <b>${formatMoney(stats.totalSales, curr)}</b>`,
    `🛍️ <b>Commandes enregistrées :</b> <b>${stats.ordersCount}</b>`,
    `✅ <b>Livrées & Validées :</b> ${stats.deliveredCount}`,
    `🟡 <b>En attente d'expédition :</b> ${stats.pendingCount}`,
    `💵 <b>Espèces collectées (Livreurs) :</b> <b>${formatMoney(stats.cashCollected, curr)}</b>`,
    '',
    stats.topProducts && stats.topProducts.length > 0 
      ? `🔥 <b>Top articles vendus :</b>\n${stats.topProducts.map(p => `  • ${escapeTelegramHtml(p)}`).join('\n')}\n`
      : '',
    `🏪 <i>${escapeTelegramHtml(settings.storeName || 'Ivoire Djassa')}</i>`
  ].filter(Boolean).join('\n');

  return sendTelegramMessage(reportText, settings, {
    inline_keyboard: [
      [
        { text: '📊 Ouvrir le Tableau de bord', url: 'https://www.ivoireci.com/admin' }
      ]
    ]
  });
}

/** Configure Webhook on Telegram */
export async function setTelegramWebhook(botToken: string, webhookUrl: string) {
  if (!botToken || !webhookUrl) {
    throw new Error('Bot token et URL de webhook requis.');
  }

  const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      drop_pending_updates: false,
      allowed_updates: ['message', 'callback_query'],
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    throw new Error(data?.description || `Erreur configuration webhook Telegram HTTP ${response.status}`);
  }

  return data;
}
