import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession(request);
    if (!session || !hasAdminRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    const { id } = await params;
    const partner = await prisma.partner.findUnique({
      where: { id },
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
        orders: {
          orderBy: { createdAt: 'desc' },
        },
        payouts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partenaire introuvable' }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession(request);
    if (!session || !hasAdminRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const allowedUpdates: any = {};
    if (body.status !== undefined) allowedUpdates.status = body.status; // 'active', 'pending', 'suspended', 'rejected'
    if (body.commissionRate !== undefined) allowedUpdates.commissionRate = Number(body.commissionRate);
    if (body.storeName !== undefined) allowedUpdates.storeName = body.storeName;
    if (body.bio !== undefined) allowedUpdates.bio = body.bio;
    if (body.phone !== undefined) allowedUpdates.phone = body.phone;
    if (body.payoutPhone !== undefined) allowedUpdates.payoutPhone = body.payoutPhone;

    const updated = await prisma.partner.update({
      where: { id },
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
    console.error('Error updating partner by admin:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession(request);
    if (!session || !hasAdminRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.partner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting partner:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
