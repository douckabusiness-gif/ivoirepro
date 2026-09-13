import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPartnerSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await verifyPartnerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payouts = await prisma.partnerPayout.findMany({
      where: { partnerId: session.partnerId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(payouts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyPartnerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const partner = await prisma.partner.findUnique({
      where: { id: session.partnerId },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partenaire introuvable' }, { status: 404 });
    }

    if (partner.status !== 'active') {
      return NextResponse.json(
        { error: 'Votre compte doit être validé et actif pour effectuer un retrait.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const amount = Number(body.amount);
    const payoutMethod = body.payoutMethod || partner.payoutMethod || 'wave';
    const payoutTarget = body.payoutTarget || partner.payoutPhone || partner.phone;

    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
    });
    const minPayout = settings?.minPayoutAmount ?? 5000;

    if (!Number.isFinite(amount) || amount <= 0 || amount < minPayout) {
      return NextResponse.json(
        { error: `Le montant minimum de retrait est de ${minPayout.toLocaleString('fr-FR')} FCFA.` },
        { status: 400 }
      );
    }

    if (!payoutTarget) {
      return NextResponse.json(
        { error: 'Veuillez renseigner un numéro de réception pour le retrait (Wave ou Orange Money).' },
        { status: 400 }
      );
    }

    // Claim the balance with a conditional update. Two concurrent requests cannot
    // both decrement the same available amount.
    const [payout, updatedPartner] = await prisma.$transaction(async (tx) => {
      const debited = await tx.partner.updateMany({
        where: {
          id: partner.id,
          status: 'active',
          pendingBalance: { gte: amount },
        },
        data: { pendingBalance: { decrement: amount } },
      });
      if (debited.count !== 1) {
        throw new Error('Solde insuffisant ou partenaire inactif.');
      }

      const createdPayout = await tx.partnerPayout.create({
        data: {
          partnerId: partner.id,
          amount,
          payoutMethod,
          payoutTarget,
          status: 'pending',
          note: body.note || null,
        },
      });
      const updated = await tx.partner.findUnique({ where: { id: partner.id } });
      return [createdPayout, updated] as const;
    });

    return NextResponse.json({
      success: true,
      payout,
      newPendingBalance: updatedPartner?.pendingBalance ?? 0,
      message: 'Demande de retrait enregistrée avec succès ! Elle sera traitée sous 24h à 48h.',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating payout request:', error);
    const message = error?.message || 'Impossible de créer la demande de retrait.';
    const status = /Solde insuffisant|partenaire inactif/i.test(message) ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
