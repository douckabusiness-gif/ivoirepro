const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.product.findFirst({
    where: { title: { contains: 'Souffleur', mode: 'insensitive' } }
  });

  if (!p) return;

  const cleanTitle = 'Souffleur de Feuilles à Succion Haute Puissance 1800W';
  const cleanDesc = `Découvrez notre **Souffleur de Feuilles à Succion Haute Puissance 1800W**, l'outil indispensable pour entretenir impeccablement vos extérieurs à Abidjan.

✨ **Points Forts :**
• **Puissance Élevée** : Moteur 1800W délivrant un flux d'air puissant pour décoller feuilles et débris humides.
• **Fonction 2-en-1 Soufflage & Succion** : Souffle et aspire les débris rapidement en un seul passage.
• **Design Ergonomique** : Poignée antidérapante confortable et conception équilibrée pour réduire la fatigue.
• **Utilisation Polyvalente** : Idéal pour cours, allées, jardins, terrasses et parkings.

🚚 **Livraison Express :** Partout à Abidjan sous 24h et en intérieur sous 48h.
💳 **Paiement Sécurisé :** Wave, Orange Money, MTN Mobile Money ou à la livraison.`;

  await prisma.product.update({
    where: { id: p.id },
    data: {
      title: cleanTitle,
      description: cleanDesc,
      shortDescription: 'Moteur 1800W haute puissance avec fonction soufflage et aspiration. Idéal pour jardins et cours à Abidjan.',
    }
  });

  console.log('Fixed cleanly to:', cleanTitle);
}

main().catch(console.error).finally(() => prisma.$disconnect());
