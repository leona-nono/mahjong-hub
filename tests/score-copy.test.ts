import { describe, expect, it } from 'vitest';

import {
  formatPatternList,
  formatPaymentLabel,
  formatScoreHeadline,
  type ScoreCopy
} from '@/features/table/score-copy';
import zh from '../messages/zh.json';

function translate(locale: typeof zh): ScoreCopy {
  const t = ((key: string, values?: Record<string, string | number>) => {
    const node = key.split('.').reduce<unknown>((current, part) => {
      if (!current || typeof current !== 'object') return undefined;
      return (current as Record<string, unknown>)[part];
    }, locale.mahjong);
    if (typeof node !== 'string') throw new Error(`missing ${key}`);
    return node.replace(/\{(\w+)\}/g, (_, name: string) => String(values?.[name] ?? ''));
  }) as ScoreCopy;
  t.has = (key: string) => {
    const node = key.split('.').reduce<unknown>((current, part) => {
      if (!current || typeof current !== 'object') return undefined;
      return (current as Record<string, unknown>)[part];
    }, locale.mahjong);
    return typeof node === 'string';
  };
  return t;
}

const t = translate(zh);

describe('win overlay copy', () => {
  it('localizes the Chinese Official hand from the settlement overlay', () => {
    const patterns = [
      { id: 'flower', label: 'Flower / Season (f7)', value: 1 },
      { id: 'allSimples', label: 'All Simples', value: 2 },
      { id: 'noHonours', label: 'No Honors', value: 1 },
      { id: 'allSequences', label: 'All Chows', value: 2 },
      { id: 'mixedDoubleChow', label: 'Mixed Double Chow', value: 1 },
      { id: 'shortStraight', label: 'Short Straight', value: 1 },
      { id: 'fullyConcealed', label: 'Fully Concealed Hand', value: 4 },
      { id: 'singleWait', label: 'Single Wait', value: 1 }
    ];
    expect(formatPatternList(patterns, t)).toBe(
      '花牌（竹） (+1) · 断幺 (+2) · 无字 (+1) · 平和 (+2) · 喜相逢 (+1) · 连六 (+1) · 不求人 (+4) · 单钓 (+1)'
    );
    expect(formatScoreHeadline('chinese-official', { total: 13, points: 63 }, t)).toBe('13 分 · 共得 63 分');
    expect(formatPaymentLabel('21 from each opponent (8 + 13)', t)).toBe('每家各付 21（8 + 13）');
  });

  it('keeps shared pattern ids distinct by English label and ruleset', () => {
    expect(formatPatternList([{ id: 'allSequences', label: 'All Sequences', value: 1 }], t)).toBe('平胡 (+1)');
    expect(formatPatternList([{ id: 'allSequences', label: 'All Chows', value: 2 }], t)).toBe('平和 (+2)');
    expect(formatPatternList([{ id: 'lastTileWin', label: 'Last Tile Draw', value: 1 }], t)).toBe('海底捞月 (+1)');
    expect(formatPatternList([{ id: 'lastTileDraw', label: 'Last Tile Draw', value: 8 }], t)).toBe('妙手回春 (+8)');
  });

  it('leaves an unknown engine label unchanged', () => {
    expect(formatPatternList([{ id: 'futureFan', label: 'Future Fan', value: 3 }], t)).toBe('Future Fan (+3)');
    expect(formatPaymentLabel('unparsed settlement', t)).toBe('unparsed settlement');
  });
});
