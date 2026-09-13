import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'partenaire@test.com';
  const password = 'pass123';
  const passwordHash = await bcrypt.hash(password, 10);

  const partner = await prisma.partner.upsert({
    where: { email },
    update: {
      name: 'Awa Diop (Ambassadrice)',
      passwordHash,
      phone: '+221 77 123 45 67',
      slug: 'awa-chic',
      storeName: 'Awa Chic Boutique',
      bio: 'Influenceuse & Ambassadrice officielle. Découvrez ma sélection mode et profitez de la livraison rapide !',
      payoutMethod: 'wave',
      payoutPhone: '+221 77 123 45 67',
      commissionRate: 10,
      status: 'active',
      clicksCount: 86,
      totalEarnings: 45000,
      pendingBalance: 15000,
      paidBalance: 30000,
    },
    create: {
      name: 'Awa Diop (Ambassadrice)',
      email,
      passwordHash,
      phone: '+221 77 123 45 67',
      slug: 'awa-chic',
      storeName: 'Awa Chic Boutique',
      bio: 'Influenceuse & Ambassadrice officielle. Découvrez ma sélection mode et profitez de la livraison rapide !',
      payoutMethod: 'wave',
      payoutPhone: '+221 77 123 45 67',
      commissionRate: 10,
      status: 'active',
      clicksCount: 86,
      totalEarnings: 45000,
      pendingBalance: 15000,
      paidBalance: 30000,
    },
  });

  console.log('PARTNER_CREATED_OK', {
    id: partner.id,
    name: partner.name,
    email: partner.email,
    slug: partner.slug,
    storeName: partner.storeName,
    status: partner.status,
    commissionRate: `${partner.commissionRate}%`,
    pendingBalance: `${partner.pendingBalance} FCFA`,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
