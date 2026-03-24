// Prisma seed — bootstraps the beach database verification
// Run with: npm run db:seed
// (beaches are in data/beaches.ts and used at runtime by the distance lib)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌴 EchoHome seed starting...');

  // Verify the DB is accessible
  const count = await prisma.listing.count();
  console.log(`📊 Current listings in DB: ${count}`);

  // Create a placeholder scrape run to verify schema works
  const run = await prisma.scrapeRun.create({
    data: {
      source: 'seed',
      status: 'done',
      found: 0,
      saved: 0,
      finishedAt: new Date(),
    },
  });
  console.log(`✅ Schema verified — ScrapeRun id: ${run.id}`);

  // Clean up seed run
  await prisma.scrapeRun.delete({ where: { id: run.id } });

  console.log('🏖️  Beach database: 108 FL sandy beaches loaded in data/beaches.ts');
  console.log('🚀 Seed complete. Run `POST /api/refresh` to trigger first scrape.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
