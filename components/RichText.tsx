import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

export type RichSegment = { text: string; href?: string };

export function RichText({
  segments,
  className
}: {
  segments: RichSegment[];
  className?: string;
}) {
  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.href ? (
          <Link key={i} href={seg.href} className="font-semibold text-portal-accent hover:underline">
            {seg.text}
          </Link>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </span>
  );
}

export function InlineLinks({
  links,
  separator = ' · '
}: {
  links: { label: string; href: string }[];
  separator?: ReactNode;
}) {
  return (
    <>
      {links.map((link, i) => (
        <span key={link.href}>
          {i > 0 ? separator : null}
          <Link href={link.href} className="font-semibold text-portal-accent hover:underline">
            {link.label}
          </Link>
        </span>
      ))}
    </>
  );
}
