import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

/** Primary play entry — `/games/mahjong-solitaire-classic` (SITE_RULES R1). */
const SOLITAIRE_HREF = '/games/mahjong-solitaire-classic';

/**
 * Homepage first block: site-positioning `<h1>` + one-click play CTA.
 * Stripped of the retired points / check-in economy (SITE_RULES R1 / R2).
 */
export default async function HomeHero() {
  const t = await getTranslations('home');

  return (
    <section
      aria-labelledby="home-hero-title"
      className="rounded-3xl border border-portal-border bg-gradient-to-br from-portal-panel via-portal-elevated to-portal-panel px-5 py-8 shadow-portal sm:px-8 sm:py-10"
    >
      <h1
        id="home-hero-title"
        className="font-display text-3xl font-semibold tracking-tight text-portal-text sm:text-4xl"
      >
        {t('heroTitle')}
      </h1>
      <div className="hero-tile-stack mt-3 flex gap-2" aria-hidden>
        <span className="hero-tile hero-tile--0">🀄</span>
        <span className="hero-tile hero-tile--1">🀀</span>
        <span className="hero-tile hero-tile--2">🀅</span>
      </div>
      <p className="mt-2 text-sm font-medium text-portal-accent sm:text-base">{t('brandLine')}</p>

      <div className="mt-8 flex flex-col items-start gap-2">
        <Link
          href={SOLITAIRE_HREF}
          className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-portal-accent px-7 py-3.5 text-base font-black text-portal-on-accent shadow-lg transition hover:brightness-110 sm:text-lg"
        >
          {t('playSolitaire')}
        </Link>
        <p className="text-sm text-portal-muted">{t('instantPlay')}</p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <SecondaryEntry href="/games/mahjong-connect-classic" label={t('entryConnect')} />
        <SecondaryEntry href="/games/classic" label={t('entryClassic')} />
        <SecondaryEntry href="/games/solitaire" label={t('entryTileMatch')} />
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
