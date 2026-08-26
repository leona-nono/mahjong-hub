import { getTranslations } from 'next-intl/server';
import { clipSeo } from '@/lib/seo-templates';
import { getSiteSettings } from '@/lib/site-settings';

/**
 * Locale-aware homepage title + description.
 * English title is product-controlled via messages (not CMS) so typos like
 * "Onlien" in site settings cannot ship to <title>.
 */
export async function homeSeo(locale: string): Promise<{
  title: string;
  description: string;
}> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  const site = await getSiteSettings();

  if (locale === 'en') {
    return {
      title: clipSeo(t('homeTitle'), 70),
      description: clipSeo(site.siteDescription || t('homeDescription'), 160)
    };
  }

  return {
    title: clipSeo(t('homeTitle'), 70),
    description: clipSeo(t('homeDescription'), 160)
  };
}
