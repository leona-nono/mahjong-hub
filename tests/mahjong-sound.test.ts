import { describe, expect, it } from 'vitest';

import { cantoneseTileLabel, japaneseTileLabel, mandarinTileLabel } from '@/lib/mahjong/sound';

describe('Hong Kong discard voice labels', () => {
  it('uses Cantonese table terminology for suits and honours', () => {
    expect(cantoneseTileLabel('m3')).toBe('\u4e09\u842c');
    expect(cantoneseTileLabel('s2')).toBe('\u4e8c\u7d22');
    expect(cantoneseTileLabel('p5')).toBe('\u4e94\u7b52');
    expect(cantoneseTileLabel('z1')).toBe('\u6771\u98a8');
    expect(cantoneseTileLabel('z6')).toBe('\u767c\u8ca1');
    expect(cantoneseTileLabel('z7')).toBe('\u7d05\u4e2d');
  });
});

describe('Riichi discard voice labels', () => {
  it('uses Japanese tile calls for suits and honours', () => {
    expect(japaneseTileLabel('m3')).toBe('サンマン');
    expect(japaneseTileLabel('p2')).toBe('リャンピン');
    expect(japaneseTileLabel('s7')).toBe('チーソウ');
    expect(japaneseTileLabel('z5')).toBe('ハク');
  });
});

describe('Chinese Official discard voice labels', () => {
  it('uses simplified Mandarin names rather than Hong Kong Cantonese labels', () => {
    expect(mandarinTileLabel('m3')).toBe('三万');
    expect(mandarinTileLabel('s2')).toBe('二条');
    expect(mandarinTileLabel('p5')).toBe('五筒');
    expect(mandarinTileLabel('z1')).toBe('东风');
    expect(mandarinTileLabel('z6')).toBe('发财');
    expect(mandarinTileLabel('z7')).toBe('红中');
  });
});
