import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';

const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_IMAGE_LENGTH = 2_500_000;

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/g, '');
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    if (!session || !hasAdminRole(session, ['admin', 'vendeur', 'gestionnaire_stock'])) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Données JSON invalides.' }, { status: 400 });
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Les données de sous-catégorie sont invalides.' }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const categoryId = typeof input.categoryId === 'string' ? input.categoryId.trim() : '';
    if (!name || name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Le nom est obligatoire et doit contenir au maximum ${MAX_NAME_LENGTH} caractères.` },
        { status: 400 },
      );
    }
    if (!categoryId) {
      return NextResponse.json({ error: 'Le rayon parent est obligatoire.' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
    if (!category) {
      return NextResponse.json({ error: 'Le rayon sélectionné n’existe plus.' }, { status: 400 });
    }

    const description = input.description === undefined ? '' : input.description;
    const image = input.image === undefined ? '' : input.image;
    if (typeof description !== 'string' || description.length > MAX_DESCRIPTION_LENGTH) {
      return NextResponse.json({ error: 'La description de la sous-catégorie est invalide.' }, { status: 400 });
    }
    if (typeof image !== 'string' || image.length > MAX_IMAGE_LENGTH) {
      return NextResponse.json({ error: 'L’image est invalide ou trop volumineuse.' }, { status: 400 });
    }

    const suppliedId = typeof input.id === 'string' ? input.id.trim() : '';
    if (suppliedId && !/^[A-Za-z0-9_-]{1,120}$/.test(suppliedId)) {
      return NextResponse.json({ error: 'L’identifiant de la sous-catégorie est invalide.' }, { status: 400 });
    }

    const requestedSlug = typeof input.slug === 'string' ? input.slug : name;
    const baseSlug = slugify(requestedSlug) || `sous-categorie-${randomUUID().slice(0, 8)}`;
    let slug = baseSlug;
    for (let suffix = 2; await prisma.subcategory.findFirst({ where: { categoryId, slug }, select: { id: true } }); suffix += 1) {
      const suffixText = `-${suffix}`;
      slug = `${baseSlug.slice(0, 120 - suffixText.length)}${suffixText}`;
      if (suffix > 1000) {
        return NextResponse.json({ error: 'Impossible de générer une URL unique pour cette sous-catégorie.' }, { status: 409 });
      }
    }

    const id = suppliedId || `sub-${randomUUID()}`;

    const newSubcategory = await prisma.subcategory.create({
      data: {
        id,
        name,
        slug,
        description,
        image,
        itemCount: 0,
        categoryId,
      },
    });

    return NextResponse.json(newSubcategory, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating subcategory:', error);
    return NextResponse.json({ error: 'Impossible de créer la sous-catégorie pour le moment.' }, { status: 500 });
  }
}
