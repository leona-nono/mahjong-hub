'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import MahjongTable from '@/components/games/MahjongTable';
import { dailySeed } from '@/lib/daily/seed';
import { planDailyStreak } from '@/lib/daily/streak';
import { utcDateString } from '@/lib/points-rules';

const KEY = 'mahjong-hub.daily-hand.v1';

interface DailyHandProgress {
  lastClearDate: string | null;
  streak: number;
  freezeWeekKey: string | null;
}

function readProgress(): DailyHandProgress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { lastClearDate: null, streak: 0, freezeWeekKey: null };
    const parsed = JSON.parse(raw) as DailyHandProgress;
    return {
      lastClearDate: parsed.lastClearDate ?? null,
      streak: Number(parsed.streak) || 0,
      freezeWeekKey: parsed.freezeWeekKey ?? null
    };
  } catch {
    return { lastClearDate: null, streak: 0, freezeWeekKey: null };
  }
}

export default function HomeDailyHand() {
  const t = useTranslations('dailyHand');
  const [seed, setSeed] = useState<number | null>(null);
  const [dateKey, setDateKey] = useState('');
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState<{ won: boolean; discards: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const today = utcDateString();
    setDateKey(today);
    setSeed(dailySeed(today));
    setStreak(readProgress().streak);
  }, []);

  const onHandOver = (info: { won: boolean; discards: number }) => {
    setResult(info);
    if (!info.won || !dateKey) return;
    const stored = readProgress();
    const plan = planDailyStreak({ ...stored, today: dateKey });
    if (!plan.alreadyClearedToday) {
      const next = {
        lastClearDate: dateKey,
        streak: plan.streak,
        freezeWeekKey: plan.freezeWeekKey
      };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      setStreak(plan.streak);
    } else {
      setStreak(plan.streak);
    }
  };

  const resultLine = result
    ? t('resultLine', { date: dateKey, rules: t('rules'), n: result.discards })
    : '';

  const share = async () => {
    const text = `${t('title')} · ${resultLine} · ${t('streak', { n: streak })}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section aria-labelledby="daily-hand-title" className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-portal-accent">{t('eyebrow')}</p>
        <h1 id="daily-hand-title" className="mt-1 font-display text-3xl font-semibold text-portal-text sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-portal-muted">{t('subtitle')}</p>
        {streak > 0 && <p className="mt-2 text-sm font-semibold text-portal-text">{t('streak', { n: streak })}</p>}
      </div>
      {seed === null ? (
        <div className="h-64 animate-pulse rounded-2xl border border-portal-border bg-portal-panel" aria-hidden />
      ) : (
        <MahjongTable dailySeed={seed} lockRuleset onHandOver={onHandOver} />
      )}
      {result?.won && (
        <div className="rounded-2xl border border-portal-border bg-portal-panel p-4">
          <p className="font-semibold text-portal-text">{t('complete')}</p>
          <p className="mt-1 text-sm text-portal-text">{resultLine}</p>
          <p className="mt-1 text-sm text-portal-muted">{t('streak', { n: streak })}</p>
          <button type="button" onClick={share} className="mt-3 rounded-lg bg-portal-accent px-3 py-2 text-sm font-semibold text-portal-on-accent">
            {copied ? t('copied') : t('share')}
          </button>
        </div>
      )}
    </section>
  );
}
