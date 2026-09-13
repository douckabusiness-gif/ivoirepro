import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    if (!session || !hasAdminRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const payouts = await prisma.partnerPayout.findMany({
      where: whereClause,
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            slug: true,
            storeName: true,
            payoutPhone: true,
            payoutMethod: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(payouts);
  } catch (error: any) {
    console.error('Error fetching admin payouts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    if (!session || !hasAdminRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    const body = await request.json();
    const { payoutId, status, note } = body; // status: 'completed' | 'rejected'

    if (!payoutId || !status) {
      return NextResponse.json({ error: 'ID de retrait et statut requis' }, { status: 400 });
    }

    const payout = await prisma.partnerPayout.findUnique({
      where: { id: payoutId },
      select: {
        id: true,
        partnerId: true,
        amount: true,
        payoutMethod: true,
        payoutTarget: true,
        status: true,
        note: true,
        createdAt: true,
        partner: { select: { id: true, status: true } },
      },
    });

    if (!payout) {
      return NextResponse.json({ error: 'Demande de retrait introuvable' }, { status: 404 });
    }

    if (payout.status !== 'pending') {
      return NextResponse.json({ error: 'Cette demande a déjà été traitée.' }, { status: 400 });
    }

    if (status === 'completed' || status === 'rejected') {
      const updatedPayout = await prisma.$transaction(async (tx) => {
        const claimed = await tx.partnerPayout.updateMany({
          where: { id: payoutId, status: 'pending' },
          data: {
            status,
            note: note || (status === 'rejected' ? 'Demande de retrait refusée par l\'administrateur.' : payout.note),
            processedAt: new Date(),
          },
        });
        if (claimed.count !== 1) {
          throw new Error('Cette demande a déjà été traitée.');
        }

        await tx.partner.update({
          where: { id: payout.partnerId },
          data: status === 'completed'
            ? { paidBalance: { increment: payout.amount } }
            : { pendingBalance: { increment: payout.amount } },
        });

        return tx.partnerPayout.findUnique({ where: { id: payoutId } });
      });

      return NextResponse.json({ success: true, payout: updatedPayout });
    } else {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error processing payout by admin:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
