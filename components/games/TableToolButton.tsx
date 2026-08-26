'use client';

import type { ReactNode } from 'react';

const PRESS_FEEDBACK =
  'transition-transform duration-200 motion-safe:hover:scale-105 motion-safe:active:scale-95 disabled:pointer-events-none disabled:opacity-50';

export default function TableToolButton({
  label,
  children,
  onClick,
  active = false,
  className = '',
  tone = 'dark'
}: {
  label?: string;
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  className?: string;
  tone?: 'dark' | 'green';
}) {
  const toneClass =
    tone === 'green'
      ? active
        ? 'border-amber-300 bg-amber-300 text-emerald-950'
        : 'border-white/10 bg-[#07553b] text-white hover:bg-[#096246]'
      : active
        ? 'bg-amber-300 text-emerald-950'
        : 'border border-white/15 bg-black/20 text-white hover:bg-black/30';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-portal-accent ${PRESS_FEEDBACK} ${toneClass} ${className}`}
    >
      {children}
    </button>
  );
}
