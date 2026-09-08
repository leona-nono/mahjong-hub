import { describe, expect, it } from 'vitest';
import { categorizeFieldPath } from '@/lib/i18n-studio/field-taxonomy';
import {
  clearIdenticalToEn,
  copyEnIntoEmpty,
  flattenFields,
  replaceInStrings
} from '@/lib/i18n-studio/fields';
import { isCjkLocale, pushResidualFinding } from '@/lib/i18n-rules/residual';
import type { I18nFinding } from '@/lib/i18n-rules/types';

describe('field taxonomy', () => {
  it('maps common paths', () => {
    expect(categorizeFieldPath('blog', 'title')).toBe('title');
    expect(categorizeFieldPath('blog', 'description')).toBe('description');
    expect(categorizeFieldPath('games', 'content.howToPlay')).toBe('list');
    expect(categorizeFieldPath('site', 'ogImage')).toBe('media');
    expect(categorizeFieldPath('messages', 'nav.play')).toBe('button');
  });
});

describe('field helpers', () => {
  it('copies EN only into empty or identical leaves', () => {
    const en = { title: 'Hello', body: 'X' };
    const loc = { title: 'Hello', body: '已译' };
    const next = copyEnIntoEmpty(en, loc, 'blog') as typeof en;
    expect(next.title).toBe('Hello');
    expect(next.body).toBe('已译');
  });

  it('clears residual identical fields', () => {
    const en = { title: 'Hello' };
    const loc = { title: 'Hello', extra: 'ok' };
    const next = clearIdenticalToEn(en, loc, 'blog') as Record<string, string>;
    expect(next.title).toBe('');
    expect(next.extra).toBe('ok');
  });

  it('replaces strings', () => {
    const loc = { title: 'Mahjong Kong tips' };
    const next = replaceInStrings(loc, 'blog', 'Kong', '杠') as typeof loc;
    expect(next.title).toBe('Mahjong 杠 tips');
  });

  it('flattens nested objects', () => {
    const fields = flattenFields('games', {
      title: 'T',
      content: { intro: 'I', howToPlay: ['a', 'b'] }
    });
    expect(fields.some((f) => f.path === 'title')).toBe(true);
    expect(fields.some((f) => f.path === 'content.howToPlay' && f.kind === 'string[]')).toBe(
      true
    );
  });
});

describe('CJK residual', () => {
  it('marks CJK identical as error', () => {
    expect(isCjkLocale('zh')).toBe(true);
    const bag = { errors: [] as I18nFinding[], warnings: [] as I18nFinding[] };
    pushResidualFinding(bag, 'blog', 'zh', 'title', 'Hello', 'Hello');
    expect(bag.errors).toHaveLength(1);
    pushResidualFinding(bag, 'blog', 'fr', 'title', 'Hello', 'Hello');
    expect(bag.warnings.length).toBeGreaterThan(0);
  });
});
