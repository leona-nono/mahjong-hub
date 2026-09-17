/**
 * Submit indexable URLs to IndexNow (Bing / Yandex / Naver / Seznam).
 *
 * Usage:
 *   npm run seo:indexnow
 *   npm run seo:indexnow -- --urls=https://mahjonggame.org/en/blog/what-is-mahjong
 *
 * Key: INDEXNOW_KEY env, or auto-detect public/<hex>.txt (filename = contents).
 * Do not run from next build — deploy first, then curl key URL, then this script.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = 'mahjonggame.org';
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const KEY_RE = /^[a-f0-9]{8,128}$/;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

function parseArgs(argv) {
  const urlsFlag = argv.find((arg) => arg.startsWith('--urls='));
  if (!urlsFlag) return { urls: null };
  const raw = urlsFlag.slice('--urls='.length).trim();
  const urls = raw
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
  return { urls: urls.length ? urls : null };
}

function resolveKey() {
  const fromEnv = process.env.INDEXNOW_KEY?.trim();
  if (fromEnv) {
    if (!KEY_RE.test(fromEnv)) {
      console.error(`INDEXNOW_KEY is not a valid IndexNow key (8–128 hex chars): ${fromEnv}`);
      process.exit(1);
    }
    return fromEnv;
  }

  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error('No INDEXNOW_KEY and public/ directory missing.');
    process.exit(1);
  }

  const matches = [];
  for (const name of fs.readdirSync(PUBLIC_DIR)) {
    if (!name.endsWith('.txt')) continue;
    const stem = name.slice(0, -'.txt'.length);
    if (!KEY_RE.test(stem)) continue;
    const full = path.join(PUBLIC_DIR, name);
    const body = fs.readFileSync(full, 'utf8').trim();
    if (body === stem && KEY_RE.test(body)) matches.push(body);
  }

  if (matches.length === 0) {
    console.error(
      'No IndexNow key found. Set INDEXNOW_KEY or add public/<key>.txt (filename = contents, hex 8–128).'
    );
    process.exit(1);
  }
  if (matches.length > 1) {
    console.error(`Multiple IndexNow key files in public/: ${matches.join(', ')}`);
    process.exit(1);
  }
  return matches[0];
}

function extractLocs(xml) {
  const locs = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let match;
  while ((match = re.exec(xml))) {
    locs.push(match[1].trim());
  }
  return [...new Set(locs)];
}

async function fetchSitemapUrls() {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) {
    console.error(`Failed to fetch sitemap ${SITEMAP_URL}: HTTP ${res.status}`);
    process.exit(1);
  }
  const xml = await res.text();
  const urls = extractLocs(xml);
  if (urls.length === 0) {
    console.error('Sitemap contained no <loc> entries.');
    process.exit(1);
  }
  return urls;
}

async function main() {
  const { urls: overrideUrls } = parseArgs(process.argv.slice(2));
  const key = resolveKey();
  const keyLocation = `https://${HOST}/${key}.txt`;
  const urlList = overrideUrls ?? (await fetchSitemapUrls());

  console.log(`IndexNow host=${HOST} keyLocation=${keyLocation} urls=${urlList.length}`);

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key,
      keyLocation,
      urlList
    })
  });

  const text = await res.text().catch(() => '');
  if (res.status === 200 || res.status === 202) {
    console.log(`OK HTTP ${res.status} submitted=${urlList.length}${text ? ` body=${text}` : ''}`);
    process.exit(0);
  }

  console.error(`IndexNow failed HTTP ${res.status}${text ? `: ${text}` : ''}`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
