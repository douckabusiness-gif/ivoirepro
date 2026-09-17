const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPhones() {
  console.log('Connecting to database...');
  const categories = await prisma.category.findMany();
  console.log('Available categories in DB:', categories.map(c => ({ id: c.id, name: c.name })));

  let phoneCat = categories.find(c => c.id === 'cat-phones' || c.slug.includes('phone') || c.slug.includes('telephon'));
  if (!phoneCat) {
    console.log('Category cat-phones not found, creating it...');
    phoneCat = await prisma.category.create({
      data: {
        id: 'cat-phones',
        name: 'Téléphones & Tablettes',
        slug: 'telephones-tablettes',
        description: 'Smartphones originaux importés directement de Dubaï avec garantie internationale.',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80',
        iconName: 'Smartphone',
        itemCount: 0
      }
    });
  }

  console.log('Using phone category:', phoneCat.id, phoneCat.name);

  const dubaiPhones = [
    {
      id: 'dubai-iphone-16-pro-max',
      title: 'Apple iPhone 16 Pro Max 256GB • Dubaï UAE Dual Nano-SIM Physique',
      slug: 'apple-iphone-16-pro-max-256gb-dubai-dual-sim',
      description: "Édition originale Apple Store Dubaï (Émirats Arabes Unis). Version prestige avec DOUBLE CARTE NANO-SIM PHYSIQUE (2 tiroirs SIM physiques officiels Apple), 100% débloqué tout opérateur en Côte d'Ivoire (Orange, MTN, Moov) et dans le monde entier. Puce A18 Pro Bionic gravée en 3nm, châssis en titane de grade 5 ultra-résistant, bouton Commande de l'appareil photo, écran Super Retina XDR 6.9\" ProMotion 120Hz. Boîte neuve scellée d'usine sous blister, garantie internationale Apple 1 an.",
      shortDescription: 'Double SIM physique officielle Apple Dubaï, Titane, A18 Pro, 256GB, boîte scellée 1 an de garantie.',
      price: 950000,
      originalPrice: 1050000,
      discountPercent: 10,
      categoryId: phoneCat.id,
      categoryName: phoneCat.name,
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900&auto=format&fit=crop&q=80'
      ],
      inStock: true,
      stockCount: 8,
      rating: 5.0,
      reviewCount: 42,
      badgeText: '🇦🇪 DUAL SIM PHYSIQUE DXB',
      tags: ['Dubaï', 'Apple', 'iPhone 16 Pro Max', 'Dual SIM', 'Smartphone', 'Titane'],
      colors: ['Titane Désert', 'Titane Naturel', 'Titane Noir', 'Titane Blanc'],
      sizes: ['256 Go', '512 Go', '1 To'],
      specs: {
        "Marque": "Apple",
        "Modèle": "iPhone 16 Pro Max UAE Version",
        "Type SIM": "Double nano-SIM physique (2 cartes SIM physiques)",
        "Écran": "6.9\" Super Retina XDR OLED ProMotion 120Hz",
        "Processeur": "Puce Apple A18 Pro (Gravure 3nm)",
        "Appareil Photo": "48 MP Fusion + 48 MP Ultra grand-angle + Téléobjectif 5x 12 MP",
        "Vidéo": "4K Dolby Vision 120 i/s",
        "Réseau": "5G International Débloqué Tout Opérateur CI",
        "Garantie": "1 An Internationale Apple Store Dubaï"
      },
      isDubaiPreorder: true,
      dubaiDeliveryDays: '7 à 10 jours ouvrés',
      dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
      featured: true,
      isNew: true,
      isFlashSale: true
    },
    {
      id: 'dubai-iphone-16-pro',
      title: 'Apple iPhone 16 Pro 256GB • Dubaï UAE Dual Nano-SIM Physique',
      slug: 'apple-iphone-16-pro-256gb-dubai-dual-sim',
      description: "Le concentré de puissance de la gamme Apple dans un format ergonomique de 6.3 pouces. Version officielle des Émirats Arabes Unis équipée du double emplacement physique nano-SIM. Processeur A18 Pro, nouveau téléobjectif 5x en tétraprisme, finition en titane brossé haute résistance. Livré neuf dans son emballage d'origine scellé Apple Store Dubaï avec facture certifiée.",
      shortDescription: 'Double SIM physique officielle, écran 6.3" ProMotion 120Hz, A18 Pro, Titane, 256GB scellé.',
      price: 820000,
      originalPrice: 920000,
      discountPercent: 11,
      categoryId: phoneCat.id,
      categoryName: phoneCat.name,
      images: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900&auto=format&fit=crop&q=80'
      ],
      inStock: true,
      stockCount: 10,
      rating: 4.9,
      reviewCount: 28,
      badgeText: '🇦🇪 DUAL SIM APPLE DXB',
      tags: ['Dubaï', 'Apple', 'iPhone 16 Pro', 'Dual SIM', 'Smartphone'],
      colors: ['Titane Naturel', 'Titane Désert', 'Titane Noir', 'Titane Blanc'],
      sizes: ['128 Go', '256 Go', '512 Go', '1 To'],
      specs: {
        "Marque": "Apple",
        "Modèle": "iPhone 16 Pro UAE Version",
        "Type SIM": "Double nano-SIM physique",
        "Écran": "6.3\" Super Retina XDR OLED ProMotion 120Hz",
        "Processeur": "Puce Apple A18 Pro",
        "Appareil Photo": "48 MP + Téléobjectif 5x + Ultra grand-angle 48 MP",
        "Réseau": "5G International Débloqué",
        "Garantie": "1 An Internationale Apple Store Dubaï"
      },
      isDubaiPreorder: true,
      dubaiDeliveryDays: '7 à 10 jours ouvrés',
      dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
      featured: true,
      isNew: true
    },
    {
      id: 'dubai-iphone-16',
      title: 'Apple iPhone 16 128GB • Édition Officielle Dubaï UAE Spec',
      slug: 'apple-iphone-16-128gb-dubai-edition',
      description: "Le nouveau standard Apple doté de la puce A18 ultra-rapide et du bouton innovant Commande de l'appareil photo. Modèle direct Émirats Arabes Unis débloqué tout opérateur mondial avec compatibilité réseau 5G Orange, MTN et Moov CI. Boîte neuve scellée, garantie 1 an internationale.",
      shortDescription: 'Nouvelle puce A18, bouton Commande appareil photo, couleurs éclatantes, boîte scellée.',
      price: 590000,
      originalPrice: 680000,
      discountPercent: 13,
      categoryId: phoneCat.id,
      categoryName: phoneCat.name,
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&auto=format&fit=crop&q=80'
      ],
      inStock: true,
      stockCount: 12,
      rating: 4.9,
      reviewCount: 19,
      badgeText: '🇦🇪 IMPORT ÉMIRATS',
      tags: ['Dubaï', 'Apple', 'iPhone 16', 'Smartphone'],
      colors: ['Rose Pastel', 'Sarcelle', 'Outremer', 'Noir Sidéral', 'Blanc'],
      sizes: ['128 Go', '256 Go', '512 Go'],
      specs: {
        "Marque": "Apple",
        "Modèle": "iPhone 16 UAE Version",
        "Écran": "6.1\" Super Retina XDR OLED",
        "Processeur": "Puce Apple A18",
        "Caméra": "48 MP Fusion avec téléobjectif 2x de qualité optique",
        "Garantie": "1 An Internationale Apple Store Dubaï"
      },
      isDubaiPreorder: true,
      dubaiDeliveryDays: '7 à 10 jours ouvrés',
      dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
      featured: false,
      isNew: true
    },
    {
      id: 'dubai-iphone-15-pro-max',
      title: 'Apple iPhone 15 Pro Max 256GB • Dubaï UAE Dual Nano-SIM',
      slug: 'apple-iphone-15-pro-max-256gb-dubai-dual-sim',
      description: "Le titane à l'état pur avec la fameuse configuration DOUBLE NANO-SIM physique des Émirats Arabes Unis. Puce A17 Pro taillée pour le gaming console, zoom optique 5x exclusif, connecteur USB-C ultra-rapide 10 Gb/s. Un des meilleurs rapports prix/prestige pour les précommandes Dubaï.",
      shortDescription: 'Double SIM physique officielle, Titane, puce A17 Pro, zoom 5x, 256GB scellé.',
      price: 750000,
      originalPrice: 850000,
      discountPercent: 12,
      categoryId: phoneCat.id,
      categoryName: phoneCat.name,
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80'
      ],
      inStock: true,
      stockCount: 6,
      rating: 5.0,
      reviewCount: 35,
      badgeText: '🇦🇪 TOP AFFAIRES DUBAÏ',
      tags: ['Dubaï', 'Apple', 'iPhone 15 Pro Max', 'Dual SIM', 'Titane'],
      colors: ['Titane Naturel', 'Titane Bleu', 'Titane Noir'],
      sizes: ['256 Go', '512 Go', '1 To'],
      specs: {
        "Marque": "Apple",
        "Modèle": "iPhone 15 Pro Max UAE",
        "Type SIM": "Double nano-SIM physique",
        "Écran": "6.7\" Super Retina XDR OLED 120Hz ProMotion",
        "Processeur": "Puce A17 Pro",
        "Caméra": "48 MP Pro Camera + Zoom optique 5x",
        "Garantie": "1 An Internationale Apple"
      },
      isDubaiPreorder: true,
      dubaiDeliveryDays: '7 à 10 jours ouvrés',
      dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
      featured: true
    },
    {
      id: 'dubai-samsung-s25-ultra',
      title: 'Samsung Galaxy S25 Ultra 5G 512GB • Snapdragon UAE Gulf Edition',
      slug: 'samsung-galaxy-s25-ultra-512gb-snapdragon-uae',
      description: "Le summum absolu d'Android en provenance directe de Samsung Gulf (Dubaï). Équipé du surpuissant processeur Qualcomm Snapdragon 8 Elite UAE Edition, de 12 Go de RAM et de 512 Go de stockage ultra-rapide. Stylet S-Pen intégré au châssis en titane, écran géant 6.9\" Dynamic AMOLED 2X avec traitement anti-reflet de pointe Gorilla Armor. Boîte scellée d'usine avec garantie officielle internationale Samsung Gulf 1 an.",
      shortDescription: 'Snapdragon 8 Elite UAE, S-Pen intégré, 200 MP, Titane, 512 Go, garantie 1 an Gulf.',
      price: 890000,
      originalPrice: 990000,
      discountPercent: 10,
      categoryId: phoneCat.id,
      categoryName: phoneCat.name,
      images: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=900&auto=format&fit=crop&q=80'
      ],
      inStock: true,
      stockCount: 7,
      rating: 5.0,
      reviewCount: 38,
      badgeText: '🇦🇪 SNAPDRAGON UAE GULF',
      tags: ['Dubaï', 'Samsung', 'Galaxy S25 Ultra', 'Snapdragon', 'Android', 'Flagship'],
      colors: ['Titane Gris', 'Titane Noir', 'Titane Argent', 'Titane Bleu'],
      sizes: ['256 Go', '512 Go', '1 To'],
      specs: {
        "Marque": "Samsung",
        "Modèle": "Galaxy S25 Ultra 5G Gulf Edition",
        "Processeur": "Qualcomm Snapdragon 8 Elite (UAE Spec)",
        "Mémoire RAM": "12 Go LPDDR5X",
        "Écran": "6.9\" Dynamic AMOLED 2X 120Hz Gorilla Armor",
        "Stylet": "S-Pen intégré à latence ultra-faible",
        "Caméra Principale": "200 MP avec zoom optique 5x et zoom spatial 100x",
        "Batterie": "5000 mAh avec charge 45W",
        "Garantie": "1 An Internationale Samsung Gulf Dubaï"
      },
      isDubaiPreorder: true,
      dubaiDeliveryDays: '7 à 10 jours ouvrés',
      dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
      featured: true,
      isNew: true,
      isFlashSale: true
    },
    {
      id: 'dubai-samsung-s24-ultra',
      title: 'Samsung Galaxy S24 Ultra 5G 256GB • Snapdragon 8 Gen 3 UAE Spec',
      slug: 'samsung-galaxy-s24-ultra-256gb-snapdragon-uae',
      description: "La référence incontournable de Samsung avec les fonctionnalités avancées Galaxy AI (traduction d'appels en direct, Circle to Search, retouche photo générative). Modèle officiel importé des Émirats Arabes Unis avec le processeur Qualcomm Snapdragon 8 Gen 3, châssis en titane et quadruple capteur photo de 200 MP. Compatible 5G tous opérateurs en Côte d'Ivoire.",
      shortDescription: 'Snapdragon 8 Gen 3, Galaxy AI, 200 MP, S-Pen, Titane, boîte scellée Samsung UAE.',
      price: 690000,
      originalPrice: 790000,
      discountPercent: 13,
      categoryId: phoneCat.id,
      categoryName: phoneCat.name,
      images: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=900&auto=format&fit=crop&q=80'
      ],
      inStock: true,
      stockCount: 9,
      rating: 4.9,
      reviewCount: 51,
      badgeText: '🇦🇪 SNAPDRAGON GULF',
      tags: ['Dubaï', 'Samsung', 'Galaxy S24 Ultra', 'Snapdragon', 'AI'],
      colors: ['Titane Gris', 'Titane Noir', 'Titane Violet', 'Titane Jaune'],
      sizes: ['256 Go', '512 Go'],
      specs: {
        "Marque": "Samsung",
        "Modèle": "Galaxy S24 Ultra 5G UAE",
        "Processeur": "Qualcomm Snapdragon 8 Gen 3 for Galaxy",
        "RAM": "12 Go",
        "Caméra": "200 MP + 50 MP Périscope 5x + 10 MP 3x + 12 MP",
        "Écran": "6.8\" Dynamic AMOLED 2X QHD+ 120Hz",
        "Garantie": "1 An Internationale Samsung Gulf"
      },
      isDubaiPreorder: true,
      dubaiDeliveryDays: '7 à 10 jours ouvrés',
      dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
      featured: true
    },
    {
      id: 'dubai-samsung-z-fold-6',
      title: 'Samsung Galaxy Z Fold 6 5G 256GB • Dubaï DXB Foldable Edition',
      slug: 'samsung-galaxy-z-fold-6-256gb-dubai-foldable',
      description: "Le smartphone pliable par excellence pour les entrepreneurs et cadres exigeants. Double écran AMOLED 120Hz (écran externe 6.3\" et immense écran interne pliable de 7.6\"). Puce Snapdragon 8 Gen 3, châssis allégé en Armor Aluminum, étanchéité certifiée. Version Gulf débloquée d'origine, garantie Samsung 1 an.",
      shortDescription: 'Double écran pliable 7.6", Snapdragon 8 Gen 3, multitâche 3 fenêtres, édition Dubaï.',
      price: 1050000,
      originalPrice: 1200000,
      discountPercent: 13,
      categoryId: phoneCat.id,
      categoryName: phoneCat.name,
      images: [
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=900&auto=format&fit=crop&q=80'
      ],
      inStock: true,
      stockCount: 4,
      rating: 5.0,
      reviewCount: 16,
      badgeText: '🇦🇪 LUXE FOLDABLE DXB',
      tags: ['Dubaï', 'Samsung', 'Galaxy Z Fold 6', 'Pliable', 'Luxe'],
      colors: ['Gris Ombré', 'Bleu Nuit', 'Argent'],
      sizes: ['256 Go', '512 Go'],
      specs: {
        "Marque": "Samsung",
        "Modèle": "Galaxy Z Fold 6 5G UAE",
        "Écran Intérieur": "7.6\" Dynamic AMOLED 2X pliable 120Hz",
        "Écran Extérieur": "6.3\" Dynamic AMOLED 2X 120Hz",
        "Processeur": "Snapdragon 8 Gen 3 for Galaxy",
        "RAM": "12 Go LPDDR5X",
        "Garantie": "1 An Internationale Samsung Gulf"
      },
      isDubaiPreorder: true,
      dubaiDeliveryDays: '7 à 10 jours ouvrés',
      dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
      featured: true
    },
    {
      id: 'dubai-samsung-z-flip-6',
      title: 'Samsung Galaxy Z Flip 6 5G 256GB • Dubaï DXB Pocket Edition',
      slug: 'samsung-galaxy-z-flip-6-256gb-dubai',
      description: "Le smartphone pliable iconique au format poudrier ultra-compact. Écran de couverture FlexWindow interactif de 3.4\", nouvel appareil photo 50 MP hérité du S24, autonomie accrue grâce à la nouvelle batterie 4000 mAh et processeur Snapdragon 8 Gen 3. Importé directement des boutiques Samsung de Dubaï.",
      shortDescription: 'Format clapet ultra-compact, écran externe FlexWindow 3.4", 50 MP, boîte scellée.',
      price: 580000,
      originalPrice: 680000,
      discountPercent: 15,
      categoryId: phoneCat.id,
      categoryName: phoneCat.name,
      images: [
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=900&auto=format&fit=crop&q=80'
      ],
      inStock: true,
      stockCount: 8,
      rating: 4.8,
      reviewCount: 22,
      badgeText: '🇦🇪 CLAPET LUXE DXB',
      tags: ['Dubaï', 'Samsung', 'Galaxy Z Flip 6', 'Pliable', 'Pocket'],
      colors: ['Menthe', 'Argent Shadow', 'Bleu', 'Jaune'],
      sizes: ['256 Go', '512 Go'],
      specs: {
        "Marque": "Samsung",
        "Modèle": "Galaxy Z Flip 6 5G",
        "Écran Pliable": "6.7\" FHD+ Dynamic AMOLED 2X 120Hz",
        "Écran Externe": "3.4\" Super AMOLED 60Hz",
        "Caméra": "50 MP grand-angle + 12 MP ultra grand-angle",
        "Processeur": "Snapdragon 8 Gen 3 for Galaxy",
        "Garantie": "1 An Internationale Samsung Gulf"
      },
      isDubaiPreorder: true,
      dubaiDeliveryDays: '7 à 10 jours ouvrés',
      dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
      featured: false
    },
    {
      id: 'dubai-xiaomi-14-ultra',
      title: 'Xiaomi 14 Ultra 5G 512GB / 16GB RAM • Leica Quad Cam Dubaï Edition',
      slug: 'xiaomi-14-ultra-512gb-leica-dubai-edition',
      description: "Le meilleur photophone du marché conçu en partenariat avec les légendaires optiques allemandes Leica. Capteur photo révolutionnaire 1 pouce Sony LYT-900 à ouverture variable f/1.63 - f/4.0, double téléobjectif périscope Leica, écran WQHD+ 120Hz 3000 nits et processeur Snapdragon 8 Gen 3. Version globale officielle vendue à Dubaï avec chargeur 90W inclus dans la boîte.",
      shortDescription: 'Quadruple capteur Leica 50 MP avec capteur 1 pouce, 16 Go RAM, 512 Go, chargeur 90W inclus.',
      price: 680000,
      originalPrice: 790000,
      discountPercent: 14,
      categoryId: phoneCat.id,
      categoryName: phoneCat.name,
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900&auto=format&fit=crop&q=80'
      ],
      inStock: true,
      stockCount: 6,
      rating: 5.0,
      reviewCount: 31,
      badgeText: '🇦🇪 PHOTOPHONE LEICA DXB',
      tags: ['Dubaï', 'Xiaomi', '14 Ultra', 'Leica', 'Photophone', 'Flagship'],
      colors: ['Noir Cuir Végan', 'Blanc Cuir Végan'],
      sizes: ['512 Go / 16 Go RAM'],
      specs: {
        "Marque": "Xiaomi",
        "Modèle": "Xiaomi 14 Ultra Global UAE",
        "Optiques": "Leica Vario-Summilux 1:1.63-2.5/12-120 ASPH",
        "Capteur Principal": "50 MP 1 pouce Sony LYT-900 à ouverture variable",
        "Écran": "6.73\" AMOLED WQHD+ 120Hz 3000 nits",
        "Processeur": "Qualcomm Snapdragon 8 Gen 3",
        "Mémoire": "16 Go RAM LPDDR5X + 512 Go UFS 4.0",
        "Charge": "90W HyperCharge filaire + 80W sans fil",
        "Garantie": "1 An Internationale Dubaï"
      },
      isDubaiPreorder: true,
      dubaiDeliveryDays: '7 à 10 jours ouvrés',
      dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
      featured: true,
      isFlashSale: true
    },
    {
      id: 'dubai-poco-f6-pro',
      title: 'Poco F6 Pro 5G 512GB / 12GB RAM • Flagship Killer Dubaï Edition',
      slug: 'poco-f6-pro-512gb-dubai-edition',
      description: "Le champion imbattable du rapport performance / prix de Dubaï. Puce Qualcomm Snapdragon 8 Gen 2, écran WQHD+ 120Hz atteignant 4000 nits, charge ultra-rapide 120W (0 à 100% en 19 minutes seulement). Version globale importée de Dubaï avec chargeur officiel 120W et coque inclus dans la boîte.",
      shortDescription: 'Snapdragon 8 Gen 2, écran 2K 120Hz 4000 nits, charge 120W en 19min, 512 Go.',
      price: 340000,
      originalPrice: 410000,
      discountPercent: 17,
      categoryId: phoneCat.id,
      categoryName: phoneCat.name,
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900&auto=format&fit=crop&q=80'
      ],
      inStock: true,
      stockCount: 15,
      rating: 4.9,
      reviewCount: 27,
      badgeText: '🇦🇪 BEST-SELLER DXB',
      tags: ['Dubaï', 'Xiaomi', 'Poco', 'F6 Pro', 'Gaming', 'Performance'],
      colors: ['Noir Minéral', 'Blanc Marbre'],
      sizes: ['512 Go / 12 Go RAM'],
      specs: {
        "Marque": "Xiaomi / Poco",
        "Modèle": "Poco F6 Pro 5G Global UAE",
        "Processeur": "Qualcomm Snapdragon 8 Gen 2 (4nm)",
        "Écran": "6.67\" Flow AMOLED WQHD+ 120Hz 4000 nits",
        "RAM / Stockage": "12 Go LPDDR5X / 512 Go UFS 4.0",
        "Charge": "120W HyperCharge (Chargeur 120W inclus)",
        "Garantie": "1 An Internationale Dubaï"
      },
      isDubaiPreorder: true,
      dubaiDeliveryDays: '7 à 10 jours ouvrés',
      dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
      featured: true
    },
    {
      id: 'dubai-pixel-9-pro-xl',
      title: 'Google Pixel 9 Pro XL 5G 256GB • Dubaï International DXB Edition',
      slug: 'google-pixel-9-pro-xl-256gb-dubai-edition',
      description: "L'expérience Google et Android pure avec les capacités d'intelligence artificielle Gemini Pro intégrées. Écran Super Actua LTPO 120Hz de 6.8 pouces éclatant, puce Google Tensor G4, traitement photographique inégalé et 7 ans de mises à jour système garanties. Version débloquée internationale vendue à Dubaï avec garantie constructeur 1 an.",
      shortDescription: 'Google Tensor G4, Gemini AI natif, meilleur rendu photo portrait de nuit, 256 Go.',
      price: 670000,
      originalPrice: 770000,
      discountPercent: 13,
      categoryId: phoneCat.id,
      categoryName: phoneCat.name,
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900&auto=format&fit=crop&q=80'
      ],
      inStock: true,
      stockCount: 5,
      rating: 5.0,
      reviewCount: 24,
      badgeText: '🇦🇪 GOOGLE AI DXB',
      tags: ['Dubaï', 'Google', 'Pixel 9 Pro XL', 'Gemini AI', 'Android'],
      colors: ['Porcelaine', 'Obsidienne', 'Noisette'],
      sizes: ['128 Go', '256 Go', '512 Go'],
      specs: {
        "Marque": "Google",
        "Modèle": "Pixel 9 Pro XL 5G DXB",
        "Processeur": "Google Tensor G4 avec coprocesseur Titan M2",
        "Écran": "6.8\" Super Actua OLED 120Hz LTPO (jusqu'à 3000 nits)",
        "Caméra": "50 MP grand-angle + 48 MP ultra grand-angle Macro + 48 MP Téléobjectif 5x",
        "IA": "Google Gemini Pro intégré en natif",
        "Mises à jour": "7 ans de mises à jour Android et sécurité",
        "Garantie": "1 An Internationale Dubaï"
      },
      isDubaiPreorder: true,
      dubaiDeliveryDays: '7 à 10 jours ouvrés',
      dubaiBatchDate: 'Vol Cargo Mardi & Vendredi',
      featured: true,
      isNew: true
    }
  ];

  for (const phone of dubaiPhones) {
    await prisma.product.upsert({
      where: { id: phone.id },
      update: phone,
      create: phone
    });
    console.log('Upserted successfully:', phone.title);
  }

  console.log(`✅ ALL ${dubaiPhones.length} DUBAI FLAGSHIP PHONES SEEDED SUCCESSFULLY!`);
}

seedPhones()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
