const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetState = process.argv[2] === 'true';
  const updated = await prisma.storeSettings.update({
    where: { id: 'default_settings' },
    data: { dubaiPageEnabled: targetState }
  });
  console.log('SUCCESS: dubaiPageEnabled is now set to:', updated.dubaiPageEnabled);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
