'use client';

import { useMemo, useState, type ReactNode } from 'react';

import TileFace, { TileBack, useTraditionalTilePreload } from './TileFace';
import { sortTiles, tileFace, type Tile } from '@/lib/mahjong/tiles';

type CharlestonStep = 0 | 1 | 2 | 3;

const STANDARD = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7'] as Tile[];
const FLOWERS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];
// Physical American set: four copies of every standard face, eight distinct
// flowers and eight distinct Joker tiles. Deal operations always consume this
// wall; no presentation path may create a fifth copy of a standard tile.
const WALL = [...STANDARD.flatMap((tile) => [tile, tile, tile, tile]), ...FLOWERS, ...Array.from({ length: 8 }, (_, index) => `j${index + 1}`)];
const PASS_LABELS = ['First Charleston · pass 3 tiles to the right', 'Second Charleston · pass 3 tiles across', 'Third Charleston · pass 3 tiles to the left'];

function shuffledWall(seed: number): string[] {
  const tiles = [...WALL];
  let state = seed >>> 0;
  for (let index = tiles.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swap = state % (index + 1);
    [tiles[index], tiles[swap]] = [tiles[swap], tiles[index]];
  }
  return tiles;
}

function initialDeal(seed: number): { hand: string[]; wall: string[] } {
  const wall = shuffledWall(seed);
  // Four 13-tile hands are removed before the human hand is returned. The
  // opponents are intentionally concealed, but their tiles still leave wall.
  return { hand: wall.slice(0, 13), wall: wall.slice(52) };
}

function isStandardTile(tile: string): tile is Tile {
  return STANDARD.includes(tile as Tile) || FLOWERS.includes(tile);
}

function sortAmerican(tiles: string[]): string[] {
  const ordinary = tiles.filter(isStandardTile);
  const specials = tiles.filter((tile) => !isStandardTile(tile));
  return [...sortTiles(ordinary), ...specials];
}

