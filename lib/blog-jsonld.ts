import { absoluteUrl, SITE_BASE_URL } from '@/lib/seo';
import { siteOrganizationJsonLd } from '@/lib/home-jsonld';
import type { PublicSiteSettings } from '@/lib/site-settings';
import { brandName } from '@/lib/site-settings';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;

/** Normalize a blog date to ISO-8601 with UTC offset. Pass-through if already datetime. */
export function toSchemaDate(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (ISO_DATETIME.test(trimmed)) return trimmed;
  if (ISO_DATE.test(trimmed)) return `${trimmed}T00:00:00+00:00`;
  return undefined;
}

export interface BlogArticleJsonLdInput {
  site: PublicSiteSettings;
  locale: string;
  slug: string;
  title: string;
  description: string;
  publishedAt?: string;
  updatedAt?: string;
  wordCount: number;
  faq?: { question: string; answer: string }[];
}

/**
 * Article page JSON-LD: Organization (shared @id) + Article (+ optional FAQPage).
 * Does not emit a second Article; call once per page.
 */
export function blogArticleJsonLd(input: BlogArticleJsonLdInput): Record<string, unknown>[] {
  const brand = brandName(input.site);
  const pageUrl = `${SITE_BASE_URL}/${input.locale}/blog/${input.slug}`;
  const published = toSchemaDate(input.publishedAt);
  const modified = toSchemaDate(input.updatedAt ?? input.publishedAt);

  const article: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: pageUrl,
    inLanguage: input.locale,
    isAccessibleForFree: true,
    author: { '@type': 'Organization', name: brand, url: SITE_BASE_URL },
    publisher: { '@id': `${SITE_BASE_URL}/#organization` },
    // TODO(per-article cover): replace site-wide OG once each post has its own image
    image: [absoluteUrl('/og-default.png')],
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    wordCount: input.wordCount
  };
  if (published) article.datePublished = published;
  if (modified) article.dateModified = modified;

  const nodes: Record<string, unknown>[] = [
    siteOrganizationJsonLd({ site: input.site }),
    article
  ];

  if (input.faq?.length) {
    nodes.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: input.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer }
      }))
    });
  }

  return nodes;
}
