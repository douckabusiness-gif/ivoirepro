import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signCustomerToken } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';
import { validateAdminPassword } from '@/lib/passwordSecurity';

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, { keyPrefix: 'customer-register', max: 5, windowMs: 60 * 60 * 1000 });
    if (limited) return limited;
    const { fullName, phone, email, password, city, address } = await request.json();

    if (
      typeof fullName !== 'string' ||
      typeof phone !== 'string' ||
      typeof password !== 'string' ||
      !fullName.trim() ||
      !phone.trim() ||
      !password ||
      fullName.length > 120 ||
      phone.length > 40 ||
      password.length > 256
    ) {
      return NextResponse.json(
        { error: 'Le nom complet, le numéro de téléphone et le mot de passe sont requis.' },
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

    const cleanPhone = phone.trim();
    const cleanEmail = email ? email.toLowerCase().trim() : null;

    // Check if phone already registered
    const existingByPhone = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (existingByPhone) {
      return NextResponse.json(
        { error: 'Ce numéro de téléphone est déjà associé à un compte. Veuillez vous connecter.' },
        { status: 409 }
      );
    }

    // Check if email already registered (if provided)
    if (cleanEmail) {
      const existingByEmail = await prisma.customer.findUnique({
        where: { email: cleanEmail },
      });
      if (existingByEmail) {
        return NextResponse.json(
          { error: 'Cette adresse email est déjà associée à un compte.' },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = await prisma.customer.create({
      data: {
        fullName: fullName.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        passwordHash,
        city: city?.trim() || 'Dakar',
        address: address?.trim() || '',
        loyaltyPoints: 10, // 10 bonus points on registration!
        wishlist: [],
      },
    });

    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        city: customer.city,
        address: customer.address,
        avatarUrl: customer.avatarUrl,
        loyaltyPoints: customer.loyaltyPoints,
        wishlist: customer.wishlist,
        createdAt: customer.createdAt,
      },
    });

    response.cookies.set('customer_session', signCustomerToken({ customerId: customer.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Customer registration error:', error);
    return NextResponse.json(
      { error: "Impossible de créer le compte pour le moment." },
      { status: 500 }
    );
  }
}
