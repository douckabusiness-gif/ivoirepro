import { Category, Product, StoreSettings, Order, DeliveryPerson, DeliveryZone, HeroSlideItem, InGridBannerItem } from './types';

export const IVORY_COAST_COMMUNES = [
  { name: 'Cocody (Angré, Riviera, 2 Plateaux)', zone: 'Abidjan Nord & Centre', fee: 1500 },
  { name: 'Le Plateau (Centre des affaires)', zone: 'Abidjan Nord & Centre', fee: 1500 },
  { name: 'Marcory (Zone 4, Biétry)', zone: 'Abidjan Sud & Ouest', fee: 2000 },
  { name: 'Yopougon', zone: 'Abidjan Sud & Ouest', fee: 2000 },
  { name: 'Koumassi', zone: 'Abidjan Sud & Ouest', fee: 2000 },
  { name: 'Treichville', zone: 'Abidjan Sud & Ouest', fee: 2000 },
  { name: 'Port-Bouët (Aéroport)', zone: 'Abidjan Sud & Ouest', fee: 2000 },
  { name: 'Adjamé', zone: 'Abidjan Nord & Centre', fee: 1500 },
  { name: 'Attécoubé', zone: 'Abidjan Nord & Centre', fee: 1500 },
  { name: 'Abobo', zone: 'Abidjan Nord & Centre', fee: 1500 },
  { name: 'Bingerville', zone: 'Périphérie Grand Abidjan', fee: 2500 },
  { name: 'Songon', zone: 'Périphérie Grand Abidjan', fee: 2500 },
  { name: 'Grand-Bassam', zone: 'Périphérie Grand Abidjan', fee: 2500 },
  { name: 'Yamoussoukro (Capitale)', zone: 'Villes de l\'Intérieur', fee: 4000 },
  { name: 'Bouaké', zone: 'Villes de l\'Intérieur', fee: 4000 },
  { name: 'San-Pédro', zone: 'Villes de l\'Intérieur', fee: 4000 },
  { name: 'Korhogo', zone: 'Villes de l\'Intérieur', fee: 4000 },
  { name: 'Daloa', zone: 'Villes de l\'Intérieur', fee: 4000 },
  { name: 'Man', zone: 'Villes de l\'Intérieur', fee: 4000 },
  { name: 'Gagnoa', zone: 'Villes de l\'Intérieur', fee: 4000 },
  { name: 'Autre ville de Côte d\'Ivoire', zone: 'Villes de l\'Intérieur', fee: 4000 }
];

export const initialDeliveryPersons: DeliveryPerson[] = [
  {
    id: 'courier-1',
    name: 'Koffi Kouamé',
    phone: '+225 07 11 22 33 44',
    vehicleType: 'moto',
    zone: 'Abidjan Nord & Centre',
    status: 'available',
    currentDeliveriesCount: 2,
    totalCompletedDeliveries: 148,
    collectedCashToday: 42500,
    rating: 4.9,
    notes: 'Secteur Cocody, Angré, Riviera et Plateau. Rapide et ponctuel.',
    createdAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'courier-2',
    name: 'Bakary Koné',
    phone: '+225 05 55 66 77 88',
    vehicleType: 'moto',
    zone: 'Abidjan Sud & Ouest',
    status: 'available',
    currentDeliveriesCount: 1,
    totalCompletedDeliveries: 124,
    collectedCashToday: 26000,
    rating: 4.8,
    notes: 'Secteur Marcory Zone 4, Koumassi, Treichville et Yopougon.',
    createdAt: '2026-01-20T08:00:00Z'
  },
  {
    id: 'courier-3',
    name: 'Yao Franck',
    phone: '+225 01 99 88 77 66',
    vehicleType: 'voiture',
    zone: 'Périphérie Grand Abidjan',
    status: 'available',
    currentDeliveriesCount: 0,
    totalCompletedDeliveries: 89,
    collectedCashToday: 0,
    rating: 5.0,
    notes: 'Grand-Bassam, Bingerville, Songon et colis volumineux.',
    createdAt: '2026-02-01T08:00:00Z'
  }
];

