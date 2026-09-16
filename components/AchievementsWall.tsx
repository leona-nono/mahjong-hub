'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import {
  ACHIEVEMENT_IDS,
  ACHIEVEMENT_TIERS,
  type AchievementId,
  type AchievementTier
} from '@/lib/achievements';
import { openLogin } from '@/lib/auth';

const TIER_ORDER: AchievementTier[] = ['bronze', 'silver', 'gold', 'platinum'];

export default function AchievementsWall() {
  const t = useTranslations('achievements');
  const { status } = useSession();
  const loggedIn = status === 'authenticated';
  const [unlocked, setUnlocked] = useState<string[]>([]);

  useEffect(() => {
    if (!loggedIn) {
      setUnlocked([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/achievements', { credentials: 'same-origin' });
        if (!res.ok) return;
        const data = (await res.json()) as { unlocked?: string[] };
        if (!cancelled) setUnlocked(data.unlocked ?? []);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  const unlockedSet = useMemo(() => new Set(unlocked), [unlocked]);

  const byTier = useMemo(() => {
    const map = new Map<AchievementTier, AchievementId[]>();
    for (const tier of TIER_ORDER) map.set(tier, []);
    for (const id of ACHIEVEMENT_IDS) {
      map.get(ACHIEVEMENT_TIERS[id])!.push(id);
    }
    return map;
  }, []);

  return (
    <section className="rounded-3xl border border-[#d8d7cd] bg-[#fffdf7] p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-serif text-2xl font-bold text-[#1d2a44]">{t('title')}</h2>
        {loggedIn ? (
          <p className="text-sm text-[#52617a]">
            {t('progress', { done: unlockedSet.size, total: ACHIEVEMENT_IDS.length })}
          </p>
        ) : null}
      </div>

      {!loggedIn ? (
        <div className="mb-6 rounded-2xl border border-[#e5e1d5] bg-[#f7f4ec] px-4 py-4">
          <p className="font-serif text-lg font-bold text-[#1d2a44]">{t('loginValue.title')}</p>
          <p className="mt-1 text-sm text-[#52617a]">{t('loginValue.body')}</p>
          <button
            type="button"
            onClick={() => openLogin()}
            className="mt-3 rounded-xl bg-[#1e554d] px-4 py-2 text-sm font-bold text-white hover:bg-[#2d756a]"
          >
            {t('loginValue.cta')}
          </button>
        </div>
      ) : null}

      <div className="space-y-5">
        {TIER_ORDER.map((tier) => {
          const ids = byTier.get(tier) ?? [];
          const done = ids.filter((id) => unlockedSet.has(id)).length;
          return (
            <div key={tier}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h3 className="font-serif text-base font-bold text-[#1d2a44]">
                  {t(`tiers.${tier}`)}
                </h3>
                <span className="text-xs text-[#52617a]">
                  {t('progress', { done, total: ids.length })}
                </span>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {ids.map((id) => {
                  const got = unlockedSet.has(id);
                  return (
                    <li
                      key={id}
                      className={`rounded-xl border px-3 py-2 ${
                        got ? 'border-[#a8cfc5] bg-[#eef6f3]' : 'border-[#e5e1d5] bg-white'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#1d2a44]">
                        {got ? '✓ ' : ''}
                        {t(`items.${id}.name`)}
                      </p>
                      <p className="mt-0.5 text-xs text-[#52617a]">{t(`items.${id}.desc`)}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
