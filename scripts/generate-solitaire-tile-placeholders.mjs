/**
 * Generate silver-friendly placeholder SVGs for mahjong solitaire.
 * Formal art should overwrite the same filenames — no code change needed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../public/assets/mahjong-solitaire/tiles');
const backDir = path.resolve(__dirname, '../public/assets/mahjong-solitaire/backs');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(backDir, { recursive: true });

function tileSvg({ label, sub, accent, mark }) {
  const subLine = sub
    ? `<text x="60" y="128" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="14" font-weight="600" fill="#5c6b73">${sub}</text>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" viewBox="0 0 120 160" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fffdf8"/>
      <stop offset="100%" stop-color="#f3ebe0"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="112" height="152" rx="14" fill="url(#g)" stroke="#2c3e50" stroke-width="3"/>
  <rect x="10" y="10" width="100" height="140" rx="10" fill="none" stroke="${accent}" stroke-width="2" opacity="0.35"/>
  <text x="60" y="92" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="58" font-weight="700" fill="${accent}">${label}</text>
  ${subLine}
  <circle cx="24" cy="28" r="12" fill="${accent}"/>
  <text x="24" y="33" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="12" font-weight="700" fill="#fff">${mark}</text>
</svg>
`;
}

const files = [];

for (let n = 1; n <= 9; n += 1) {
  const id = String(n).padStart(2, '0');
  files.push({
    name: `man-${id}.svg`,
    svg: tileSvg({ label: String(n), sub: 'MAN', accent: '#c0392b', mark: 'M' })
  });
  files.push({
    name: `pin-${id}.svg`,
    svg: tileSvg({ label: String(n), sub: 'PIN', accent: '#2980b9', mark: 'P' })
  });
  files.push({
    name: `sou-${id}.svg`,
    svg: tileSvg({ label: String(n), sub: 'SOU', accent: '#1e8449', mark: 'S' })
  });
}

for (const [name, label, sub] of [
  ['wind-e', 'E', 'EAST'],
  ['wind-s', 'S', 'SOUTH'],
  ['wind-w', 'W', 'WEST'],
  ['wind-n', 'N', 'NORTH']
]) {
  files.push({
    name: `${name}.svg`,
    svg: tileSvg({ label, sub, accent: '#6c3483', mark: label })
  });
}

for (const [name, label, sub, accent] of [
  ['dragon-white', 'W', 'WHITE', '#7f8c8d'],
  ['dragon-green', 'G', 'GREEN', '#196f3d'],
  ['dragon-red', 'R', 'RED', '#922b21']
]) {
  files.push({
    name: `${name}.svg`,
    svg: tileSvg({ label, sub, accent, mark: label })
  });
}

for (const [name, label, sub, accent] of [
  ['season-spring', 'Sp', 'SPRING', '#27ae60'],
  ['season-summer', 'Su', 'SUMMER', '#f39c12'],
  ['season-autumn', 'Au', 'AUTUMN', '#d35400'],
  ['season-winter', 'Wi', 'WINTER', '#3498db']
]) {
  files.push({
    name: `${name}.svg`,
    svg: tileSvg({ label, sub, accent, mark: 'A' })
  });
}

for (const [name, label, sub, accent] of [
  ['flower-plum', 'Pl', 'PLUM', '#8e44ad'],
  ['flower-orchid', 'Or', 'ORCHID', '#16a085'],
  ['flower-bamboo', 'Ba', 'BAMBOO', '#2ecc71'],
  ['flower-chrys', 'Ch', 'CHRYS', '#e67e22']
]) {
  files.push({
    name: `${name}.svg`,
    svg: tileSvg({ label, sub, accent, mark: 'B' })
  });
}

[
  'rat',
  'ox',
  'tiger',
  'rabbit',
  'dragon',
  'snake',
  'horse',
  'goat',
  'monkey',
  'rooster',
  'dog',
  'pig'
].forEach((z, i) => {
  files.push({
    name: `zodiac-${z}.svg`,
    svg: tileSvg({
      label: String(i + 1),
      sub: z.toUpperCase(),
      accent: '#a04000',
      mark: 'Z'
    })
  });
});

for (let i = 1; i <= 4; i += 1) {
  files.push({
    name: `face-0${i}.svg`,
    svg: tileSvg({ label: `F${i}`, sub: 'OPERA', accent: '#1a5276', mark: 'O' })
  });
}

for (const f of files) {
  fs.writeFileSync(path.join(outDir, f.name), f.svg);
}

fs.writeFileSync(
  path.join(backDir, 'default.svg'),
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" viewBox="0 0 120 160">
  <rect x="4" y="4" width="112" height="152" rx="14" fill="#1e8449" stroke="#0e3d22" stroke-width="3"/>
  <rect x="16" y="16" width="88" height="128" rx="10" fill="none" stroke="#f9e79f" stroke-width="3"/>
  <text x="60" y="90" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#f9e79f">MJ</text>
</svg>
`
);

console.log(`Wrote ${files.length} tile SVGs + default back → ${outDir}`);
