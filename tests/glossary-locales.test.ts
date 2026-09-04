import { describe, expect, it } from 'vitest';
import { term, GLOSSARY, glossaryKeys } from '@/data/glossary';
import {
  CONTENT_LOCALES,
  INDEXABLE_LOCALES,
  isContentLocale,
  isIndexableLocale,
  ogLocale
} from '@/lib/locales';

describe('glossary', () => {
  it('resolves locked terms for CJK and EU locales', () => {
    expect(term('waiting_hand', 'zh')).toBe('听牌');
    expect(term('waiting_hand', 'zh-TW')).toBe('聽牌');
    expect(term('waiting_hand', 'ja')).toBe('テンパイ');
    expect(term('waiting_hand', 'ko')).toBe('텐파이');
    expect(term('dragon_tiles', 'ja')).toBe('三元牌');
    expect(term('four_triplets', 'zh')).toBe('四暗刻');
    expect(term('kong', 'es')).toBeTruthy();
    expect(term('kong', 'fr')).toBeTruthy();
    expect(term('kong', 'de')).toBeTruthy();
    expect(term('kong', 'pt-BR')).toBeTruthy();
  });

  it('returns English source for en', () => {
    expect(term('kong', 'en')).toBe('Kong');
  });

  it('throws on unknown keys', () => {
    expect(() => term('not_a_real_key', 'zh')).toThrow(/not found/i);
  });

  it('has entries for every glossary key', () => {
    expect(glossaryKeys().length).toBeGreaterThan(20);
    expect(Object.keys(GLOSSARY)).toContain('pure_one_suit');
  });
});

describe('locales indexability', () => {
  it('indexes all nine UI locales', () => {
    expect([...INDEXABLE_LOCALES]).toEqual([
      'en',
      'zh',
      'zh-TW',
      'ja',
      'ko',
      'es',
      'pt-BR',
      'fr',
      'de'
    ]);
    expect(isIndexableLocale('zh')).toBe(true);
    expect(isIndexableLocale('fr')).toBe(true);
    expect(isIndexableLocale('pt-BR')).toBe(true);
    expect(isContentLocale('es')).toBe(true);
    expect(CONTENT_LOCALES).toContain('de');
  });

  it('maps OG locale codes', () => {
    expect(ogLocale('zh')).toBe('zh_CN');
    expect(ogLocale('pt-BR')).toBe('pt_BR');
    expect(ogLocale('en')).toBe('en_US');
  });
});
