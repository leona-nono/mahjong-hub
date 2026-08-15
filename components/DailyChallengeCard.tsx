'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { utcDateString } from '@/lib/points-rules';
import { DAILY_CLEAR_POINTS } from '@/lib/mahjong-solitaire/progress-rules';
import type { SolitaireDeal } from '@/lib/mahjong-solitaire/progress-rules';

const PLAY_HREF = '/games/mahjong-solitaire-classic?play=daily';

type DailyHud = {
  utcDay: string;
  cleared: boolean;
  streak: number;
  reward: number;
  streakBonus: number;
};

export default function DailyChallengeCard() {
  const t = useTranslations('challenge');
  const [hud, setHud] = useState<DailyHud | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/solitaire/daily', { credentials: 'same-origin' });
        if (!res.ok || cancelled) {
          if (!cancelled) {
            setHud({
              utcDay: utcDateString(),
              cleared: false,
              streak: 0,
              reward: DAILY_CLEAR_POINTS,
              streakBonus: 0
            });
          }
          return;
        }
        const data = (await res.json()) as {
          utcDay?: string;
          deal?: SolitaireDeal;
          cleared?: boolean;
          streak?: number;
          reward?: number;
          streakBonus?: number;
        };
        if (cancelled) return;
        setHud({
          utcDay: data.utcDay ?? utcDateString(),
          cleared: !!data.cleared,
          streak: Number(data.streak) || 0,
          reward: Number(data.reward) || DAILY_CLEAR_POINTS,
          streakBonus: Number(data.streakBonus) || 0
        });
      } catch {
        if (!cancelled) {
          setHud({
            utcDay: utcDateString(),
            cleared: false,
            streak: 0,
            reward: DAILY_CLEAR_POINTS,
            streakBonus: 0
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const reward = hud?.reward ?? DAILY_CLEAR_POINTS;
  const streak = hud?.streak ?? 0;
  const cleared = hud?.cleared ?? false;
  const bonus = hud?.streakBonus ?? 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-portal-border bg-gradient-to-r from-teal-950/80 via-portal-panel to-amber-950/40">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-portal-accent">
            {t('eyebrow')}
          </p>
          <h2 className="font-display text-xl font-semibold text-portal-text sm:text-2xl">
            {t('title')}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-portal-muted">{t('subtitle')}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-md bg-black/30 px-2 py-1 text-portal-text">
              {t('reward', { n: reward })}
            </span>
            {bonus > 0 && !cleared && (
              <span className="rounded-md bg-amber-400/15 px-2 py-1 text-portal-amber">
                {t('streakBonus', { n: bonus })}
              </span>
            )}
            <span className="rounded-md bg-black/30 px-2 py-1 text-portal-muted">
              {t('streak', { n: streak })}
            </span>
            {cleared && (
              <span className="rounded-md bg-emerald-400/15 px-2 py-1 text-emerald-300">
                {t('cleared')}
              </span>
            )}
          </div>
        </div>
        <Link
          href={PLAY_HREF}
          className={`shrink-0 rounded-full px-6 py-2.5 text-center text-sm font-bold transition hover:brightness-110 ${
            cleared
              ? 'border border-portal-border bg-white/5 text-portal-text'
              : 'bg-portal-accent text-slate-900'
          }`}
        >
          {cleared ? t('playAgain') : t('play')}
        </Link>
      </div>
    </section>
  );
}
