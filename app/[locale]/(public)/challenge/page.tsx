import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ChallengeQuiz from '@/components/challenge/ChallengeQuiz';
import { pageMeta } from '@/lib/seo';
import { brandName, getPublicSiteSettings } from '@/lib/site-settings';
import {
  parseChallengeSeed,
  todayChallengeSeed
} from '@/lib/challenge';
import { utcDateString } from '@/lib/points-rules';

/** Request-time so daily seed and ?c= noindex stay correct. */
export const dynamic = 'force-dynamic';

const FAQ_COUNT = 4;

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ c?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const shared = parseChallengeSeed(sp.c) !== null;
  const t = await getTranslations({ locale, namespace: 'challenge' });
  const site = getPublicSiteSettings();
  return pageMeta({
    locale,
    path: '/challenge',
    title: t('metaTitle'),
    description: t('metaDesc'),
    ogImage: site.ogImage,
    siteName: brandName(site),
    ...(shared ? { robots: { index: false, follow: true } } : {})
  });
}

export default async function ChallengePage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations('challenge');

  const sharedSeed = parseChallengeSeed(sp.c);
  const shared = sharedSeed !== null;
  const seed = sharedSeed ?? todayChallengeSeed();
  const dateKey = shared ? undefined : utcDateString();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        locale={locale}
        crumbs={[
          { name: t('crumbHome'), path: '/' },
          { name: t('crumbChallenge'), path: '/challenge' }
        ]}
      />

      <header className="mt-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-portal-accent/90">
          {t('eyebrow')}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-portal-text sm:text-4xl">
          {t('h1')}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-portal-muted sm:text-base">
          {t('intro')}
        </p>
      </header>

      <section className="mt-6 space-y-3 text-sm leading-relaxed text-portal-muted">
        <h2 className="font-display text-lg font-semibold text-portal-text">{t('howTitle')}</h2>
        <p>{t('howBody')}</p>
        <h2 className="font-display text-lg font-semibold text-portal-text">{t('scopeTitle')}</h2>
        <p>{t('scopeBody')}</p>
      </section>

      <div className="mt-8">
        <ChallengeQuiz seed={seed} shared={shared} dateKey={dateKey} />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('faqTitle')}</h2>
        <dl className="mt-4 space-y-4">
          {Array.from({ length: FAQ_COUNT }, (_, i) => i + 1).map((n) => (
            <div key={n}>
              <dt className="font-semibold text-portal-text">{t(`faqQ${n}`)}</dt>
              <dd className="mt-1 text-sm text-portal-muted">{t(`faqA${n}`)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-10 text-sm">
        <Link href="/learn/glossary" className="text-portal-accent underline">
          {t('toGlossary')}
        </Link>
        {' · '}
        <Link href="/tools" className="text-portal-muted underline">
          {t('toTools')}
        </Link>
      </p>
    </div>
  );
}
