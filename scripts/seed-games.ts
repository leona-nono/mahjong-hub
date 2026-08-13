/**
 * Seed script: populate the CMS database from the static game catalogue.
 *
 * - Creates a `Game` row for every slug in `data/games.ts` that is missing.
 * - Backfills English FAQs (`GameFaq`, locale 'en') from `content.faq` when
 *   the game has none yet.
 * - NEVER overwrites existing rows: once seeded, the admin CMS becomes the
 *   source of truth for title / description / featured / active / sortOrder
 *   and the frontend reads it via the overlay in `lib/games-db.ts`.
 *
 * Run with: npm run seed
 * (Node >= 22.18 runs TypeScript natively; env is loaded from .env.local/.env
 * via the --env-file-if-exists flags in the npm script.)
 */
import { PrismaClient } from '@prisma/client';
import { games } from '../data/games';

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  let skipped = 0;
  let faqsSeeded = 0;

  for (const [index, g] of games.entries()) {
    const existing = await prisma.game.findUnique({ where: { slug: g.slug } });

    if (!existing) {
      await prisma.game.create({
        data: {
          slug: g.slug,
          title: g.title,
          description: g.description,
          iframeUrl: g.gameIframeUrl ?? null,
          category: g.category,
          tags: [],
          isFeatured: !!g.featured,
          // coming-soon games are shown on the frontend, so they stay active.
          isActive: true,
          sortOrder: index
        }
      });
      created++;
    } else {
      skipped++;
    }

    // Backfill English FAQs only when the game has none — never wipe edits.
    if (g.content?.faq?.length) {
      const game = existing ?? (await prisma.game.findUnique({ where: { slug: g.slug } }));
      if (game) {
        const faqCount = await prisma.gameFaq.count({
          where: { gameId: game.id, locale: 'en' }
        });
        if (faqCount === 0) {
          await prisma.gameFaq.createMany({
            data: g.content.faq.map((f, i) => ({
              gameId: game.id,
              locale: 'en',
              question: f.question,
              answer: f.answer,
              sortOrder: i
            }))
          });
          faqsSeeded += g.content.faq.length;
        }
      }
    }
  }

  console.log(
    `seed-games: ${created} created, ${skipped} already existed, ${faqsSeeded} FAQs seeded`
  );
}

main()
  .catch((err) => {
    console.error('seed-games failed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
