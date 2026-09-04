'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import MahjongSolitaire from '@/components/games/MahjongSolitaire';
import { utcDateString } from '@/lib/points-rules';
import { dailyLevelId } from '@/lib/mahjong-solitaire/progress-rules';

/** Homepage daily board — level id computed client-side so the home RSC stays static. */
export default function HomeDailyChallenge() {
  const t = useTranslations('challenge');
  const todayLevel = useMemo(() => dailyLevelId(utcDateString()), []);

  return (
    <section className="overflow-hidden rounded-3xl border border-portal-border bg-gradient-to-br from-teal-950/60 via-portal-panel to-portal-elevated shadow-portal">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-portal-border/80 px-4 py-4 sm:px-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-portal-accent">
            {t('eyebrow')}
          </p>
          <h1 className="font-display text-2xl font-semibold text-portal-text sm:text-3xl">
            {t('title')}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-portal-muted">{t('subtitle')}</p>
        </div>
        <Link
          href="/games/solitaire"
          className="text-sm font-semibold text-portal-accent hover:underline"
        >
          {t('moreSolitaire')}
        </Link>
      </div>
      <div className="p-2 sm:p-3">
        <MahjongSolitaire defaultLevelId={todayLevel} compact autoStart />
      </div>
    </section>
  );
}
