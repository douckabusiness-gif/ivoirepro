import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';

const MAX_CATEGORY_NAME_LENGTH = 120;
const MAX_CATEGORY_DESCRIPTION_LENGTH = 5000;
const MAX_CATEGORY_IMAGE_LENGTH = 2_500_000;
const MAX_CATEGORY_ICON_LENGTH = 80;
const MAX_CATEGORY_SLUG_LENGTH = 120;

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_CATEGORY_SLUG_LENGTH)
    .replace(/-+$/g, '');
}

function isUniqueConstraintError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: unknown }).code === 'P2002',
  );
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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
      return NextResponse.json({ error: 'Les données de catégorie sont invalides.' }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    if (!name || name.length > MAX_CATEGORY_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Le nom est obligatoire et doit contenir au maximum ${MAX_CATEGORY_NAME_LENGTH} caractères.` },
        { status: 400 },
      );
    }

    const description = input.description === undefined ? '' : input.description;
    if (typeof description !== 'string' || description.length > MAX_CATEGORY_DESCRIPTION_LENGTH) {
      return NextResponse.json({ error: 'La description de la catégorie est invalide.' }, { status: 400 });
    }

    const image = input.image === undefined ? '' : input.image;
    if (typeof image !== 'string' || image.length > MAX_CATEGORY_IMAGE_LENGTH) {
      return NextResponse.json({ error: 'L’image de la catégorie est invalide ou trop volumineuse.' }, { status: 400 });
    }

    const iconName = input.iconName === undefined ? 'ShoppingBag' : input.iconName;
    if (typeof iconName !== 'string' || iconName.length > MAX_CATEGORY_ICON_LENGTH) {
      return NextResponse.json({ error: 'L’icône de la catégorie est invalide.' }, { status: 400 });
    }

    const itemCount = input.itemCount === undefined ? 0 : input.itemCount;
    if (
      typeof itemCount !== 'number' ||
      !Number.isInteger(itemCount) ||
      itemCount < 0 ||
      itemCount > 1_000_000_000
    ) {
      return NextResponse.json({ error: 'Le nombre d’articles est invalide.' }, { status: 400 });
    }

    const requestedSlug = input.slug === undefined ? name : input.slug;
    if (typeof requestedSlug !== 'string' || requestedSlug.length > MAX_CATEGORY_SLUG_LENGTH) {
      return NextResponse.json({ error: 'Le slug de la catégorie est invalide.' }, { status: 400 });
    }

    const baseSlug = slugify(requestedSlug) || `categorie-${randomUUID().slice(0, 8)}`;
    let slug = baseSlug;
    for (let suffix = 2; await prisma.category.findUnique({ where: { slug }, select: { id: true } }); suffix += 1) {
      const suffixText = `-${suffix}`;
      slug = `${baseSlug.slice(0, MAX_CATEGORY_SLUG_LENGTH - suffixText.length)}${suffixText}`;
      if (suffix > 1000) {
        return NextResponse.json({ error: 'Impossible de générer une URL unique pour cette catégorie.' }, { status: 409 });
      }
    }

    const suppliedId = typeof input.id === 'string' ? input.id.trim() : '';
    if (suppliedId && !/^[A-Za-z0-9_-]{1,120}$/.test(suppliedId)) {
      return NextResponse.json({ error: 'L’identifiant de la catégorie est invalide.' }, { status: 400 });
    }
    const id = suppliedId || `cat-${randomUUID()}`;

    const newCategory = await prisma.category.create({
      data: {
        id,
        name,
        slug,
        description,
        image,
        iconName,
        itemCount,
      },
      include: {
        subcategories: true,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: 'Une catégorie avec ces identifiants existe déjà. Réessayez avec un autre nom.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'Impossible de créer la catégorie pour le moment.' }, { status: 500 });
  }
}
