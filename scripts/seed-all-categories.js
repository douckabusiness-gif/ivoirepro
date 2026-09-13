const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categoriesData = [
  {
    id: 'cat-fashion',
    fallbackSlug: 'mode',
    name: 'Mode & Habillement',
    slug: 'mode-habillement',
    description: 'Vêtements tendance, prêt-à-porter homme, femme, enfants, chaussures et créations africaines',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80',
    iconName: 'Shirt',
    itemCount: 8,
    subcategories: [
      { id: 'sub-mode-chaussures', name: 'Chaussures & Baskets', slug: 'chaussures-baskets', description: 'Sneakers tendance, souliers en cuir et sandales' },
      { id: 'sub-mode-homme', name: 'Prêt-à-Porter Homme', slug: 'pret-a-porter-homme', description: 'Chemises, polos, pantalons chinos et costumes' },
      { id: 'sub-mode-femme', name: 'Prêt-à-Porter Femme', slug: 'pret-a-porter-femme', description: 'Robes élégantes, ensembles chics, jupes et tops' },
      { id: 'sub-mode-wax', name: 'Mode Africaine, Wax & Boubous', slug: 'mode-africaine-wax', description: 'Créations en pagne tissé, boubous brodés et tenues traditionnelles' },
      { id: 'sub-mode-sacs', name: 'Sacs & Maroquinerie', slug: 'sacs-maroquinerie', description: 'Sacs à main de luxe, pochettes et sacoches' },
      { id: 'sub-mode-lingerie', name: 'Lingerie & Vêtements de Nuit', slug: 'lingerie-nuit', description: 'Sous-vêtements confortables, pyjamas et peignoirs' }
    ]
  },
  {
    id: 'cat-phones',
    name: 'Téléphones & Tablettes',
    slug: 'telephones-tablettes',
    description: 'Smartphones dernière génération, iPhones, tablettes tactiles et accessoires mobiles',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    iconName: 'Smartphone',
    itemCount: 12,
    subcategories: [
      { id: 'sub-phone-android', name: 'Smartphones Android (Samsung, Xiaomi, Tecno, Infinix)', slug: 'smartphones-android', description: 'Derniers modèles Android avec caméras haute résolution' },
      { id: 'sub-phone-apple', name: 'iPhones & Écosystème Apple', slug: 'iphones-apple', description: 'iPhones neufs et reconditionnés garantis' },
      { id: 'sub-phone-tablettes', name: 'Tablettes Tactiles & iPads', slug: 'tablettes-ipads', description: 'Pour le travail, les études et le divertissement' },
      { id: 'sub-phone-ecouteurs', name: 'Écouteurs sans Fil & AirPods', slug: 'ecouteurs-sans-fil', description: 'Oreillettes Bluetooth TWS et réduction active de bruit' },
      { id: 'sub-phone-chargeurs', name: 'Chargeurs Rapides, Câbles & Powerbanks', slug: 'chargeurs-powerbanks', description: 'Batteries externes haute capacité et chargeurs ultra-rapides' },
      { id: 'sub-phone-protections', name: 'Coques, Étuis & Verres Trempés', slug: 'coques-protections', description: 'Protection intégrale antichoc pour tous modèles' }
    ]
  },
  {
    id: 'cat-computers',
    name: 'Informatique & Bureautique',
    slug: 'informatique-bureautique',
    description: 'PC portables, ordinateurs de bureau, stockage et périphériques professionnels',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
    iconName: 'Laptop',
    itemCount: 6,
    subcategories: [
      { id: 'sub-comp-laptops', name: 'Ordinateurs Portables & MacBooks', slug: 'ordinateurs-portables', description: 'PC ultra-fins, gaming et stations de travail' },
      { id: 'sub-comp-desktops', name: 'PC de Bureau & Écrans', slug: 'ordinateurs-bureau-ecrans', description: 'Unités centrales, tout-en-un et moniteurs 4K' },
      { id: 'sub-comp-stockage', name: 'Disques Durs, SSD & Clés USB', slug: 'disques-durs-ssd-usb', description: 'Stockage rapide grande capacité et sauvegardes sécurisées' },
      { id: 'sub-comp-peripheriques', name: 'Claviers, Souris & Accessoires', slug: 'claviers-souris-accessoires', description: 'Souris sans fil ergonomiques et claviers rétroéclairés' },
      { id: 'sub-comp-imprimantes', name: 'Imprimantes, Scanners & Encres', slug: 'imprimantes-scanners', description: 'Imprimantes multifonctions jet d’encre et laser' },
      { id: 'sub-comp-reseaux', name: 'Routeurs Wi-Fi, Box 4G/5G & Répéteurs', slug: 'routeurs-wifi-box', description: 'Connexion Internet haut débit partout à la maison et au bureau' }
    ]
  },
  {
    id: 'cat-electronics',
    name: 'Électronique & Son',
    slug: 'electronique-son',
    description: 'Téléviseurs intelligents, barres de son home cinéma et audio haute fidélité',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    iconName: 'Headphones',
    itemCount: 6,
    subcategories: [
      { id: 'sub-elec-tv', name: 'Smart TV, Téléviseurs 4K & Supports Muraux', slug: 'smart-tv-4k', description: 'Télévisions connectées Google TV, WebOS et OLED' },
      { id: 'sub-elec-speakers', name: 'Enceintes Bluetooth, Sono & Karaoké', slug: 'enceintes-bluetooth-sono', description: 'Baffles portables puissants et systèmes de fête' },
      { id: 'sub-elec-soundbars', name: 'Barres de Son & Home Cinéma', slug: 'barres-de-son-home-cinema', description: 'Son cinéma Dolby Atmos avec caisson de basses sans fil' },
      { id: 'sub-elec-headphones', name: 'Casques Audio & Écouteurs Hi-Fi', slug: 'casques-audio-hifi', description: 'Casques circum-auriculaires pour mélomanes et créateurs' },
      { id: 'sub-elec-gaming', name: 'Consoles de Jeux & Accessoires Gaming', slug: 'consoles-jeux-gaming', description: 'PlayStation, Xbox, manettes et jeux vidéo' },
      { id: 'sub-elec-cameras', name: 'Appareils Photo, Caméras & Drones', slug: 'appareils-photo-drones', description: 'Prise de vue professionnelle et caméras d’action 4K' }
    ]
  },
  {
    id: 'cat-appliances',
    name: 'Électroménager & Climatisation',
    slug: 'electromenager-climatisation',
    description: 'Climatiseurs, réfrigérateurs, cuisinières, petit électroménager et confort de la maison',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
    iconName: 'Home',
    itemCount: 6,
    subcategories: [
      { id: 'sub-app-clim', name: 'Climatiseurs Split, Inverter & Ventilateurs', slug: 'climatiseurs-ventilateurs', description: 'Fraîcheur économique et ventilation silencieuse' },
      { id: 'sub-app-frigo', name: 'Réfrigérateurs & Congélateurs Coffres', slug: 'refrigerateurs-congelateurs', description: 'Conservation longue durée et froid ventilé no-frost' },
      { id: 'sub-app-cuisiniere', name: 'Cuisinières, Plaques à Gaz & Fours', slug: 'cuisinieres-fours-gaz', description: 'Cuisinières 4 à 5 feux avec four et allumage automatique' },
      { id: 'sub-app-lave-linge', name: 'Machines à Laver & Sèche-Linge', slug: 'machines-a-laver', description: 'Lave-linge automatiques et semi-automatiques grande capacité' },
      { id: 'sub-app-robots', name: 'Mixeurs, Friteuses Air Fryer & Robots Cuisine', slug: 'mixeurs-air-fryer-robots', description: 'Cuisson sans huile saine et préparation culinaire rapide' },
      { id: 'sub-app-fers', name: 'Fers à Repasser, Centrales Vapeur & Bouilloires', slug: 'fers-repasser-bouilloires', description: 'Repassage vertical vapeur et bouilloires inox rapides' }
    ]
  },
  {
    id: 'cat-beauty',
    name: 'Beauté, Parfums & Bien-Être',
    slug: 'beaute-parfums-bien-etre',
    description: 'Parfumerie fine, soins de la peau, maquillage et soins capillaires haut de gamme',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
    iconName: 'Sparkles',
    itemCount: 6,
    subcategories: [
      { id: 'sub-beauty-men', name: 'Parfums Homme (Oud, Boisé, Ambré)', slug: 'parfums-homme', description: 'Eaux de parfum intenses, orientales et fraîches longue tenue' },
      { id: 'sub-beauty-women', name: 'Parfums Femme (Floral, Sucré, Vanille)', slug: 'parfums-femme', description: 'Fragrances captivantes et coffrets cadeaux de luxe' },
      { id: 'sub-beauty-visage', name: 'Soins Visage & Crèmes Hydratantes Bio', slug: 'soins-visage-cremes', description: 'Sérums vitamine C, anti-taches et éclat du teint' },
      { id: 'sub-beauty-cheveux', name: 'Mèches, Perruques & Soins Capillaires', slug: 'meches-perruques-capillaires', description: 'Mèches brésiliennes, perruques lace et beurres nourrissants' },
      { id: 'sub-beauty-makeup', name: 'Maquillage, Palettes & Rouges à Lèvres', slug: 'maquillage-cosmetiques', description: 'Fonds de teint adaptés aux carnations métisses et noires' },
      { id: 'sub-beauty-savons', name: 'Savons Naturels, Gommages & Huiles Corps', slug: 'savons-gommages-corps', description: 'Savon noir, beurre de karité pur et gommages exfoliants' }
    ]
  },
  {
    id: 'cat-watches',
    name: 'Montres & Bijouterie de Luxe',
    slug: 'montres-bijouterie-luxe',
    description: 'Horlogerie d\'exception, chronographes de prestige et parures de bijoux raffinés',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    iconName: 'Watch',
    itemCount: 6,
    subcategories: [
      { id: 'sub-watch-men', name: 'Montres Homme Automatiques & Chronos', slug: 'montres-homme-automatiques', description: 'Boîtiers acier massif, cadrans squelettes et bracelets cuir' },
      { id: 'sub-watch-women', name: 'Montres Femme Élégantes & Parures', slug: 'montres-femme-elegantes', description: 'Finitions or rose, cristaux brillants et mailles milanaises' },
      { id: 'sub-watch-smart', name: 'Montres Connectées AMOLED & Santé', slug: 'montres-connectees-sante', description: 'Appels Bluetooth, suivi cardiaque et autonomie étendue' },
      { id: 'sub-watch-bagues', name: 'Bagues, Alliances & Solitaires', slug: 'bagues-alliances-bijoux', description: 'Alliances de mariage, anneaux sertis et chevalières' },
      { id: 'sub-watch-colliers', name: 'Colliers, Chaînes & Pendentifs', slug: 'colliers-chaines-or-argent', description: 'Chaînes maille royale, pendentifs personnalisés' },
      { id: 'sub-watch-bracelets', name: 'Bracelets en Cuir, Acier & Perles', slug: 'bracelets-homme-femme', description: 'Bracelets magnétiques, gourmettes et joncs' }
    ]
  },
  {
    id: 'cat-baby',
    name: 'Bébé, Enfants & Puériculture',
    slug: 'bebe-enfants-puericulture',
    description: 'Tout pour bébé, nouveau-nés, poussettes, éveil et jeux pour enfants',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80',
    iconName: 'Baby',
    itemCount: 5,
    subcategories: [
      { id: 'sub-baby-vetements', name: 'Vêtements & Ensembles Bébé Garçon & Fille', slug: 'vetements-bebe-enfants', description: 'Bodies pur coton, grenouillères douces et ensembles assortis' },
      { id: 'sub-baby-couches', name: 'Couches, Lingettes & Toilette Bébé', slug: 'couches-lingettes-toilette', description: 'Couches ultra-absorbantes anti-fuites et savons hypoallergéniques' },
      { id: 'sub-baby-poussettes', name: 'Poussettes, Sièges Auto & Porte-Bébés', slug: 'poussettes-sieges-auto', description: 'Poussettes pliables compactes et porte-bébés ergonomiques' },
      { id: 'sub-baby-repas', name: 'Biberons, Stérilisateurs & Repas Bébé', slug: 'biberons-repas-bebe', description: 'Biberons anti-coliques, tasses d’apprentissage et bavoirs' },
      { id: 'sub-baby-jouets', name: 'Jouets d\'Éveil, Poupées & Véhicules Enfants', slug: 'jouets-eveil-enfants', description: 'Peluches interactives, tapis d’éveil et petites voitures' }
    ]
  },
  {
    id: 'cat-sports',
    name: 'Sports, Fitness & Musculation',
    slug: 'sports-fitness-musculation',
    description: 'Équipements de sport, appareils de musculation, tenues de fitness et loisirs extérieurs',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    iconName: 'Dumbbell',
    itemCount: 5,
    subcategories: [
      { id: 'sub-sport-running', name: 'Vêtements & Chaussures de Running & Gym', slug: 'chaussures-vetements-sport', description: 'Baskets avec amorti réactif et maillots respirants' },
      { id: 'sub-sport-materiel', name: 'Haltères, Bandes Élastiques & Tapis de Yoga', slug: 'halteres-tapis-musculation', description: 'Kits d’entraînement à domicile et accessoires de renforcement' },
      { id: 'sub-sport-foot', name: 'Maillots de Foot & Équipes Officielles', slug: 'maillots-football-officiels', description: 'Maillots Éléphants de Côte d’Ivoire, clubs européens et ballons' },
      { id: 'sub-sport-velos', name: 'Vélos VTT, Trottinettes & Accessoires', slug: 'velos-vtt-trottinettes', description: 'VTT tout terrain robustes et trottinettes pliantes' },
      { id: 'sub-sport-accessoires', name: 'Gourdes Isothermes & Sacs de Sport', slug: 'gourdes-sacs-sport', description: 'Gourdes grande contenance et sacs polochons compartimentés' }
    ]
  },
  {
    id: 'cat-automotive',
    name: 'Auto, Moto & Bricolage',
    slug: 'auto-moto-bricolage',
    description: 'Accessoires intérieurs et extérieurs, entretien automobile, casques et équipements moto',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    iconName: 'Car',
    itemCount: 5,
    subcategories: [
      { id: 'sub-auto-accessoires', name: 'Accessoires Auto & Aménagement Intérieur', slug: 'accessoires-auto-interieur', description: 'Housses de sièges, tapis sur-mesure et supports smartphone' },
      { id: 'sub-auto-entretien', name: 'Entretien, Huiles & Produits de Nettoyage', slug: 'entretien-huiles-lavage-auto', description: 'Shampoings lustrants, microfibres et rénovateurs optiques' },
      { id: 'sub-auto-electronique', name: 'Électronique Embarquée, GPS & Dashcams', slug: 'gps-dashcam-cameras-recul', description: 'Caméras de recul sans fil, balises GPS et transmetteurs FM' },
      { id: 'sub-auto-moto', name: 'Casques, Gants & Équipements Moto', slug: 'casques-equipements-moto', description: 'Casques intégraux homologués, blousons et gants renforcés' },
      { id: 'sub-auto-outils', name: 'Boîtes à Outils, Clés & Dépannage', slug: 'outils-bricolage-depannage', description: 'Compresseurs d’air portables, câbles de démarrage et coffrets à douilles' }
    ]
  },
  {
    id: 'cat-grocery',
    name: 'Supermarché & Épicerie Fine',
    slug: 'supermarche-epicerie-fine',
    description: 'Produits du quotidien, thés, cafés, délices du terroir ivoirien et entretien ménager',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    iconName: 'ShoppingBag',
    itemCount: 5,
    subcategories: [
      { id: 'sub-groc-boissons', name: 'Cafés, Thés, Chocolats Chauds & Sirops', slug: 'cafes-thes-boissons', description: 'Café de Côte d’Ivoire, cacao pur moulu et infusions parfumées' },
      { id: 'sub-groc-terroir', name: 'Produits du Terroir & Saveurs d\'Afrique', slug: 'produits-terroir-africain', description: 'Miel pur de savane, épices traditionnelles et fruits séchés' },
      { id: 'sub-groc-sale', name: 'Épicerie Salée, Huiles, Riz & Pâtes', slug: 'riz-huiles-pates-conserves', description: 'Riz parfumé, huiles de qualité et conserves du quotidien' },
      { id: 'sub-groc-sucre', name: 'Biscuits, Snacks & Chocolats Fins', slug: 'biscuits-snacks-chocolats', description: 'Confiseries gourmandes et chocolats fins au beurre de cacao' },
      { id: 'sub-groc-entretien', name: 'Lessives, Désinfectants & Entretien Maison', slug: 'lessives-produits-entretien', description: 'Produits vaisselle dégraissants et assouplissants parfumés' }
    ]
  }
];

