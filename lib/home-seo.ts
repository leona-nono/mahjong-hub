import { getTranslations } from 'next-intl/server';
import { clipSeo } from '@/lib/seo-templates';
import { getSiteSettings } from '@/lib/site-settings';

/**
 * Locale-aware homepage title + description.
 * CMS siteTitle/siteDescription are English brand copy — apply them only to `en`
 * so FR/DE/ES/PT (and others) do not inherit untranslated meta and compete with /en.
 */
export async function homeSeo(locale: string): Promise<{
  title: string;
  description: string;
}> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  const site = await getSiteSettings();

  if (locale === 'en') {
    return {
      title: clipSeo(site.siteTitle || t('homeTitle'), 70),
      description: clipSeo(site.siteDescription || t('homeDescription'), 160)
    };
  }

  return {
    title: clipSeo(t('homeTitle'), 70),
    description: clipSeo(t('homeDescription'), 160)
  };
}
