import { describe, expect, it } from 'vitest';
import { getBlogPosts, getLocalizedBlogPost } from '@/data/blog';
import { BLOG_CLUSTERS, relatedSlugs } from '@/data/blog-clusters';
import { GLOSSARY_GROUPS } from '@/data/glossary/definitions';
import { linkArticleSections } from '@/lib/article-links';

describe('article links and glossary', () => {
  it('publishes 32 glossary terms in one page of groups', () => {
    const keys = GLOSSARY_GROUPS.flatMap((group) => group.keys);
    expect(new Set(keys).size).toBe(32);
    expect(keys).toHaveLength(32);
  });

  it('gives every article a cluster link and related reading', () => {
    const slugs = new Set(BLOG_CLUSTERS.flatMap((cluster) => [cluster.pillar, ...cluster.members]));
    expect([...slugs].sort()).toEqual(getBlogPosts().map((post) => post.slug).sort());
    for (const slug of slugs) {
      expect(relatedSlugs(slug).length).toBeGreaterThan(0);
      for (const locale of ['en', 'zh', 'zh-TW'] as const) {
        const post = getLocalizedBlogPost(slug, locale);
        expect(post?.publishedAt).toBeTruthy();
        const linked = linkArticleSections(post!.sections, slug, locale);
        const body = linked.flatMap((section) => section.body).join('\n');
        expect(body).toMatch(/\]\(\/blog\//);
      }
    }
  });

  it('caps glossary autolinks at six per article', () => {
    const post = getLocalizedBlogPost('what-is-mahjong', 'en');
    const linked = linkArticleSections(post!.sections, 'what-is-mahjong', 'en');
    const glossaryLinks = linked
      .flatMap((section) => section.body)
      .join('\n')
      .match(/\/learn\/glossary#/g);
    expect(glossaryLinks?.length ?? 0).toBeLessThanOrEqual(6);
  });
});
