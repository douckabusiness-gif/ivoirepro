import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { initialCategories, initialProducts, initialOrders, initialStoreSettings } from '../lib/initialData';

const prisma = new PrismaClient();

export async function runSeed() {
  console.log('🌱 Starting database seeding...');

  // 1. Create or update Store Settings
  console.log('⚙️ Seeding Store Settings...');
  const { faqList, ...settingsData } = initialStoreSettings;
  
  await prisma.storeSettings.upsert({
    where: { id: 'default_settings' },
    update: {
      ...(settingsData as any),
    },
    create: {
      id: 'default_settings',
      ...(settingsData as any),
    },
  });

  // Seed FAQs
  if (faqList && faqList.length > 0) {
    await prisma.fAQItem.deleteMany({ where: { settingsId: 'default_settings' } });
    for (let i = 0; i < faqList.length; i++) {
      const faq = faqList[i];
      await prisma.fAQItem.create({
        data: {
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          category: faq.category || 'Général',
          order: i,
          settingsId: 'default_settings',
        },
      });
    }
  }

  // 2. Create Default Admin User
  console.log('👤 Seeding Admin User...');
  const defaultAdminEmail = process.env.ADMIN_DEFAULT_EMAIL?.trim();
  const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
  if (!defaultAdminEmail || !defaultAdminPassword) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_DEFAULT_EMAIL et ADMIN_DEFAULT_PASSWORD doivent être définis en production.');
    }
    console.warn('⚠️ Admin non créé: définissez ADMIN_DEFAULT_EMAIL et ADMIN_DEFAULT_PASSWORD pour initialiser un compte.');
  } else {
    const passwordHash = await bcrypt.hash(defaultAdminPassword, 12);
    await prisma.adminUser.upsert({
      where: { email: defaultAdminEmail.toLowerCase() },
      update: { role: 'admin' },
      create: {
        email: defaultAdminEmail.toLowerCase(),
        name: 'Directeur Boutique',
        passwordHash,
        role: 'admin',
      },
    });
  }

  // 3. Seed Categories and Subcategories
  console.log('📁 Seeding Categories & Subcategories...');
  for (const cat of initialCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        iconName: cat.iconName || 'ShoppingBag',
        itemCount: cat.itemCount || 0,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        iconName: cat.iconName || 'ShoppingBag',
        itemCount: cat.itemCount || 0,
      },
    });

    if (cat.subcategories && cat.subcategories.length > 0) {
      for (const sub of cat.subcategories) {
        await prisma.subcategory.upsert({
          where: { id: sub.id },
          update: {
            name: sub.name,
            slug: sub.slug,
            description: sub.description || '',
            image: sub.image || '',
            itemCount: sub.itemCount || 0,
            categoryId: cat.id,
          },
          create: {
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            description: sub.description || '',
            image: sub.image || '',
            itemCount: sub.itemCount || 0,
            categoryId: cat.id,
          },
        });
      }
    }
  }

  // 4. Seed Products
  console.log('🛍️ Seeding Products...');
  for (const prod of initialProducts) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        title: prod.title,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.shortDescription || '',
        price: prod.price,
        originalPrice: prod.originalPrice || null,
        discountPercent: prod.discountPercent || null,
        categoryId: prod.categoryId,
        categoryName: prod.categoryName || '',
        subcategoryId: prod.subcategoryId || null,
        subcategoryName: prod.subcategoryName || null,
        images: prod.images || [],
        featured: Boolean(prod.featured),
        isNew: Boolean(prod.isNew),
        isFlashSale: Boolean(prod.isFlashSale),
        flashSaleEndsAt: prod.flashSaleEndsAt ? new Date(prod.flashSaleEndsAt) : null,
        inStock: prod.inStock ?? true,
        stockCount: prod.stockCount || 10,
        rating: prod.rating || 5.0,
        reviewCount: prod.reviewCount || 10,
        badgeText: prod.badgeText || null,
        tags: prod.tags || [],
        specs: prod.specs ? (prod.specs as any) : undefined,
        colors: prod.colors || [],
        sizes: prod.sizes || [],
      },
      create: {
        id: prod.id,
        title: prod.title,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.shortDescription || '',
        price: prod.price,
        originalPrice: prod.originalPrice || null,
        discountPercent: prod.discountPercent || null,
        categoryId: prod.categoryId,
        categoryName: prod.categoryName || '',
        subcategoryId: prod.subcategoryId || null,
        subcategoryName: prod.subcategoryName || null,
        images: prod.images || [],
        featured: Boolean(prod.featured),
        isNew: Boolean(prod.isNew),
        isFlashSale: Boolean(prod.isFlashSale),
        flashSaleEndsAt: prod.flashSaleEndsAt ? new Date(prod.flashSaleEndsAt) : null,
        inStock: prod.inStock ?? true,
        stockCount: prod.stockCount || 10,
        rating: prod.rating || 5.0,
        reviewCount: prod.reviewCount || 10,
        badgeText: prod.badgeText || null,
        tags: prod.tags || [],
        specs: prod.specs ? (prod.specs as any) : undefined,
        colors: prod.colors || [],
        sizes: prod.sizes || [],
      },
    });
  }

  // 5. Seed Initial Orders
  console.log('📦 Seeding Orders...');
  for (const order of initialOrders) {
    const existingOrder = await prisma.order.findUnique({ where: { id: order.id } });
    if (!existingOrder) {
      await prisma.order.create({
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail || null,
          customerAddress: order.customerAddress,
          customerCity: order.customerCity,
          customerCountry: order.customerCountry || 'Sénégal',
          customerNotes: order.customerNotes || null,
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          discountAmount: order.discountAmount,
          totalAmount: order.totalAmount,
          currency: order.currency,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          directPaymentLinkUsed: order.directPaymentLinkUsed || null,
          whatsappMessageSent: Boolean(order.whatsappMessageSent),
          createdAt: new Date(order.createdAt),
          items: {
            create: order.items.map((it) => ({
              productId: it.productId,
              productTitle: it.productTitle,
              productImage: it.productImage,
              price: it.price,
              quantity: it.quantity,
              selectedColor: it.selectedColor || null,
              selectedSize: it.selectedSize || null,
            })),
          },
        },
      });
    }
  }

  console.log('✅ Seeding completed successfully!');
}

if (require.main === module) {
  runSeed()
    .catch((e) => {
      console.error('❌ Seeding error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
