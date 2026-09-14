import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isDemoModeEnabled, signPartnerToken } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, { keyPrefix: 'partner-login', max: 10, windowMs: 15 * 60 * 1000 });
    const { email, password, isDemo } = await request.json();

    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
      select: { partnerProgramEnabled: true },
    });

    if (settings && settings.partnerProgramEnabled === false) {
      return NextResponse.json(
        { error: 'Le programme de partenariat est actuellement désactivé par l\'administrateur.' },
        { status: 403 }
      );
    }

    if (isDemo && !isDemoModeEnabled()) {
      return NextResponse.json({ error: 'Le mode démo est désactivé.' }, { status: 403 });
    }

    // 1-Click Demo Partner Access (local development only)
    if (isDemo) {
      let demoPartner = await prisma.partner.findFirst({
        where: { email: 'fatou.demo@luxetendance.com' },
      });

      if (!demoPartner) {
        const passwordHash = await bcrypt.hash('partner123', 10);
        demoPartner = await prisma.partner.create({
          data: {
            name: 'Fatou Ndiaye (Ambassadrice)',
            email: 'fatou.demo@luxetendance.com',
            passwordHash,
            phone: '+221 77 987 65 43',
            slug: 'fatou-chic-selection',
            storeName: 'Fatou Chic Sélection',
            bio: 'Styliste & Influenceuse mode à Dakar. Découvrez ma sélection exclusive !',
            payoutMethod: 'wave',
            payoutPhone: '+221 77 987 65 43',
            commissionRate: 10,
            status: 'active',
            clicksCount: 142,
            totalEarnings: 38500,
            pendingBalance: 12500,
            paidBalance: 26000,
          },
        });
      }

      const response = NextResponse.json({
        success: true,
        partner: {
          id: demoPartner.id,
          name: demoPartner.name,
          email: demoPartner.email,
          phone: demoPartner.phone,
          slug: demoPartner.slug,
          storeName: demoPartner.storeName,
          bio: demoPartner.bio,
          avatarUrl: demoPartner.avatarUrl,
          payoutMethod: demoPartner.payoutMethod,
          payoutPhone: demoPartner.payoutPhone,
          commissionRate: demoPartner.commissionRate,
          status: demoPartner.status,
          totalEarnings: demoPartner.totalEarnings,
          pendingBalance: demoPartner.pendingBalance,
          paidBalance: demoPartner.paidBalance,
          clicksCount: demoPartner.clicksCount,
          createdAt: demoPartner.createdAt,
        },
      });

      const sessionToken = signPartnerToken({
        partnerId: demoPartner.id,
        email: demoPartner.email,
        slug: demoPartner.slug,
      });

      response.cookies.set('partner_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont requis.' },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!partner) {
      return NextResponse.json(
        { error: 'Identifiants incorrects ou compte introuvable.' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, partner.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Identifiants incorrects.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
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
        createdAt: partner.createdAt,
      },
    });

    const sessionToken = signPartnerToken({
      partnerId: partner.id,
      email: partner.email,
      slug: partner.slug,
    });

    response.cookies.set('partner_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Partner login error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la connexion.' }, { status: 500 });
  }
}
