import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isDemoModeEnabled, signCustomerToken } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, { keyPrefix: 'customer-login', max: 10, windowMs: 15 * 60 * 1000 });
    if (limited) return limited;
    const { identifier, password, isDemo } = await request.json();

    // 1-Click Demo Customer Access
    if (isDemo && !isDemoModeEnabled()) {
      return NextResponse.json({ error: 'Le mode démo est désactivé.' }, { status: 403 });
    }

    if (isDemo) {
      let demoCustomer = await prisma.customer.findFirst({
        where: { phone: '+221 77 100 20 30' },
        include: {
          orders: {
            include: { items: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!demoCustomer) {
        const passwordHash = await bcrypt.hash('pass123', 10);
        demoCustomer = await prisma.customer.create({
          data: {
            fullName: 'Moussa Diop',
            phone: '+221 77 100 20 30',
            email: 'moussa.demo@gmail.com',
            passwordHash,
            city: 'Dakar (Mermoz)',
            address: 'Rue 12, Immeuble Horizon, Apt 4B',
            loyaltyPoints: 45,
            wishlist: [],
          },
          include: {
            orders: {
              include: { items: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        });
      }

      const response = NextResponse.json({
        success: true,
        customer: {
          id: demoCustomer.id,
          fullName: demoCustomer.fullName,
          phone: demoCustomer.phone,
          email: demoCustomer.email,
          city: demoCustomer.city,
          address: demoCustomer.address,
          avatarUrl: demoCustomer.avatarUrl,
          loyaltyPoints: demoCustomer.loyaltyPoints,
          wishlist: demoCustomer.wishlist,
          orders: demoCustomer.orders,
          createdAt: demoCustomer.createdAt,
        },
      });

      response.cookies.set('customer_session', signCustomerToken({ customerId: demoCustomer.id }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    }

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Numéro de téléphone ou email et mot de passe requis.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    // Find customer by phone or email
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: cleanIdentifier },
          { email: cleanIdentifier.toLowerCase() },
        ],
      },
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Compte introuvable. Vérifiez votre numéro ou inscrivez-vous.' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, customer.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect.' },
        { status: 401 }
      );
    }

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
        orders: customer.orders,
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
  } catch (error: any) {
    console.error('Customer login error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la connexion.' },
      { status: 500 }
    );
  }
}
