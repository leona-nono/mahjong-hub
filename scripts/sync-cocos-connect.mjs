/**
 * Copy MahjongCoreGame web-mobile build into Next.js public/ for pathway testing.
 *
 * Usage (from mahjong-hub/):
 *   npm run sync:cocos-connect
 *
 * Env override:
 *   COCOS_BUILD_DIR=D:\path\to\build\web-mobile
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const hubRoot = resolve(__dirname, '..');
const defaultBuild = resolve(hubRoot, '..', '..', 'MahjongCoreGame', 'build', 'web-mobile');
const src = resolve(process.env.COCOS_BUILD_DIR || defaultBuild);
const dest = resolve(hubRoot, 'public', 'cocos', 'connect');

if (!existsSync(join(src, 'index.html'))) {
  console.error(`[sync:cocos-connect] Missing build at:\n  ${src}`);
  console.error('Build web-mobile in Cocos Creator first (include main + Connect scenes).');
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dirname(dest), { recursive: true });
cpSync(src, dest, { recursive: true });

writeFileSync(
  join(dest, '.sync-meta.json'),
  JSON.stringify(
    {
      syncedAt: new Date().toISOString(),
      source: src
    },
    null,
    2
  )
);

console.log(`[sync:cocos-connect] OK\n  ${src}\n  → ${dest}`);
