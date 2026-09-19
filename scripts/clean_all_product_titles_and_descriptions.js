const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function sanitizeTitle(title) {
  if (!title) return '';
  return title
    .replace(/[\s–\-—:]+\d[\d\s\.,]*(?:fcfa|cfa|f\b|frs)?\s*$/i, '')
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .trim();
}

function sanitizeDescription(desc) {
  if (!desc) return '';
  return desc
    .replace(/<li[^>]*>(.*?)<\/li>/gis, (_, content) => `\n• ${content.trim()}`)
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function main() {
  console.log('--- SCANNING AND CLEANING PRODUCTS ---');
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products to check.`);

  let updatedCount = 0;

  for (const p of products) {
    const cleanT = sanitizeTitle(p.title);
    const cleanD = sanitizeDescription(p.description);

    const titleChanged = cleanT !== p.title;
    const descChanged = cleanD !== (p.description || '');

    if (titleChanged || descChanged) {
      console.log(`\n[Cleaning Product] ID: ${p.id}`);
      if (titleChanged) {
        console.log(`  Title Before: "${p.title}"`);
        console.log(`  Title After:  "${cleanT}"`);
      }
      if (descChanged) {
        console.log(`  Desc Before (preview): "${(p.description || '').slice(0, 80)}..."`);
        console.log(`  Desc After (preview):  "${cleanD.slice(0, 80)}..."`);
      }

      await prisma.product.update({
        where: { id: p.id },
        data: {
          title: cleanT,
          description: cleanD,
        }
      });
      updatedCount++;
    }
  }

  console.log(`\nFINISHED: Cleaned ${updatedCount} products.`);
}

main()
  .catch((err) => {
    console.error('Error during cleanup:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
