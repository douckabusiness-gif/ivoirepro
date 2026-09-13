import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasAdminRole, verifyAdminSession, verifyCustomerSession } from '@/lib/auth';
import { sendOrderConfirmationEmail, sendAdminNewOrderNotification } from '@/lib/email';
import { sendTelegramNewOrderNotification } from '@/lib/telegram';
import { calculateOrderTotals } from '@/lib/orderPricing';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    if (!session || !hasAdminRole(session, ['admin', 'vendeur', 'support', 'gestionnaire_livraison'])) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        items: true,
        partner: {
          select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, { keyPrefix: 'order-create', max: 20, windowMs: 10 * 60 * 1000 });
    if (limited) return limited;
    const body = await request.json();
    const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
    const customerPhone = typeof body.customerPhone === 'string' ? body.customerPhone.trim() : '';
    const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim().toLowerCase() : '';
    const customerAddress = typeof body.customerAddress === 'string' ? body.customerAddress.trim() : '';
    const customerCity = typeof body.customerCity === 'string' ? body.customerCity.trim() : '';
    const customerNotes = typeof body.customerNotes === 'string' ? body.customerNotes.trim() : '';
    const paymentMethod = typeof body.paymentMethod === 'string' ? body.paymentMethod : 'cod';
    const allowedPaymentMethods = new Set([
      'whatsapp', 'payment_link', 'wave', 'orange_money', 'mtn_money', 'moov_money', 'card', 'cod', 'bank_transfer',
    ]);

    if (!customerName || !customerPhone || !customerAddress || !customerCity) {
      return NextResponse.json({ error: 'Les coordonnées client et l’adresse de livraison sont obligatoires.' }, { status: 400 });
    }
    if (customerEmail && !/^\S+@\S+\.\S+$/.test(customerEmail)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
    }
    if (!allowedPaymentMethods.has(paymentMethod)) {
      return NextResponse.json({ error: 'Mode de paiement invalide.' }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Le panier ne peut pas être vide.' }, { status: 400 });
    }

    const requestedItems: Array<{
      productId: string;
      quantity: number;
      selectedColor: string | null;
      selectedSize: string | null;
    }> = body.items.map((item: any) => ({
      productId: typeof item.productId === 'string' ? item.productId : '',
      quantity: Number(item.quantity),
      selectedColor: typeof item.selectedColor === 'string' ? item.selectedColor.trim() : null,
      selectedSize: typeof item.selectedSize === 'string' ? item.selectedSize.trim() : null,
    }));
    if (requestedItems.some((item: { productId: string; quantity: number }) => !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100)) {
      return NextResponse.json({ error: 'Article ou quantité de panier invalide.' }, { status: 400 });
    }

    const storeSettings = await prisma.storeSettings.findUnique({ where: { id: 'default_settings' } });
    const standardShippingFee = Number(storeSettings?.standardShippingFee ?? 2000);
    const freeShippingThreshold = Number(storeSettings?.freeShippingThreshold ?? 50000);
    const session = await verifyCustomerSession(request);
    const orderNumber = `CMD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;

    const newOrder = await prisma.$transaction(async (tx) => {
      const productIds: string[] = Array.from(new Set(requestedItems.map((item) => item.productId)));
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, title: true, images: true, price: true, stockCount: true, inStock: true, colors: true, sizes: true },
      });
      const productsById = new Map(products.map((product) => [product.id, product]));
      const quantitiesByProduct = new Map<string, number>();

      for (const item of requestedItems) {
        quantitiesByProduct.set(item.productId, (quantitiesByProduct.get(item.productId) || 0) + item.quantity);
      }

      for (const [productId, quantity] of quantitiesByProduct) {
        const product = productsById.get(productId);
        if (!product) throw new Error(`Produit introuvable: ${productId}`);
        if (!product.inStock || product.stockCount < quantity) {
          throw new Error(`Stock insuffisant pour « ${product.title} ».`);
        }
      }

      const lineItems = requestedItems.map((item) => {
        const product = productsById.get(item.productId)!;
        return {
          productId: product.id,
          productTitle: product.title,
          productImage: product.images[0] || '',
          price: product.price,
          quantity: item.quantity,
          selectedColor: item.selectedColor && (product.colors.length === 0 || product.colors.includes(item.selectedColor)) ? item.selectedColor : null,
          selectedSize: item.selectedSize && (product.sizes.length === 0 || product.sizes.includes(item.selectedSize)) ? item.selectedSize : null,
        };
      });
      const { subtotal, shippingFee, totalAmount } = calculateOrderTotals(
        lineItems,
        standardShippingFee,
        freeShippingThreshold
      );

      const customerId = session?.customerId || null;
      const customer = customerId
        ? await tx.customer.findUnique({ where: { id: customerId }, select: { id: true, referredByPartnerId: true } })
        : null;
      if (customerId && !customer) throw new Error('Session client invalide.');

      const referralCode = typeof body.partnerSlug === 'string' ? body.partnerSlug.trim() : typeof body.referralCode === 'string' ? body.referralCode.trim() : '';
      let partner = referralCode
        ? await tx.partner.findFirst({ where: { OR: [{ slug: referralCode.toLowerCase() }, { id: referralCode }] } })
        : null;
      if (!partner && customer?.referredByPartnerId) {
        partner = await tx.partner.findUnique({ where: { id: customer.referredByPartnerId } });
      }
      if (partner?.status !== 'active') partner = null;
      const partnerCommission = partner ? Math.round(subtotal * ((partner.commissionRate || 10) / 100)) : 0;

      for (const [productId, quantity] of quantitiesByProduct) {
        const updated = await tx.product.updateMany({
          where: { id: productId, inStock: true, stockCount: { gte: quantity } },
          data: { stockCount: { decrement: quantity } },
        });
        if (updated.count !== 1) throw new Error('Le stock a changé. Veuillez réessayer.');
        const product = productsById.get(productId)!;
        if (product.stockCount === quantity) {
          await tx.product.update({ where: { id: productId }, data: { inStock: false } });
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          customerName,
          customerPhone,
          customerEmail: customerEmail || null,
          customerAddress,
          customerCity,
          customerCountry: typeof body.customerCountry === 'string' ? body.customerCountry.trim() || 'Côte d\'Ivoire' : 'Côte d\'Ivoire',
          customerNotes: customerNotes || null,
          subtotal,
          shippingFee,
          discountAmount: 0,
          totalAmount,
          currency: storeSettings?.currency || 'FCFA',
          paymentMethod,
          paymentStatus: 'pending',
          orderStatus: 'pending',
          directPaymentLinkUsed: paymentMethod === 'payment_link' && storeSettings?.enableCustomPaymentLink ? storeSettings.customPaymentLinkUrl || null : null,
          whatsappMessageSent: false,
          deliveryStatus: 'pending',
          partnerId: partner?.id || null,
          partnerSlug: partner?.slug || null,
          partnerCommission,
          partnerCommissionCredited: false,
          items: { create: lineItems },
        },
        include: {
          items: true,
          partner: { select: { id: true, name: true, slug: true, email: true, phone: true } },
        },
      });

      if (customerId) {
        const earnedPoints = Math.floor(totalAmount / 1000);
        if (earnedPoints > 0) {
          await tx.customer.update({ where: { id: customerId }, data: { loyaltyPoints: { increment: earnedPoints } } });
        }
      }

      return created;
    });

    // Trigger asynchronous transactional emails if SMTP is enabled
    (async () => {
      try {
        const storeSettings = await prisma.storeSettings.findUnique({
          where: { id: 'default_settings' },
        });
        if (storeSettings && storeSettings.smtpEnabled) {
          await Promise.allSettled([
            sendOrderConfirmationEmail(newOrder as any, storeSettings as any),
            sendAdminNewOrderNotification(newOrder as any, storeSettings as any),
          ]);
        }
      } catch (emailErr) {
        console.warn('Erreur envoi email confirmation de commande (non bloquant):', emailErr);
      }
    })();

    // Telegram alert is deliberately asynchronous: a Telegram outage must never block a paid order.
    (async () => {
      try {
        const notificationSettings = await prisma.storeSettings.findUnique({
          where: { id: 'default_settings' },
        });
        if (notificationSettings?.telegramEnabled && notificationSettings.telegramNotifyNewOrder !== false) {
          await sendTelegramNewOrderNotification(newOrder as any, notificationSettings as any);
        }
      } catch (telegramErr) {
        console.warn('Erreur envoi notification Telegram (non bloquant):', telegramErr);
      }
    })();

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    const message = error?.message || 'Erreur lors de la création de la commande.';
    const isClientError = /Produit introuvable|Stock insuffisant|Le stock a changé|Session client invalide/i.test(message);
    return NextResponse.json({ error: isClientError ? message : 'Impossible de créer la commande pour le moment.' }, { status: isClientError ? 400 : 500 });
  }
}
