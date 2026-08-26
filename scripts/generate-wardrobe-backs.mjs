import fs from 'node:fs';
import path from 'node:path';

function tile(bg0, bg1, accent, motif) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300" viewBox="0 0 220 300">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg0}"/>
      <stop offset="100%" stop-color="${bg1}"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="204" height="284" rx="18" fill="url(#g)" stroke="${accent}" stroke-width="6"/>
  <rect x="28" y="28" width="164" height="244" rx="12" fill="none" stroke="${accent}" stroke-opacity=".35" stroke-width="2"/>
  ${motif}
</svg>`;
}

const assets = {
  'public/images/tiles/backs/foundation/ivory-classic.svg': tile(
    '#f7f1e4',
    '#e8dcc4',
    '#a67c52',
    `<circle cx="110" cy="150" r="34" fill="none" stroke="#a67c52" stroke-width="4"/><path d="M110 118v64M78 150h64" stroke="#a67c52" stroke-width="4"/>`
  ),
  'public/images/tiles/backs/foundation/charcoal-night.svg': tile(
    '#2a3140',
    '#151922',
    '#9fb4d0',
    `<path d="M70 190c30-70 50-70 80 0" fill="none" stroke="#9fb4d0" stroke-width="5"/><circle cx="110" cy="110" r="18" fill="#9fb4d0" fill-opacity=".35"/>`
  ),
  'public/images/tiles/backs/foundation/coral-dawn.svg': tile(
    '#ffd2c2',
    '#f08a6b',
    '#7a2e22',
    `<circle cx="110" cy="130" r="28" fill="#ffffff33" stroke="#7a2e22" stroke-width="3"/><path d="M70 190h80" stroke="#7a2e22" stroke-width="4"/>`
  ),
  'public/images/tiles/backs/foundation/mist-lilac.svg': tile(
    '#e8e0f5',
    '#b9a6d8',
    '#4d3a78',
    `<rect x="78" y="108" width="64" height="84" rx="8" fill="none" stroke="#4d3a78" stroke-width="4"/>`
  ),
  'public/images/tiles/backs/premium/deep-sea-blue.svg': tile(
    '#0b3d5c',
    '#072536',
    '#57c3e0',
    `<path d="M40 170c30-20 50-20 80 0s50 20 80 0" fill="none" stroke="#57c3e0" stroke-width="4"/><circle cx="110" cy="120" r="22" fill="#57c3e0" fill-opacity=".25"/>`
  ),
  'public/images/tiles/backs/premium/sakura-pink.svg': tile(
    '#ffd6e5',
    '#f2a0bc',
    '#8a3358',
    `<g fill="#ffffff88" stroke="#8a3358" stroke-width="2"><circle cx="110" cy="120" r="14"/><circle cx="92" cy="136" r="14"/><circle cx="128" cy="136" r="14"/><circle cx="98" cy="156" r="14"/><circle cx="122" cy="156" r="14"/></g>`
  ),
  'public/images/tiles/backs/premium/bamboo-green.svg': tile(
    '#1f5a3a',
    '#123825',
    '#b7e39a',
    `<path d="M90 80v140M130 80v140" stroke="#b7e39a" stroke-width="8"/><path d="M78 120h84M78 170h84" stroke="#b7e39a" stroke-width="4"/>`
  ),
  'public/images/tiles/backs/premium/gold-dynasty.svg': tile(
    '#c9a227',
    '#8a6810',
    '#fff1b8',
    `<polygon points="110,95 130,160 90,160" fill="#fff1b8" fill-opacity=".35" stroke="#fff1b8" stroke-width="3"/><circle cx="110" cy="175" r="18" fill="none" stroke="#fff1b8" stroke-width="3"/>`
  ),
  'public/images/tiles/backs/premium/ink-wash.svg': tile(
    '#d9d6cf',
    '#8f8a82',
    '#222222',
    `<path d="M60 180c40-90 70-90 110-20" fill="none" stroke="#222" stroke-width="5" stroke-opacity=".55"/><path d="M70 200c35-40 60-35 90-5" fill="none" stroke="#222" stroke-width="3" stroke-opacity=".4"/>`
  )
};

for (const [file, svg] of Object.entries(assets)) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, svg);
  console.log('wrote', file);
}
