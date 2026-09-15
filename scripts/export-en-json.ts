/**
 * One-shot: export English base content from TS sources into en.json
 * so the Dev Content Studio can edit EN for blog / games.
 *
 * Run from repo root:  npx tsx scripts/export-en-json.ts
 * This script only WRITES data/blog-i18n/en.json and data/games-i18n/en.json.
 * Pure format conversion — no content changes.
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { getBlogPosts } from '../data/blog';
import { games } from '../data/games';

function writeJson(relPath: string, data: unknown) {
  const file = path.join(process.cwd(), relPath);
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${file}`);
}

const blogOut: Record<string, unknown> = {};
for (const p of getBlogPosts()) {
  blogOut[p.slug] = {
    title: p.title,
    description: p.description,
    sections: p.sections,
    faq: p.faq
  };
}
writeJson(path.join('data', 'blog-i18n', 'en.json'), blogOut);

const gamesOut: Record<string, unknown> = {};
for (const g of games) {
  gamesOut[g.slug] = {
    title: g.title,
    description: g.description,
    ...(g.content ? { content: g.content } : {})
  };
}
writeJson(path.join('data', 'games-i18n', 'en.json'), gamesOut);

console.log(
  `blog: ${Object.keys(blogOut).length} posts, games: ${Object.keys(gamesOut).length} entries`
);