export const initialCategories: Category[] = [
  {
    id: 'cat-fashion',
    name: 'Mode & Habillement',
    slug: 'mode-habillement',
    description: 'Vêtements tendance, prêt-à-porter homme, femme, enfants, chaussures et créations africaines',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80',
    iconName: 'Shirt',
    itemCount: 8,
    subcategories: [
      { id: 'sub-mode-chaussures', categoryId: 'cat-fashion', name: 'Chaussures & Baskets', slug: 'chaussures-baskets', description: 'Sneakers tendance, souliers en cuir et sandales' },
      { id: 'sub-mode-homme', categoryId: 'cat-fashion', name: 'Prêt-à-Porter Homme', slug: 'pret-a-porter-homme', description: 'Chemises, polos, pantalons chinos et costumes' },
      { id: 'sub-mode-femme', categoryId: 'cat-fashion', name: 'Prêt-à-Porter Femme', slug: 'pret-a-porter-femme', description: 'Robes élégantes, ensembles chics, jupes et tops' },
      { id: 'sub-mode-wax', categoryId: 'cat-fashion', name: 'Mode Africaine, Wax & Boubous', slug: 'mode-africaine-wax', description: 'Créations en pagne tissé, boubous brodés et tenues traditionnelles' },
      { id: 'sub-mode-sacs', categoryId: 'cat-fashion', name: 'Sacs & Maroquinerie', slug: 'sacs-maroquinerie', description: 'Sacs à main de luxe, pochettes et sacoches' },
      { id: 'sub-mode-lingerie', categoryId: 'cat-fashion', name: 'Lingerie & Vêtements de Nuit', slug: 'lingerie-nuit', description: 'Sous-vêtements confortables, pyjamas et peignoirs' }
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
      { id: 'sub-phone-android', categoryId: 'cat-phones', name: 'Smartphones Android (Samsung, Xiaomi, Tecno, Infinix)', slug: 'smartphones-android', description: 'Derniers modèles Android avec caméras haute résolution' },
      { id: 'sub-phone-apple', categoryId: 'cat-phones', name: 'iPhones & Écosystème Apple', slug: 'iphones-apple', description: 'iPhones neufs et reconditionnés garantis' },
      { id: 'sub-phone-tablettes', categoryId: 'cat-phones', name: 'Tablettes Tactiles & iPads', slug: 'tablettes-ipads', description: 'Pour le travail, les études et le divertissement' },
      { id: 'sub-phone-ecouteurs', categoryId: 'cat-phones', name: 'Écouteurs sans Fil & AirPods', slug: 'ecouteurs-sans-fil', description: 'Oreillettes Bluetooth TWS et réduction active de bruit' },
      { id: 'sub-phone-chargeurs', categoryId: 'cat-phones', name: 'Chargeurs Rapides, Câbles & Powerbanks', slug: 'chargeurs-powerbanks', description: 'Batteries externes haute capacité et chargeurs ultra-rapides' },
      { id: 'sub-phone-protections', categoryId: 'cat-phones', name: 'Coques, Étuis & Verres Trempés', slug: 'coques-protections', description: 'Protection intégrale antichoc pour tous modèles' }
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
      { id: 'sub-comp-laptops', categoryId: 'cat-computers', name: 'Ordinateurs Portables & MacBooks', slug: 'ordinateurs-portables', description: 'PC ultra-fins, gaming et stations de travail' },
      { id: 'sub-comp-desktops', categoryId: 'cat-computers', name: 'PC de Bureau & Écrans', slug: 'ordinateurs-bureau-ecrans', description: 'Unités centrales, tout-en-un et moniteurs 4K' },
      { id: 'sub-comp-stockage', categoryId: 'cat-computers', name: 'Disques Durs, SSD & Clés USB', slug: 'disques-durs-ssd-usb', description: 'Stockage rapide grande capacité et sauvegardes sécurisées' },
      { id: 'sub-comp-peripheriques', categoryId: 'cat-computers', name: 'Claviers, Souris & Accessoires', slug: 'claviers-souris-accessoires', description: 'Souris sans fil ergonomiques et claviers rétroéclairés' },
      { id: 'sub-comp-imprimantes', categoryId: 'cat-computers', name: 'Imprimantes, Scanners & Encres', slug: 'imprimantes-scanners', description: 'Imprimantes multifonctions jet d’encre et laser' },
      { id: 'sub-comp-reseaux', categoryId: 'cat-computers', name: 'Routeurs Wi-Fi, Box 4G/5G & Répéteurs', slug: 'routeurs-wifi-box', description: 'Connexion Internet haut débit partout à la maison et au bureau' }
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
      { id: 'sub-elec-tv', categoryId: 'cat-electronics', name: 'Smart TV, Téléviseurs 4K & Supports Muraux', slug: 'smart-tv-4k', description: 'Télévisions connectées Google TV, WebOS et OLED' },
      { id: 'sub-elec-speakers', categoryId: 'cat-electronics', name: 'Enceintes Bluetooth, Sono & Karaoké', slug: 'enceintes-bluetooth-sono', description: 'Baffles portables puissants et systèmes de fête' },
      { id: 'sub-elec-soundbars', categoryId: 'cat-electronics', name: 'Barres de Son & Home Cinéma', slug: 'barres-de-son-home-cinema', description: 'Son cinéma Dolby Atmos avec caisson de basses sans fil' },
      { id: 'sub-elec-headphones', categoryId: 'cat-electronics', name: 'Casques Audio & Écouteurs Hi-Fi', slug: 'casques-audio-hifi', description: 'Casques circum-auriculaires pour mélomanes et créateurs' },
      { id: 'sub-elec-gaming', categoryId: 'cat-electronics', name: 'Consoles de Jeux & Accessoires Gaming', slug: 'consoles-jeux-gaming', description: 'PlayStation, Xbox, manettes et jeux vidéo' },
      { id: 'sub-elec-cameras', categoryId: 'cat-electronics', name: 'Appareils Photo, Caméras & Drones', slug: 'appareils-photo-drones', description: 'Prise de vue professionnelle et caméras d’action 4K' }
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
      { id: 'sub-app-clim', categoryId: 'cat-appliances', name: 'Climatiseurs Split, Inverter & Ventilateurs', slug: 'climatiseurs-ventilateurs', description: 'Fraîcheur économique et ventilation silencieuse' },
      { id: 'sub-app-frigo', categoryId: 'cat-appliances', name: 'Réfrigérateurs & Congélateurs Coffres', slug: 'refrigerateurs-congelateurs', description: 'Conservation longue durée et froid ventilé no-frost' },
      { id: 'sub-app-cuisiniere', categoryId: 'cat-appliances', name: 'Cuisinières, Plaques à Gaz & Fours', slug: 'cuisinieres-fours-gaz', description: 'Cuisinières 4 à 5 feux avec four et allumage automatique' },
      { id: 'sub-app-lave-linge', categoryId: 'cat-appliances', name: 'Machines à Laver & Sèche-Linge', slug: 'machines-a-laver', description: 'Lave-linge automatiques et semi-automatiques grande capacité' },
      { id: 'sub-app-robots', categoryId: 'cat-appliances', name: 'Mixeurs, Friteuses Air Fryer & Robots Cuisine', slug: 'mixeurs-air-fryer-robots', description: 'Cuisson sans huile saine et préparation culinaire rapide' },
      { id: 'sub-app-fers', categoryId: 'cat-appliances', name: 'Fers à Repasser, Centrales Vapeur & Bouilloires', slug: 'fers-repasser-bouilloires', description: 'Repassage vertical vapeur et bouilloires inox rapides' }
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
      { id: 'sub-beauty-men', categoryId: 'cat-beauty', name: 'Parfums Homme (Oud, Boisé, Ambré)', slug: 'parfums-homme', description: 'Eaux de parfum intenses, orientales et fraîches longue tenue' },
      { id: 'sub-beauty-women', categoryId: 'cat-beauty', name: 'Parfums Femme (Floral, Sucré, Vanille)', slug: 'parfums-femme', description: 'Fragrances captivantes et coffrets cadeaux de luxe' },
      { id: 'sub-beauty-visage', categoryId: 'cat-beauty', name: 'Soins Visage & Crèmes Hydratantes Bio', slug: 'soins-visage-cremes', description: 'Sérums vitamine C, anti-taches et éclat du teint' },
      { id: 'sub-beauty-cheveux', categoryId: 'cat-beauty', name: 'Mèches, Perruques & Soins Capillaires', slug: 'meches-perruques-capillaires', description: 'Mèches brésiliennes, perruques lace et beurres nourrissants' },
      { id: 'sub-beauty-makeup', categoryId: 'cat-beauty', name: 'Maquillage, Palettes & Rouges à Lèvres', slug: 'maquillage-cosmetiques', description: 'Fonds de teint adaptés aux carnations métisses et noires' },
      { id: 'sub-beauty-savons', categoryId: 'cat-beauty', name: 'Savons Naturels, Gommages & Huiles Corps', slug: 'savons-gommages-corps', description: 'Savon noir, beurre de karité pur et gommages exfoliants' }
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
      { id: 'sub-watch-men', categoryId: 'cat-watches', name: 'Montres Homme Automatiques & Chronos', slug: 'montres-homme-automatiques', description: 'Boîtiers acier massif, cadrans squelettes et bracelets cuir' },
      { id: 'sub-watch-women', categoryId: 'cat-watches', name: 'Montres Femme Élégantes & Parures', slug: 'montres-femme-elegantes', description: 'Finitions or rose, cristaux brillants et mailles milanaises' },
      { id: 'sub-watch-smart', categoryId: 'cat-watches', name: 'Montres Connectées AMOLED & Santé', slug: 'montres-connectees-sante', description: 'Appels Bluetooth, suivi cardiaque et autonomie étendue' },
      { id: 'sub-watch-bagues', categoryId: 'cat-watches', name: 'Bagues, Alliances & Solitaires', slug: 'bagues-alliances-bijoux', description: 'Alliances de mariage, anneaux sertis et chevalières' },
      { id: 'sub-watch-colliers', categoryId: 'cat-watches', name: 'Colliers, Chaînes & Pendentifs', slug: 'colliers-chaines-or-argent', description: 'Chaînes maille royale, pendentifs personnalisés' },
      { id: 'sub-watch-bracelets', categoryId: 'cat-watches', name: 'Bracelets en Cuir, Acier & Perles', slug: 'bracelets-homme-femme', description: 'Bracelets magnétiques, gourmettes et joncs' }
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
      { id: 'sub-baby-vetements', categoryId: 'cat-baby', name: 'Vêtements & Ensembles Bébé Garçon & Fille', slug: 'vetements-bebe-enfants', description: 'Bodies pur coton, grenouillères douces et ensembles assortis' },
      { id: 'sub-baby-couches', categoryId: 'cat-baby', name: 'Couches, Lingettes & Toilette Bébé', slug: 'couches-lingettes-toilette', description: 'Couches ultra-absorbantes anti-fuites et savons hypoallergéniques' },
      { id: 'sub-baby-poussettes', categoryId: 'cat-baby', name: 'Poussettes, Sièges Auto & Porte-Bébés', slug: 'poussettes-sieges-auto', description: 'Poussettes pliables compactes et porte-bébés ergonomiques' },
      { id: 'sub-baby-repas', categoryId: 'cat-baby', name: 'Biberons, Stérilisateurs & Repas Bébé', slug: 'biberons-repas-bebe', description: 'Biberons anti-coliques, tasses d’apprentissage et bavoirs' },
      { id: 'sub-baby-jouets', categoryId: 'cat-baby', name: 'Jouets d\'Éveil, Poupées & Véhicules Enfants', slug: 'jouets-eveil-enfants', description: 'Peluches interactives, tapis d’éveil et petites voitures' }
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
      { id: 'sub-sport-running', categoryId: 'cat-sports', name: 'Vêtements & Chaussures de Running & Gym', slug: 'chaussures-vetements-sport', description: 'Baskets avec amorti réactif et maillots respirants' },
      { id: 'sub-sport-materiel', categoryId: 'cat-sports', name: 'Haltères, Bandes Élastiques & Tapis de Yoga', slug: 'halteres-tapis-musculation', description: 'Kits d’entraînement à domicile et accessoires de renforcement' },
      { id: 'sub-sport-foot', categoryId: 'cat-sports', name: 'Maillots de Foot & Équipes Officielles', slug: 'maillots-football-officiels', description: 'Maillots Éléphants de Côte d’Ivoire, clubs européens et ballons' },
      { id: 'sub-sport-velos', categoryId: 'cat-sports', name: 'Vélos VTT, Trottinettes & Accessoires', slug: 'velos-vtt-trottinettes', description: 'VTT tout terrain robustes et trottinettes pliantes' },
      { id: 'sub-sport-accessoires', categoryId: 'cat-sports', name: 'Gourdes Isothermes & Sacs de Sport', slug: 'gourdes-sacs-sport', description: 'Gourdes grande contenance et sacs polochons compartimentés' }
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
      { id: 'sub-auto-accessoires', categoryId: 'cat-automotive', name: 'Accessoires Auto & Aménagement Intérieur', slug: 'accessoires-auto-interieur', description: 'Housses de sièges, tapis sur-mesure et supports smartphone' },
      { id: 'sub-auto-entretien', categoryId: 'cat-automotive', name: 'Entretien, Huiles & Produits de Nettoyage', slug: 'entretien-huiles-lavage-auto', description: 'Shampoings lustrants, microfibres et rénovateurs optiques' },
      { id: 'sub-auto-electronique', categoryId: 'cat-automotive', name: 'Électronique Embarquée, GPS & Dashcams', slug: 'gps-dashcam-cameras-recul', description: 'Caméras de recul sans fil, balises GPS et transmetteurs FM' },
      { id: 'sub-auto-moto', categoryId: 'cat-automotive', name: 'Casques, Gants & Équipements Moto', slug: 'casques-equipements-moto', description: 'Casques intégraux homologués, blousons et gants renforcés' },
      { id: 'sub-auto-outils', categoryId: 'cat-automotive', name: 'Boîtes à Outils, Clés & Dépannage', slug: 'outils-bricolage-depannage', description: 'Compresseurs d’air portables, câbles de démarrage et coffrets à douilles' }
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
      { id: 'sub-groc-boissons', categoryId: 'cat-grocery', name: 'Cafés, Thés, Chocolats Chauds & Sirops', slug: 'cafes-thes-boissons', description: 'Café de Côte d’Ivoire, cacao pur moulu et infusions parfumées' },
      { id: 'sub-groc-terroir', categoryId: 'cat-grocery', name: 'Produits du Terroir & Saveurs d\'Afrique', slug: 'produits-terroir-africain', description: 'Miel pur de savane, épices traditionnelles et fruits séchés' },
      { id: 'sub-groc-sale', categoryId: 'cat-grocery', name: 'Épicerie Salée, Huiles, Riz & Pâtes', slug: 'riz-huiles-pates-conserves', description: 'Riz parfumé, huiles de qualité et conserves du quotidien' },
      { id: 'sub-groc-sucre', categoryId: 'cat-grocery', name: 'Biscuits, Snacks & Chocolats Fins', slug: 'biscuits-snacks-chocolats', description: 'Confiseries gourmandes et chocolats fins au beurre de cacao' },
      { id: 'sub-groc-entretien', categoryId: 'cat-grocery', name: 'Lessives, Désinfectants & Entretien Maison', slug: 'lessives-produits-entretien', description: 'Produits vaisselle dégraissants et assouplissants parfumés' }
    ]
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    title: 'Casque Audio Sans Fil Pulse ANC Pro',
    slug: 'casque-audio-pulse-anc-pro',
    description: 'Plongez dans une immersion sonore totale avec la réduction active du bruit hybride de dernière génération. Autonomie record de 45 heures, coussinets en mousse à mémoire de forme ultra confortables et son spatialisé haute fidélité.',
    shortDescription: 'Réduction active de bruit, 45h d\'autonomie, son Haute Fidélité 3D.',
    price: 49900,
    originalPrice: 75000,
    discountPercent: 33,
    categoryId: 'cat-electronics',
    categoryName: 'High-Tech & Audio',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900&auto=format&fit=crop&q=80'
    ],
    featured: true,
    isNew: true,
    isFlashSale: true,
    flashSaleEndsAt: '2026-08-30T23:59:59',
    inStock: true,
    stockCount: 18,
    rating: 4.9,
    reviewCount: 142,
    badgeText: 'VENTE FLASH -33%',
    tags: ['Audio', 'Bluetooth 5.3', 'Best Seller'],
    colors: ['Noir Mat', 'Gris Titane', 'Bleu Nuit'],
    specs: {
      'Autonomie': '45 heures (35h avec ANC activé)',
      'Connectivité': 'Bluetooth 5.3 + Câble Jack 3.5mm',
      'Recharge': 'USB-C Fast Charge (10 min = 5h d\'écoute)',
      'Poids': '250g'
    }
  },
  {
    id: 'prod-2',
    title: 'Sneakers Velocity Runner Édition Limitée',
    slug: 'sneakers-velocity-runner',
    description: 'Une alliance audacieuse entre design avant-gardiste et performance sportive. Semelle amortissante à technologie dynamique, tige en mesh respirant renforcé et finitions haut de gamme faites pour durer.',
    shortDescription: 'Sneakers premium ultra légères avec semelle rebond dynamique.',
    price: 38500,
    originalPrice: 55000,
    discountPercent: 30,
    categoryId: 'cat-fashion',
    categoryName: 'Mode & Sneakers',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=900&auto=format&fit=crop&q=80'
    ],
    featured: true,
    isNew: true,
    isFlashSale: false,
    inStock: true,
    stockCount: 24,
    rating: 4.8,
    reviewCount: 96,
    badgeText: 'NOUVEAU',
    tags: ['Mode', 'Sneakers', 'Streetwear'],
    colors: ['Rouge Écarlate', 'Noir Carbone', 'Blanc Pur'],
    sizes: ['40', '41', '42', '43', '44', '45'],
    specs: {
      'Matière': 'Mesh respirant & empiècements cuir suédé',
      'Semelle': 'Mousse EVA thermoformée + caoutchouc anti-dérapant',
      'Usage': 'Quotidien, Running urbain & Lifestyle'
    }
  },
  {
    id: 'prod-3',
    title: 'Montre Chronographe Royal Gold Automatique',
    slug: 'montre-chronographe-royal-gold',
    description: 'La quintessence du raffinement horloger. Mouvement mécanique automatique visible à travers le fond saphir, boîtier en acier inoxydable 316L plaqué or brossé et bracelet en cuir véritable façon crocodile.',
    shortDescription: 'Mouvement automatique suisse, verre saphir inrayable, cuir véritable.',
    price: 89000,
    originalPrice: 125000,
    discountPercent: 29,
    categoryId: 'cat-watches',
    categoryName: 'Montres & Bijoux',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&auto=format&fit=crop&q=80'
    ],
    featured: true,
    isNew: false,
    isFlashSale: true,
    flashSaleEndsAt: '2026-08-30T23:59:59',
    inStock: true,
    stockCount: 7,
    rating: 5.0,
    reviewCount: 68,
    badgeText: 'LUXE -29%',
    tags: ['Luxe', 'Horlogerie', 'Automatique'],
    colors: ['Or & Cadran Blanc', 'Or & Cadran Noir', 'Argent Platine'],
    specs: {
      'Diamètre du boîtier': '42 mm',
      'Étanchéité': '5 ATM / 50 Mètres',
      'Verre': 'Cristal Saphir antireflet',
      'Garantie': '2 ans internationale'
    }
  },
  {
    id: 'prod-4',
    title: 'Extrait de Parfum "Oud Impérial & Ambre Doré" (100ml)',
    slug: 'parfum-oud-imperial-ambre-dore',
    description: 'Un voyage olfactif envoûtant et sophistiqué. Des notes de tête d\'épices précieuses, un cœur d\'oud noble du Cambodge et un sillage persistant d\'ambre chaleureux et de vanille bourbon.',
    shortDescription: 'Concentration extrait de parfum 30%, tenue exceptionnelle 24h+.',
    price: 32000,
    originalPrice: 45000,
    discountPercent: 28,
    categoryId: 'cat-beauty',
    categoryName: 'Beauté & Parfums',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=900&auto=format&fit=crop&q=80'
    ],
    featured: true,
    isNew: false,
    isFlashSale: false,
    inStock: true,
    stockCount: 15,
    rating: 4.9,
    reviewCount: 83,
    badgeText: 'BEST-SELLER',
    tags: ['Parfum', 'Niche', 'Longue tenue'],
    specs: {
      'Volume': '100 ml (Flacon rechargeable)',
      'Famille': 'Oriental Boisé Épicé',
      'Origine': 'Grasse, France'
    }
  },
  {
    id: 'prod-5',
    title: 'Smartwatch Horizon Fit Ultra AMOLED',
    slug: 'smartwatch-horizon-fit-ultra',
    description: 'Votre partenaire santé et connectivité complet. Écran tactile AMOLED lumineux 1.95 pouces, suivi cardiaque & SpO2 24/7, plus de 100 modes sportifs et appels Bluetooth haute définition intégrés.',
    shortDescription: 'Écran AMOLED 1.95", ECG, autonomie 10 jours et appels Bluetooth.',
    price: 42000,
    originalPrice: 60000,
    discountPercent: 30,
    categoryId: 'cat-electronics',
    categoryName: 'High-Tech & Audio',
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900&auto=format&fit=crop&q=80'
    ],
    featured: false,
    isNew: true,
    isFlashSale: true,
    flashSaleEndsAt: '2026-08-30T23:59:59',
    inStock: true,
    stockCount: 30,
    rating: 4.7,
    reviewCount: 54,
    badgeText: 'PROMO FLASH',
    tags: ['Smartwatch', 'Fitness', 'Appels'],
    colors: ['Noir Sidéral', 'Argent Métal', 'Or Rose'],
    specs: {
      'Écran': 'AMOLED 1.95" Always-On Display',
      'Autonomie': 'Jusqu\'à 10 jours en utilisation normale',
      'Résistance': 'Norme étanche IP68'
    }
  },
  {
    id: 'prod-6',
    title: 'Veste Bomber Minimaliste Matelassée Luxe',
    slug: 'veste-bomber-minimaliste-luxe',
    description: 'Une pièce intemporelle taillée dans un tissu technique déperlant avec isolation thermique légère. Coupe ajustée moderne, zips métalliques renforcés YKK et doublure satinée anti-statique.',
    shortDescription: 'Coupe moderne cintrée, tissu déperlant haut de gamme et finition satin.',
    price: 45000,
    originalPrice: 68000,
    discountPercent: 34,
    categoryId: 'cat-fashion',
    categoryName: 'Mode & Sneakers',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=900&auto=format&fit=crop&q=80'
    ],
    featured: false,
    isNew: true,
    isFlashSale: false,
    inStock: true,
    stockCount: 12,
    rating: 4.8,
    reviewCount: 39,
    badgeText: 'TENDANCE',
    tags: ['Mode', 'Veste', 'Hiver/Automne'],
    colors: ['Vert Olive', 'Noir Absolu', 'Beige Sable'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specs: {
      'Composition': '100% Polyester technique haute densité',
      'Entretien': 'Lavage délicat 30°C'
    }
  },
  {
    id: 'prod-7',
    title: 'Lampe d\'Ambiance Lévitation Magnétique MoonLight',
    slug: 'lampe-ambiance-levitation-moonlight',
    description: 'Une œuvre de design et d\'ingénierie qui flotte et tourne magiquement au-dessus de sa base en bois massif de noyer. Éclairage LED apaisant réglable avec 3 nuances de blanc et contrôle tactile intuitif.',
    shortDescription: 'Lune 3D en lévitation magnétique véritable avec 3 modes d\'éclairage.',
    price: 35000,
    originalPrice: 49000,
    discountPercent: 28,
    categoryId: 'cat-home',
    categoryName: 'Maison & Lifestyle',
    images: [
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900&auto=format&fit=crop&q=80'
    ],
    featured: false,
    isNew: true,
    isFlashSale: false,
    inStock: true,
    stockCount: 9,
    rating: 4.9,
    reviewCount: 47,
    badgeText: 'COUP DE CŒUR',
    tags: ['Déco', 'Design', 'Cadeau'],
    specs: {
      'Dimensions': 'Diamètre lune 14 cm, Base 13x13x3 cm',
      'Alimentation': 'Adaptateur secteur 12V 1A fourni'
    }
  },
  {
    id: 'prod-8',
    title: 'Lunettes de Soleil Polarisées Aviateur Titanium',
    slug: 'lunettes-soleil-aviateur-titanium',
    description: 'Monture ultra résistante et ultra légère en alliage de titane flexible. Verres polarisés UV400 offrant une clarté optique exceptionnelle et une protection totale contre les éblouissements.',
    shortDescription: 'Monture titane indestructible et verres polarisés haute définition UV400.',
    price: 26000,
    originalPrice: 39000,
    discountPercent: 33,
    categoryId: 'cat-fashion',
    categoryName: 'Mode & Sneakers',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=900&auto=format&fit=crop&q=80'
    ],
    featured: false,
    isNew: false,
    isFlashSale: true,
    flashSaleEndsAt: '2026-08-30T23:59:59',
    inStock: true,
    stockCount: 22,
    rating: 4.8,
    reviewCount: 71,
    badgeText: 'FLASH -33%',
    tags: ['Accessoires', 'Solaire', 'Polarisé'],
    colors: ['Verre Noir & Monture Or', 'Verre Miroir Argent & Monture Noire'],
    specs: {
      'Protection': 'UV400 Catégorie 3 Polarisé',
      'Étui': 'Étui rigide en cuir + microfibre inclus'
    }
  },
  {
    id: 'prod-9',
    title: 'Enceinte Bluetooth Nomade SoundWave 360° Max Bass',
    slug: 'enceinte-bluetooth-soundwave-360-max-bass',
    description: 'Diffusez un son puissant à 360 degrés avec des basses profondes et percutantes. Boîtier étanche IPX7 résistant à l\'eau et à la poussière, autonomie de 20h et technologie de jumelage stéréo TWS.',
    shortDescription: 'Son stéréo 360° surround, étanchéité IPX7 et autonomie 20h.',
    price: 29500,
    originalPrice: 45000,
    discountPercent: 34,
    categoryId: 'cat-electronics',
    categoryName: 'High-Tech & Audio',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900&auto=format&fit=crop&q=80'
    ],
    featured: true,
    isNew: true,
    isFlashSale: true,
    flashSaleEndsAt: '2026-08-30T23:59:59',
    inStock: true,
    stockCount: 14,
    rating: 4.9,
    reviewCount: 62,
    badgeText: 'VENTE FLASH -34%',
    tags: ['Audio', 'Enceinte', 'Bluetooth', 'Outdoor'],
    colors: ['Noir Anthracite', 'Bleu Océan', 'Rouge Sport'],
    specs: {
      'Puissance': '30W RMS Stéréo',
      'Autonomie': '20 heures d\'écoute',
      'Étanchéité': 'Certifié IPX7 immersion',
      'Connectivité': 'Bluetooth 5.3 + Aux 3.5mm'
    }
  },
  {
    id: 'prod-10',
    title: 'Coffret Montre Minimaliste Acier & Cuir Italien',
    slug: 'coffret-montre-minimaliste-cuir-italien',
    description: 'L\'élégance sobre et moderne pour le quotidien et les grandes occasions. Cadran ultra fin 7mm, verre trempé minéral anti-rayures, et 2 bracelets interchangeables (cuir italien pleine fleur et maille milanaise).',
    shortDescription: 'Cadran ultra fin 7mm, mouvement quartz japonais et 2 bracelets inclus.',
    price: 39000,
    originalPrice: 58000,
    discountPercent: 33,
    categoryId: 'cat-watches',
    categoryName: 'Montres & Bijoux',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=900&auto=format&fit=crop&q=80'
    ],
    featured: false,
    isNew: true,
    isFlashSale: true,
    flashSaleEndsAt: '2026-08-30T23:59:59',
    inStock: true,
    stockCount: 8,
    rating: 4.8,
    reviewCount: 43,
    badgeText: 'OFFRE COFFRET',
    tags: ['Montre', 'Minimaliste', 'Coffret'],
    colors: ['Cadran Noir & Cuir Brun', 'Cadran Blanc & Cuir Noir', 'Or Rose & Milanais'],
    specs: {
      'Épaisseur': '7 mm ultra-slim',
      'Mouvement': 'Quartz Citizen Miyota',
      'Bracelets': '2 bracelets inclus dans le coffret'
    }
  },
  {
    id: 'prod-11',
    title: 'Diffuseur d\'Arômes Ultrasonique Zen Flame & LED',
    slug: 'diffuseur-aromes-ultrasonique-zen-flame',
    description: 'Créez une atmosphère relaxante et parfumée dans votre intérieur. Effet visuel de flamme apaisante par brume illuminée, diffusion silencieuse à ultrasons et arrêt automatique de sécurité sans eau.',
    shortDescription: 'Effet flamme réaliste, diffusion d\'huiles essentielles et silence total.',
    price: 18500,
    originalPrice: 28000,
    discountPercent: 34,
    categoryId: 'cat-home',
    categoryName: 'Maison & Lifestyle',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=900&auto=format&fit=crop&q=80'
    ],
    featured: false,
    isNew: true,
    isFlashSale: true,
    flashSaleEndsAt: '2026-08-30T23:59:59',
    inStock: true,
    stockCount: 19,
    rating: 4.7,
    reviewCount: 51,
    badgeText: 'FLASH -34%',
    tags: ['Maison', 'Bien-être', 'Aromathérapie'],
    colors: ['Noir Mystique', 'Blanc Pur'],
    specs: {
      'Capacité': '200 ml',
      'Bruit': '< 25 dB (ultra silencieux)',
      'Alimentation': 'Câble USB Type-C inclus'
    }
  },
  {
    id: 'prod-12',
    title: 'Hoodie Oversize Streetwear Coton Lourd 450g',
    slug: 'hoodie-oversize-streetwear-coton-lourd',
    description: 'Le sweat à capuche streetwear ultime conçu en molleton de coton peigné 450g/m² ultra épais. Coupe boxy oversize tombé parfait, capuche double épaisseur structurée et finitions côtelées renforcées.',
    shortDescription: 'Coton bio lourd 450 GSM, coupe oversize boxy et capuche structurée.',
    price: 27500,
    originalPrice: 42000,
    discountPercent: 35,
    categoryId: 'cat-fashion',
    categoryName: 'Mode & Sneakers',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=900&auto=format&fit=crop&q=80'
    ],
    featured: true,
    isNew: true,
    isFlashSale: true,
    flashSaleEndsAt: '2026-08-30T23:59:59',
    inStock: true,
    stockCount: 16,
    rating: 4.9,
    reviewCount: 88,
    badgeText: 'BEST-SELLER -35%',
    tags: ['Streetwear', 'Hoodie', 'Mode', 'Oversize'],
    colors: ['Gris Chiné', 'Noir Vintage', 'Vert Forêt'],
    sizes: ['S', 'M', 'L', 'XL'],
    specs: {
      'Grammage': '450 g/m² Premium Heavyweight',
      'Matière': '100% Coton peigné biologique',
      'Origine': 'Confection soignée'
    }
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'CMD-84920',
    customerName: 'Jean-Marc Kouadio',
    customerPhone: '+225 07 45 67 89 01',
    customerEmail: 'jm.kouadio@example.com',
    customerAddress: 'Cocody Deux-Plateaux Vallon, Rue des Jardins',
    customerCity: 'Cocody',
    customerCountry: 'Côte d\'Ivoire',
    customerNotes: 'Sonner à l\'interphone Villa 12, portail blanc',
    items: [
      {
        productId: 'prod-1',
        productTitle: 'Casque Audio Sans Fil Pulse ANC Pro',
        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=80',
        price: 49900,
        quantity: 1,
        selectedColor: 'Noir Mat'
      }
    ],
    subtotal: 49900,
    shippingFee: 0,
    discountAmount: 0,
    totalAmount: 49900,
    currency: 'FCFA',
    paymentMethod: 'wave',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    deliveryStatus: 'in_transit',
    deliveryPersonId: 'courier-1',
    deliveryPersonName: 'Koffi Kouamé',
    deliveryPersonPhone: '+225 07 11 22 33 44',
    deliveryZone: 'Abidjan Nord & Centre',
    deliveryAssignedAt: '2026-08-28T09:30:00Z',
    createdAt: '2026-08-28T09:00:00Z'
  },
  {
    id: 'ord-1002',
    orderNumber: 'CMD-84921',
    customerName: 'Aïcha Kone',
    customerPhone: '+225 07 88 99 00 11',
    customerEmail: 'aicha.kone@example.com',
    customerAddress: 'Cocody Riviera 3, Cité Verdoyante',
    customerCity: 'Cocody',
    customerCountry: 'Côte d\'Ivoire',
    items: [
      {
        productId: 'prod-2',
        productTitle: 'Sneakers Velocity Runner Édition Limitée',
        productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80',
        price: 38500,
        quantity: 1,
        selectedColor: 'Rouge Écarlate',
        selectedSize: '42'
      },
      {
        productId: 'prod-4',
        productTitle: 'Extrait de Parfum "Oud Impérial & Ambre Doré" (100ml)',
        productImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&auto=format&fit=crop&q=80',
        price: 32000,
        quantity: 1
      }
    ],
    subtotal: 70500,
    shippingFee: 0,
    discountAmount: 3500,
    totalAmount: 67000,
    currency: 'FCFA',
    paymentMethod: 'orange_money',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    deliveryStatus: 'delivered',
    deliveryPersonId: 'courier-1',
    deliveryPersonName: 'Koffi Kouamé',
    deliveryPersonPhone: '+225 07 11 22 33 44',
    deliveryZone: 'Abidjan Nord & Centre',
    deliveryAssignedAt: '2026-08-27T16:00:00Z',
    deliveredAt: '2026-08-27T17:30:00Z',
    createdAt: '2026-08-27T15:45:00Z'
  },
  {
    id: 'ord-1003',
    orderNumber: 'CMD-84922',
    customerName: 'Kouassi Yves',
    customerPhone: '+225 05 12 34 56 78',
    customerEmail: 'yves.kouassi@example.com',
    customerAddress: 'Marcory Zone 4C, Rue Pierre et Marie Curie',
    customerCity: 'Marcory',
    customerCountry: 'Côte d\'Ivoire',
    items: [
      {
        productId: 'prod-3',
        productTitle: 'Montre Chronographe Royal Gold Automatique',
        productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80',
        price: 89000,
        quantity: 1,
        selectedColor: 'Or & Cadran Noir'
      }
    ],
    subtotal: 89000,
    shippingFee: 0,
    discountAmount: 0,
    totalAmount: 89000,
    currency: 'FCFA',
    paymentMethod: 'mtn_money',
    paymentStatus: 'paid',
    orderStatus: 'processing',
    deliveryStatus: 'assigned',
    deliveryPersonId: 'courier-2',
    deliveryPersonName: 'Bakary Koné',
    deliveryPersonPhone: '+225 05 55 66 77 88',
    deliveryZone: 'Abidjan Sud & Ouest',
    deliveryAssignedAt: '2026-08-28T11:20:00Z',
    createdAt: '2026-08-28T11:15:00Z'
  },
  {
    id: 'ord-1004',
    orderNumber: 'CMD-84919',
    customerName: 'Seydou Bamba',
    customerPhone: '+225 01 44 55 66 77',
    customerEmail: 'seydou.b@example.com',
    customerAddress: 'Yopougon Selmer, Carrefour Keneya',
    customerCity: 'Yopougon',
    customerCountry: 'Côte d\'Ivoire',
    items: [
      {
        productId: 'prod-5',
        productTitle: 'Smartwatch Horizon Fit Ultra AMOLED',
        productImage: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=900&auto=format&fit=crop&q=80',
        price: 42000,
        quantity: 1,
        selectedColor: 'Noir Sidéral'
      }
    ],
    subtotal: 42000,
    shippingFee: 2000,
    discountAmount: 0,
    totalAmount: 44000,
    currency: 'FCFA',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'shipped',
    deliveryStatus: 'in_transit',
    deliveryPersonId: 'courier-2',
    deliveryPersonName: 'Bakary Koné',
    deliveryPersonPhone: '+225 05 55 66 77 88',
    deliveryZone: 'Abidjan Sud & Ouest',
    deliveryCashCollected: 44000,
    deliveryAssignedAt: '2026-08-26T14:30:00Z',
    createdAt: '2026-08-26T14:20:00Z'
  },
  {
    id: 'ord-1005',
    orderNumber: 'CMD-84918',
    customerName: 'Mariam Coulibaly',
    customerPhone: '+223 66 12 34 56',
    customerEmail: 'mariam.c@example.com',
    customerAddress: 'Badalabougou',
    customerCity: 'Bamako',
    customerCountry: 'Mali',
    items: [
      {
        productId: 'prod-6',
        productTitle: 'Veste Bomber Minimaliste Matelassée Luxe',
        productImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&auto=format&fit=crop&q=80',
        price: 45000,
        quantity: 1
      },
      {
        productId: 'prod-8',
        productTitle: 'Lunettes de Soleil Polarisées Aviateur Titanium',
        productImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900&auto=format&fit=crop&q=80',
        price: 26000,
        quantity: 1
      }
    ],
    subtotal: 71000,
    shippingFee: 0,
    discountAmount: 5000,
    totalAmount: 66000,
    currency: 'FCFA',
    paymentMethod: 'whatsapp',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    createdAt: '2026-08-25T18:10:00Z'
  },
  {
    id: 'ord-1006',
    orderNumber: 'CMD-84917',
    customerName: 'Ibrahim Traoré',
    customerPhone: '+226 76 54 32 10',
    customerAddress: 'Ouaga 2000',
    customerCity: 'Ouagadougou',
    customerCountry: 'Burkina Faso',
    items: [
      {
        productId: 'prod-1',
        productTitle: 'Casque Audio Sans Fil Pulse ANC Pro',
        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=80',
        price: 49900,
        quantity: 1
      }
    ],
    subtotal: 49900,
    shippingFee: 0,
    discountAmount: 0,
    totalAmount: 49900,
    currency: 'FCFA',
    paymentMethod: 'orange_money',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    createdAt: '2026-08-24T10:05:00Z'
  },
  {
    id: 'ord-1007',
    orderNumber: 'CMD-84916',
    customerName: 'Cheikh Sarr',
    customerPhone: '+221 77 111 22 33',
    customerAddress: 'Sacré Cœur 3',
    customerCity: 'Dakar',
    customerCountry: 'Sénégal',
    items: [
      {
        productId: 'prod-7',
        productTitle: 'Sac à Dos Business Voyage Cuir Premium',
        productImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=80',
        price: 39000,
        quantity: 1
      }
    ],
    subtotal: 39000,
    shippingFee: 0,
    discountAmount: 0,
    totalAmount: 39000,
    currency: 'FCFA',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'delivered',
    createdAt: '2026-08-23T15:30:00Z'
  },
  {
    id: 'ord-1008',
    orderNumber: 'CMD-84915',
    customerName: 'Seydou Ba',
    customerPhone: '+221 78 999 88 77',
    customerAddress: 'Fann Résidence',
    customerCity: 'Dakar',
    customerCountry: 'Sénégal',
    items: [
      {
        productId: 'prod-3',
        productTitle: 'Montre Chronographe Royal Gold Automatique',
        productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80',
        price: 89000,
        quantity: 1
      }
    ],
    subtotal: 89000,
    shippingFee: 0,
    discountAmount: 0,
    totalAmount: 89000,
    currency: 'FCFA',
    paymentMethod: 'wave',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    createdAt: '2026-08-22T12:00:00Z'
  }
];

