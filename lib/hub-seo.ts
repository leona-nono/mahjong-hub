import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { pageMeta } from '@/lib/seo';
import { clipSeo } from '@/lib/seo-templates';
import { brandName, formatPageTitle, getSiteSettings } from '@/lib/site-settings';

type HubTitleKey = 'blogTitle' | 'gamesTitle' | 'privacyTitle' | 'aboutTitle';

/** Locale-aware hub-page metadata with product-controlled English titles. */
export async function hubPageMeta(opts: {
  locale: string;
  path: string;
  titleKey: HubTitleKey;
  pageLabel: string;
  description: string;
}): Promise<Metadata> {
  const site = await getSiteSettings();
  const ts = await getTranslations({ locale: opts.locale, namespace: 'seo' });
  const title =
    opts.locale === 'en'
      ? clipSeo(ts(opts.titleKey), 70)
      : formatPageTitle(site, opts.pageLabel);

  return pageMeta({
    locale: opts.locale,
    path: opts.path,
    title,
    description: opts.description,
    ogImage: site.ogImage,
    siteName: brandName(site)
  });
}
