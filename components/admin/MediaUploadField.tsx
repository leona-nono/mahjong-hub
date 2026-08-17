'use client';

import { useRef, useState } from 'react';

interface Props {
  slug: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}

export default function MediaUploadField({
  slug,
  label,
  value,
  onChange,
  hint
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('slug', slug);
      body.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      onChange(json.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/games/... 或 https://..."
          className="min-w-[240px] flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? '上传中…' : '上传图片'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = '';
          }}
        />
      </div>
      {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      {value ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="max-h-40 rounded object-contain" />
        </div>
      ) : null}
    </div>
  );
}

interface GalleryProps {
  slug: string;
  items: string[];
  onChange: (items: string[]) => void;
  onSetCover?: (url: string) => void;
}

export function ScreenshotGallery({
  slug,
  items,
  onChange,
  onSetCover
}: GalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('slug', slug);
      body.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      onChange([...items, json.url]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase text-gray-500">
          游戏截图
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? '上传中…' : '+ 上传截图'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = '';
          }}
        />
      </div>
      {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-400">
          还没有截图。上传后会显示在游戏详情页。
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((url) => (
            <div
              key={url}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-video w-full object-cover" />
              <div className="flex gap-1 p-2">
                {onSetCover ? (
                  <button
                    type="button"
                    onClick={() => onSetCover(url)}
                    className="flex-1 rounded bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-700 hover:bg-gray-200"
                  >
                    设为封面
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onChange(items.filter((x) => x !== url))}
                  className="rounded bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-100"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
