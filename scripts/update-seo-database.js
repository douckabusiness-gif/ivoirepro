const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSeo() {
  const seoData = {
    seoTitle: "Ivoire Djassa | Boutique en Ligne N°1 à Abidjan & Côte d'Ivoire",
    seoDescription: "Boutique en ligne N°1 en Côte d'Ivoire. Mode, chaussures, sneakers & high-tech à Abidjan. Livraison express 24h, paiement Wave, Orange Money & à la livraison.",
    seoKeywords: [
      "ivoire djassa",
      "ivoireci",
      "boutique en ligne abidjan",
      "site e-commerce cote d'ivoire",
      "achat en ligne abidjan",
      "vente en ligne cote d'ivoire",
      "shopping en ligne abidjan",
      "djassa abidjan",
      "djassa en ligne",
      "marche abidjan",
      "chaussures homme abidjan",
      "chaussures femme abidjan",
      "sneakers abidjan",
      "baskets tendance cote d'ivoire",
      "mocassins homme abidjan",
      "vetements tendance abidjan",
      "mode abidjan",
      "montres luxe abidjan",
      "montres connectees ci",
      "smartphones abidjan",
      "electronique cote d'ivoire",
      "accessoires mode abidjan",
      "sacs a main abidjan",
      "parfums originaux abidjan",
      "livraison express abidjan 24h",
      "livraison domicile abidjan",
      "livraison cocody",
      "livraison yopougon",
      "livraison marcory",
      "livraison plateau",
      "livraison koumassi",
      "livraison treichville",
      "livraison abobo",
      "livraison bingerville",
      "livraison grand-bassam",
      "livraison yamoussoukro",
      "livraison bouake",
      "livraison san-pedro",
      "livraison korhogo",
      "paiement a la livraison abidjan",
      "paiement wave cote d'ivoire",
      "orange money abidjan",
      "mtn momo cote d'ivoire",
      "moov money ci",
      "cash on delivery abidjan",
      "commande whatsapp abidjan",
      "prix en fcfa",
      "boutique fiable abidjan",
      "meilleur site e-commerce abidjan",
      "promotions abidjan",
      "soldes cote d'ivoire"
    ].join(', '),
    seoCanonicalUrl: "https://www.ivoireci.com",
    seoOgImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80"
  };

  try {
    const updated = await prisma.storeSettings.update({
      where: { id: 'default_settings' },
      data: seoData
    });

    console.log('✅ Configuration SEO mise à jour avec succès en base de données :');
    console.log(JSON.stringify({
      seoTitle: updated.seoTitle,
      seoDescription: updated.seoDescription,
      seoKeywordsCount: updated.seoKeywords.split(',').length,
      seoCanonicalUrl: updated.seoCanonicalUrl,
      seoOgImage: updated.seoOgImage
    }, null, 2));
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour SEO :', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateSeo();
