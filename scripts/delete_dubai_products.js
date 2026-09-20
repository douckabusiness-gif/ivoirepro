const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const isExecute = process.argv.includes('--execute');

  console.log('=== SCANNING DUBAI PRODUCTS (isDubaiPreorder = true) ===');
  const dubaiProducts = await prisma.product.findMany({
    where: { isDubaiPreorder: true },
    select: { id: true, title: true, slug: true, price: true, categoryId: true, categoryName: true }
  });

  console.log(`Found ${dubaiProducts.length} Dubai product(s):`);
  dubaiProducts.forEach((p, idx) => {
    console.log(`  ${idx + 1}. [${p.id}] ${p.title} (${p.price} FCFA) - Cat: ${p.categoryName || p.categoryId}`);
  });

  if (dubaiProducts.length === 0) {
    console.log('\nNo Dubai products found in database.');
    return;
  }

  if (!isExecute) {
    console.log('\nDRY RUN: Pass --execute to delete these products permanently.');
    return;
  }

  console.log('\n=== DELETING DUBAI PRODUCTS ===');
  const deleteResult = await prisma.product.deleteMany({
    where: { isDubaiPreorder: true }
  });
  console.log(`Deleted ${deleteResult.count} product(s).`);

  // Recalculate category item counts
  console.log('=== RECALCULATING CATEGORY COUNTS ===');
  const categories = await prisma.category.findMany({ select: { id: true, name: true } });
  for (const cat of categories) {
    const realCount = await prisma.product.count({
      where: { categoryId: cat.id }
    });
    await prisma.category.update({
      where: { id: cat.id },
      data: { itemCount: realCount }
    });
  }
  console.log(`Updated itemCount for ${categories.length} categories.`);

  console.log('\nSUCCESS: All Dubai products deleted successfully.');
}

main()
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