export const initialHeroSlides: HeroSlideItem[] = [
  {
    id: 'hero-slide-1',
    enabled: true,
    title: 'L\'Excellence & Le Style',
    highlight: 'À Portée De Clic.',
    subtitle: 'Découvrez notre collection exclusive de pièces haut de gamme. Commandez en un éclair par WhatsApp ou payez en toute sécurité en ligne.',
    badge: 'NOUVELLE COLLECTION 2026',
    tag: '-35% SUR LA SÉLECTION',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80',
    buttonText: 'Explorer le Catalogue',
    buttonAction: 'shop',
    secondaryButtonText: 'Commander sur WhatsApp',
    secondaryButtonAction: 'whatsapp',
    promoDiscount: '-35% SUR LA SÉLECTION',
    theme: 'midnight'
  },
  {
    id: 'hero-slide-2',
    enabled: true,
    title: 'Matériel High-Tech & Accessoires',
    highlight: 'Qualité Certifiée & Garantie.',
    subtitle: 'Commandez vos articles à l\'unité ou par lot avec remise immédiate. Support client dédié 7j/7.',
    badge: 'OFFRES SPÉCIALES 2026',
    tag: '⚡ EXPÉDITION 24H GARANTIE',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
    buttonText: 'Explorer le Catalogue',
    buttonAction: 'shop',
    secondaryButtonText: 'Commander sur WhatsApp',
    secondaryButtonAction: 'whatsapp',
    promoDiscount: '⚡ EXPÉDITION 24H',
    theme: 'dark'
  },
  {
    id: 'hero-slide-3',
    enabled: true,
    title: 'Style Urbain & Horlogerie Luxe',
    highlight: 'Les Nouveautés les Plus Demandées.',
    subtitle: 'Découvrez les modèles plébiscités par nos clients partout en Afrique et en Europe.',
    badge: 'TOP TENDANCES',
    tag: '⭐ NOTÉ 4.9/5 PAR NOS CLIENTS',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
    buttonText: 'Explorer le Catalogue',
    buttonAction: 'shop',
    secondaryButtonText: 'Commander sur WhatsApp',
    secondaryButtonAction: 'whatsapp',
    promoDiscount: '⭐ NOTÉ 4.9/5',
    theme: 'gold'
  }
];

