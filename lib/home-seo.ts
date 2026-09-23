import { getTranslations } from 'next-intl/server';
import { clipSeo } from '@/lib/seo-templates';
import { getPublicSiteSettings } from '@/lib/site-settings';

const BRAND_SEP = ' | ';
const TRAILING_PUNCT = /[&–\-·,]\s*$/u;

/**
 * Clip a homepage title while keeping a trailing ` | Brand` segment intact.
 * Does not change clipSeo itself (shared by hub/site-settings).
 */
function clipSeoKeepTrailingBrand(text: string, max: number): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  const sepIdx = trimmed.lastIndexOf(BRAND_SEP);
  const brand = sepIdx >= 0 ? trimmed.slice(sepIdx + BRAND_SEP.length).trim() : '';
  const core = sepIdx >= 0 ? trimmed.slice(0, sepIdx).trim() : trimmed;
  const budget = max - (brand ? brand.length + BRAND_SEP.length : 0);

  let coreClipped = clipSeo(core, Math.max(budget, 1));
  if (TRAILING_PUNCT.test(coreClipped)) {
    const withoutTail = coreClipped.replace(/\s*\S+\s*$/u, '').trimEnd();
    coreClipped = clipSeo(withoutTail, Math.max(budget, 1));
  }

  return brand ? `${coreClipped}${BRAND_SEP}${brand}` : coreClipped;
}

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
  const site = getPublicSiteSettings();

  if (locale === 'en') {
    return {
      title: clipSeoKeepTrailingBrand(t('homeTitle'), 70),
      description: clipSeo(site.siteDescription || t('homeDescription'), 160)
    };
  }

  return {
    title: clipSeoKeepTrailingBrand(t('homeTitle'), 70),
    description: clipSeo(t('homeDescription'), 160)
  };
}
