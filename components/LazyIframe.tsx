'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { awardPoints } from '@/lib/points';

interface FallbackGame {
  slug: string;
  title: string;
}

interface LazyIframeProps {
  src: string;
  title: string;
  /** iframe aspect ratio (height / width). 0.66 ≈ 2:3 portrait. */
  ratio?: number;
  /** Games suggested when the iframe fails to load. */
  fallbackGames?: FallbackGame[];
  /** Auto-load on mount (set false to require a tap first). */
  autoLoad?: boolean;
}

/**
 * Lazy iframe wrapper with a tap-to-play gate, skeleton, and a graceful
 * fallback when the external game fails to load (timeout / cross-origin block).
 * Replicates the template's LazyIframe behaviour, rewritten for this project.
 */
export default function LazyIframe({
  src,
  title,
  ratio = 0.66,
  fallbackGames = [],
  autoLoad = false
}: LazyIframeProps) {
  const [active, setActive] = useState(autoLoad);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLIFrameElement>(null);
  const t = useTranslations('game');

  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => {
      if (ref.current && !ref.current.dataset.loaded) setFailed(true);
    }, 12000);
    return () => clearTimeout(id);
  }, [active]);

  if (failed) {
    return (
      <div className="rounded-2xl bg-white/70 p-8 text-center">
        <h3 className="text-lg font-bold text-gray-800">{t('failedTitle')}</h3>
        <p className="mt-2 text-sm text-gray-500">{t('failedDesc')}</p>
        {fallbackGames.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {fallbackGames.map((g) => (
              <Link
                key={g.slug}
                href={`/games/${g.slug}`}
                className="rounded-full bg-rainbow-indigo/10 px-3 py-1 text-sm font-medium text-rainbow-indigo hover:bg-rainbow-indigo/20"
              >
                {g.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-white/60"
      style={{ paddingTop: `${ratio * 100}%` }}
    >
      {!active && (
        <button
          type="button"
          onClick={() => {
            setActive(true);
            // Earning points is gated behind login: guests keep playing,
            // but are prompted to sign in the moment points would be awarded.
            awardPoints(10, 'start_game');
          }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 rainbow-card"
          aria-label={t('play')}
        >
          <span className="text-3xl">🀄</span>
          <span className="rainbow-text text-2xl font-black">{t('play')}</span>
          <span className="text-sm text-gray-500">{title}</span>
        </button>
      )}
      {active && (
        <iframe
          ref={ref}
          src={src}
          title={title}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
          allow="autoplay; fullscreen; gamepad"
          onLoad={() => {
            if (ref.current) ref.current.dataset.loaded = '1';
          }}
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
    </div>
  );
}