export const initialInGridBanners: InGridBannerItem[] = [
  {
    id: 'grid-banner-1',
    enabled: true,
    title: '🔥 Vente Flash & Offres Exclusives Abidjan',
    subtitle: 'Profitez de réductions exceptionnelles allant jusqu\'à -40% et de la livraison express 24h partout à Abidjan et en Côte d\'Ivoire !',
    badge: '⚡ OFFRE DU JOUR',
    buttonText: 'Profiter des Ventes Flash',
    buttonAction: 'flash',
    buttonLink: '',
    theme: 'gold',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'grid-banner-2',
    enabled: false,
    title: '🎁 Rejoignez le Club Privilège & Gagnez des Points',
    subtitle: 'Inscrivez-vous en 1 clic pour obtenir +10 Points VIP offerts et des remises exclusives !',
    badge: '✨ PROGRAMME VIP',
    buttonText: 'Créer mon Compte VIP',
    buttonAction: 'vip',
    buttonLink: '',
    theme: 'midnight',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80'
  }
];

export const initialStoreSettings: StoreSettings = {
  storeName: 'ELITE BOUTIQUE',
  storeSlogan: 'La Référence du Shopping Haut de Gamme & Tendance en Côte d\'Ivoire',
  storeLogoUrl: '',
  storeLogoHeight: 40,
  showLogoText: true,
  pwaIconUrl: '',
  siteHeaderColor: '#ffffff',
  siteFooterColor: '#020617',
  siteBodyColor: '#f1f5f9',
  homeTheme: 'midnight',
  currency: 'FCFA',
  currencySymbol: 'FCFA',
  
  // WhatsApp Settings (Côte d'Ivoire +225)
  whatsappNumber: '+225078901234',
  whatsappAutoMessage: 'Bonjour ! Je souhaite commander sur votre boutique :\n\n📦 *Commande :* {order_number}\n🛒 *Articles :*\n{items_list}\n💰 *Montant Total :* {total_amount} {currency}\n👤 *Client :* {customer_name}\n📞 *Téléphone :* {customer_phone}\n📍 *Commune / Adresse :* {customer_address}, {customer_city}\n\nMerci de me confirmer la disponibilité et le délai de livraison à Abidjan / Côte d\'Ivoire !',
  whatsappFloatingEnabled: true,
  whatsappDirectOrderEnabled: true,
  
  // Payment Settings & Links (Côte d'Ivoire: Wave, MTN MoMo, Orange Money, Moov Money)
  enableWavePayment: true,
  wavePaymentUrl: 'https://pay.wave.com/m/M_example_merchant_id',
  waveMerchantPhone: '+225 07 89 01 23 45',
  
  enableOrangeMoney: true,
  orangeMoneyMerchantNumber: '#144*391# ou +225 07 12 34 56 78',

  enableMtnMoney: true,
  mtnMerchantNumber: '+225 05 89 01 23 45 (MTN MoMo)',

  enableMoovMoney: true,
  moovMerchantNumber: '+225 01 23 45 67 89 (Moov Money)',
  
  enableCustomPaymentLink: true,
  customPaymentLinkUrl: 'https://buy.stripe.com/demo_payment_link',
  customPaymentLinkLabel: 'Paiement Sécurisé par Carte Bancaire (Visa / Mastercard)',
  
  enableBankTransfer: true,
  bankDetails: 'Banque: BOA Côte d\'Ivoire | IBAN / RIB: CI08 CI01 2010 0345 6789 0123 45 | Titulaire: ELITE BOUTIQUE SARL',
  
  enableCashOnDelivery: true,
  codInstructions: 'Payez en espèces ou par Mobile Money (Wave, MTN MoMo, Orange Money) directement au coursier lors de la livraison à Abidjan.',
  
  // Contact & Social (Abidjan)
  contactEmail: 'contact@eliteboutique.ci',
  contactPhone: '+225 05 89 01 23 45',
  contactAddress: 'Cocody Deux-Plateaux Vallon, Abidjan, Côte d\'Ivoire',
  facebookUrl: 'https://facebook.com/eliteboutique',
  instagramUrl: 'https://instagram.com/eliteboutique',
  tiktokUrl: 'https://tiktok.com/@eliteboutique',
  
  // Shipping & Policies (Abidjan & Intérieur)
  standardShippingFee: 1500,
  freeShippingThreshold: 50000,
  estimatedDeliveryDays: '24h chrono à Abidjan • 48h Intérieur',
  
  // Top Banner
  topBannerEnabled: true,
  topBannerText: '✨ LIVRAISON EXPRESS OFFERTE DÈS 50 000 FCFA | PAIEMENT WAVE, MTN MOMO & ORANGE MONEY !',
  topBannerLink: '#catalogue',

  // TikTok Shoppable Video Feed
  tiktokFeedEnabled: true,

  // In-Grid Interstitial Promotional Banners
  inGridBannerEnabled: true,
  inGridBannerFrequency: 8,
  inGridBannerTitle: '🔥 Vente Flash & Offres Exclusives Abidjan',
  inGridBannerSubtitle: 'Profitez de réductions exceptionnelles allant jusqu\'à -40% et de la livraison express 24h partout à Abidjan et en Côte d\'Ivoire !',
  inGridBannerBadge: '⚡ OFFRE DU JOUR',
  inGridBannerButtonText: 'Profiter des Ventes Flash',
  inGridBannerButtonAction: 'flash',
  inGridBannerButtonLink: '',
  inGridBannerTheme: 'gold',
  inGridBannerImageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
  inGridBannerSecondaryEnabled: false,
  inGridBannerSecondaryTitle: '🎁 Rejoignez le Club Privilège & Gagnez des Points',
  inGridBannerSecondarySubtitle: 'Inscrivez-vous en 1 clic pour obtenir +10 Points VIP offerts et des remises exclusives !',
  inGridBannerSecondaryBadge: '✨ PROGRAMME VIP',
  inGridBannerSecondaryButtonText: 'Créer mon Compte VIP',
  inGridBannerSecondaryButtonAction: 'vip',
  inGridBannerSecondaryTheme: 'midnight',
  inGridBannerSecondaryImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
  inGridBannersList: initialInGridBanners,
  
  // Hero section settings
  heroTheme: 'midnight',
  heroTitle: 'L\'Excellence & Le Style',
  heroHighlight: 'À Portée De Clic.',
  heroSubtitle: 'Découvrez notre collection exclusive de pièces haut de gamme. Commandez en un éclair par WhatsApp ou payez en toute sécurité en ligne.',
  heroBadge: 'NOUVELLE COLLECTION 2026',
  heroImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80',
  heroButtonText: 'Explorer le Catalogue',
  heroSecondaryButtonText: 'Commander sur WhatsApp',
  heroPromoDiscount: '-35% SUR LA SÉLECTION',
  heroSlidesList: initialHeroSlides,

  // Hero Slide 2
  heroSlide2Title: 'Matériel High-Tech & Accessoires',
  heroSlide2Highlight: 'Qualité Certifiée & Garantie.',
  heroSlide2Subtitle: 'Commandez vos articles à l\'unité ou par lot avec remise immédiate. Support client dédié 7j/7.',
  heroSlide2Badge: 'OFFRES SPÉCIALES 2026',
  heroSlide2Image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
  heroSlide2Tag: '⚡ EXPÉDITION 24H GARANTIE',

  // Hero Slide 3
  heroSlide3Title: 'Style Urbain & Horlogerie Luxe',
  heroSlide3Highlight: 'Les Nouveautés les Plus Demandées.',
  heroSlide3Subtitle: 'Découvrez les modèles plébiscités par nos clients partout au Sénégal et en Afrique.',
  heroSlide3Badge: 'TOP TENDANCES',
  heroSlide3Image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
  heroSlide3Tag: '⭐ NOTÉ 4.9/5 PAR NOS CLIENTS',

  // CMS Content (Côte d'Ivoire)
  aboutUsText: 'ELITE BOUTIQUE ABIDJAN est votre destination de référence pour l\'achat d\'articles de mode, d\'électronique de pointe, d\'horlogerie et de beauté sélectionnés avec soin auprès des meilleurs créateurs internationaux. Notre engagement : authenticité certifiée, service client réactif 7j/7 et livraison express autonome à votre porte à Abidjan et dans toute la Côte d\'Ivoire.',
  deliveryPolicyText: 'Nos livraisons sont opérées par notre flotte de coursiers autonomes et nos partenaires de transport agréés. À Abidjan, toute commande passée avant 14h est livrée le jour même ou sous 24h chrono. Pour les villes de l\'intérieur (Yamoussoukro, Bouaké, San-Pédro, Korhogo, etc.), l\'expédition est assurée sous 48h à 72h avec suivi par message WhatsApp dès la prise en charge.',
  returnPolicyText: 'Vous disposez d\'un délai de 14 jours francs après réception de votre commande pour demander un échange ou un remboursement complet si le produit ne correspond pas à vos attentes. Le produit doit être dans son emballage d\'origine non utilisé.',
  termsText: `1. OBJET & ACCEPTATION DES CONDITIONS
Les présentes Conditions Générales d'Utilisation et de Vente (CGU/CGV) régissent l'accès, la navigation et toutes les commandes effectuées sur notre boutique en ligne, via le site web, par lien de paiement ou via notre canal officiel WhatsApp en Côte d'Ivoire.
Toute validation de commande implique l'acceptation pleine, entière et sans réserve des présentes conditions par le client.

2. COMMANDES & DISPONIBILITÉ DES ARTICLES
Nos offres de produits sont valables tant qu'elles sont visibles sur le catalogue en ligne, dans la limite des stocks disponibles.
Une fois la commande enregistrée, un récapitulatif détaillé est transmis au client par WhatsApp ou e-mail. En cas d'indisponibilité fortuite d'un article après passation de commande, le client est immédiatement contacté et peut choisir entre le remplacement immédiat ou le remboursement sans frais.

3. PRIX & PAIEMENT SÉCURISÉ EN CÔTE D'IVOIRE (FCFA)
Tous les prix de nos produits sont exprimés en Francs CFA (FCFA) toutes taxes comprises (TTC). Les frais de livraison par commune d'Abidjan ou vers l'intérieur sont calculés de manière claire avant la confirmation définitive.
Les modes de paiement acceptés en Côte d'Ivoire sont :
- Mobile Money : Wave CI, MTN Mobile Money (MoMo), Orange Money CI, Moov Money via transfert direct sécurisé.
- Espèces à la livraison (Cash on Delivery) : règlement direct au coursier lors de la remise du colis à Abidjan.
- Carte bancaire : paiement crypté SSL/TLS via passerelle bancaire certifiée.

4. EXPÉDITION & SYSTÈME DE LIVRAISON AUTONOME
Les livraisons sont assurées par notre réseau de coursiers autonomes à Abidjan et par transporteurs partenaires pour l'intérieur :
- Grand Abidjan (Cocody, Plateau, Marcory, Yopougon, Koumassi, Treichville, Port-Bouët, Adjamé, Attécoubé, Abobo) : livraison express 24h à domicile ou au bureau.
- Périphérie & Banlieues (Bingerville, Songon, Grand-Bassam) : livraison sous 24h à 48h.
- Villes de l'Intérieur (Yamoussoukro, Bouaké, San-Pédro, Korhogo, etc.) : expédition sécurisée sous 48h à 72h.
Le coursier contacte systématiquement le client par appel téléphonique direct ou WhatsApp avant son passage.

5. DROIT DE RÉTRACTATION, ÉCHANGES & RETOURS
Le client bénéficie d'un délai de 14 jours francs à compter de la réception de son colis pour signaler toute non-conformité, vice caché ou souhait d'échange.
L'article doit obligatoirement être retourné dans son état d'origine, neuf, non porté/non utilisé et dans son emballage d'origine. Notre service client coordonne la reprise du produit.

6. SERVICE CLIENT & RÈGLEMENT AMIABLE DES LITIGES
Notre équipe de support client est disponible 7 jours sur 7 par WhatsApp, téléphone et e-mail. En cas de réclamation, nous nous engageons à apporter une solution amiable, rapide et satisfaisante dans les 24h.`,
  privacyText: `1. ENGAGEMENT DE CONFIDENTIALITÉ & CADRE LÉGAL IVOIRIEN
La protection de votre vie privée et de vos données personnelles est une priorité absolue pour notre boutique. La présente politique détaille notre engagement envers la transparence et la sécurité de vos données, en stricte conformité avec la loi n° 2013-450 relative à la protection des données à caractère personnel en République de Côte d'Ivoire et les directives de l'Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire (ARTCI).

2. DONNÉES PERSONNELLES COLLECTÉES
Dans le cadre de votre expérience d'achat et du traitement de vos commandes, nous collectons exclusivement les données nécessaires :
- Identité : Nom complet, prénom, adresse e-mail.
- Coordonnées de livraison : Numéro de téléphone (utilisé pour les notifications de livraison et les échanges WhatsApp avec le coursier), commune et adresse exacte de livraison à Abidjan ou en Côte d'Ivoire.
- Historique commercial : Détail des commandes passées, montants et statut de paiement.
Nous ne collectons ni ne stockons AUCUNE coordonnée bancaire sensible ou code secret Mobile Money (Wave, MTN MoMo, Orange Money, Moov).

3. FINALITÉS DU TRAITEMENT DES DONNÉES
Vos données sont strictement utilisées pour :
- La préparation, l'acheminement et la livraison autonome à domicile de vos colis par nos coursiers agréés.
- L'envoi des confirmations de commande, factures électroniques et suivis d'acheminement par WhatsApp et e-mail.
- La prise en charge de vos demandes d'assistance, questions produits et garanties SAV.
- La prévention de la fraude et la sécurisation des transactions.

4. NON-CESSION & PARTAGE SÉCURISÉ
Vos informations personnelles ne sont JAMAIS vendues, louées ni cédées à des entreprises tierces à des fins commerciales ou publicitaires.
Elles sont uniquement transmises à nos coursiers et partenaires logistiques dans la stricte mesure requise pour assurer la livraison physique de vos articles.

5. SÉCURITÉ & DURÉE DE CONSERVATION
Toutes les connexions et échanges de données sur notre plateforme bénéficient d'un chiffrement SSL/TLS haute sécurité. Les sessions partenaires et administratives sont protégées par des jetons cryptographiques HMAC-SHA256. Vos données sont conservées pendant la durée nécessaire aux obligations légales, comptables et fiscales.

6. VOS DROITS D'ACCÈS ET DE RECTIFICATION (ARTCI / LOI N° 2013-450)
Conformément à la loi n° 2013-450 relative à la protection des données à caractère personnel en Côte d'Ivoire, vous disposez d'un droit permanent d'accès, d'opposition, de rectification et de suppression de vos données personnelles.
Pour exercer ce droit, il vous suffit de contacter notre service client par WhatsApp ou par e-mail à l'adresse officielle de la boutique.`,
  faqList: [
    {
      id: 'faq-1',
      question: 'Comment passer commande par WhatsApp à Abidjan ?',
      answer: 'C\'est très simple ! Cliquez sur le bouton "Commander sur WhatsApp" sur la page d\'un produit ou dans votre panier. Un message récapitulatif pré-rempli sera généré automatiquement avec les articles choisis, et notre équipe confirmera votre commande en direct.'
    },
    {
      id: 'faq-2',
      question: 'Quels sont les moyens de paiement acceptés en Côte d\'Ivoire ?',
      answer: 'Nous acceptons Wave CI, MTN Mobile Money (MoMo), Orange Money CI, Moov Money, les Cartes Bancaires (Visa, Mastercard via lien sécurisé), le virement bancaire et le paiement en espèces à la livraison (Cash on Delivery) à Abidjan.'
    },
    {
      id: 'faq-3',
      question: 'Quels sont les délais et frais de livraison à Abidjan & Intérieur ?',
      answer: 'À Abidjan, la livraison s\'effectue en 24h chrono (1 500 à 2 000 FCFA selon la commune) et devient totalement GRATUITE dès 50 000 FCFA d\'achat. Pour les villes de l\'intérieur, l\'expédition sécurisée sous 48h à 72h est à 4 000 FCFA.'
    },
    {
      id: 'faq-4',
      question: 'Les produits sont-ils sous garantie ?',
      answer: 'Oui, tous nos articles électroniques et montres bénéficient d\'une garantie constructeur de 1 à 2 ans selon les modèles. Nous assurons le SAV et le support direct.'
    },
    {
      id: 'faq-5',
      question: 'Comment contacter le service client ?',
      answer: 'Notre service client est disponible 7j/7 de 8h à 21h via WhatsApp au numéro indiqué en bas de page ou par email.'
    }
  ],

  // Partner / Affiliate Program Settings
  partnerProgramEnabled: true,
  defaultPartnerCommissionRate: 10.0,
  minPayoutAmount: 5000,

  // Autonomous Delivery & Fleet Management (Côte d'Ivoire)
  autoDispatchEnabled: true,
  deliveryZonesList: [
    { id: 'zone-abidjan-nord', name: 'Abidjan Nord & Centre', fee: 1500, delay: '24h chrono', communes: ['Cocody', 'Le Plateau', 'Adjamé', 'Attécoubé', 'Abobo'] },
    { id: 'zone-abidjan-sud', name: 'Abidjan Sud & Ouest', fee: 2000, delay: '24h chrono', communes: ['Marcory', 'Koumassi', 'Treichville', 'Port-Bouët', 'Yopougon'] },
    { id: 'zone-grand-abidjan', name: 'Périphérie Grand Abidjan', fee: 2500, delay: '24h à 48h', communes: ['Bingerville', 'Songon', 'Grand-Bassam'] },
    { id: 'zone-interieur', name: 'Villes de l\'Intérieur (Expédition car)', fee: 4000, delay: '48h à 72h', communes: ['Yamoussoukro', 'Bouaké', 'San-Pédro', 'Korhogo', 'Daloa', 'Man', 'Gagnoa', 'Autre ville de Côte d\'Ivoire'] }
  ],

  // SMTP Email Server Configuration
  smtpEnabled: false,
  smtpHost: '',
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: '',
  smtpPass: '',
  smtpFromName: 'ELITE BOUTIQUE',
  smtpFromEmail: 'contact@eliteboutique.ci',
  smtpOrderNotificationAdmin: true,
  smtpOrderConfirmationCustomer: true,
  smtpOrderStatusUpdateCustomer: true,
  smtpAdminRecipientEmail: 'contact@eliteboutique.ci',

  // Telegram order notifications
  telegramEnabled: false,
  telegramBotToken: '',
  telegramChatId: '',
  telegramNotifyNewOrder: true,

  // SEO & Webmaster Configuration
  seoTitle: 'ELITE BOUTIQUE | Mode, High-Tech & Shopping Premium en Côte d\'Ivoire',
  seoDescription: 'Boutique en ligne haut de gamme en Côte d\'Ivoire. Mode, montres, sneakers et high-tech avec livraison express 24h et paiement sécurisé Wave, Orange Money et à la livraison.',
  seoKeywords: 'boutique en ligne, abidjan, côte d\'ivoire, mode, sneakers, high-tech, livraison express, wave, orange money, shopping afrique',
  seoOgImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
  seoCanonicalUrl: 'https://eliteboutique.ci',
  seoGoogleVerification: '',
  seoGoogleAnalyticsId: '',
  seoFacebookPixelId: ''
};
