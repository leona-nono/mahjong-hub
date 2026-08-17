import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/db';
import {
  getBlogPosts as getStaticBlogPosts,
  getLocalizedBlogPost as getStaticLocalizedBlogPost,
  type BlogPost
} from '@/data/blog';

export interface PublicGuide {
  slug: string;
  title: string;
  description: string;
  content: string;
  cover: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  readMinutes: number;
  sortOrder: number;
  source: 'cms' | 'static';
}

export function markdownFromBlogPost(post: BlogPost): string {
  return post.sections
    .map((section) => {
      const paras = section.body.map((p) => p).join('\n\n');
      return `## ${section.heading}\n\n${paras}`;
    })
    .join('\n\n');
}

function fromStatic(post: BlogPost, index: number): PublicGuide {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    content: markdownFromBlogPost(post),
    cover: null,
    ctaLabel: post.cta?.label ?? null,
    ctaHref: post.cta?.href ?? null,
    readMinutes: post.readMinutes,
    sortOrder: index,
    source: 'static'
  };
}

function mergeGuides(
  staticPosts: PublicGuide[],
  rows: Array<{
    slug: string;
    title: string;
    description: string | null;
    content: string;
    cover: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    readMinutes: number;
    sortOrder: number;
    isPublished: boolean;
  }>
): PublicGuide[] {
  const unpublished = new Set(rows.filter((row) => !row.isPublished).map((row) => row.slug));
  const bySlug = new Map(rows.filter((row) => row.isPublished).map((row) => [row.slug, row]));
  const merged: PublicGuide[] = [];

  for (const post of staticPosts) {
    if (unpublished.has(post.slug)) continue;
    const row = bySlug.get(post.slug);
    if (!row) {
      merged.push(post);
      continue;
    }
    bySlug.delete(post.slug);
    merged.push({
      slug: row.slug,
      title: row.title,
      description: row.description ?? post.description,
      content: row.content || post.content,
      cover: row.cover,
      ctaLabel: row.ctaLabel ?? post.ctaLabel,
      ctaHref: row.ctaHref ?? post.ctaHref,
      readMinutes: row.readMinutes || post.readMinutes,
      sortOrder: row.sortOrder,
      source: 'cms'
    });
  }

  for (const row of bySlug.values()) {
    merged.push({
      slug: row.slug,
      title: row.title,
      description: row.description ?? '',
      content: row.content,
      cover: row.cover,
      ctaLabel: row.ctaLabel,
      ctaHref: row.ctaHref,
      readMinutes: row.readMinutes,
      sortOrder: row.sortOrder,
      source: 'cms'
    });
  }

  merged.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
  return merged;
}

const loadGuides = cache(async (): Promise<PublicGuide[]> => {
  const staticPosts = getStaticBlogPosts().map((post, index) => fromStatic(post, index));
  try {
    const rows = await prisma.guide.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
    });
    return mergeGuides(staticPosts, rows);
  } catch {
    return staticPosts;
  }
});

/** Slug list for sitemap — times out so a slow DB cannot 500 /sitemap.xml. */
export async function getPublicGuideSlugs(): Promise<string[]> {
  const staticSlugs = getStaticBlogPosts().map((post) => post.slug);
  try {
    const rows = await Promise.race([
      prisma.guide.findMany({ select: { slug: true, isPublished: true } }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500))
    ]);
    if (!rows) return staticSlugs;
    const unpublished = new Set(rows.filter((row) => !row.isPublished).map((row) => row.slug));
    const extra = rows
      .filter((row) => row.isPublished && !staticSlugs.includes(row.slug))
      .map((row) => row.slug);
    return [...staticSlugs.filter((slug) => !unpublished.has(slug)), ...extra];
  } catch {
    return staticSlugs;
  }
}

export async function getPublicGuides(): Promise<PublicGuide[]> {
  return loadGuides();
}

export async function getPublicGuide(slug: string): Promise<PublicGuide | undefined> {
  const list = await loadGuides();
  return list.find((g) => g.slug === slug);
}

export function localizeStaticGuide(slug: string, locale: string): PublicGuide | undefined {
  const post = getStaticLocalizedBlogPost(slug, locale);
  if (!post) return undefined;
  return fromStatic(post, 0);
}

export interface AdminGuideRow {
  slug: string;
  title: string;
  sortOrder: number;
  isPublished: boolean;
  source: 'cms' | 'static';
}

export async function getAdminGuides(): Promise<AdminGuideRow[]> {
  const staticPosts = getStaticBlogPosts();
  const guides: AdminGuideRow[] = staticPosts.map((post, index) => ({
    slug: post.slug,
    title: post.title,
    sortOrder: index,
    isPublished: true,
    source: 'static'
  }));

  try {
    const rows = await prisma.guide.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
    });
    const bySlug = new Map(rows.map((row) => [row.slug, row]));
    return [
      ...guides.map((g) => {
        const row = bySlug.get(g.slug);
        if (!row) return g;
        bySlug.delete(g.slug);
        return {
          slug: row.slug,
          title: row.title,
          sortOrder: row.sortOrder,
          isPublished: row.isPublished,
          source: 'cms' as const
        };
      }),
      ...[...bySlug.values()].map((row) => ({
        slug: row.slug,
        title: row.title,
        sortOrder: row.sortOrder,
        isPublished: row.isPublished,
        source: 'cms' as const
      }))
    ].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
  } catch {
    return guides;
  }
}
