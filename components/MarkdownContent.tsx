import type { ReactNode } from 'react';

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const embed = youtubeEmbed(href);
      if (embed && (label === 'video' || label === 'Video' || label === '视频')) {
        return (
          <div key={i} className="my-4 overflow-hidden rounded-xl border border-portal-border">
            <iframe
              title={label}
              src={embed}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <a
          key={i}
          href={href}
          className="text-portal-accent underline-offset-2 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function renderBlock(block: string, key: number): ReactNode {
  const trimmed = block.trim();
  if (!trimmed) return null;

  const image = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (image) {
    const [, alt, src] = image;
    const embed = youtubeEmbed(src);
    if (embed) {
      return (
        <div key={key} className="my-4 overflow-hidden rounded-xl border border-portal-border">
          <iframe
            title={alt || 'video'}
            src={embed}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <figure key={key} className="my-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="w-full rounded-xl border border-portal-border object-cover"
          loading="lazy"
        />
        {alt ? (
          <figcaption className="mt-2 text-center text-xs text-portal-muted">
            {alt}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  const videoLine = trimmed.match(/^@video\s+(\S+)$/i);
  if (videoLine) {
    const embed = youtubeEmbed(videoLine[1]);
    if (embed) {
      return (
        <div key={key} className="my-4 overflow-hidden rounded-xl border border-portal-border">
          <iframe
            title="video"
            src={embed}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }

  if (trimmed.startsWith('### ')) {
    return (
      <h3 key={key} className="mt-5 font-display text-lg font-semibold text-portal-text">
        {renderInline(trimmed.slice(4))}
      </h3>
    );
  }
  if (trimmed.startsWith('## ')) {
    return (
      <h2 key={key} className="mt-6 font-display text-xl font-semibold text-portal-text">
        {renderInline(trimmed.slice(3))}
      </h2>
    );
  }

  const lines = trimmed.split('\n');
  if (lines.every((line) => line.startsWith('- '))) {
    return (
      <ul key={key} className="my-3 list-disc space-y-1 pl-5 text-sm text-portal-muted">
        {lines.map((line, i) => (
          <li key={i}>{renderInline(line.slice(2))}</li>
        ))}
      </ul>
    );
  }

  if (lines.every((line) => /^\d+\.\s/.test(line))) {
    return (
      <ol key={key} className="my-3 list-decimal space-y-1 pl-5 text-sm text-portal-muted">
        {lines.map((line, i) => (
          <li key={i}>{renderInline(line.replace(/^\d+\.\s/, ''))}</li>
        ))}
      </ol>
    );
  }

  return (
    <p key={key} className="my-3 text-sm leading-relaxed text-portal-muted">
      {renderInline(trimmed.replace(/\n/g, ' '))}
    </p>
  );
}

export default function MarkdownContent({ markdown }: { markdown: string }) {
  const blocks = markdown.split(/\n{2,}/);
  return (
    <div className="cms-markdown">
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}
