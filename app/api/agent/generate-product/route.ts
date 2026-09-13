import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateProductAiListing } from '@/lib/agentEngine';
import { verifyAdminSession } from '@/lib/auth';

// POST /api/agent/generate-product
// Body: { prompt, categoryId?, categoryName? }
export async function POST(request: Request) {
  try {
    if (!await verifyAdminSession(request)) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }
    const body = await request.json();
    const { prompt, categoryId = '', categoryName = 'Général' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const settingsRecord = await prisma.storeSettings.findFirst();
    const settings = settingsRecord || { storeName: 'ELITE BOUTIQUE', currency: 'FCFA' };

    const generated = await generateProductAiListing(
      prompt,
      categoryId,
      categoryName,
      settings as any
    );

    return NextResponse.json({ success: true, product: generated });
  } catch (error: any) {
    console.error('Error generating product via AI:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate product' }, { status: 500 });
  }
}
