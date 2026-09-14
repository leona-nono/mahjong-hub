import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

const MD_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Render inline [anchor](href) links. Never uses dangerouslySetInnerHTML. */
export function RichParagraph({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(MD_LINK)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    const anchor = match[1] ?? '';
    const href = match[2] ?? '';
    const external = /^https?:/i.test(href);
    parts.push(
      external ? (
        <a key={index} href={href} rel="noopener noreferrer" className="text-portal-accent underline">
          {anchor}
        </a>
      ) : (
        <Link key={index} href={href} className="text-portal-accent underline">
          {anchor}
        </Link>
      )
    );
    last = index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
