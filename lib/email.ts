import nodemailer from 'nodemailer';
import { StoreSettings, Order } from './types';

/** Escape values before placing them in an HTML email template. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>\"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}

function safeHttpUrl(value: unknown): string {
  const raw = String(value ?? '').trim();
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : '';
  } catch {
    return '';
  }
}

/**
 * Creates a configured Nodemailer transporter using the store's SMTP settings.
 */
export function createTransporter(settings: StoreSettings) {
  if (!settings.smtpEnabled) {
    throw new Error("Le service d'email SMTP est actuellement désactivé dans les paramètres.");
  }

  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
    throw new Error("Configuration SMTP incomplète : l'hôte, l'utilisateur et le mot de passe sont requis.");
  }

  const port = Number(settings.smtpPort) || 587;
  const isSecure = settings.smtpSecure !== undefined 
    ? Boolean(settings.smtpSecure) 
    : (port === 465);

  return nodemailer.createTransport({
    host: settings.smtpHost.trim(),
    port: port,
    secure: isSecure,
    auth: {
      user: settings.smtpUser.trim(),
      pass: settings.smtpPass.trim(),
    },
    tls: {
      // Avoid TLS rejection on custom domain self-signed or shared certificates
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
  });
}

/**
 * Formats a number to FCFA currency string
 */