export default function AmericanMahjongTable({ onWin }: { onWin?: (points: number) => void }) {
  useTraditionalTilePreload();
  const [deal, setDeal] = useState(() => initialDeal(20260813));
  const [hand, setHand] = useState<string[]>(() => sortAmerican(initialDeal(20260813).hand));
  const [selected, setSelected] = useState<number[]>([]);
  const [step, setStep] = useState<CharlestonStep>(0);
  const [lastDiscard, setLastDiscard] = useState<string | null>(null);
  const [autoSort, setAutoSort] = useState(true);
  const [notice, setNotice] = useState('Choose exactly three tiles to begin the Charleston.');

  const inCharleston = step < 3;
  const selectedTiles = selected.map((index) => hand[index]).filter(Boolean);
  const targetProgress = useMemo(() => {
    const flowers = hand.filter((tile) => tile.startsWith('f')).length;
    const jokers = hand.filter((tile) => tile.startsWith('j')).length;
    const dots = hand.filter((tile) => tile === 'p2' || tile === 'p3' || tile === 'p4').length;
    return { flowers, jokers, dots: Math.min(6, dots) };
  }, [hand]);

  const reset = () => {
    const nextDeal = initialDeal(Date.now());
    setDeal(nextDeal);
    setHand(sortAmerican(nextDeal.hand));
    setSelected([]);
    setStep(0);
    setLastDiscard(null);
    setNotice('Choose exactly three tiles to begin the Charleston.');
  };

  const pass = () => {
    if (selected.length !== 3) {
      setNotice('Select exactly 3 tiles before passing.');
      return;
    }
    const remaining = hand.filter((_, index) => !selected.includes(index));
    const incoming = deal.wall.slice(0, 3);
    const next = autoSort ? sortAmerican([...remaining, ...incoming]) : [...remaining, ...incoming];
    setHand(next);
    setSelected([]);
    const remainingWall = deal.wall.slice(3);
    if (step === 2) {
      const draw = remainingWall[0];
      setHand(autoSort ? sortAmerican([...next, draw]) : [...next, draw]);
      setDeal({ hand: [], wall: remainingWall.slice(1) });
      setStep(3);
      setNotice('Charleston complete. You are East: choose one tile to discard.');
    } else {
      setDeal({ hand: [], wall: remainingWall });
      setStep((value) => (value + 1) as CharlestonStep);
      setNotice(`Passed. ${PASS_LABELS[step + 1]}`);
    }
  };

  const discard = (index: number) => {
    if (inCharleston) {
      setSelected((current) => current.includes(index) ? current.filter((item) => item !== index) : current.length === 3 ? [...current.slice(1), index] : [...current, index]);
      return;
    }
    const tile = hand[index];
    const next = hand.filter((_, item) => item !== index);
    const drawn = deal.wall[0];
    if (!drawn) {
      setNotice('The wall is exhausted. This practice hand is a draw.');
      return;
    }
    setLastDiscard(tile);
    setHand(autoSort ? sortAmerican([...next, drawn]) : [...next, drawn]);
    setDeal({ hand: [], wall: deal.wall.slice(1) });
    setNotice(`You discarded ${tile.startsWith('j') ? 'a Joker' : tileFace(tile as Tile)}. Bots have played; your replacement tile is highlighted.`);
    if (targetProgress.dots >= 6 && targetProgress.flowers >= 2) onWin?.(20);
  };

  return (
    <section className="overflow-hidden rounded-xl bg-[#176845] p-0 shadow-[0_24px_60px_rgba(0,45,31,.35)] lg:p-3">
      {/* A browser at 110–125% zoom often reports <1024 CSS pixels.  The
          tabletop must still be the default on desktop-sized screens; only
          genuinely narrow phones use the compact interaction layout. */}
      <div className="hidden min-w-[700px] min-[700px]:block">
        <div className="mb-2 flex h-11 items-center justify-between gap-3">
          <div className="flex gap-2">
            <TableButton onClick={reset}>↻ New Game</TableButton>
            <TableButton onClick={() => setAutoSort((value) => !value)} active={autoSort}>Sort By Suit</TableButton>
            <TableButton onClick={() => setNotice('Original practice card: choose the Garden Ladder line. Jokers can fill a group of 3+, never a pair or single.')}>◇ Practice Card</TableButton>
          </div>
          <div className="flex items-center gap-3 text-emerald-100"><span className="text-xs font-black">ORIGINAL PRACTICE CARD</span><span className="text-2xl">⚙</span></div>
        </div>

        <div className="relative h-[720px] overflow-hidden border-[5px] border-[#032f22] bg-[#00553e] shadow-[inset_0_0_90px_rgba(0,30,22,.34)]">
          <div className="absolute inset-y-0 left-0 w-[11%] bg-[linear-gradient(105deg,#0b0a08_0%,#1b1914_58%,transparent_59%)]" />
          <div className="absolute inset-y-0 right-0 w-[11%] bg-[linear-gradient(255deg,#0b0a08_0%,#1b1914_58%,transparent_59%)]" />
          <div className="absolute left-4 top-3 text-xl font-semibold leading-6 text-emerald-100/45">NMJL-STYLE<br />PRACTICE<br />Rate: 10</div>

          <Wall className="left-1/2 top-8 -translate-x-1/2" count={13} />
          <Wall className="left-[16%] top-1/2 -translate-y-1/2" count={13} vertical />
          <Wall className="right-[16%] top-1/2 -translate-y-1/2" count={13} vertical />
          <CharlestonReserve className="left-1/2 top-[13%] -translate-x-1/2" />
          <CharlestonReserve className="left-[31%] top-[39%]" vertical />
          <CharlestonReserve className="right-[31%] top-[39%]" vertical />
          <Avatar seat="P4" score="8900" className="right-[20%] top-[9%]" />
          <Avatar seat="P3" score="8900" className="left-5 top-[37%]" />
          <Avatar seat="P2" score="8900" className="right-5 top-[37%]" />
          <Avatar seat="YOU" score="8920" className="bottom-[15%] left-[13%]" human />

          <div className="pointer-events-none absolute left-[28%] right-[28%] top-[18%] h-[48%] border border-[#003d2f]" />
          <div className="absolute left-1/2 top-[45%] z-10 flex h-40 w-52 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border-[5px] border-[#20222d] bg-[#07090d] text-center shadow-xl">
            <span className="text-[11px] font-black tracking-[.26em] text-cyan-300">AMERICAN</span>
            <strong className="mt-2 text-2xl font-normal text-cyan-100">{inCharleston ? `Charleston ${step + 1}/3` : 'Your Turn'}</strong>
            <span className="mt-1 text-4xl font-light text-cyan-200">{deal.wall.length}</span>
            <span className="mt-1 text-[10px] font-bold text-emerald-200">tiles left</span>
          </div>

          <div className="absolute left-1/2 top-[46%] z-20 w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-emerald-200/15 bg-[#002f24]/95 px-6 py-5 text-center shadow-2xl">
            <p className="text-[2rem] font-black leading-tight text-amber-50">{inCharleston ? `Charleston ${step + 1}` : 'Original Practice Card'}</p>
            <p className="mt-1 text-[1.45rem] font-semibold leading-tight text-emerald-100">{inCharleston ? PASS_LABELS[step].replace(' · ', ': ') : 'Garden Ladder · Jokers only in groups'}</p>
            <p className="mt-2 text-xs font-bold text-emerald-200/80">{notice}</p>
          </div>

          <div className="absolute bottom-[20%] left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 rounded-xl bg-transparent p-3">
            {inCharleston && selectedTiles.map((tile, index) => <AmericanTile key={`${tile}-${index}`} tile={tile} selected />)}
            {inCharleston && <button type="button" onClick={pass} className="h-20 min-w-48 -skew-x-6 rounded-2xl border-2 border-emerald-950/40 bg-[#b7c8be] px-9 text-[2.15rem] font-black text-white shadow-[inset_0_-5px_0_rgba(0,0,0,.2),0_6px_10px_rgba(0,0,0,.35)]"><span className="inline-block skew-x-6">Pass</span></button>}
            {!inCharleston && <div className="text-sm font-black text-emerald-100">Last discard: {lastDiscard ? <AmericanTile tile={lastDiscard} /> : '—'}</div>}
          </div>

          <div className="absolute bottom-[18%] left-3 z-30 flex w-28 flex-col gap-2 rounded-lg border border-emerald-200/15 bg-[#063d30]/80 p-2 text-sm font-black text-emerald-100/75">
            <button type="button" onClick={() => setAutoSort(true)} className="rounded bg-black/20 px-2 py-2 text-left hover:bg-black/35">Sort By Suit</button>
            <button type="button" onClick={() => setAutoSort(false)} className="rounded bg-black/20 px-2 py-2 text-left hover:bg-black/35">Sort By Rank</button>
            <span className="border-t border-white/10 pt-2 text-xs">No Call <i className="float-right inline-block h-4 w-4 rounded-full bg-emerald-950" /></span>
            <span className="text-xs">Auto Discard <i className="float-right inline-block h-4 w-4 rounded-full bg-emerald-950" /></span>
          </div>

          <div className="absolute bottom-3 left-1/2 z-20 w-[84%] -translate-x-1/2">
            <div className="mb-2 flex justify-between text-xs font-bold text-emerald-100"><span>{inCharleston ? `Choose 3 tiles · ${selected.length}/3 selected` : 'Your turn · choose a tile to discard'}</span><span>Garden Ladder: {targetProgress.dots}/6 groups · {targetProgress.flowers}/2 flowers · {targetProgress.jokers} jokers</span></div>
            <div className="flex items-end justify-center gap-[2px]">
              {hand.map((tile, index) => <AmericanTile key={`${tile}-${index}`} tile={tile} selected={selected.includes(index)} onClick={() => discard(index)} highlight={!inCharleston && index === hand.length - 1} />)}
            </div>
          </div>
        </div>
        <div className="flex h-10 items-center justify-between bg-[#15583e] px-3 text-sm font-semibold text-emerald-100/75"><span>American Mahjong · Original practice-card beta</span><span>Charleston · Jokers · Flowers · Full Screen</span></div>
      </div>

      <div className="min-h-[620px] bg-[radial-gradient(circle_at_center,#087052_0%,#00553e_62%,#003c2d_100%)] p-3 text-white min-[700px]:hidden">
        <div className="flex items-center justify-between"><strong className="text-xs tracking-[.18em]">AMERICAN MAHJONG</strong><button type="button" className="rounded bg-amber-300 px-3 py-1 text-xs font-black text-emerald-950" onClick={reset}>New</button></div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-[#003b2d]/90 p-4 text-center"><p className="text-lg font-black">{inCharleston ? `Charleston ${step + 1}` : 'Your turn'}</p><p className="mt-1 text-sm text-emerald-100">{inCharleston ? PASS_LABELS[step] : notice}</p><p className="mt-2 text-[10px] text-emerald-200">Original practice card · not an NMJL annual card</p></div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-emerald-100"><Opponent label="P4" /><Opponent label="P3" /><Opponent label="P2" /></div>
        <div className="mt-5 rounded-xl bg-black/25 p-3"><p className="text-center text-xs font-black">{inCharleston ? `Tap 3 tiles to pass · ${selected.length}/3` : 'Tap a tile to discard'}</p><div className="mt-3 flex flex-wrap justify-center gap-1">{hand.map((tile, index) => <AmericanTile key={`${tile}-${index}`} tile={tile} selected={selected.includes(index)} onClick={() => discard(index)} highlight={!inCharleston && index === hand.length - 1} compact />)}</div></div>
        {inCharleston && <button type="button" onClick={pass} className="mt-4 w-full rounded-xl bg-amber-300 py-3 text-lg font-black text-emerald-950">Pass 3 tiles</button>}
        <div className="mt-4 rounded-xl bg-black/20 p-3 text-xs"><strong>Practice card: Garden Ladder</strong><p className="mt-1 text-emerald-100">Flowers + three or more matching Dots groups. Jokers can only replace tiles inside groups of three or more.</p></div>
      </div>
    </section>
  );
}

function AmericanTile({ tile, selected = false, highlight = false, compact = false, onClick }: { tile: string; selected?: boolean; highlight?: boolean; compact?: boolean; onClick?: () => void }) {
  const classes = `${compact ? 'h-11 w-8 text-[9px]' : 'h-24 w-[4.25rem] text-3xl'} ${selected ? '-translate-y-4 ring-4 ring-amber-300' : highlight ? '-translate-y-2 ring-2 ring-amber-300' : ''}`;
  if (isStandardTile(tile)) return <span className={classes}><TileFace tile={tile} size={compact ? 'xs' : 'xl'} traditional onClick={onClick ? () => onClick() : undefined} highlight={selected || highlight} /></span>;
  return <button type="button" onClick={onClick} className={`inline-flex items-center justify-center rounded-lg border-2 border-slate-500 bg-[radial-gradient(circle,#d9ddd7_0%,#8e958d_100%)] font-black text-emerald-950 shadow-[0_4px_0_rgba(0,0,0,.3)] ${classes}`}>J<br /><span className="text-[.42em]">OKER</span></button>;
}

function Wall({ className, count, vertical = false }: { className: string; count: number; vertical?: boolean }) { return <div className={`absolute flex ${vertical ? 'flex-col' : ''} ${className}`}>{Array.from({ length: count }, (_, index) => <span key={index} className={vertical ? '-my-[5px]' : '-mx-[2px]'}><TileBack size="table" /></span>)}</div>; }
function CharlestonReserve({ className, vertical = false }: { className: string; vertical?: boolean }) { return <div className={`absolute z-[3] flex ${vertical ? 'flex-col' : ''} gap-4 ${className}`}>{Array.from({ length: 3 }, (_, index) => <span key={index} className="inline-block"><TileBack size="xl" /></span>)}</div>; }
function Avatar({ seat, score, className, human = false }: { seat: string; score: string; className: string; human?: boolean }) { return <div className={`absolute z-20 flex w-24 flex-col items-center ${className}`}><div className={`flex h-14 w-14 items-center justify-center rounded-lg border-4 ${human ? 'border-amber-300 bg-sky-500' : 'border-white bg-violet-500'} text-xs font-black`}>{seat}</div><div className="mt-1 rounded-full bg-black/40 px-2 py-0.5 text-xs font-black text-amber-100">G {score}</div></div>; }
function Opponent({ label }: { label: string }) { return <div className="rounded-full bg-black/35 p-2"><span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 font-black">{label}</span><span className="ml-1 font-black text-amber-100">8900</span></div>; }
function TableButton({ children, onClick, active = false }: { children: ReactNode; onClick: () => void; active?: boolean }) { return <button type="button" onClick={onClick} className={`h-9 rounded-lg border px-4 text-xs font-black ${active ? 'border-amber-300 bg-amber-300 text-emerald-950' : 'border-white/10 bg-[#07553b] text-white'}`}>{children}</button>; }
