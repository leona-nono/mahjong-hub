import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import enPosts from '@/data/blog-i18n/en.json';
import {
  LEARNING_PATHS,
  assertLearningPaths,
  courseNeighbours,
  pathById,
  pathOfSlug,
  type LearningPath
} from '@/data/learning-paths';

const enSlugs = new Set(Object.keys(enPosts));

describe('learning paths', () => {
  it('lists 8 / 4 / 5 lessons with contiguous steps', () => {
    expect(LEARNING_PATHS.map((path) => [path.id, path.courses.length])).toEqual([
      ['start', 8],
      ['variants', 4],
      ['advanced', 5]
    ]);
    for (const path of LEARNING_PATHS) {
      expect(path.titleKey).toBe(path.id);
      expect(path.courses.map((course) => course.step)).toEqual(
        path.courses.map((_, index) => index + 1)
      );
    }
  });

  it('points every published slug at en.json and keeps the kit article optional', () => {
    const slugs = LEARNING_PATHS.flatMap((path) => path.courses.map((course) => course.slug));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toContain('six-mahjongs-one-hand');
    expect(enSlugs.has('six-mahjongs-one-hand')).toBe(false);
    for (const slug of slugs) {
      if (slug === 'six-mahjongs-one-hand') continue;
      expect(enSlugs.has(slug), slug).toBe(true);
    }
  });

  it('resolves a path, its neighbours, and misses', () => {
    expect(pathById('variants')?.courses[2]?.slug).toBe('six-mahjongs-one-hand');
    expect(pathById('variants')?.courses[2]?.action).toEqual({
      href: '/kit',
      labelKey: 'seeKit'
    });
    expect(pathOfSlug('how-to-win-mahjong')?.id).toBe('start');
    expect(pathOfSlug('mahjong-history-cultural-guide')).toBeUndefined();

    expect(courseNeighbours('what-is-mahjong')).toMatchObject({
      step: 1,
      total: 8,
      next: { slug: 'mahjong-tiles-meaning-guide' }
    });
    expect(courseNeighbours('what-is-mahjong')?.prev).toBeUndefined();
    expect(courseNeighbours('common-beginner-mistakes')).toMatchObject({
      step: 5,
      total: 5,
      prev: { slug: 'defense-strategy' }
    });
    expect(courseNeighbours('common-beginner-mistakes')?.next).toBeUndefined();
    expect(courseNeighbours('not-a-lesson')).toBeUndefined();
  });

  it('rejects a missing slug, a repeated slug, and a broken step', () => {
    const known = new Set(['alpha', 'beta']);
    const base: LearningPath[] = [
      {
        id: 'start',
        titleKey: 'start',
        courses: [
          { slug: 'alpha', step: 1 },
          { slug: 'beta', step: 2 }
        ]
      }
    ];

    expect(() =>
      assertLearningPaths(
        [
          {
            ...base[0],
            courses: [
              { slug: 'not-a-real-slug', step: 1 },
              { slug: 'beta', step: 2 }
            ]
          }
        ],
        known
      )
    ).toThrow(/not-a-real-slug/);

    expect(() =>
      assertLearningPaths(
        [
          base[0],
          {
            id: 'advanced',
            titleKey: 'advanced',
            courses: [{ slug: 'alpha', step: 1 }]
          }
        ],
        known
      )
    ).toThrow(/alpha/);

    expect(() =>
      assertLearningPaths(
        [
          {
            ...base[0],
            courses: [
              { slug: 'alpha', step: 1 },
              { slug: 'beta', step: 9 }
            ]
          }
        ],
        known
      )
    ).toThrow(/out of order/);
  });

  it('lets six-mahjongs-one-hand stay missing until en.json has the key', () => {
    expect(() =>
      assertLearningPaths(
        [
          {
            id: 'variants',
            titleKey: 'variants',
            courses: [{ slug: 'six-mahjongs-one-hand', step: 1 }]
          }
        ],
        new Set()
      )
    ).not.toThrow();

    expect(() =>
      assertLearningPaths(
        [
          {
            id: 'variants',
            titleKey: 'variants',
            courses: [{ slug: 'six-mahjongs-one-hand', step: 1 }]
          }
        ],
        new Set(['six-mahjongs-one-hand'])
      )
    ).not.toThrow();
  });

  it('stays free of React and client directives', () => {
    const source = readFileSync(path.join(process.cwd(), 'data', 'learning-paths.ts'), 'utf8');
    expect(source).not.toContain("'use client'");
    expect(source).not.toContain('from \'react\'');
    expect(source).not.toContain('from "react"');
  });
});