function formatFCFA(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

/**
 * Returns the effective sender address
 */
function getFromAddress(settings: StoreSettings): string {
  const fromName = settings.smtpFromName?.trim() || settings.storeName?.trim() || 'Boutique E-Commerce';
  const fromEmail = settings.smtpFromEmail?.trim() || settings.smtpUser?.trim() || settings.contactEmail?.trim() || 'no-reply@boutique.ci';
  return `"${fromName}" <${fromEmail}>`;
}

/**
 * Test SMTP connection and send a verification email
 */
export async function sendTestEmail(toEmail: string, settings: StoreSettings) {
  const transporter = createTransporter(settings);

  // 1. Verify credentials & socket connection
  await transporter.verify();

  const from = getFromAddress(settings);
  const now = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' });
  const storeName = settings.storeName || 'Boutique';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Test de Connexion SMTP Réussi</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; padding: 4px 14px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase; margin-bottom: 12px; }
    .content { padding: 32px 24px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    .table td { padding: 10px 12px; border-bottom: 1px solid #334155; color: #cbd5e1; }
    .table td.label { font-weight: bold; color: #94a3b8; width: 40%; }
    .footer { padding: 20px; text-align: center; font-size: 11px; color: #64748b; background: #0f172a; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">Connexion SMTP Validée ⚡</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900;">${escapeHtml(storeName)}</h1>
      <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Serveur de Messagerie Transactionnelle Opérationnel</p>
    </div>
    <div class="content">
      <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6; margin-top: 0;">
        Félicitations ! Votre serveur d'email SMTP est correctement configuré et connecté à votre boutique.
      </p>
      
      <table class="table">
        <tr>
          <td class="label">Serveur Hôte :</td>
          <td style="font-family: monospace; color: #818cf8;">${escapeHtml(settings.smtpHost)}</td>
        </tr>
        <tr>
          <td class="label">Port :</td>
          <td style="font-family: monospace;">${escapeHtml(settings.smtpPort)} (${settings.smtpSecure ? 'SSL' : 'TLS/STARTTLS'})</td>
        </tr>
        <tr>
          <td class="label">Utilisateur Authentifié :</td>
          <td style="font-family: monospace;">${escapeHtml(settings.smtpUser)}</td>
        </tr>
        <tr>
          <td class="label">Expéditeur Officiel :</td>
          <td>${escapeHtml(from)}</td>
          </tr>
        <tr>
          <td class="label">Date & Heure du Test :</td>
          <td>${now} (GMT)</td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #94a3b8; margin-top: 24px; line-height: 1.5;">
        Les emails de confirmation de commande pour vos clients et les alertes pour votre équipe commerciale seront désormais transmis via ce canal avec une délivrabilité maximale.
      </p>
    </div>
    <div class="footer">
      Email de diagnostic généré automatiquement par la console d'administration de ${escapeHtml(storeName)}.
    </div>
  </div>
</body>
</html>
`;

  return await transporter.sendMail({
    from,
    to: toEmail.trim(),
    subject: `✅ Test SMTP Réussi — ${storeName}`,
    html,
    text: `Test de connexion SMTP réussi pour ${storeName} ! Votre serveur ${settings.smtpHost}:${settings.smtpPort} est opérationnel.`,
  });
}

/**
 * Send order confirmation email to the customer
 */
export async function sendOrderConfirmationEmail(order: Order, settings: StoreSettings) {
  if (!settings.smtpEnabled || settings.smtpOrderConfirmationCustomer === false) {
    return { skipped: true, reason: 'Email customer notifications disabled' };
  }

  if (!order.customerEmail || !order.customerEmail.includes('@')) {
    return { skipped: true, reason: 'No customer email provided' };
  }

  const transporter = createTransporter(settings);
  const from = getFromAddress(settings);
  const storeName = settings.storeName || 'ELITE BOUTIQUE';

  const itemsRows = (order.items || []).map((item) => {
    const itemSubtotal = (item.price || 0) * (item.quantity || 1);
    const variantInfo = [item.selectedColor, item.selectedSize].filter(Boolean).join(' • ');
    const productImage = safeHttpUrl(item.productImage);
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #334155;">
          ${productImage ? `<img src="${escapeHtml(productImage)}" alt="${escapeHtml(item.productTitle)}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; vertical-align: middle; margin-right: 12px; border: 1px solid #475569;" />` : ''}
          <div style="display: inline-block; vertical-align: middle;">
            <strong style="color: #f8fafc; font-size: 14px;">${escapeHtml(item.productTitle)}</strong>
            ${variantInfo ? `<br><span style="color: #94a3b8; font-size: 11px;">${escapeHtml(variantInfo)}</span>` : ''}
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: center; color: #cbd5e1; font-weight: 600;">x${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: right; color: #f8fafc; font-weight: 700; white-space: nowrap;">${formatFCFA(itemSubtotal)}</td>
      </tr>
    `;
  }).join('');

  const paymentMethodLabels: Record<string, string> = {
    wave: 'Wave Mobile Money 🌊',
    orange_money: 'Orange Money 🟠',
    mtn: 'MTN Mobile Money 🟡',
    moov: 'Moov Money 🔵',
    card: 'Carte Bancaire Sécurisée 💳',
    cod: 'Paiement à la Livraison (Espèces / COD) 💵',
    whatsapp: 'Commande Directe WhatsApp 💬',
  };

  const paymentLabel = paymentMethodLabels[order.paymentMethod] || order.paymentMethod.toUpperCase();

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Confirmation de Commande ${escapeHtml(order.orderNumber)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 620px; margin: 0 auto; background: #131d31; border-radius: 20px; border: 1px solid #233350; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.6); }
    .header { background: linear-gradient(135deg, #1e1b4b, #312e81); padding: 36px 24px; text-align: center; border-bottom: 1px solid #3730a3; }
    .badge { display: inline-block; background: rgba(52, 211, 153, 0.15); border: 1px solid #10b981; color: #34d399; padding: 5px 16px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase; margin-bottom: 12px; }
    .content { padding: 32px 24px; }
    .order-box { background: #0f172a; border-radius: 14px; border: 1px solid #1e293b; padding: 18px; margin-bottom: 24px; }
    .summary-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    .totals { margin-top: 20px; padding-top: 16px; border-top: 1px dashed #334155; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #94a3b8; }
    .row-total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; color: #ffffff; margin-top: 12px; padding-top: 12px; border-top: 2px solid #334155; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 14px; margin-top: 24px; text-align: center; box-shadow: 0 4px 15px rgba(79,70,229,0.4); }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #64748b; background: #090d16; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">Commande Confirmée 🎉</div>
      <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff;">Merci pour votre achat !</h1>
      <p style="margin: 8px 0 0 0; color: #c7d2fe; font-size: 14px;">Numéro : <strong style="color: #ffffff;">${escapeHtml(order.orderNumber)}</strong></p>
    </div>

    <div class="content">
      <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6; margin-top: 0;">
        Bonjour <strong>${escapeHtml(order.customerName)}</strong>,<br>
        Nous avons bien enregistré votre commande. Notre équipe prépare actuellement vos articles pour une expédition rapide.
      </p>

      <!-- Order Articles -->
      <div class="order-box">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; color: #cbd5e1; letter-spacing: 0.5px;">Articles Commandés</h3>
        <table class="summary-table">
          ${itemsRows}
        </table>

        <!-- Totals -->
        <div class="totals">
          <table style="width: 100%; font-size: 13px; color: #94a3b8;">
            <tr>
              <td style="padding: 4px 0;">Sous-total :</td>
              <td style="padding: 4px 0; text-align: right; color: #cbd5e1;">${formatFCFA(order.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">Frais de livraison :</td>
              <td style="padding: 4px 0; text-align: right; color: #cbd5e1;">${order.shippingFee === 0 ? '<strong style="color: #34d399;">GRATUIT</strong>' : formatFCFA(order.shippingFee)}</td>
            </tr>
            ${order.discountAmount > 0 ? `
            <tr>
              <td style="padding: 4px 0; color: #f43f5e;">Réduction appliquée :</td>
              <td style="padding: 4px 0; text-align: right; color: #f43f5e; font-weight: bold;">-${formatFCFA(order.discountAmount)}</td>
            </tr>` : ''}
            <tr style="font-size: 17px; font-weight: 900; color: #ffffff; border-top: 1px solid #334155;">
              <td style="padding: 12px 0 0 0;">Total TTC :</td>
              <td style="padding: 12px 0 0 0; text-align: right; color: #38bdf8;">${formatFCFA(order.totalAmount)}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Delivery Info -->
      <div class="order-box">
        <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; color: #cbd5e1;">Détails de Livraison & Paiement</h3>
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;">
          📍 <strong>Adresse :</strong> ${escapeHtml(order.customerAddress)}, ${escapeHtml(order.customerCity)} (${escapeHtml(order.customerCountry || 'Côte d\'Ivoire')})<br>
          📞 <strong>Téléphone :</strong> ${escapeHtml(order.customerPhone)}<br>
          💳 <strong>Règlement :</strong> ${escapeHtml(paymentLabel)}
          ${order.customerNotes ? `<br>📝 <strong>Note du client :</strong> <em>${escapeHtml(order.customerNotes)}</em>` : ''}
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${escapeHtml(settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}` : '#')}" class="btn">
          💬 Contacter le Support WhatsApp
        </a>
      </div>
    </div>

    <div class="footer">
      <strong>${escapeHtml(storeName)}</strong> • ${escapeHtml(settings.contactAddress || 'Abidjan, Côte d\'Ivoire')}<br>
      Besoin d'aide ? Écrivez-nous à <a href="mailto:${escapeHtml(settings.contactEmail || 'contact@boutique.ci')}" style="color: #818cf8;">${escapeHtml(settings.contactEmail || 'contact@boutique.ci')}</a> ou appelez le ${escapeHtml(settings.contactPhone || '')}.
    </div>
  </div>
</body>
</html>
  `;

  return await transporter.sendMail({
    from,
    to: order.customerEmail.trim(),
    subject: `📦 Commande Confirmée #${order.orderNumber} — ${storeName}`,
    html,
    text: `Merci pour votre commande #${order.orderNumber} sur ${storeName} ! Montant total : ${formatFCFA(order.totalAmount)}. Nous préparons votre colis.`,
  });
}

/**
 * Send new order alert notification to the store administrator
 */
export async function sendAdminNewOrderNotification(order: Order, settings: StoreSettings) {
  if (!settings.smtpEnabled || settings.smtpOrderNotificationAdmin === false) {
    return { skipped: true, reason: 'Admin email notifications disabled' };
  }

  const recipient = settings.smtpAdminRecipientEmail?.trim() || settings.contactEmail?.trim();
  if (!recipient || !recipient.includes('@')) {
    return { skipped: true, reason: 'No admin recipient email configured' };
  }

  const transporter = createTransporter(settings);
  const from = getFromAddress(settings);
  const storeName = settings.storeName || 'Boutique';

  const itemsListText = (order.items || [])
    .map(i => `• ${escapeHtml(i.productTitle)} x${i.quantity} (${formatFCFA((i.price || 0) * (i.quantity || 1))})`)
    .join('<br>');

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Alerte Nouvelle Commande ${escapeHtml(order.orderNumber)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; }
    .header { background: #b91c1c; padding: 24px; color: #ffffff; text-align: center; }
    .content { padding: 24px; }
    .box { background: #0f172a; border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid #334155; }
    .btn { display: inline-block; background: #6366f1; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span style="font-size: 11px; font-weight: 800; background: rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">Alerte E-Commerce</span>
      <h2 style="margin: 8px 0 0 0; font-size: 20px;">Nouvelle Commande #${escapeHtml(order.orderNumber)}</h2>
    </div>
    <div class="content">
      <p style="font-size: 14px; margin-top: 0; color: #cbd5e1;">
        Une nouvelle commande vient d'être validée par un client sur votre boutique <strong>${escapeHtml(storeName)}</strong>.
      </p>

      <div class="box">
        <h4 style="margin: 0 0 10px 0; color: #94a3b8; text-transform: uppercase; font-size: 11px;">Client & Destination</h4>
        <p style="margin: 0; font-size: 13px; line-height: 1.6;">
          👤 <strong>Nom :</strong> ${escapeHtml(order.customerName)}<br>
          📞 <strong>Téléphone :</strong> <a href="tel:${escapeHtml(order.customerPhone)}" style="color: #818cf8;">${escapeHtml(order.customerPhone)}</a><br>
          📧 <strong>Email :</strong> ${escapeHtml(order.customerEmail || 'Non renseigné')}<br>
          📍 <strong>Commune / Ville :</strong> ${escapeHtml(order.customerAddress)}, ${escapeHtml(order.customerCity)}<br>
          💳 <strong>Moyen de Paiement :</strong> ${escapeHtml(order.paymentMethod.toUpperCase())} (${order.paymentStatus === 'paid' ? 'Payé' : 'À encaisser'})
        </p>
      </div>

      <div class="box">
        <h4 style="margin: 0 0 10px 0; color: #94a3b8; text-transform: uppercase; font-size: 11px;">Contenu du Panier</h4>
        <div style="font-size: 13px; line-height: 1.6; color: #e2e8f0;">
          ${itemsListText}
        </div>
        <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #334155; font-size: 16px; font-weight: 900; color: #38bdf8; text-align: right;">
          Total : ${formatFCFA(order.totalAmount)}
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="/admin" class="btn">Accéder à l'Administration</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return await transporter.sendMail({
    from,
    to: recipient,
    subject: `🚨 [NOUVELLE COMMANDE] #${order.orderNumber} — ${formatFCFA(order.totalAmount)} (${order.customerName})`,
    html,
    text: `Nouvelle commande #${order.orderNumber} de ${order.customerName} pour un montant de ${formatFCFA(order.totalAmount)}. Connectez-vous à l'admin pour la traiter.`,
  });
}

/**
 * Send order status update email to the customer (e.g. In Transit, Delivered)
 */
export async function sendOrderStatusUpdateEmail(order: Order, newStatus: string, settings: StoreSettings) {
  if (!settings.smtpEnabled || settings.smtpOrderStatusUpdateCustomer === false) {
    return { skipped: true, reason: 'Status update emails disabled' };
  }

  if (!order.customerEmail || !order.customerEmail.includes('@')) {
    return { skipped: true, reason: 'No customer email' };
  }

  const statusConfigs: Record<string, { title: string; badge: string; color: string; desc: string }> = {
    shipped: {
      title: 'Votre colis est en cours d\'acheminement !',
      badge: 'EXPÉDIÉ 🛵',
      color: '#f59e0b',
      desc: 'Notre livreur a pris en charge votre colis et se dirige vers votre adresse à Abidjan.',
    },
    delivered: {
      title: 'Votre commande a été livrée !',
      badge: 'LIVRÉ AVEC SUCCÈS ✅',
      color: '#10b981',
      desc: 'Votre colis a été remis en mains propres. Nous espérons que vos articles vous donneront entière satisfaction !',
    },
    cancelled: {
      title: 'Notification d\'annulation de commande',
      badge: 'COMMANDE ANNULÉE ❌',
      color: '#ef4444',
      desc: 'Votre commande a été annulée. Si vous pensez qu\'il s\'agit d\'une erreur, contactez immédiatement notre service client.',
    },
  };

  const currentCfg = statusConfigs[newStatus];
  if (!currentCfg) {
    return { skipped: true, reason: 'No template for this status' };
  }

  const transporter = createTransporter(settings);
  const from = getFromAddress(settings);
  const storeName = settings.storeName || 'Boutique';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(currentCfg.title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; }
    .header { background: #1e1b4b; padding: 30px 20px; text-align: center; border-bottom: 2px solid ${currentCfg.color}; }
    .badge { display: inline-block; background: ${currentCfg.color}25; border: 1px solid ${currentCfg.color}; color: ${currentCfg.color}; padding: 4px 12px; border-radius: 999px; font-weight: 800; font-size: 11px; margin-bottom: 10px; }
    .content { padding: 28px 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">${escapeHtml(currentCfg.badge)}</div>
      <h2 style="margin: 0; font-size: 22px; color: #ffffff;">${escapeHtml(currentCfg.title)}</h2>
      <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">Commande #${escapeHtml(order.orderNumber)}</p>
    </div>
    <div class="content">
      <p style="font-size: 14px; color: #e2e8f0; line-height: 1.6; margin-top: 0;">
        Bonjour <strong>${escapeHtml(order.customerName)}</strong>,<br>
        ${escapeHtml(currentCfg.desc)}
      </p>

      <div style="background: #0f172a; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #334155; font-size: 13px;">
        📍 <strong>Destination :</strong> ${escapeHtml(order.customerAddress)}, ${escapeHtml(order.customerCity)}<br>
        💰 <strong>Total :</strong> ${formatFCFA(order.totalAmount)}
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
        Besoin d'assistance ? Répondez directement à cet email ou joignez notre service client par WhatsApp.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return await transporter.sendMail({
    from,
    to: order.customerEmail.trim(),
    subject: `${currentCfg.badge} Commande #${order.orderNumber} — ${storeName}`,
    html,
    text: `${currentCfg.title} pour votre commande #${order.orderNumber} sur ${storeName}. ${currentCfg.desc}`,
  });
}
