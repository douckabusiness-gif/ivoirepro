const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dubaiProducts = [
  {
    id: 'dubai-lattafa-khamrah',
    title: 'Parfum Dubaï Lattafa Khamrah 100ml • Eau de Parfum Original',
    slug: 'parfum-dubai-lattafa-khamrah-100ml',
    description: "Chef-d'œuvre de la parfumerie orientale de Dubaï. Khamrah de Lattafa mêle des notes gourmandes de cannelle, noix de muscade, dattes sucrées, praliné et vanille sur un fond d'ambre et de bois d'agar (oud). Flacon cristal lourd inspiré des plus grands cognacs de luxe. 100% original garanti importé en direct de Dubaï.",
    shortDescription: "Fragrance orientale boisée & gourmande, cannelle, vanille et oud. Flacon cristal.",
    price: 35000,
    originalPrice: 48000,
    discountPercent: 27,
    categoryId: 'cat-beauty',
    categoryName: 'Beauté, Parfums & Bien-Être',
    subcategoryId: 'sub-beauty-men',
    subcategoryName: 'Parfums Homme (Oud, Boisé, Ambré)',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=900&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 25,
    rating: 5.0,
    reviewCount: 48,
    badgeText: '🇦🇪 IMPORT DUBAÏ',
    tags: ['Dubaï', 'Lattafa', 'Khamrah', 'Parfum', 'Oud', 'Prestige'],
    isDubaiPreorder: true,
    dubaiDeliveryDays: '7 à 10 jours ouvrés',
    dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
    featured: true,
    isNew: true,
    isFlashSale: true
  },
  {
    id: 'dubai-lattafa-asad',
    title: 'Parfum Lattafa Asad 100ml • Signature Noire & Dorée',
    slug: 'parfum-lattafa-asad-100ml-dubai',
    description: "Le parfum masculin le plus vendu de Dubaï. Notes épicées de poivre noir, ananas mûr et café torréfié, adoucies par l'iris, le tabac brun et le benjoin. Sillage puissant et tenue supérieure à 12 heures. Flacon noir mat orné de dorures royales.",
    shortDescription: 'Notes de poivre noir, café torréfié, vanille et tabac chaud. Sillage intense.',
    price: 29000,
    originalPrice: 39000,
    discountPercent: 25,
    categoryId: 'cat-beauty',
    categoryName: 'Beauté, Parfums & Bien-Être',
    subcategoryId: 'sub-beauty-men',
    subcategoryName: 'Parfums Homme (Oud, Boisé, Ambré)',
    images: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=900&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 30,
    rating: 4.9,
    reviewCount: 64,
    badgeText: '🇦🇪 TOP VENTE DXB',
    tags: ['Dubaï', 'Lattafa', 'Asad', 'Parfum', 'Émirats'],
    isDubaiPreorder: true,
    dubaiDeliveryDays: '7 à 10 jours ouvrés',
    dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
    featured: true,
    isNew: true
  },
  {
    id: 'dubai-badee-al-oud-glory',
    title: "Bade'e Al Oud (Oud for Glory) Lattafa Prestige 100ml",
    slug: 'badee-al-oud-glory-lattafa-dubai',
    description: "L'Oud légendaire des Émirats Arabes Unis. Alliance magistrale de lavande provençale, safran d'Orient, noix de muscade, patchouli et bois de Oud majestueux. Une tenue exceptionnelle reconnue par les collectionneurs internationaux.",
    shortDescription: "Oud royal d'Orient, safran et patchouli. Flacon noir sérigraphié or.",
    price: 38000,
    originalPrice: 50000,
    discountPercent: 24,
    categoryId: 'cat-beauty',
    categoryName: 'Beauté, Parfums & Bien-Être',
    images: [
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=900&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 15,
    rating: 5.0,
    reviewCount: 32,
    badgeText: '🇦🇪 OUD ROYAL',
    tags: ['Dubaï', 'Oud', "Bade'e Al Oud", 'Lattafa', 'Luxe'],
    isDubaiPreorder: true,
    dubaiDeliveryDays: '7 à 10 jours ouvrés',
    dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
    featured: true
  },
  {
    id: 'dubai-montre-gold-24k-squelette',
    title: 'Montre Automatique Prestige Dubaï Or 24K Squelette Inox',
    slug: 'montre-automatique-prestige-dubai-or-24k',
    description: "Pièce horlogère somptueuse issue des bijouteries renommées du Souk de l'Or de Deira. Mouvement automatique visible à cœur ouvert à travers le cadran squelette. Boîtier et bracelet en acier inoxydable 316L avec dorure PVD 24K inaltérable. Verre saphir inrayable.",
    shortDescription: 'Mouvement automatique sans pile, squelette or 24K, verre saphir inrayable.',
    price: 65000,
    originalPrice: 89000,
    discountPercent: 27,
    categoryId: 'cat-watches',
    categoryName: 'Montres & Bijouterie de Luxe',
    subcategoryId: 'sub-watch-men',
    subcategoryName: 'Montres Homme Automatiques & Chronos',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 10,
    rating: 4.9,
    reviewCount: 22,
    badgeText: '🇦🇪 OR 24K DUBAÏ',
    tags: ['Dubaï', 'Montre', 'Or 24K', 'Automatique', 'Deira'],
    isDubaiPreorder: true,
    dubaiDeliveryDays: '7 à 10 jours ouvrés',
    dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
    featured: true,
    isFlashSale: true
  },
  {
    id: 'dubai-abaya-soie-medine',
    title: 'Abaya Papillon Dubaï Soie de Médine Brodée Main avec Voile',
    slug: 'abaya-papillon-dubai-soie-medine-brodee',
    description: "Véritable abaya de fête confectionnée dans les ateliers de haute couture de Dubaï. Tissu noble en soie de Médine infroissable, tombé fluide majestueux et broderies artisanales réalisées à la main le long des manches et du col. Livrée avec son voile assorti sous housse de protection.",
    shortDescription: 'Soie de Médine premium, coupe papillon royale, broderies dorées faites main.',
    price: 42000,
    originalPrice: 58000,
    discountPercent: 28,
    categoryId: 'cat-fashion',
    categoryName: 'Mode & Habillement',
    subcategoryId: 'sub-mode-femme',
    subcategoryName: 'Prêt-à-Porter Femme',
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 20,
    rating: 5.0,
    reviewCount: 29,
    badgeText: '🇦🇪 HAUTE COUTURE',
    tags: ['Dubaï', 'Abaya', 'Soie de Médine', 'Mode', 'Orient'],
    isDubaiPreorder: true,
    dubaiDeliveryDays: '7 à 10 jours ouvrés',
    dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
    featured: true
  },
  {
    id: 'dubai-bakhoor-royal-encensoir',
    title: 'Coffret Bakhoor Royal Al Haramain + Encensoir Doré Émirati',
    slug: 'coffret-bakhoor-royal-al-haramain-encensoir',
    description: "Le rituel olfactif traditionnel des plus beaux salons de Dubaï. Coffret cadeau comprenant une boîte de copeaux de bois de santal et oud imprégnés d'huiles parfumées Al Haramain, accompagnée d'un somptueux encensoir (Mabkhara) doré ciselé à la main.",
    shortDescription: 'Encens traditionnel de Dubaï avec diffuseur doré pour parfumer votre intérieur.',
    price: 25000,
    originalPrice: 35000,
    discountPercent: 28,
    categoryId: 'cat-beauty',
    categoryName: 'Beauté, Parfums & Bien-Être',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=900&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 18,
    rating: 4.8,
    reviewCount: 17,
    badgeText: '🇦🇪 COFFRET ROYAL',
    tags: ['Dubaï', 'Bakhoor', 'Encensoir', 'Al Haramain', 'Maison'],
    isDubaiPreorder: true,
    dubaiDeliveryDays: '7 à 10 jours ouvrés',
    dubaiBatchDate: 'Vol Cargo Mardi & Vendredi'
  },
  {
    id: 'dubai-parure-femme-or-rose',
    title: 'Parure Horlogère Femme Dubaï Or Rose & Cristaux Zirconium',
    slug: 'parure-horlogere-femme-dubai-or-rose-cristaux',
    description: "Ensemble de joaillerie d'exception composé d'une montre bijou plaquée or rose sertie de cristaux étincelants, assortie d'un collier pendentif, d'une paire de boucles d'oreilles et d'une bague ajustable. Livré dans un coffret de luxe en velours bordeaux.",
    shortDescription: 'Montre joaillerie or rose + collier + boucles + bague dans coffret velours.',
    price: 49000,
    originalPrice: 68000,
    discountPercent: 28,
    categoryId: 'cat-watches',
    categoryName: 'Montres & Bijouterie de Luxe',
    subcategoryId: 'sub-watch-women',
    subcategoryName: 'Montres Femme Élégantes & Parures',
    images: [
      'https://images.unsplash.com/photo-1535683577427-740aaac4ec25?w=900&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 12,
    rating: 5.0,
    reviewCount: 31,
    badgeText: '🇦🇪 PARURE JOAILLERIE',
    tags: ['Dubaï', 'Montre', 'Parure', 'Or Rose', 'Bijoux'],
    isDubaiPreorder: true,
    dubaiDeliveryDays: '7 à 10 jours ouvrés',
    dubaiBatchDate: 'Vol Cargo Mardi & Vendredi'
  },
  {
    id: 'dubai-iphone-16-pro-max-dxb',
    title: 'Apple iPhone 16 Pro Max 256GB • Spécification Dubaï Dual SIM',
    slug: 'iphone-16-pro-max-256gb-dubai-dual-sim',
    description: "Édition originale Apple Store Dubaï (Émirats Arabes Unis). Modèle très recherché avec double emplacement carte nano-SIM physique, compatible 5G tous opérateurs en Côte d'Ivoire. Boîte neuve scellée d'usine avec garantie internationale Apple 1 an.",
    shortDescription: 'Double SIM physique officielle Apple Dubaï, 256GB, Titane Naturel, scellé.',
    price: 950000,
    originalPrice: 1050000,
    discountPercent: 10,
    categoryId: 'cat-phones',
    categoryName: 'Téléphones & Tablettes',
    subcategoryId: 'sub-phone-apple',
    subcategoryName: 'iPhones & Écosystème Apple',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 5,
    rating: 5.0,
    reviewCount: 14,
    badgeText: '🇦🇪 APPLE DXB SCELLÉ',
    tags: ['Dubaï', 'Apple', 'iPhone 16 Pro Max', 'Dual SIM', 'High-Tech'],
    isDubaiPreorder: true,
    dubaiDeliveryDays: '5 à 7 jours express',
    dubaiBatchDate: 'Vol Cargo Express Mardi & Vendredi',
    featured: true
  }
];

async function seed() {
  console.log('Seeding 8 authentic Dubai products into PostgreSQL...');
  for (const prod of dubaiProducts) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: prod,
      create: prod
    });
    console.log('Upserted:', prod.title);
  }
  console.log('Successfully seeded all 8 Dubai products!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
