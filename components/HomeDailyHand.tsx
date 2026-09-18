'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import MahjongTable from '@/components/games/MahjongTable';
import TableErrorBoundary from '@/components/games/TableErrorBoundary';
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
    <section aria-label={t('title')} className="space-y-4">
      {seed === null ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-portal-border bg-portal-panel text-sm text-portal-muted">
          Loading table…
        </div>
      ) : (
        <TableErrorBoundary fallbackLabel="Daily hand table failed to load">
          <MahjongTable dailySeed={seed} lockRuleset onHandOver={onHandOver} />
        </TableErrorBoundary>
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