async function seedAllCategories() {
  console.log('🚀 Démarrage du peuplement complet des catégories & sous-catégories...');

  for (const catData of categoriesData) {
    const { subcategories, fallbackSlug, ...catFields } = catData;

    // Check if category already exists by slug or fallbackSlug
    let existingCat = await prisma.category.findFirst({
      where: {
        OR: [
          { id: catFields.id },
          { slug: catFields.slug },
          ...(fallbackSlug ? [{ slug: fallbackSlug }] : [])
        ]
      },
      include: { subcategories: true }
    });

    let targetCategoryId = catFields.id;

    if (existingCat) {
      console.log(`🔄 Mise à jour de la catégorie existante : ${existingCat.name} -> ${catFields.name}`);
      targetCategoryId = existingCat.id;
      await prisma.category.update({
        where: { id: existingCat.id },
        data: {
          name: catFields.name,
          description: catFields.description,
          image: catFields.image,
          iconName: catFields.iconName,
          itemCount: catFields.itemCount
        }
      });
    } else {
      console.log(`✨ Création de la catégorie : ${catFields.name}`);
      const created = await prisma.category.create({
        data: {
          id: catFields.id,
          name: catFields.name,
          slug: catFields.slug,
          description: catFields.description,
          image: catFields.image,
          iconName: catFields.iconName,
          itemCount: catFields.itemCount
        }
      });
      targetCategoryId = created.id;
    }

    // Process subcategories
    for (const sub of subcategories) {
      const existingSub = await prisma.subcategory.findFirst({
        where: {
          OR: [
            { id: sub.id },
            { categoryId: targetCategoryId, slug: sub.slug },
            { categoryId: targetCategoryId, name: sub.name }
          ]
        }
      });

      if (existingSub) {
        await prisma.subcategory.update({
          where: { id: existingSub.id },
          data: {
            name: sub.name,
            description: sub.description,
            image: catFields.image
          }
        });
      } else {
        await prisma.subcategory.create({
          data: {
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            description: sub.description,
            image: catFields.image,
            categoryId: targetCategoryId
          }
        });
      }
    }
    console.log(`  ✅ ${subcategories.length} sous-catégories associées à "${catFields.name}"`);
  }

  const allCats = await prisma.category.findMany({
    include: { subcategories: true }
  });

  const totalSubs = allCats.reduce((acc, c) => acc + c.subcategories.length, 0);
  console.log(`🎉 Terminé avec succès ! Total : ${allCats.length} catégories et ${totalSubs} sous-catégories actives.`);
}

seedAllCategories()
  .catch(err => {
    console.error('❌ Erreur lors du peuplement des catégories :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
