import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, '_gen-games-i18n-romance.mjs'), 'utf8');
const start = src.indexOf('locales.es = {');
const end = src.indexOf('\nimport { readFileSync }', start);
if (start < 0 || end < 0) throw new Error('could not locate locales.es');
const block = src.slice(start, end).replace(/^locales\.es = /, 'const es = ');
const outPath = join(__dirname, '_es-tmp.mjs');
writeFileSync(
  outPath,
  `${block}\nimport { writeFileSync } from 'node:fs';\nwriteFileSync(new URL('../data/games-i18n/es.json', import.meta.url), JSON.stringify(es, null, 2) + '\\n');\nconsole.log('es slugs', Object.keys(es).length);\n`
);
console.log('wrote', outPath);
