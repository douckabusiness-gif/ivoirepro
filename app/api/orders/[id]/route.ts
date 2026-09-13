import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasAdminRole, verifyAdminSession, verifyCustomerSession } from '@/lib/auth';
import { sendOrderStatusUpdateEmail } from '@/lib/email';

const safePartnerSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  slug: true,
  storeName: true,
  commissionRate: true,
  status: true,
} as const;

async function restoreOrderStock(
  tx: any,
  orderId: string,
  items: Array<{ productId: string | null; quantity: number }>,
) {
  const claimed = await tx.order.updateMany({
    where: { id: orderId, stockRestored: false },
    data: { stockRestored: true },
  });
  if (claimed.count !== 1) return false;

  const quantities = new Map<string, number>();
  for (const item of items) {
    if (item.productId) {
      quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    }
  }
  for (const [productId, quantity] of quantities) {
    await tx.product.update({
      where: { id: productId },
      data: { stockCount: { increment: quantity }, inStock: true },
    });
  }
  return true;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await verifyAdminSession(request);
    const isAuthorizedAdmin = Boolean(
      admin && hasAdminRole(admin, ['admin', 'vendeur', 'support', 'gestionnaire_livraison'])
    );
    const customerSession = isAuthorizedAdmin ? null : await verifyCustomerSession(request);
    if (!isAuthorizedAdmin && !customerSession) {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, partner: { select: safePartnerSelect } },
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }
    if (customerSession && order.customerId !== customerSession.customerId) {
      return NextResponse.json({ error: 'Accès interdit.' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin || !hasAdminRole(admin, ['admin', 'vendeur', 'gestionnaire_livraison'])) {
      return NextResponse.json({ error: 'Accès non autorisé (Session administrateur requise)' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: {
        partnerId: true,
        partnerCommission: true,
        partnerCommissionCredited: true,
        stockRestored: true,
        orderStatus: true,
        paymentStatus: true,
        items: { select: { productId: true, quantity: true } },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    const targetOrderStatus = body.orderStatus || existingOrder.orderStatus;
    const targetPaymentStatus = body.paymentStatus || existingOrder.paymentStatus;
    const orderStatuses = new Set(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
    const paymentStatuses = new Set(['pending', 'paid', 'failed', 'refunded']);
    const deliveryStatuses = new Set(['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned']);
    if (body.orderStatus !== undefined && !orderStatuses.has(body.orderStatus)) {
      return NextResponse.json({ error: 'Statut de commande invalide.' }, { status: 400 });
    }
    if (body.paymentStatus !== undefined && !paymentStatuses.has(body.paymentStatus)) {
      return NextResponse.json({ error: 'Statut de paiement invalide.' }, { status: 400 });
    }
    if (body.deliveryStatus !== undefined && !deliveryStatuses.has(body.deliveryStatus)) {
      return NextResponse.json({ error: 'Statut de livraison invalide.' }, { status: 400 });
    }
    if (body.deliveryCashCollected !== undefined && (!Number.isFinite(Number(body.deliveryCashCollected)) || Number(body.deliveryCashCollected) < 0)) {
      return NextResponse.json({ error: 'Montant encaissé invalide.' }, { status: 400 });
    }
    if (body.deliveryAssignedAt && Number.isNaN(Date.parse(body.deliveryAssignedAt))) {
      return NextResponse.json({ error: 'Date d’affectation invalide.' }, { status: 400 });
    }
    if (body.deliveredAt && Number.isNaN(Date.parse(body.deliveredAt))) {
      return NextResponse.json({ error: 'Date de livraison invalide.' }, { status: 400 });
    }

    const deliveryData = {
      ...(body.deliveryStatus !== undefined && { deliveryStatus: body.deliveryStatus }),
      ...(body.deliveryPersonId !== undefined && { deliveryPersonId: body.deliveryPersonId || null }),
      ...(body.deliveryPersonName !== undefined && { deliveryPersonName: body.deliveryPersonName || null }),
      ...(body.deliveryPersonPhone !== undefined && { deliveryPersonPhone: body.deliveryPersonPhone || null }),
      ...(body.deliveryZone !== undefined && { deliveryZone: body.deliveryZone || null }),
      ...(body.deliveryNotes !== undefined && { deliveryNotes: body.deliveryNotes || null }),
      ...(body.deliveryAssignedAt !== undefined && { deliveryAssignedAt: body.deliveryAssignedAt ? new Date(body.deliveryAssignedAt) : null }),
      ...(body.deliveredAt !== undefined && { deliveredAt: body.deliveredAt ? new Date(body.deliveredAt) : null }),
      ...(body.deliveryCashCollected !== undefined && { deliveryCashCollected: Number(body.deliveryCashCollected) }),
    };

    // Check if partner commission should be credited or debited
    const hasPartner = existingOrder.partnerId && existingOrder.partnerCommission > 0;
    const shouldCredit =
      hasPartner &&
      !existingOrder.partnerCommissionCredited &&
      targetOrderStatus !== 'cancelled' &&
      !['failed', 'refunded'].includes(targetPaymentStatus) &&
      (targetOrderStatus === 'delivered' || targetPaymentStatus === 'paid');

    const shouldDebit =
      hasPartner &&
      existingOrder.partnerCommissionCredited &&
      (targetOrderStatus === 'cancelled' || targetPaymentStatus === 'refunded' || targetPaymentStatus === 'failed');
    const shouldRestoreStock =
      !existingOrder.stockRestored &&
      existingOrder.orderStatus !== 'delivered' &&
      (targetOrderStatus === 'cancelled' || targetPaymentStatus === 'refunded' || targetPaymentStatus === 'failed');

    let updatedOrder;

    if (shouldCredit) {
      // Claim the commission flag conditionally so concurrent status updates can
      // credit a partner only once.
      updatedOrder = await prisma.$transaction(async (tx) => {
        const claimed = await tx.order.updateMany({
          where: { id, partnerCommissionCredited: false },
          data: {
            ...(body.orderStatus && { orderStatus: body.orderStatus }),
            ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
            ...(body.whatsappMessageSent !== undefined && { whatsappMessageSent: body.whatsappMessageSent }),
            ...deliveryData,
            partnerCommissionCredited: true,
          },
        });
        if (claimed.count === 1) {
          await tx.partner.update({
            where: { id: existingOrder.partnerId! },
            data: {
              totalEarnings: { increment: existingOrder.partnerCommission },
              pendingBalance: { increment: existingOrder.partnerCommission },
            },
          });
        }
        if (shouldRestoreStock) {
          await restoreOrderStock(tx, id, existingOrder.items);
        }
        return tx.order.findUnique({
          where: { id },
          include: { items: true, partner: { select: safePartnerSelect } },
        });
      });
    } else if (shouldDebit) {
      // Revert the commission only if this request successfully claims the
      // previously credited order.
      updatedOrder = await prisma.$transaction(async (tx) => {
        const claimed = await tx.order.updateMany({
          where: { id, partnerCommissionCredited: true },
          data: {
            ...(body.orderStatus && { orderStatus: body.orderStatus }),
            ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
            ...(body.whatsappMessageSent !== undefined && { whatsappMessageSent: body.whatsappMessageSent }),
            ...deliveryData,
            partnerCommissionCredited: false,
          },
        });
        if (claimed.count === 1) {
          await tx.partner.update({
            where: { id: existingOrder.partnerId! },
            data: {
              pendingBalance: { decrement: existingOrder.partnerCommission },
              totalEarnings: { decrement: existingOrder.partnerCommission },
            },
          });
        }
        if (shouldRestoreStock) {
          await restoreOrderStock(tx, id, existingOrder.items);
        }
        return tx.order.findUnique({
          where: { id },
          include: { items: true, partner: { select: safePartnerSelect } },
        });
      });
    } else {
      // Standard order update
      if (shouldRestoreStock) {
        updatedOrder = await prisma.$transaction(async (tx) => {
          await restoreOrderStock(tx, id, existingOrder.items);
          return tx.order.update({
            where: { id },
            data: {
              ...(body.orderStatus && { orderStatus: body.orderStatus }),
              ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
              ...(body.whatsappMessageSent !== undefined && { whatsappMessageSent: body.whatsappMessageSent }),
              ...deliveryData,
            },
            include: { items: true, partner: { select: safePartnerSelect } },
          });
        });
      } else {
        updatedOrder = await prisma.order.update({
          where: { id },
          data: {
            ...(body.orderStatus && { orderStatus: body.orderStatus }),
            ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
            ...(body.whatsappMessageSent !== undefined && { whatsappMessageSent: body.whatsappMessageSent }),
            ...deliveryData,
          },
          include: { items: true, partner: { select: safePartnerSelect } },
        });
      }
    }

    // Send status update email if order status has changed
    if (body.orderStatus && body.orderStatus !== existingOrder.orderStatus) {
      (async () => {
        try {
          const storeSettings = await prisma.storeSettings.findUnique({
            where: { id: 'default_settings' },
          });
          if (storeSettings && storeSettings.smtpEnabled) {
            await sendOrderStatusUpdateEmail(updatedOrder as any, body.orderStatus, storeSettings as any);
          }
        } catch (emailErr) {
          console.warn('Erreur envoi email mise à jour statut commande:', emailErr);
        }
      })();
    }

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin || !hasAdminRole(admin, ['admin', 'vendeur'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const result = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id },
        include: { items: { select: { productId: true, quantity: true } } },
      });

      if (!existingOrder) {
        return false;
      }

      if (existingOrder.partnerCommissionCredited && existingOrder.partnerId && existingOrder.partnerCommission > 0) {
        const reversed = await tx.partner.updateMany({
          where: {
            id: existingOrder.partnerId,
            pendingBalance: { gte: existingOrder.partnerCommission },
            totalEarnings: { gte: existingOrder.partnerCommission },
          },
          data: {
            pendingBalance: { decrement: existingOrder.partnerCommission },
            totalEarnings: { decrement: existingOrder.partnerCommission },
          },
        });
        if (reversed.count !== 1) {
          throw new Error('COMMISSION_DEJA_PAYEE');
        }
      }

      // Pending/processing/cancelled orders and failed/refunded payments still
      // represent reserved inventory. The claim makes restoration idempotent.
      const shouldRestoreStock =
        !existingOrder.stockRestored &&
        (['pending', 'processing', 'cancelled'].includes(existingOrder.orderStatus) ||
          ['failed', 'refunded'].includes(existingOrder.paymentStatus));
      if (shouldRestoreStock) {
        await restoreOrderStock(tx, id, existingOrder.items);
      }

      await tx.order.delete({ where: { id } });
      return true;
    });

    if (!result) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message === 'COMMISSION_DEJA_PAYEE') {
      return NextResponse.json({ error: 'Cette commande ne peut pas être supprimée après paiement de la commission partenaire.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
