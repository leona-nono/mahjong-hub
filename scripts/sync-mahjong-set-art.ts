/**
 * One-shot: sync D:\mahjonggamebox\Mahjong-set into public tile art paths.
 * Run: npx tsx scripts/sync-mahjong-set-art.ts
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'D:/mahjonggamebox/Mahjong-set';
const ROOT = process.cwd();
const solTiles = path.join(ROOT, 'public/assets/mahjong-solitaire/tiles');
const solBacks = path.join(ROOT, 'public/assets/mahjong-solitaire/backs');
const hkDisplay = path.join(ROOT, 'public/assets/mahjong-hongkong/tiles-display');
const hkTiles = path.join(ROOT, 'public/assets/mahjong-hongkong/tiles');
const hkWebp = path.join(ROOT, 'public/assets/mahjong-hongkong/tiles-webp-v1');
const imgBacks = path.join(ROOT, 'public/images/tiles/backs');

fs.mkdirSync(solBacks, { recursive: true });
fs.mkdirSync(hkWebp, { recursive: true });

type FaceRow = { src: string; sol: string; hk: string };

const faceMap: FaceRow[] = [];
for (let i = 1; i <= 9; i++) {
  const n = String(i).padStart(2, '0');
  faceMap.push({
    src: `PaiW${n}.png`,
    sol: `man-${n}.png`,
    hk: String(i).padStart(3, '0') + '.png'
  });
}
for (let i = 1; i <= 9; i++) {
  const n = String(i).padStart(2, '0');
  faceMap.push({
    src: `PaiT${n}.png`,
    sol: `pin-${n}.png`,
    hk: String(i + 9).padStart(3, '0') + '.png'
  });
}
for (let i = 1; i <= 9; i++) {
  const n = String(i).padStart(2, '0');
  faceMap.push({
    src: `PaiB${n}.png`,
    sol: `sou-${n}.png`,
    hk: String(i + 18).padStart(3, '0') + '.png'
  });
}
faceMap.push(
  { src: 'PaiEast.png', sol: 'wind-e.png', hk: '028.png' },
  { src: 'PaiSouth.png', sol: 'wind-s.png', hk: '029.png' },
  { src: 'PaiWest.png', sol: 'wind-w.png', hk: '030.png' },
  { src: 'PaiNorth.png', sol: 'wind-n.png', hk: '031.png' },
  { src: 'PaiMiddle.png', sol: 'dragon-red.png', hk: '032.png' },
  { src: 'PaiFa.png', sol: 'dragon-green.png', hk: '033.png' },
  { src: 'PaiBai.png', sol: 'dragon-white.png', hk: '034.png' }
);

async function writePng(buf: Buffer, pngPath: string) {
  const png = await sharp(buf).png().toBuffer();
  fs.writeFileSync(pngPath, png);
}

async function writeWebp(buf: Buffer, webpPath: string) {
  const webp = await sharp(buf).webp({ quality: 90 }).toBuffer();
  fs.writeFileSync(webpPath, webp);
}

async function main() {
  let n = 0;
  for (const row of faceMap) {
    const from = path.join(SRC, row.src);
    if (!fs.existsSync(from)) throw new Error(`missing ${from}`);
    const buf = fs.readFileSync(from);
    await writePng(buf, path.join(solTiles, row.sol));
    await writePng(buf, path.join(hkDisplay, row.hk));
    await writePng(buf, path.join(hkTiles, row.hk));
    await writeWebp(buf, path.join(hkWebp, row.hk.replace(/\.png$/, '.webp')));
    n += 1;
    console.log(`OK ${row.src} -> ${row.sol} / ${row.hk}`);
  }

  const bgPath = path.join(SRC, 'PaiBG01.png');
  if (!fs.existsSync(bgPath)) throw new Error(`missing ${bgPath}`);
  const bg = fs.readFileSync(bgPath);
  await writePng(bg, path.join(solBacks, 'default.png'));
  await writeWebp(bg, path.join(solBacks, 'default.webp'));
  await writePng(bg, path.join(imgBacks, 'pai-bg-01.png'));
  await writeWebp(bg, path.join(imgBacks, 'pai-bg-01.webp'));
  // Default four-player / wardrobe jade back
  await writePng(bg, path.join(imgBacks, 'jade-moon-gate-tile-back-v1.png'));
  await writeWebp(bg, path.join(imgBacks, 'jade-moon-gate-tile-back-v1.webp'));
  console.log(`faces=${n} back=PaiBG01 synced`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
