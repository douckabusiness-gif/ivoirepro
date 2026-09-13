import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPartnerSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await verifyPartnerSession(request);

    if (!session || !session.partnerId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const partnerId = session.partnerId;
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            partnerCommission: true,
            partnerCommissionCredited: true,
            orderStatus: true,
            paymentStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
    });

    return NextResponse.json({
      authenticated: true,
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        slug: partner.slug,
        storeName: partner.storeName,
        bio: partner.bio,
        avatarUrl: partner.avatarUrl,
        payoutMethod: partner.payoutMethod,
        payoutPhone: partner.payoutPhone,
        commissionRate: partner.commissionRate,
        status: partner.status,
        totalEarnings: partner.totalEarnings,
        pendingBalance: partner.pendingBalance,
        paidBalance: partner.paidBalance,
        clicksCount: partner.clicksCount,
        orders: partner.orders,
        payouts: partner.payouts,
        createdAt: partner.createdAt,
      },
      settings: {
        minPayoutAmount: settings?.minPayoutAmount ?? 5000,
        defaultCommissionRate: settings?.defaultPartnerCommissionRate ?? 10,
        storeName: settings?.storeName ?? 'Boutique',
      },
    });
  } catch (error: any) {
    console.error('Error fetching partner profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await verifyPartnerSession(request);

    if (!session || !session.partnerId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const partnerId = session.partnerId;
    const body = await request.json();

    const allowedUpdates: any = {};
    if (body.storeName !== undefined) allowedUpdates.storeName = body.storeName.trim();
    if (body.bio !== undefined) allowedUpdates.bio = body.bio.trim();
    if (body.avatarUrl !== undefined) allowedUpdates.avatarUrl = body.avatarUrl;
    if (body.payoutMethod !== undefined) allowedUpdates.payoutMethod = body.payoutMethod;
    if (body.payoutPhone !== undefined) allowedUpdates.payoutPhone = body.payoutPhone.trim();
    if (body.phone !== undefined) allowedUpdates.phone = body.phone.trim();

    const updated = await prisma.partner.update({
      where: { id: partnerId },
      data: allowedUpdates,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        slug: true,
        storeName: true,
        bio: true,
        avatarUrl: true,
        payoutMethod: true,
        payoutPhone: true,
        commissionRate: true,
        status: true,
        totalEarnings: true,
        pendingBalance: true,
        paidBalance: true,
        clicksCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, partner: updated });
  } catch (error: any) {
    console.error('Error updating partner profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
