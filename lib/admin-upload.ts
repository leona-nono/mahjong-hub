import 'server-only';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { put } from '@vercel/blob';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

const MAX_BYTES = 4 * 1024 * 1024;

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return '仅支持 JPG / PNG / WebP / GIF 图片';
  }
  if (file.size > MAX_BYTES) {
    return '图片不能超过 4MB';
  }
  return null;
}

function safeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function extFor(type: string): string {
  return {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
  }[type]!;
}

function blobPathname(slug: string, file: File): string {
  const filename = `${Date.now()}-${safeName(file.name || 'upload')}${extFor(file.type)}`;
  return `games/${slug}/${filename}`;
}

async function storeOnBlob(slug: string, file: File): Promise<string> {
  const blob = await put(blobPathname(slug, file), file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type
  });
  return blob.url;
}

/** Store under public/uploads for local development without BLOB_READ_WRITE_TOKEN. */
async function storeOnDisk(slug: string, file: File): Promise<string> {
  const filename = `${Date.now()}-${safeName(file.name || 'upload')}${extFor(file.type)}`;
  const relDir = path.posix.join('uploads', 'games', slug);
  const absDir = path.join(process.cwd(), 'public', relDir);
  await mkdir(absDir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(absDir, filename), bytes);

  return `/${relDir}/${filename}`;
}

/**
 * Prefer Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set (production).
 * Fall back to the local public folder in development.
 */
export async function storeGameUpload(
  slug: string,
  file: File
): Promise<string> {
  const err = validateUploadFile(file);
  if (err) throw new Error(err);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return storeOnBlob(slug, file);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('线上上传需要配置 BLOB_READ_WRITE_TOKEN');
  }

  return storeOnDisk(slug, file);
}
