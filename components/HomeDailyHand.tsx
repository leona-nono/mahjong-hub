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
    // #region agent log
    const payload = { sessionId: '3bd6ce', runId: 'pre-fix', hypothesisId: 'A', location: 'HomeDailyHand.tsx:seed-effect', message: 'seed effect running', data: { w: window.innerWidth }, timestamp: Date.now() };
    fetch('http://127.0.0.1:7640/ingest/f4459068-bdc8-426b-bae7-bfb610af1d22', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '3bd6ce' }, body: JSON.stringify(payload) }).catch(() => {});
    fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
    // #endregion
    try {
      const today = utcDateString();
      const nextSeed = dailySeed(today);
      setDateKey(today);
      setSeed(nextSeed);
      setStreak(readProgress().streak);
      // #region agent log
      const done = { sessionId: '3bd6ce', runId: 'pre-fix', hypothesisId: 'A', location: 'HomeDailyHand.tsx:seed-done', message: 'seed set', data: { today, nextSeed }, timestamp: Date.now() };
      fetch('http://127.0.0.1:7640/ingest/f4459068-bdc8-426b-bae7-bfb610af1d22', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '3bd6ce' }, body: JSON.stringify(done) }).catch(() => {});
      fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(done) }).catch(() => {});
      // #endregion
    } catch (error) {
      // #region agent log
      const fail = { sessionId: '3bd6ce', runId: 'pre-fix', hypothesisId: 'B', location: 'HomeDailyHand.tsx:seed-error', message: 'seed threw', data: { error: error instanceof Error ? error.message : String(error) }, timestamp: Date.now() };
      fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fail) }).catch(() => {});
      // #endregion
      throw error;
    }
  }, []);

  // #region agent log
  useEffect(() => {
    const snap = { sessionId: '3bd6ce', runId: 'pre-fix', hypothesisId: 'A', location: 'HomeDailyHand.tsx:seed-snap', message: 'seed snapshot', data: { seed, dateKey, w: window.innerWidth }, timestamp: Date.now() };
    fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(snap) }).catch(() => {});
  }, [seed, dateKey]);
  // #endregion

  // #region agent log
  useEffect(() => {
    const onErr = (event: ErrorEvent) => {
      const payload = { sessionId: '3bd6ce', runId: 'pre-fix', hypothesisId: 'B', location: 'HomeDailyHand.tsx:window-error', message: 'window error', data: { msg: event.message, file: event.filename, line: event.lineno, col: event.colno }, timestamp: Date.now() };
      fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
    };
    const onRej = (event: PromiseRejectionEvent) => {
      const payload = { sessionId: '3bd6ce', runId: 'pre-fix', hypothesisId: 'B', location: 'HomeDailyHand.tsx:unhandledrejection', message: 'rejection', data: { reason: String(event.reason) }, timestamp: Date.now() };
      fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
    };
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, []);
  // #endregion

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
        <h2 id="daily-hand-title" className="mt-1 font-display text-2xl font-semibold text-portal-text sm:text-3xl">
          {t('title')}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-portal-muted">{t('subtitle')}</p>
        {streak > 0 && <p className="mt-2 text-sm font-semibold text-portal-text">{t('streak', { n: streak })}</p>}
      </div>
      {seed === null ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-portal-border bg-portal-panel text-sm text-portal-muted" data-debug-daily="placeholder">
          Loading table…
        </div>
      ) : (
        <div data-debug-daily="table-wrap">
          <TableErrorBoundary fallbackLabel="Daily hand table failed to load">
            <MahjongTable dailySeed={seed} lockRuleset onHandOver={onHandOver} />
          </TableErrorBoundary>
        </div>
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
