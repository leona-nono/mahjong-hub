import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import PathPageBody from '@/components/learning/PathPageBody';
import { pageMeta } from '@/lib/seo';
import { brandName, getPublicSiteSettings } from '@/lib/site-settings';
import { clipSeo } from '@/lib/seo-templates';
import { learningPath } from '@/lib/learning-view';

export const dynamic = 'force-static';

const PATH_ID = 'variants' as const;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const learn = await getTranslations({ locale, namespace: 'learn' });
  const site = getPublicSiteSettings();
  const lessons = learningPath(PATH_ID).courses.length;
  const title =
    locale === 'en'
      ? clipSeo(`The Six Mahjong Rulesets, Compared in ${lessons} Lessons | Mahjong Hub`, 70)
      : `${learn(`path.${PATH_ID}.title`)} | ${brandName(site)}`;
  return pageMeta({
    locale,
    path: `/learn/${PATH_ID}`,
    title,
    description: learn(`path.${PATH_ID}.lead`),
    ogImage: site.ogImage,
    siteName: brandName(site)
  });
}

export default async function LearnVariantsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const learn = await getTranslations('learn');

  return (
    <PathPageBody pathId={PATH_ID} locale={locale}>
      {/*
        Starter-kit offer (D-028). The buy link goes live with T-08 once
        `/kit` exists — until then this block states the price and shows a
        disabled note instead of a dead CTA.
      */}
      <section
        aria-labelledby="kit-offer"
        className="mt-10 rounded-2xl border border-portal-accent/30 bg-portal-panel p-5 sm:p-6"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-portal-accent/90">
          {learn('kit.eyebrow')}
        </p>
        <h2
          id="kit-offer"
          className="mt-2 font-display text-lg font-semibold text-portal-text sm:text-xl"
        >
          {learn('kit.title')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-portal-muted">{learn('kit.lead')}</p>

        <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-2xl font-bold text-portal-text">
            {learn('kit.priceNow')}
          </span>
          <span className="text-sm text-portal-muted line-through">
            {learn('kit.priceWas')}
          </span>
        </p>
        <p className="mt-1 text-xs text-portal-muted">{learn('kit.disclaimer')}</p>

        <p className="mt-4 text-sm font-medium text-portal-muted">{learn('kit.ctaSoon')}</p>
      </section>

      <section className="mt-6 rounded-2xl border border-portal-border bg-portal-panel p-5">
        <h2 className="font-display text-lg font-semibold text-portal-text">
          {learn('pathOutcome')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-portal-muted">
          {learn('path.variants.finish')}
        </p>
        <p className="mt-4 text-sm">
          <Link
            href="/games/american-mahjong"
            className="font-semibold text-portal-accent hover:underline"
          >
            {learn('action.tryAmerican')} →
          </Link>
        </p>
      </section>
    </PathPageBody>
  );
}
