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

    const partners = await prisma.partner.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            orders: true,
            payouts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Summary metrics
    const totalPartners = await prisma.partner.count();
    const pendingPartners = await prisma.partner.count({ where: { status: 'pending' } });
    const activePartners = await prisma.partner.count({ where: { status: 'active' } });

    const totalCommissionsDistributed = await prisma.partner.aggregate({
      _sum: { totalEarnings: true, paidBalance: true, pendingBalance: true },
    });

    const pendingPayoutsCount = await prisma.partnerPayout.count({ where: { status: 'pending' } });

    return NextResponse.json({
      partners,
      metrics: {
        totalPartners,
        pendingPartners,
        activePartners,
        pendingPayoutsCount,
        totalEarnings: totalCommissionsDistributed._sum.totalEarnings || 0,
        totalPaidOut: totalCommissionsDistributed._sum.paidBalance || 0,
        totalPendingBalance: totalCommissionsDistributed._sum.pendingBalance || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin partners list:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
