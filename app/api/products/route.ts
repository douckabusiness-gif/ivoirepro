import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').slice(0, 100)
    : [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const subcategoryId = searchParams.get('subcategoryId');
    const featured = searchParams.get('featured');
    const isFlashSale = searchParams.get('isFlashSale');
    const isNew = searchParams.get('isNew');
    const isDubaiPreorder = searchParams.get('isDubaiPreorder');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy');

    const where: any = {};

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }
    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    }
    if (featured === 'true') {
      where.featured = true;
    }
    if (isFlashSale === 'true') {
      where.isFlashSale = true;
    }
    if (isNew === 'true') {
      where.isNew = true;
    }
    if (isDubaiPreorder === 'true') {
      where.isDubaiPreorder = true;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { categoryName: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price-asc') orderBy = { price: 'asc' };
    if (sortBy === 'price-desc') orderBy = { price: 'desc' };
    if (sortBy === 'rating') orderBy = { rating: 'desc' };
    if (sortBy === 'popular') orderBy = { reviewCount: 'desc' };

    // Pagination optionnelle et rétro-compatible : sans `limit`, la réponse
    // reste le tableau complet. Avec `limit` (max 200) et `offset`/`page`,
    // le total est exposé dans l'en-tête X-Total-Count.
    const rawLimit = Number.parseInt(searchParams.get('limit') || '', 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 200) : null;
    const rawPage = Number.parseInt(searchParams.get('page') || '', 10);
    const rawOffset = Number.parseInt(searchParams.get('offset') || '', 10);
    const offset = limit
      ? Math.max(0, Number.isFinite(rawOffset) ? rawOffset : (Number.isFinite(rawPage) && rawPage > 0 ? (rawPage - 1) * limit : 0))
      : 0;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        ...(limit ? { take: limit, skip: offset } : {}),
      }),
      limit ? prisma.product.count({ where }) : Promise.resolve<number | null>(null),
    ]);

    const headers = new Headers();
    if (total !== null) {
      headers.set('X-Total-Count', String(total));
      headers.set('X-Limit', String(limit));
      headers.set('X-Offset', String(offset));
    }
    return NextResponse.json(products, { headers });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    if (!session || !hasAdminRole(session, ['admin', 'vendeur', 'gestionnaire_stock'])) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    let body: Record<string, any>;
    try {
      const parsed = await request.json();
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return NextResponse.json({ error: 'Données produit invalides.' }, { status: 400 });
      }
      body = parsed as Record<string, any>;
    } catch {
      return NextResponse.json({ error: 'Le corps de la requête est invalide.' }, { status: 400 });
    }

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const categoryId = typeof body.categoryId === 'string' ? body.categoryId.trim() : '';
    const price = Number(body.price);
    if (!title || title.length > 200) {
      return NextResponse.json({ error: 'Le titre du produit est obligatoire (200 caractères maximum).' }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: 'Veuillez sélectionner une catégorie valide.' }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Le prix doit être un nombre supérieur à zéro.' }, { status: 400 });
    }

    const description = typeof body.description === 'string' ? body.description : '';
    const shortDescription = typeof body.shortDescription === 'string' ? body.shortDescription : '';
    const badgeText = typeof body.badgeText === 'string' && body.badgeText.trim() ? body.badgeText.trim() : null;
    if (body.description !== undefined && typeof body.description !== 'string') {
      return NextResponse.json({ error: 'La description du produit est invalide.' }, { status: 400 });
    }
    if (body.shortDescription !== undefined && typeof body.shortDescription !== 'string') {
      return NextResponse.json({ error: 'La description courte du produit est invalide.' }, { status: 400 });
    }
    if (body.badgeText !== undefined && body.badgeText !== null && typeof body.badgeText !== 'string') {
      return NextResponse.json({ error: 'Le badge du produit est invalide.' }, { status: 400 });
    }
    const specs = body.specs === undefined || body.specs === null ? undefined : body.specs;
    if (specs !== undefined && typeof specs !== 'object') {
      return NextResponse.json({ error: 'Les caractéristiques du produit sont invalides.' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, subcategories: { select: { id: true, name: true } } },
    });
    if (!category) {
      return NextResponse.json({ error: 'La catégorie sélectionnée n’existe plus.' }, { status: 400 });
    }

    const subcategoryId = typeof body.subcategoryId === 'string' && body.subcategoryId.trim()
      ? body.subcategoryId.trim()
      : null;
    const subcategory = subcategoryId
      ? category.subcategories.find((item) => item.id === subcategoryId)
      : null;
    if (subcategoryId && !subcategory) {
      return NextResponse.json({ error: 'La sous-catégorie ne correspond pas à la catégorie sélectionnée.' }, { status: 400 });
    }

    const requestedSlug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const baseSlug = slugify(requestedSlug || title);
    if (!baseSlug) {
      return NextResponse.json({ error: 'Le titre ne permet pas de créer une URL produit valide.' }, { status: 400 });
    }

    let slug = baseSlug;
    for (let suffix = 2; await prisma.product.findUnique({ where: { slug } }); suffix += 1) {
      const suffixText = `-${suffix}`;
      slug = `${baseSlug.slice(0, 180 - suffixText.length)}${suffixText}`;
      if (suffix > 1000) {
        return NextResponse.json({ error: 'Impossible de générer une URL unique pour ce produit.' }, { status: 409 });
      }
    }

    const originalPrice = body.originalPrice === undefined || body.originalPrice === null || body.originalPrice === ''
      ? null
      : Number(body.originalPrice);
    if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice <= 0)) {
      return NextResponse.json({ error: 'Le prix d’origine est invalide.' }, { status: 400 });
    }

    const discountPercent = body.discountPercent === undefined || body.discountPercent === null || body.discountPercent === ''
      ? null
      : Number(body.discountPercent);
    if (discountPercent !== null && (!Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > 100)) {
      return NextResponse.json({ error: 'La remise doit être un nombre entier entre 0 et 100.' }, { status: 400 });
    }

    const stockCount = body.stockCount === undefined || body.stockCount === null || body.stockCount === ''
      ? 10
      : Number(body.stockCount);
    if (!Number.isInteger(stockCount) || stockCount < 0) {
      return NextResponse.json({ error: 'Le stock doit être un nombre entier positif ou nul.' }, { status: 400 });
    }

    const rating = body.rating === undefined || body.rating === null || body.rating === '' ? 5 : Number(body.rating);
    const reviewCount = body.reviewCount === undefined || body.reviewCount === null || body.reviewCount === '' ? 0 : Number(body.reviewCount);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5 || !Number.isInteger(reviewCount) || reviewCount < 0) {
      return NextResponse.json({ error: 'Les valeurs de notation sont invalides.' }, { status: 400 });
    }

    const flashSaleEndsAt = body.flashSaleEndsAt ? new Date(body.flashSaleEndsAt) : null;
    if (flashSaleEndsAt && Number.isNaN(flashSaleEndsAt.getTime())) {
      return NextResponse.json({ error: 'La date de fin de promotion est invalide.' }, { status: 400 });
    }

    const id = typeof body.id === 'string' && body.id.trim()
      ? body.id.trim()
      : `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const newProduct = await prisma.product.create({
      data: {
        id,
        title,
        slug,
        description,
        shortDescription,
        price,
        originalPrice,
        discountPercent,
        categoryId,
        categoryName: category.name,
        subcategoryId,
        subcategoryName: subcategory?.name || null,
        images: stringArray(body.images),
        featured: Boolean(body.featured),
        isNew: Boolean(body.isNew),
        isFlashSale: Boolean(body.isFlashSale),
        flashSaleEndsAt,
        inStock: body.inStock !== undefined ? Boolean(body.inStock) : true,
        stockCount,
        rating,
        reviewCount,
        badgeText,
        tags: stringArray(body.tags),
        specs,
        colors: stringArray(body.colors),
        sizes: stringArray(body.sizes),
        tierPricingEnabled: Boolean(body.tierPricingEnabled),
        priceTiers: body.priceTiers ? (body.priceTiers as any) : undefined,
        isDubaiPreorder: Boolean(body.isDubaiPreorder),
        dubaiDeliveryDays: typeof body.dubaiDeliveryDays === 'string' && body.dubaiDeliveryDays.trim() ? body.dubaiDeliveryDays.trim() : '7 à 10 jours ouvrés',
        dubaiBatchDate: typeof body.dubaiBatchDate === 'string' && body.dubaiBatchDate.trim() ? body.dubaiBatchDate.trim() : null,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Un produit avec cet identifiant ou cette URL existe déjà.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Impossible de créer le produit pour le moment.' }, { status: 500 });
  }
}
