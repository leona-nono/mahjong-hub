'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { NativeGameMountProps } from '@/components/games/NativeGameMount';
import { utcDateString } from '@/lib/points-rules';
import { dailyLevelId } from '@/lib/mahjong-solitaire/progress-rules';

const NativeGameMount = dynamic(() => import('@/components/games/NativeGameMount'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-portal-border bg-portal-panel text-sm text-portal-muted">
      Loading game…
    </div>
  )
});

/**
 * Tap-to-play gate — keeps heavy game engines out of the first JS payload.
 * `?play=daily` is read on the client so the RSC game page stays force-static.
 */
export default function NativeGameLazy(props: NativeGameMountProps) {
  const t = useTranslations('game');
  const searchParams = useSearchParams();
  const playDaily =
    props.native === 'mahjong-solitaire' && searchParams.get('play') === 'daily';

  const resolved = useMemo(() => {
    if (!playDaily) {
      return {
        defaultLevelId: props.defaultLevelId,
        autoStart: props.autoStart ?? false
      };
    }
    return {
      defaultLevelId: dailyLevelId(utcDateString()),
      autoStart: true
    };
  }, [playDaily, props.autoStart, props.defaultLevelId]);

  const [started, setStarted] = useState(resolved.autoStart);

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

  return (
    <NativeGameMount
      {...props}
      defaultLevelId={resolved.defaultLevelId}
      autoStart={resolved.autoStart}
    />
  );
}
