import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import PathPageBody from '@/components/learning/PathPageBody';
import { pageMeta } from '@/lib/seo';
import { brandName, getPublicSiteSettings } from '@/lib/site-settings';
import { clipSeo } from '@/lib/seo-templates';
import { learningPath } from '@/lib/learning-view';

export const dynamic = 'force-static';

const PATH_ID = 'start' as const;

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
      ? clipSeo(`Learn Mahjong: Play a First Hand in ${lessons} Lessons | Mahjong Hub`, 70)
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

export default async function LearnStartPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const learn = await getTranslations('learn');

  return (
    <PathPageBody pathId={PATH_ID} locale={locale}>
      <section className="mt-10 rounded-2xl border border-portal-border bg-portal-panel p-5">
        <h2 className="font-display text-lg font-semibold text-portal-text">
          {learn('pathOutcome')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-portal-muted">
          {learn('path.start.finish')}
        </p>
        <p className="mt-4 text-sm">
          <Link
            href="/games/hong-kong-mahjong"
            className="font-semibold text-portal-accent hover:underline"
          >
            {learn('action.playWithCoach')} →
          </Link>
        </p>
      </section>
    </PathPageBody>
  );
}
