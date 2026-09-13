import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signPartnerToken } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';
import { validateAdminPassword } from '@/lib/passwordSecurity';

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, { keyPrefix: 'partner-register', max: 5, windowMs: 60 * 60 * 1000 });
    if (limited) return limited;
    const body = await request.json();
    const { name, email, password, phone, storeName, bio, payoutMethod, payoutPhone } = body;

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof phone !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !password ||
      !phone.trim() ||
      name.length > 120 ||
      email.length > 254 ||
      password.length > 256 ||
      phone.length > 40
    ) {
      return NextResponse.json(
        { error: 'Nom, email, mot de passe et numéro de téléphone sont requis.' },
        { status: 400 }
      );
    }

    const passwordValidation = validateAdminPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0], errors: passwordValidation.errors },
        { status: 400 },
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingPartner = await prisma.partner.findUnique({
      where: { email: cleanEmail },
    });

    if (existingPartner) {
      return NextResponse.json(
        { error: 'Un compte partenaire avec cette adresse email existe déjà.' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = (storeName || name)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'partenaire';

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.partner.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Fetch store default commission rate
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
    });

    if (settings && settings.partnerProgramEnabled === false) {
      return NextResponse.json(
        { error: 'Le programme de partenariat est actuellement désactivé par l\'administrateur.' },
        { status: 403 }
      );
    }

    const defaultRate = settings?.defaultPartnerCommissionRate ?? 10.0;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create partner in 'pending' status for admin validation
    const partner = await prisma.partner.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        phone: phone.trim(),
        slug: uniqueSlug,
        storeName: storeName?.trim() || `${name.trim()}'s Boutique`,
        bio: bio?.trim() || 'Ambassadeur officiel de la boutique.',
        payoutMethod: payoutMethod || 'wave',
        payoutPhone: payoutPhone?.trim() || phone.trim(),
        commissionRate: defaultRate,
        status: 'pending', // Pending Admin validation
        totalEarnings: 0,
        pendingBalance: 0,
        paidBalance: 0,
        clicksCount: 0,
      },
    });

    // Auto set partner session cookie so they can view their pending status screen
    const response = NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        slug: partner.slug,
        storeName: partner.storeName,
        status: partner.status,
        commissionRate: partner.commissionRate,
      },
      message: 'Inscription enregistrée ! Votre compte est actuellement en cours de validation par l\'administrateur.',
    }, { status: 201 });

    response.cookies.set('partner_session', signPartnerToken({
      partnerId: partner.id,
      email: partner.email,
      slug: partner.slug,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Partner registration error:', error);
    return NextResponse.json({ error: 'Impossible de créer le compte partenaire pour le moment.' }, { status: 500 });
  }
}
