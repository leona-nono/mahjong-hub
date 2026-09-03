import { describe, expect, it } from 'vitest';
import { term, GLOSSARY, glossaryKeys } from '@/data/glossary';
import { INDEXABLE_LOCALES, isIndexableLocale, ogLocale } from '@/lib/locales';

describe('glossary', () => {
  it('resolves locked terms for CJK locales', () => {
    expect(term('waiting_hand', 'zh')).toBe('听牌');
    expect(term('waiting_hand', 'zh-TW')).toBe('聽牌');
    expect(term('waiting_hand', 'ja')).toBe('テンパイ');
    expect(term('waiting_hand', 'ko')).toBe('텐파이');
    expect(term('dragon_tiles', 'ja')).toBe('三元牌');
    expect(term('four_triplets', 'zh')).toBe('四暗刻');
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
  it('marks only en + CJK as indexable', () => {
    expect(INDEXABLE_LOCALES).toEqual(['en', 'zh', 'zh-TW', 'ja', 'ko']);
    expect(isIndexableLocale('zh')).toBe(true);
    expect(isIndexableLocale('fr')).toBe(false);
    expect(isIndexableLocale('pt-BR')).toBe(false);
  });

  it('maps OG locale codes', () => {
    expect(ogLocale('zh')).toBe('zh_CN');
    expect(ogLocale('pt-BR')).toBe('pt_BR');
    expect(ogLocale('en')).toBe('en_US');
  });
});
