const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const gaId = process.argv[2] || 'G-N9GP5ED4J1';
  const updated = await prisma.storeSettings.update({
    where: { id: 'default_settings' },
    data: { seoGoogleAnalyticsId: gaId }
  });
  console.log('SUCCESS: seoGoogleAnalyticsId is now set to:', updated.seoGoogleAnalyticsId);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
