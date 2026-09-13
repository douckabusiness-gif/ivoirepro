import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, subcategory: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession(request);
    if (!session || !hasAdminRole(session, ['admin', 'vendeur', 'gestionnaire_stock'])) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { category, subcategory, orderItems, createdAt, updatedAt, ...updateData } = body;

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.originalPrice !== undefined) updateData.originalPrice = updateData.originalPrice ? Number(updateData.originalPrice) : null;
    if (updateData.discountPercent !== undefined) updateData.discountPercent = updateData.discountPercent ? Number(updateData.discountPercent) : null;
    if (updateData.stockCount !== undefined) updateData.stockCount = Number(updateData.stockCount);
    if (updateData.rating !== undefined) updateData.rating = Number(updateData.rating);
    if (updateData.reviewCount !== undefined) updateData.reviewCount = Number(updateData.reviewCount);
    if (updateData.flashSaleEndsAt) updateData.flashSaleEndsAt = new Date(updateData.flashSaleEndsAt);
    if (updateData.tierPricingEnabled !== undefined) updateData.tierPricingEnabled = Boolean(updateData.tierPricingEnabled);

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession(request);
    if (!session || !hasAdminRole(session, ['admin', 'vendeur', 'gestionnaire_stock'])) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
