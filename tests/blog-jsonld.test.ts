import { describe, expect, it } from 'vitest';
import { SITE_BASE_URL, absoluteUrl } from '@/lib/seo';
import { blogArticleJsonLd, toSchemaDate } from '@/lib/blog-jsonld';
import { DEFAULT_PUBLIC_SITE_SETTINGS } from '@/lib/site-settings';

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;

describe('toSchemaDate', () => {
  it('normalizes bare dates to UTC midnight ISO', () => {
    expect(toSchemaDate('2026-08-18')).toBe('2026-08-18T00:00:00+00:00');
  });

  it('passes through existing ISO datetimes', () => {
    expect(toSchemaDate('2024-01-05T08:00:00+08:00')).toBe('2024-01-05T08:00:00+08:00');
  });

  it('returns undefined for missing dates', () => {
    expect(toSchemaDate(undefined)).toBeUndefined();
    expect(toSchemaDate(null)).toBeUndefined();
    expect(toSchemaDate('')).toBeUndefined();
  });
});

describe('blogArticleJsonLd', () => {
  const nodes = blogArticleJsonLd({
    site: DEFAULT_PUBLIC_SITE_SETTINGS,
    locale: 'en',
    slug: 'mahjong-rules-beginners-complete-guide',
    title: 'Mahjong Rules for Beginners',
    description: 'A complete beginner guide.',
    publishedAt: '2026-08-18',
    updatedAt: '2026-09-01',
    wordCount: 1200,
    faq: [{ question: 'Q?', answer: 'A.' }]
  });

  const article = nodes.find((n) => n['@type'] === 'Article') as Record<string, unknown> | undefined;
  const org = nodes.find((n) => n['@type'] === 'Organization') as Record<string, unknown> | undefined;

  it('emits an Article block', () => {
    expect(article).toBeTruthy();
    expect(article?.['@type']).toBe('Article');
  });

  it('sets image to an absolute mahjonggame.org URL', () => {
    const image = article?.image;
    expect(Array.isArray(image)).toBe(true);
    expect((image as string[])[0]).toBe(absoluteUrl('/og-default.png'));
    expect((image as string[])[0]).toMatch(/^https:\/\/mahjonggame\.org\//);
  });

  it('resolves publisher @id to an Organization node in the same graph', () => {
    const publisher = article?.publisher as { '@id'?: string } | undefined;
    expect(publisher?.['@id']).toBe(`${SITE_BASE_URL}/#organization`);
    expect(org?.['@id']).toBe(publisher?.['@id']);
  });

  it('emits ISO-8601 datePublished or omits the field', () => {
    if ('datePublished' in (article ?? {})) {
      expect(String(article?.datePublished)).toMatch(ISO_RE);
    }
    expect(article?.datePublished).toBe('2026-08-18T00:00:00+00:00');
    expect(article?.dateModified).toBe('2026-09-01T00:00:00+00:00');
  });

  it('omits datePublished when the post has no publish date', () => {
    const bare = blogArticleJsonLd({
      site: DEFAULT_PUBLIC_SITE_SETTINGS,
      locale: 'zh',
      slug: 'what-is-mahjong',
      title: '标题',
      description: '描述',
      wordCount: 10
    });
    const a = bare.find((n) => n['@type'] === 'Article') as Record<string, unknown>;
    expect(a).not.toHaveProperty('datePublished');
    expect(a).not.toHaveProperty('dateModified');
  });
});
