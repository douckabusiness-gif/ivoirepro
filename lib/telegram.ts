import type { Order, StoreSettings } from './types';

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

function paymentLabel(paymentMethod: string): string {
  const labels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    payment_link: 'Lien de paiement',
    wave: 'Wave',
    orange_money: 'Orange Money',
    mtn_money: 'MTN Money',
    moov_money: 'Moov Money',
    card: 'Carte bancaire',
    cod: 'Paiement à la livraison',
    bank_transfer: 'Virement bancaire',
  };
  return labels[paymentMethod] || paymentMethod;
}

export function formatTelegramNewOrderMessage(order: Order, settings: StoreSettings): string {
  const storeName = escapeTelegramHtml(settings.storeName || 'Boutique');
  const items = (order.items || []).map((item) => {
    const variants = [item.selectedColor, item.selectedSize].filter(Boolean).join(' / ');
    const variantText = variants ? ` (${escapeTelegramHtml(variants)})` : '';
    return `• <b>${escapeTelegramHtml(item.productTitle)}</b>${variantText} × ${item.quantity} — ${formatMoney(item.price * item.quantity, order.currency)}`;
  }).join('\n');

  const createdAt = new Date().toLocaleString('fr-FR', {
    timeZone: 'Africa/Abidjan',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const message = [
    `🛍️ <b>NOUVELLE COMMANDE</b>`,
    `<b>${escapeTelegramHtml(order.orderNumber)}</b> • ${createdAt}`,
    '',
    `👤 <b>Client :</b> ${escapeTelegramHtml(order.customerName)}`,
    `📞 <b>Téléphone :</b> ${escapeTelegramHtml(order.customerPhone)}`,
    order.customerEmail ? `📧 <b>Email :</b> ${escapeTelegramHtml(order.customerEmail)}` : '',
    `📍 <b>Livraison :</b> ${escapeTelegramHtml(order.customerAddress)}, ${escapeTelegramHtml(order.customerCity)}`,
    '',
    `📦 <b>Articles :</b>`,
    items || '• Aucun article',
    '',
    `💰 <b>Sous-total :</b> ${formatMoney(order.subtotal, order.currency)}`,
    `🚚 <b>Livraison :</b> ${order.shippingFee === 0 ? 'Gratuite' : formatMoney(order.shippingFee, order.currency)}`,
    `✅ <b>Total :</b> ${formatMoney(order.totalAmount, order.currency)}`,
    `💳 <b>Paiement :</b> ${escapeTelegramHtml(paymentLabel(order.paymentMethod))}`,
    order.customerNotes ? `📝 <b>Note :</b> ${escapeTelegramHtml(order.customerNotes)}` : '',
    '',
    `🏪 ${storeName}`,
  ].filter(Boolean).join('\n');

  return message.length <= TELEGRAM_MESSAGE_LIMIT
    ? message
    : `${message.slice(0, TELEGRAM_MESSAGE_LIMIT - 30)}\n… (message tronqué)`;
}

function getTelegramConfig(settings: StoreSettings) {
  return {
    enabled: settings.telegramEnabled === true && settings.telegramNotifyNewOrder !== false,
    botToken: settings.telegramBotToken?.trim() || '',
    chatId: settings.telegramChatId?.trim() || '',
  };
}

/** Send a message through the Telegram Bot API without exposing the bot token to the browser. */
export async function sendTelegramMessage(text: string, settings: StoreSettings) {
  const config = getTelegramConfig(settings);
  if (!config.enabled) return { skipped: true, reason: 'Telegram notifications disabled' };
  if (!config.botToken || !config.chatId) {
    return { skipped: true, reason: 'Telegram bot token or chat ID not configured' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(config.botToken)}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
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

export async function sendTelegramNewOrderNotification(order: Order, settings: StoreSettings) {
  return sendTelegramMessage(formatTelegramNewOrderMessage(order, settings), settings);
}

export async function sendTelegramTestMessage(settings: StoreSettings) {
  const storeName = escapeTelegramHtml(settings.storeName || 'Boutique');
  return sendTelegramMessage(
    `✅ <b>Telegram connecté</b>\n\nLes alertes de nouvelles commandes de <b>${storeName}</b> sont prêtes à être reçues ici.`,
    { ...settings, telegramEnabled: true, telegramNotifyNewOrder: true },
  );
}
