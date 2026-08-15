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
    <section className="mt-8 overflow-hidden rounded-3xl rainbow-card">
      <div className="relative px-5 py-5 sm:px-6 sm:py-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 12% 20%, rgba(255,107,157,.22), transparent 45%), radial-gradient(ellipse at 90% 80%, rgba(56,189,248,.18), transparent 40%)'
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-rainbow-pink">
              {t('eyebrow')}
            </p>
            <h2 className="mt-1 text-2xl font-black rainbow-text sm:text-3xl">
              {t('title')}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-gray-600">{t('subtitle')}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white/70 px-2.5 py-1 text-gray-700 ring-1 ring-gray-100">
                {t('reward', { n: reward })}
              </span>
              {bonus > 0 && !cleared && (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800 ring-1 ring-amber-100">
                  {t('streakBonus', { n: bonus })}
                </span>
              )}
              <span className="rounded-full bg-white/70 px-2.5 py-1 text-gray-700 ring-1 ring-gray-100">
                {t('streak', { n: streak })}
              </span>
              {cleared && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-100">
                  {t('cleared')}
                </span>
              )}
            </div>
          </div>
          <Link
            href={PLAY_HREF}
            className={`shrink-0 rounded-full px-7 py-3 text-center text-sm font-bold shadow-md transition hover:opacity-90 ${
              cleared
                ? 'bg-white text-gray-700 ring-1 ring-gray-200'
                : 'rainbow-bar text-white'
            }`}
          >
            {cleared ? t('playAgain') : t('play')}
          </Link>
        </div>
      </div>
    </section>
  );
}
