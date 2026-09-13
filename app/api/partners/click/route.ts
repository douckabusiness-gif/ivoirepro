import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, { keyPrefix: 'partner-click', max: 60, windowMs: 60 * 1000 });
    if (limited) return limited;
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: 'Slug requis' }, { status: 400 });
    }

    const partner = await prisma.partner.findUnique({
      where: { slug: slug.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        storeName: true,
        avatarUrl: true,
        bio: true,
        slug: true,
        status: true,
        commissionRate: true,
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partenaire non trouvé' }, { status: 404 });
    }

    // Only increment clicks if partner is active
    if (partner.status === 'active') {
      await prisma.partner.update({
        where: { id: partner.id },
        data: { clicksCount: { increment: 1 } },
      });
    }

    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        name: partner.name,
        storeName: partner.storeName || `${partner.name}'s Boutique`,
        avatarUrl: partner.avatarUrl,
        bio: partner.bio,
        slug: partner.slug,
        status: partner.status,
        commissionRate: partner.commissionRate,
      },
    });
  } catch (error: any) {
    console.error('Error tracking partner click:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
