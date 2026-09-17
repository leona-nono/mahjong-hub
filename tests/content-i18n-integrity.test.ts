/**
 * Content integrity gate for every JSON i18n domain.
 *
 * `blog-i18n-structure.test.ts` compares only the *shape* of each locale — how many
 * paragraphs a section has, whether it carries tiles, the FAQ count. Shape can stay
 * correct while a paragraph is an empty string, which is exactly how two blank entries
 * reached `data/blog-i18n/zh.json` through a Content Studio save: the guide rendered
 * with a visible gap while every structural assertion stayed green.
 *
 * This file closes that gap. It asserts that no string leaf in any i18n domain is empty
 * or whitespace-only, and that the fields readers actually see are non-empty, so a blank
 * paragraph fails the suite instead of reaching a page.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const DATA_ROOT = path.join(process.cwd(), 'data');
const DOMAINS = ['blog-i18n', 'games-i18n', 'about-i18n', 'home-guide-i18n'];

function localeFiles(domain: string): string[] {
  return readdirSync(path.join(DATA_ROOT, domain))
    .filter((name) => name.endsWith('.json'))
    .sort();
}

function readDomain(domain: string, file: string): unknown {
  return JSON.parse(readFileSync(path.join(DATA_ROOT, domain, file), 'utf8'));
}

/** Readable paths of every empty or whitespace-only string leaf. */
function emptyLeaves(node: unknown, trail = ''): string[] {
  if (typeof node === 'string') return node.trim() ? [] : [trail];
  if (Array.isArray(node)) {
    return node.flatMap((item, index) => emptyLeaves(item, `${trail}[${index}]`));
  }
  if (node && typeof node === 'object') {
    return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
      emptyLeaves(value, `${trail}.${key}`)
    );
  }
  return [];
}

/** Readable paths of every empty array leaf. */
function emptyArrays(node: unknown, trail = ''): string[] {
  if (Array.isArray(node)) {
    return [
      ...(node.length ? [] : [trail]),
      ...node.flatMap((item, index) => emptyArrays(item, `${trail}[${index}]`))
    ];
  }
  if (node && typeof node === 'object') {
    return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
      emptyArrays(value, `${trail}.${key}`)
    );
  }
  return [];
}

describe.each(DOMAINS)('%s content integrity', (domain) => {
  const files = localeFiles(domain);

  it('ships at least one locale file', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s has no empty or whitespace-only string', (file) => {
    expect(emptyLeaves(readDomain(domain, file))).toEqual([]);
  });

  it.each(files)('%s has no empty array', (file) => {
    expect(emptyArrays(readDomain(domain, file))).toEqual([]);
  });
});

describe('blog-i18n reader-visible fields', () => {
  const files = localeFiles('blog-i18n');

  it.each(files)('%s gives every post a title, description, sections and FAQ', (file) => {
    const posts = readDomain('blog-i18n', file) as Record<
      string,
      {
        title?: string;
        description?: string;
        sections?: Array<{ heading?: string; body?: unknown }>;
        faq?: Array<{ question?: string; answer?: string }>;
      }
    >;

    const problems: string[] = [];
    for (const [slug, post] of Object.entries(posts)) {
      if (!post.title?.trim()) problems.push(`${slug}.title`);
      if (!post.description?.trim()) problems.push(`${slug}.description`);
      if (!post.sections?.length) problems.push(`${slug}.sections`);
      post.sections?.forEach((section, index) => {
        if (!section.heading?.trim()) problems.push(`${slug}.sections[${index}].heading`);
        if (!section.body?.length) problems.push(`${slug}.sections[${index}].body`);
      });
      if (!post.faq?.length) problems.push(`${slug}.faq`);
      post.faq?.forEach((entry, index) => {
        if (!entry.question?.trim()) problems.push(`${slug}.faq[${index}].question`);
        if (!entry.answer?.trim()) problems.push(`${slug}.faq[${index}].answer`);
      });
    }

    expect(problems).toEqual([]);
  });

  it('every locale carries the same post slugs as en.json', () => {
    const enSlugs = Object.keys(readDomain('blog-i18n', 'en.json') as object).sort();
    for (const file of files) {
      if (file === 'en.json') continue;
      expect(Object.keys(readDomain('blog-i18n', file) as object).sort(), file).toEqual(enSlugs);
    }
  });
});
