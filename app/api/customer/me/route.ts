import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCustomerSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await verifyCustomerSession(request);
    if (!session) {
      return NextResponse.json({ customer: null }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: session.customerId },
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ customer: null }, { status: 404 });
    }

    return NextResponse.json({
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
  } catch (error: any) {
    console.error('Customer session check error:', error);
    return NextResponse.json({ error: 'Erreur session client.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await verifyCustomerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    const data = await request.json();

    const updated = await prisma.customer.update({
      where: { id: session.customerId },
      data: {
        ...(data.fullName && { fullName: data.fullName.trim() }),
        ...(data.city !== undefined && { city: data.city.trim() }),
        ...(data.address !== undefined && { address: data.address.trim() }),
        ...(data.email !== undefined && { email: data.email ? data.email.toLowerCase().trim() : null }),
        ...(data.wishlist !== undefined && { wishlist: data.wishlist }),
      },
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: updated.id,
        fullName: updated.fullName,
        phone: updated.phone,
        email: updated.email,
        city: updated.city,
        address: updated.address,
        avatarUrl: updated.avatarUrl,
        loyaltyPoints: updated.loyaltyPoints,
        wishlist: updated.wishlist,
        orders: updated.orders,
        createdAt: updated.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Update customer profile error:', error);
    return NextResponse.json({ error: error.message || 'Erreur mise à jour.' }, { status: 500 });
  }
}
