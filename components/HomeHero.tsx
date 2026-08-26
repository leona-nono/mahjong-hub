'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { openLogin, useAuth } from '@/lib/auth';
import { usePoints } from '@/lib/points';
import { ensureGuestId } from '@/lib/guest-points';

const SOLITAIRE_HREF = '/games/mahjong-solitaire-classic';

export default function HomeHero() {
  const t = useTranslations('home');
  const { data: session } = useSession();
  const { user: localUser } = useAuth();
  const { points, checkIn } = usePoints();
  const signedIn = Boolean(session?.user || localUser);
  const name =
    session?.user?.name?.trim() ||
    session?.user?.email?.split('@')[0] ||
    localUser?.name?.trim() ||
    localUser?.email?.split('@')[0] ||
    '';

  return (
    <section className="rounded-3xl border border-portal-border bg-gradient-to-br from-portal-panel via-portal-elevated to-teal-950/40 px-5 py-8 shadow-portal sm:px-8 sm:py-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-portal-text sm:text-4xl">
        {t('heroTitle')}
      </h1>
      <p className="mt-2 text-sm font-medium text-portal-accent sm:text-base">{t('brandLine')}</p>

      <div className="mt-8 flex flex-col items-start gap-2">
        <Link
          href={SOLITAIRE_HREF}
          onClick={() => ensureGuestId()}
          className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-portal-accent px-7 py-3.5 text-base font-black text-slate-950 shadow-lg transition hover:brightness-110 sm:text-lg"
        >
          {t('playSolitaire')}
        </Link>
        <p className="text-sm text-portal-muted">{t('instantPlay')}</p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <SecondaryEntry href="/games/mahjong-connect-classic" label={t('entryConnect')} />
        <SecondaryEntry href="/games/classic" label={t('entryClassic')} />
        <SecondaryEntry href="/games/8x8-match-tiles" label={t('entryTileMatch')} />
      </div>

      <div className="mt-8 border-t border-portal-border/80 pt-6">
        {signedIn ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-portal-text">
                {t('welcomeBack', { name: name || 'player' })}
              </p>
              <p className="mt-1 text-sm text-portal-accent">
                {t('pointsBalance', { n: points })}
                {checkIn && !checkIn.claimedToday
                  ? ` · ${t('dailyCheckInLine', { n: checkIn.todayReward })}`
                  : null}
              </p>
            </div>
            <Link
              href={SOLITAIRE_HREF}
              className="inline-flex rounded-xl border border-portal-accent/40 px-4 py-2 text-sm font-bold text-portal-accent hover:bg-portal-accent/10"
            >
              {t('playSolitaire')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => openLogin()}
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-portal-text hover:bg-white/15"
            >
              {t('signInEmail')}
            </button>
            <Link
              href={SOLITAIRE_HREF}
              onClick={() => ensureGuestId()}
              className="inline-flex items-center justify-center rounded-xl border border-portal-border px-4 py-2.5 text-sm font-bold text-portal-muted hover:text-portal-text"
            >
              {t('playAsGuest')}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function SecondaryEntry({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-portal-border bg-portal-panel/80 px-4 py-5 text-center transition hover:border-portal-accent/50 hover:bg-portal-panel"
    >
      <span className="font-display text-base font-semibold text-portal-text">{label}</span>
    </Link>
  );
}
