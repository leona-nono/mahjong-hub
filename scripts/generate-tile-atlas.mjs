import { mkdirSync, writeFileSync } from 'node:fs';

const tiles = [
  ...Array.from({ length: 9 }, (_, i) => ({ id: `m${i + 1}`, mark: `${i + 1}\n萬`, color: '#b53036' })),
  ...Array.from({ length: 9 }, (_, i) => ({ id: `p${i + 1}`, mark: '●'.repeat(i + 1), color: '#17669c' })),
  ...Array.from({ length: 9 }, (_, i) => ({ id: `s${i + 1}`, mark: '▥'.repeat(i + 1), color: '#26714e' })),
  ...['東', '南', '西', '北', '白', '發', '中'].map((mark, i) => ({ id: `z${i + 1}`, mark, color: i === 5 ? '#26714e' : i === 6 ? '#b53036' : '#18243a' }))
];

const cols = 9;
const cellW = 160;
const cellH = 224;

function tile({ id, mark, color }, i, highContrast) {
  const x = (i % cols) * cellW;
  const y = Math.floor(i / cols) * cellH;
  const lines = mark.split('\n');
  const dotGrid = id.startsWith('p') ? `<text x="80" y="121" text-anchor="middle" font-family="Arial" font-size="${id === 'p9' ? 28 : 36}" letter-spacing="2" fill="${color}">${mark}</text>` : '';
  const bambooGrid = id.startsWith('s') ? `<text x="80" y="121" text-anchor="middle" font-family="Arial" font-size="${id === 's9' ? 25 : 34}" letter-spacing="1" fill="${color}">${mark}</text>` : '';
  const character = id.startsWith('m') ? `<text x="80" y="101" text-anchor="middle" font-family="Noto Serif CJK SC, SimSun, serif" font-size="56" font-weight="700" fill="${color}">${lines[0]}</text><text x="80" y="145" text-anchor="middle" font-family="Noto Serif CJK SC, SimSun, serif" font-size="38" font-weight="700" fill="${color}">${lines[1]}</text>` : '';
  const honour = id.startsWith('z') ? `<text x="80" y="130" text-anchor="middle" font-family="Noto Serif CJK SC, SimSun, serif" font-size="72" font-weight="700" fill="${color}">${mark}</text>` : '';
  const border = highContrast ? '#111827' : '#193f63';
  return `<g transform="translate(${x} ${y})"><rect x="5" y="5" width="150" height="214" rx="18" fill="#fffef8" stroke="${border}" stroke-width="${highContrast ? 7 : 4}"/><rect x="14" y="14" width="132" height="196" rx="12" fill="none" stroke="${highContrast ? '#111827' : '#d7b86c'}" stroke-width="2"/><text x="25" y="35" font-family="Arial" font-size="16" font-weight="700" fill="${color}">${id}</text>${character}${dotGrid}${bambooGrid}${honour}<text x="135" y="195" text-anchor="end" font-family="Arial" font-size="16" font-weight="700" fill="${color}" transform="rotate(180 135 195)">${id}</text></g>`;
}

function atlas(highContrast = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="896" viewBox="0 0 1440 896">${tiles.map((entry, i) => tile(entry, i, highContrast)).join('')}</svg>`;
}

mkdirSync('public/images/tiles/atlas', { recursive: true });
writeFileSync('public/images/tiles/atlas/standard-atlas.svg', atlas());
writeFileSync('public/images/tiles/atlas/standard-atlas-contrast.svg', atlas(true));
writeFileSync('public/images/tiles/atlas/a11y-suit-markers.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="64" viewBox="0 0 256 64"><rect width="256" height="64" fill="none"/><g fill="#111827" font-family="Arial" font-weight="700" font-size="42" text-anchor="middle"><text x="32" y="47">◆</text><text x="96" y="47">●</text><text x="160" y="47">║</text><text x="224" y="47">✦</text></g></svg>`);
