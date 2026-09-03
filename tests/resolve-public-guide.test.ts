import { describe, expect, it } from 'vitest';
import { resolvePublicGuide, type PublicGuide } from '@/lib/guides';

const cmsEn: PublicGuide = {
  slug: 'how-to-play-mahjong',
  title: 'CMS English Title',
  description: 'CMS English description',
  content: '## What You Need to Play\n\nEnglish CMS body.',
  cover: null,
  ctaLabel: null,
  ctaHref: null,
  readMinutes: 8,
  sortOrder: 0,
  source: 'cms'
};

describe('resolvePublicGuide', () => {
  it('prefers static JSON i18n over CMS for zh so body is not stuck in English', () => {
    const post = resolvePublicGuide('how-to-play-mahjong', 'zh', cmsEn);
    expect(post?.source).toBe('static');
    expect(post?.title).toBe('如何打麻将：新手分步指南');
    expect(post?.content).toContain('你需要什么');
    expect(post?.content).not.toContain('What You Need to Play');
  });

  it('keeps CMS as the English source of truth when published', () => {
    const post = resolvePublicGuide('how-to-play-mahjong', 'en', cmsEn);
    expect(post?.source).toBe('cms');
    expect(post?.title).toBe('CMS English Title');
    expect(post?.content).toContain('What You Need to Play');
  });

  it('falls back to localized static when CMS is missing', () => {
    const post = resolvePublicGuide('how-to-play-mahjong', 'ja', undefined);
    expect(post?.source).toBe('static');
    expect(post?.title).toBeTruthy();
  });
});

describe('localized blog sections', () => {
  it('exposes Chinese section headings from blog-i18n JSON', async () => {
    const { getLocalizedBlogPost } = await import('@/data/blog');
    const post = getLocalizedBlogPost('how-to-play-mahjong', 'zh');
    expect(post?.sections[0]?.heading).toBe('你需要什么');
    expect(post?.sections[0]?.body[0]).toContain('四名玩家');
  });
});
