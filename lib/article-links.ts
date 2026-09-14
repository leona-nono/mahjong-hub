import { bridgeSlug, clusterOf } from '@/data/blog-clusters';
import type { BlogSection } from '@/data/blog';
import { getLocalizedBlogPost } from '@/data/blog';
import { autolinkParagraph, glossaryLabels } from '@/lib/glossary-autolink';

const SEE_ALSO: Record<string, string> = {
  en: 'See also',
  zh: '另见',
  'zh-TW': '另見'
};

function seeAlsoPrefix(locale: string): string {
  return SEE_ALSO[locale] ?? SEE_ALSO.en;
}

function appendLink(text: string, locale: string, targetSlug: string): string {
  if (text.includes(`(/blog/${targetSlug})`)) return text;
  const title = getLocalizedBlogPost(targetSlug, locale)?.title;
  if (!title) return text;
  const end = locale === 'en' ? '.' : '。';
  return `${text} ${seeAlsoPrefix(locale)} [${title}](/blog/${targetSlug})${end}`;
}

function clusterTarget(slug: string): string | undefined {
  const cluster = clusterOf(slug);
  if (!cluster) return undefined;
  if (slug === cluster.pillar) return cluster.members[0];
  return cluster.pillar;
}

/** Cluster, bridge and glossary links for one article. Headings are not linked. */
export function linkArticleSections(sections: BlogSection[], slug: string, locale: string): BlogSection[] {
  const labels = glossaryLabels(locale);
  const used = new Set<string>();
  let autolinks = 0;
  const cluster = clusterTarget(slug);
  const bridge = bridgeSlug(slug);

  return sections.map((section, sectionIndex) => ({
    ...section,
    body: section.body.map((paragraph, paragraphIndex) => {
      let text = paragraph;
      if (sectionIndex === 0 && paragraphIndex === 0 && cluster) {
        text = appendLink(text, locale, cluster);
      }
      if (sectionIndex === 0 && paragraphIndex === 1 && bridge && bridge !== cluster) {
        text = appendLink(text, locale, bridge);
      }
      if (autolinks >= 6) return text;
      const linked = autolinkParagraph(text, labels, used);
      if (linked.key) autolinks += 1;
      return linked.text;
    })
  }));
}

export function articleWordCount(sections: BlogSection[]): number {
  return sections.reduce((total, section) => total + section.body.join(' ').split(/\s+/).filter(Boolean).length, 0);
}
