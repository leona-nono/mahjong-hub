'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import {
  APPEARANCES,
  APPEARANCE_TIERS,
  appearanceOf,
  appearanceWindowState,
  applyAppearance,
  freeAppearanceIds,
  markLocalOwned,
  readLocalOwnedAppearances,
  savedAppearance,
  type AppearanceId,
  type AppearanceTier
} from '@/lib/appearance';
import { openLogin } from '@/lib/auth';
import { applyLedgerTotal, usePoints } from '@/lib/points';

type Fragments = Record<string, number>;

function isWardrobeListed(id: AppearanceId) {
  const item = APPEARANCES[id];
  const state = appearanceWindowState(id);
  if (item.tier === 'seasonal' && state === 'upcoming') return true;
  if (item.tier === 'seasonal' && state === 'archive') return true;
  return state === 'permanent' || state === 'active' || state === 'archive';
}

export default function Wardrobe() {
  const t = useTranslations('wardrobe');
  const { status } = useSession();
  const { points } = usePoints();
  const loggedIn = status === 'authenticated';

  const [selected, setSelected] = useState<AppearanceId>('jade');
  const [equipped, setEquipped] = useState<AppearanceId>('jade');
  const [owned, setOwned] = useState<AppearanceId[]>(() => freeAppearanceIds());
  const [fragments, setFragments] = useState<Fragments>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const visibleIds = useMemo(
    () => (Object.keys(APPEARANCES) as AppearanceId[]).filter(isWardrobeListed),
    []
  );

  const refreshOwnership = useCallback(async () => {
    if (!loggedIn) {
      setOwned(readLocalOwnedAppearances());
      setFragments({});
      return;
    }
    try {
      const res = await fetch('/api/wardrobe', { credentials: 'same-origin' });
      if (!res.ok) return;
      const data = (await res.json()) as {
        owned?: string[];
        fragments?: Fragments;
      };
      const next = (data.owned ?? []).filter(
        (id): id is AppearanceId => id in APPEARANCES
      );
      setOwned(next);
      next.forEach(markLocalOwned);
      setFragments(data.fragments ?? {});
    } catch {
      /* keep local */
    }
  }, [loggedIn]);

  useEffect(() => {
    const active = savedAppearance();
    const next = isWardrobeListed(active) ? active : 'jade';
    setSelected(next);
    setEquipped(next);
  }, []);

  useEffect(() => {
    void refreshOwnership();
  }, [refreshOwnership]);

  const owns = (id: AppearanceId) => owned.includes(id);
  const def = appearanceOf(selected);
  const windowState = appearanceWindowState(selected);
  const fragmentHave = def.fragmentId ? fragments[def.fragmentId] ?? 0 : 0;
  const fragmentNeed = def.fragmentsRequired ?? 0;

  const unlockLabel = () => {
    if (owns(selected)) return selected === equipped ? t('equipped') : t('owned');
    if (def.unlock === 'free') return t('owned');
    if (def.unlock === 'seasonal_checkin') {
      if (windowState === 'upcoming') return t('upcoming');
      if (windowState === 'archive') return t('seasonalEnded');
      return t('unlockCheckIn');
    }
    if (def.unlock === 'points') return t('pricePoints', { n: def.price ?? 0 });
    return t('fragmentProgress', { have: fragmentHave, need: fragmentNeed });
  };

  const redeemOrCraft = async () => {
    setError('');
    if (!loggedIn) {
      openLogin();
      return;
    }
    if (owns(selected) || busy) return;
    setBusy(true);
    try {
      const action = def.unlock === 'fragments' ? 'craft' : 'redeem';
      const res = await fetch('/api/wardrobe', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appearanceId: selected, action })
      });
      const data = (await res.json()) as {
        ok?: boolean;
        total?: number;
        fragmentTotal?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        if (data.error === 'insufficient') {
          setError(
            action === 'craft' ? t('needMoreFragments') : t('needMorePoints')
          );
        } else if (data.error === 'already_owned') {
          markLocalOwned(selected);
          setOwned((prev) => [...new Set([...prev, selected])]);
        } else {
          setError(t('unlockFailed'));
        }
        return;
      }
      markLocalOwned(selected);
      setOwned((prev) => [...new Set([...prev, selected])]);
      if (typeof data.total === 'number') applyLedgerTotal(data.total);
      if (def.fragmentId && typeof data.fragmentTotal === 'number') {
        setFragments((prev) => ({ ...prev, [def.fragmentId!]: data.fragmentTotal! }));
      }
    } finally {
      setBusy(false);
    }
  };

  const primaryAction = () => {
    if (owns(selected)) {
      applyAppearance(selected);
      setEquipped(selected);
      return;
    }
    if (def.unlock === 'seasonal_checkin') {
      openLogin();
      return;
    }
    if (def.unlock === 'points' || def.unlock === 'fragments') {
      void redeemOrCraft();
    }
  };

  const primaryLabel = () => {
    if (owns(selected)) return t('apply');
    if (def.unlock === 'seasonal_checkin') return t('checkInToUnlock');
    if (def.unlock === 'points') return t('redeemFor', { n: def.price ?? 0 });
    if (def.unlock === 'fragments') return t('craftFor', { n: fragmentNeed });
    return t('apply');
  };

  const canPrimary =
    owns(selected) ||
    def.unlock === 'seasonal_checkin' ||
    def.unlock === 'points' ||
    def.unlock === 'fragments';

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <section className="overflow-hidden rounded-3xl border border-[#d8d7cd] bg-[#fffdf7] p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1d2a44]">{t('collection')}</h2>
            <p className="mt-1 text-sm text-[#52617a]">{t('tierNote')}</p>
          </div>
          {loggedIn ? (
            <p className="text-sm font-bold text-[#1e554d]">{t('balance', { n: points })}</p>
          ) : null}
        </div>
        <div className="space-y-6">
          {APPEARANCE_TIERS.map((tier: AppearanceTier) => {
            const ids = visibleIds.filter((id) => APPEARANCES[id].tier === tier);
            if (ids.length === 0) return null;
            return (
              <section key={tier} aria-labelledby={`tier-${tier}`}>
                <div className="mb-3">
                  <h3 id={`tier-${tier}`} className="font-serif text-lg font-bold text-[#1d2a44]">
                    {t(`chapters.${tier}.title`)}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#52617a]">{t(`chapters.${tier}.body`)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {ids.map((id) => {
                    const item = appearanceOf(id);
                    const state = appearanceWindowState(id);
                    const locked = !owns(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelected(id)}
                        className={`overflow-hidden rounded-2xl border text-left transition hover:-translate-y-0.5 ${
                          selected === id
                            ? 'border-[#1e554d] ring-2 ring-[#a8cfc5]'
                            : 'border-[#d8d7cd]'
                        }`}
                      >
                        <span
                          className={`block h-24 bg-cover bg-center ${locked ? 'opacity-70' : ''}`}
                          style={{ backgroundImage: `url('${item.table}')` }}
                        />
                        <span className="block bg-[#fffdf7] p-3">
                          <b className="block text-sm text-[#1d2a44]">{t(`items.${id}`)}</b>
                          <small className="mt-1 inline-block rounded-full bg-[#eef2eb] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#52617a]">
                            {locked
                              ? item.unlock === 'points'
                                ? t('pricePoints', { n: item.price ?? 0 })
                                : item.unlock === 'fragments'
                                  ? t('limitedBadge')
                                  : item.unlock === 'seasonal_checkin'
                                    ? t(state === 'active' ? 'unlockCheckIn' : state)
                                    : t('locked')
                              : t(state === 'permanent' ? 'permanent' : state)}
                          </small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <aside className="rounded-3xl border border-[#d8d7cd] bg-[#fffdf7] p-5">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a66a3f]">{t('preview')}</p>
        <div
          className="mt-3 aspect-[16/10] rounded-2xl bg-cover bg-center p-4 shadow-inner"
          style={{
            backgroundImage: `linear-gradient(rgba(16,62,53,.52),rgba(16,62,53,.58)),url('${def.table}')`
          }}
        >
          <span className="inline-block rounded-lg bg-[#fffdf7] px-3 py-2 text-sm font-bold text-[#1d2a44]">
            {t(`items.${selected}`)}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f3efe5] p-3">
          <span
            className="h-16 w-11 rounded-lg bg-cover bg-center shadow"
            style={{ backgroundImage: `url('${def.back}')` }}
          />
          <p className="text-sm text-[#52617a]">{unlockLabel()}</p>
        </div>

        {error ? <p className="mt-3 text-xs text-rose-600">{error}</p> : null}

        {canPrimary ? (
          <button
            type="button"
            disabled={busy || (owns(selected) === false && def.unlock === 'seasonal_checkin' && windowState !== 'active')}
            onClick={primaryAction}
            className="mt-4 w-full rounded-xl bg-[#1e554d] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#2d756a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? t('working') : primaryLabel()}
          </button>
        ) : null}

        {def.shopUrl && (def.tier === 'premium' || def.tier === 'limited') ? (
          <a
            href={def.shopUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-3 flex w-full items-center justify-center rounded-xl border border-[#1e554d]/40 px-4 py-3 text-sm font-bold text-[#1e554d] hover:bg-[#1e554d]/5"
          >
            {t('buyMatchingSet')}
          </a>
        ) : null}

        <p className="mt-3 text-[11px] leading-relaxed text-[#8a7f6e]">{t('shopDisclaimer')}</p>
      </aside>
    </div>
  );
}
