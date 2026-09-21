import type { Tile } from '@/lib/mahjong/tiles';

/**
 * Alternative names players actually say for each of the 34 playable tiles.
 * Used by `/tools/tile-identifier` — keep Soap/Po for White Dragon, but never
 * write 「白龙」 (I18N red line: dragons are 白板/红中/发财, not colour dragons).
 */
export const TILE_ALIASES: Record<Tile, string[]> = {
  m1: ['1 Crak', '1 Man', '一萬', '一万'],
  m2: ['2 Crak', '2 Man', '二萬', '二万'],
  m3: ['3 Crak', '3 Man', '三萬', '三万'],
  m4: ['4 Crak', '4 Man', '四萬', '四万'],
  m5: ['5 Crak', '5 Man', '五萬', '五万'],
  m6: ['6 Crak', '6 Man', '六萬', '六万'],
  m7: ['7 Crak', '7 Man', '七萬', '七万'],
  m8: ['8 Crak', '8 Man', '八萬', '八万'],
  m9: ['9 Crak', '9 Man', '九萬', '九万'],
  p1: ['1 Dot', '1 Circles', '1 Pin', '一筒', '一饼'],
  p2: ['2 Dot', '2 Circles', '2 Pin', '二筒', '二饼'],
  p3: ['3 Dot', '3 Circles', '3 Pin', '三筒', '三饼'],
  p4: ['4 Dot', '4 Circles', '4 Pin', '四筒', '四饼'],
  p5: ['5 Dot', '5 Circles', '5 Pin', '五筒', '五饼'],
  p6: ['6 Dot', '6 Circles', '6 Pin', '六筒', '六饼'],
  p7: ['7 Dot', '7 Circles', '7 Pin', '七筒', '七饼'],
  p8: ['8 Dot', '8 Circles', '8 Pin', '八筒', '八饼'],
  p9: ['9 Dot', '9 Circles', '9 Pin', '九筒', '九饼'],
  s1: ['1 Bam', '1 Sou', '一条', '一索'],
  s2: ['2 Bam', '2 Sou', '二条', '二索'],
  s3: ['3 Bam', '3 Sou', '三条', '三索'],
  s4: ['4 Bam', '4 Sou', '四条', '四索'],
  s5: ['5 Bam', '5 Sou', '五条', '五索'],
  s6: ['6 Bam', '6 Sou', '六条', '六索'],
  s7: ['7 Bam', '7 Sou', '七条', '七索'],
  s8: ['8 Bam', '8 Sou', '八条', '八索'],
  s9: ['9 Bam', '9 Sou', '九条', '九索'],
  z1: ['East', 'East Wind', '東', '东'],
  z2: ['South', 'South Wind', '南'],
  z3: ['West', 'West Wind', '西'],
  z4: ['North', 'North Wind', '北'],
  z5: ['Soap', 'Po', 'White', '白板', '白'],
  z6: ['Hatsu', 'Green', '發財', '发财', '發', '发'],
  z7: ['Chung', 'Red', '紅中', '红中', '中']
};

export const TILE_ID_ORDER: Tile[] = [
  'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9',
  'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9',
  's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9',
  'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7'
];
