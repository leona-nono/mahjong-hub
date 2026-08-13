import { mkdir, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const source = join(root, 'public', 'assets', 'mahjong-hongkong', 'tiles-display');
const output = join(root, 'public', 'assets', 'mahjong-hongkong', 'tiles-webp-v1');

await mkdir(output, { recursive: true });
const files = (await readdir(source)).filter((file) => /^\d{3}\.png$/.test(file));

await Promise.all(files.map(async (file) => {
  await sharp(join(source, file))
    .resize({ width: 150, height: 210, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 4, smartSubsample: true })
    .toFile(join(output, file.replace(/\.png$/, '.webp')));
}));

const sizes = await Promise.all(files.map(async (file) => (await stat(join(output, file.replace(/\.png$/, '.webp')))).size));
console.log(`Generated ${files.length} WebP tiles: ${(sizes.reduce((total, size) => total + size, 0) / 1024).toFixed(1)} KiB total.`);
