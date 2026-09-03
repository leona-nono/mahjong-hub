'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { NativeGameMountProps } from '@/components/games/NativeGameMount';

const NativeGameMount = dynamic(() => import('@/components/games/NativeGameMount'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-portal-border bg-portal-panel text-sm text-portal-muted">
      Loading game…
    </div>
  )
});

/** Tap-to-play gate — keeps heavy game engines out of the first JS payload. */
export default function NativeGameLazy(props: NativeGameMountProps) {
  const t = useTranslations('game');
  const [started, setStarted] = useState(props.autoStart ?? false);

  if (!started) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center rounded-2xl border border-portal-border bg-portal-panel px-6 py-10 text-center">
        <p className="max-w-md text-sm leading-relaxed text-portal-muted">{t('startBlurb')}</p>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="mt-6 rounded-xl bg-portal-accent px-8 py-3 text-sm font-semibold text-white shadow-portal transition hover:brightness-110"
        >
          {t('startGame')}
        </button>
      </div>
    );
  }

  return <NativeGameMount {...props} />;
}
