'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import TileFace, { TileBack, useTraditionalTilePreload } from './TileFace';
import { sortTiles, tileFace, type Tile } from '@/lib/mahjong/tiles';
import { americanClosestLine, applyAmericanPass, canExchangeJoker, claimAmericanDiscard, claimAmericanMahJong, createAmericanGame, decideSecondCharleston, declareAmericanMahJong, exchangeAmericanJoker, getPracticeCard, legalAmericanClaims, passAmericanClaims, playAmericanDiscard, rankAmericanLines, type AmericanGameState } from '@/lib/mahjong/american';
import { playMahjongOpeningSequence, playMahjongSound, primeMahjongAudio, stopMahjongSpeech } from '@/lib/mahjong/sound';
import MahjongAccessibilityPanel, { useMahjongPreferences } from './MahjongAccessibilityPanel';
import { trackMahjongEvent } from '@/lib/mahjong/telemetry';

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
  const tableRef = useRef<HTMLElement>(null);
  const [game, setGame] = useState<AmericanGameState>(() => createAmericanGame(20260813));
  const [selected, setSelected] = useState<number[]>([]);
  const [step, setStep] = useState<CharlestonStep>(0);
  const [lastDiscard, setLastDiscard] = useState<string | null>(null);
  const [pinnedCardId, setPinnedCardId] = useState<string | null>(null);
  const [autoSort, setAutoSort] = useState(true);
  const [notice, setNotice] = useState('Choose exactly three tiles to begin the Charleston.');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [jokerExchangeMeld, setJokerExchangeMeld] = useState<number | null>(null);
  const { preferences, setPreference } = useMahjongPreferences();
  const [showAccessibility, setShowAccessibility] = useState(false);
  const soundEnabled = preferences.soundEnabled;

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(document.fullscreenElement === tableRef.current);
    document.addEventListener('fullscreenchange', syncFullscreenState);
    syncFullscreenState();
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  const enterFullscreen = () => {
    const table = tableRef.current;
    if (!table) return;
    setIsFullscreen(true);
    trackMahjongEvent('mahjong_fullscreen', { variant: 'american' });
    void table.requestFullscreen().catch(() => setIsFullscreen(false));
  };

  const toggleSound = () => {
    primeMahjongAudio();
    const next = !soundEnabled;
    if (!next) stopMahjongSpeech();
    setPreference('soundEnabled', next);
    if (next) playMahjongSound('toggle', undefined, 'english');
    trackMahjongEvent('mahjong_sound_changed', { variant: 'american', enabled: next });
  };

  const hand = autoSort ? sortAmerican(game.players[0].hand) : game.players[0].hand;
  const deal = { hand: [], wall: game.wall };
  const inCharleston = game.phase === 'charleston';
  const fullHand = [...game.players[0].hand, ...game.players[0].melds.flatMap((meld) => meld.tiles)];
  const rankedLines = rankAmericanLines(game, fullHand);
  // Every line is live; the panel follows whichever one the hand is closest to
  // until the player pins one to work towards.
  const card = pinnedCardId ? getPracticeCard(pinnedCardId) : americanClosestLine(game, fullHand);
  const claims = legalAmericanClaims(game);
  const selectedTiles = selected.map((index) => hand[index]).filter(Boolean);
  const openingStep = game.phase === 'charleston'
    ? game.charlestonRound === 1 ? 1 : 2
    : game.phase === 'second-charleston-choice' ? 2
      : game.phase === 'courtesy' ? 3 : 4;
  const exchangeMeld = jokerExchangeMeld === null ? null : game.players[0].melds[jokerExchangeMeld];
  const exchangeNatural = exchangeMeld?.tile;
  const canConfirmJokerExchange = Boolean(exchangeMeld && exchangeNatural && canExchangeJoker(exchangeMeld, exchangeNatural) && game.players[0].hand.includes(exchangeNatural));
  const targetProgress = useMemo(() => {
    const all = [...hand, ...game.players[0].melds.flatMap((meld) => meld.tiles)];
    let remainingJokers = all.filter((tile) => tile.startsWith('j')).length;
    const groups = card.groups.map((group) => {
      const natural = group.face === 'flower'
        ? all.filter((tile) => tile.startsWith('f')).length
        : all.filter((tile) => tile === group.face).length;
      const usedJokers = group.jokerAllowed ? Math.min(Math.max(0, group.count - natural), remainingJokers) : 0;
      remainingJokers -= usedJokers;
      return { label: group.label, current: Math.min(group.count, natural + usedJokers), required: group.count };
    });
    return {
      jokers: all.filter((tile) => tile.startsWith('j')).length,
      flowers: all.filter((tile) => tile.startsWith('f')).length,
      dots: Math.min(6, all.filter((tile) => tile === 'p2' || tile === 'p3' || tile === 'p4').length),
      groups
    };
  }, [hand, game.players, card]);

  const reset = () => {
    primeMahjongAudio();
    stopMahjongSpeech();
    if (soundEnabled) playMahjongOpeningSequence('english');
    const next = createAmericanGame(Date.now());
    setGame(next);
    setSelected([]);
    setStep(0);
    setLastDiscard(null);
    setJokerExchangeMeld(null);
    setNotice('Choose exactly three tiles to begin the Charleston.');
    trackMahjongEvent('mahjong_game_started', { variant: 'american', card: next.cardId, source: 'new_hand' });
  };

  const chooseCard = (cardId: string) => {
    setPinnedCardId(cardId || null);
    setNotice(cardId
      ? 'Tracking ' + getPracticeCard(cardId).title + '. You may still declare any line you complete.'
      : 'Tracking whichever line your hand is closest to.');
    trackMahjongEvent('mahjong_card_focused', { variant: 'american', card: cardId || 'auto' });
  };

  useEffect(() => {
    trackMahjongEvent('mahjong_game_started', { variant: 'american', card: game.cardId, source: 'initial_load' });
    // The initial board is intentionally tracked once; subsequent hands use reset/chooseCard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const secondCharleston = (play: boolean) => {
    try {
      const next = decideSecondCharleston(game, play);
      setGame(next); setStep(0); setSelected([]);
      setNotice(play ? 'Second Charleston: select 3 tiles to pass left.' : next.phase === 'courtesy' ? 'Courtesy Pass: select up to 3 tiles and press Pass.' : 'Choose a tile to discard.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Choice failed.'); }
  };
  const declare = () => {
    const result = declareAmericanMahJong(game);
    if (result.declared) { if (soundEnabled) playMahjongSound('win', undefined, 'english'); setGame(result.state); setNotice('MAH JONGG! ' + result.evaluation.message); onWin?.(result.state.settlement?.points ?? 0); }
    else setNotice('Cannot declare Mah Jongg: ' + result.evaluation.message);
  };
  const claim = (kind: 'pung' | 'kong') => {
    try {
      const next = claimAmericanDiscard(game, 0, kind);
      if (soundEnabled) playMahjongSound(kind === 'pung' ? 'pon' : 'kan', undefined, 'english'); setGame(next); setNotice('You called ' + kind + '. You must discard a tile.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Call failed.'); }
  };
  const claimMahJongg = () => {
    try {
      const result = claimAmericanMahJong(game);
      if (!result.declared) { setNotice(result.evaluation.message); return; }
      if (soundEnabled) playMahjongSound('win', undefined, 'english'); setGame(result.state); setNotice('MAH JONGG! ' + result.evaluation.message); onWin?.(result.state.settlement?.points ?? 0);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Mah Jongg claim failed.'); }
  };
  const passClaims = () => {
    try {
      const next = passAmericanClaims(game);
      setGame(next); setNotice(describeTableTurn(next));
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Pass failed.'); }
  };
  const swapJoker = (meldIndex: number) => {
    const meld = game.players[0].melds[meldIndex];
    const replacement = meld?.tile;
    if (!replacement) return;
    try {
      const next = exchangeAmericanJoker(game, 0, 0, meldIndex, replacement);
      setGame(next); setJokerExchangeMeld(null); setNotice('Joker exchanged: the matching natural tile entered the exposed group.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Joker exchange failed: hold the exact matching tile first.'); }
  };

  const pass = () => {
    if (game.phase === 'courtesy' && selected.length > 3) {
      setNotice('Courtesy Pass accepts at most 3 tiles.');
      return;
    }
    if (game.phase === 'charleston' && selected.length !== 3) {
      setNotice('Select exactly 3 tiles before passing.');
      return;
    }
    try {
      const direction = game.phase === 'courtesy' ? 'right' : game.charlestonRound === 2 ? (['left', 'across', 'right'] as const)[game.passIndex] : (['right', 'across', 'left'] as const)[game.passIndex];
      const next = applyAmericanPass(game, selectedTiles, direction);
      if (soundEnabled) playMahjongSound('draw', undefined, 'english');
      setGame(next);
      setSelected([]);
      if (next.phase === 'second-charleston-choice') { setStep(3); setNotice('First Charleston complete. Choose whether to play the second Charleston.'); }
      else if (next.phase === 'courtesy') { setStep(3); setNotice('Courtesy Pass: select zero to three tiles, then pass.'); }
      else if (next.phase === 'turn') { setStep(3); setNotice('Charleston complete. You are East: choose one tile to discard.'); }
      else { setStep((value) => (value + 1) as CharlestonStep); setNotice('Passed. ' + PASS_LABELS[next.passIndex]); }
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Pass failed.'); }
  };

  const discard = (index: number) => {
    if (inCharleston || game.phase === 'courtesy') {
      setSelected((current) => current.includes(index) ? current.filter((item) => item !== index) : current.length === 3 ? [...current.slice(1), index] : [...current, index]);
      return;
    }
    const tile = hand[index];
    try {
      const next = playAmericanDiscard(game, tile);
      primeMahjongAudio(); if (soundEnabled) playMahjongSound('discard', tile as Tile, 'english'); setGame(next); setLastDiscard(tile); setNotice(describeTableTurn(next));
      setNotice(`You discarded ${tile.startsWith('j') ? 'a Joker' : tileFace(tile as Tile)}. The three bots used their actual concealed hands and the same wall.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Discard failed.'); }
  };

  return (
    <section ref={tableRef} data-high-contrast={preferences.highContrast} data-reduced-motion={preferences.reducedMotion} data-tile-scale={preferences.tileScale} className={`mahjong-table-shell ${isFullscreen ? 'mahjong-table-shell--fullscreen' : ''} overflow-hidden rounded-xl bg-[#176845] p-0 shadow-[0_24px_60px_rgba(0,45,31,.35)] lg:p-3`}>
      {/* A browser at 110–125% zoom often reports <1024 CSS pixels.  The
          tabletop must still be the default on desktop-sized screens; only
          genuinely narrow phones use the compact interaction layout. */}
      <div className="mahjong-desktop-shell hidden min-w-[700px] min-[700px]:block" style={isFullscreen ? { display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 16px)' } : undefined}>
        <div className="mahjong-table-toolbar mb-2 flex h-11 items-center justify-between gap-3" style={isFullscreen ? { flex: '0 0 44px', marginBottom: 0 } : undefined}>
          <div className="flex gap-2">
            <TableButton onClick={reset}>↻ New Game</TableButton>
            <TableButton onClick={() => setAutoSort((value) => !value)} active={autoSort}>Sort By Suit</TableButton>
            <TableButton onClick={toggleSound} active={soundEnabled}>{soundEnabled ? 'Sound On' : 'Sound Off'}</TableButton>
            <TableButton onClick={() => setShowAccessibility(true)}>Aa</TableButton>
            <select aria-label="Practice line to track" value={pinnedCardId ?? ''} onChange={(event) => chooseCard(event.target.value)} className="h-9 rounded-lg border border-white/10 bg-[#07553b] px-3 text-xs font-black text-white">
              <option value="">Closest line (auto)</option>
              {rankedLines.map(({ card: item, distance }) => <option key={item.id} value={item.id}>{item.title} · {item.points} · {distance} away</option>)}
            </select>
            <TableButton onClick={() => setNotice(card.description + ' Jokers never fill flowers or pairs.')}>◇ Practice Card</TableButton>
          </div>
          <div className="flex items-center gap-3 text-emerald-100"><span className="text-xs font-black">ORIGINAL PRACTICE CARD</span><span className="text-2xl">⚙</span></div>
        </div>

        <div className="mahjong-desktop-board relative h-[720px] overflow-hidden border-[5px] border-[#032f22] bg-[#00553e] shadow-[inset_0_0_90px_rgba(0,30,22,.34)]" style={isFullscreen ? { height: 'auto', minHeight: 0, flex: '1 1 0%' } : undefined}>
          <div className="absolute inset-y-0 left-0 w-[11%] bg-[linear-gradient(105deg,#0b0a08_0%,#1b1914_58%,transparent_59%)]" />
          <div className="absolute inset-y-0 right-0 w-[11%] bg-[linear-gradient(255deg,#0b0a08_0%,#1b1914_58%,transparent_59%)]" />
          <div className="absolute left-4 top-3 text-xl font-semibold leading-6 text-emerald-100/45">NMJL-STYLE<br />PRACTICE<br />Rate: 10</div>
          <p className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full bg-[#003d2f]/85 px-3 py-1 text-[10px] font-bold tracking-wide text-emerald-50">Original practice table · all three opponents are AI · not an NMJL annual card</p>

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

          <div className="absolute left-1/2 top-[16%] z-30 flex -translate-x-1/2 gap-1 rounded-full bg-[#002f24]/90 p-1 text-[10px] font-black shadow-lg">
            {['1 First Charleston', '2 Optional second', '3 Courtesy pass', '4 Play'].map((label, index) => {
              const number = index + 1;
              return <span key={label} className={`rounded-full px-2 py-1 ${number === openingStep ? 'bg-amber-300 text-emerald-950' : number < openingStep ? 'bg-emerald-500/35 text-emerald-50' : 'text-emerald-100/65'}`}>{label}</span>;
            })}
          </div>

          <div className="pointer-events-none absolute left-[28%] right-[28%] top-[18%] h-[48%] border border-[#003d2f]" />
          <div className="absolute left-1/2 top-[45%] z-10 flex h-40 w-52 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border-[5px] border-[#20222d] bg-[#07090d] text-center shadow-xl">
            <span className="text-[11px] font-black tracking-[.26em] text-cyan-300">AMERICAN</span>
            <strong className="mt-2 text-2xl font-normal text-cyan-100">{game.phase === 'second-charleston-choice' ? 'Choose round 2' : game.phase === 'courtesy' ? 'Courtesy Pass' : inCharleston ? `Charleston ${game.charlestonRound}-${step + 1}/3` : 'Your Turn'}</strong>
            <span className="mt-1 text-4xl font-light text-cyan-200">{deal.wall.length}</span>
            <span className="mt-1 text-[10px] font-bold text-emerald-200">tiles left</span>
          </div>

          {(inCharleston || game.phase === 'second-charleston-choice' || game.phase === 'courtesy' || game.phase === 'claim') && <div className="absolute left-1/2 top-[46%] z-20 w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-emerald-200/15 bg-[#002f24]/95 px-6 py-5 text-center shadow-2xl">
            <p className="text-[2rem] font-black leading-tight text-amber-50">{game.phase === 'second-charleston-choice' ? 'Second Charleston?' : game.phase === 'courtesy' ? 'Courtesy Pass' : inCharleston ? `Charleston ${game.charlestonRound}-${step + 1}` : 'Original Practice Card'}</p>
            <p className="mt-1 text-[1.45rem] font-semibold leading-tight text-emerald-100">{game.phase === 'second-charleston-choice' ? 'Optional · left, across, right' : game.phase === 'courtesy' ? 'Pass zero to three tiles to your right' : inCharleston ? PASS_LABELS[step].replace(' · ', ': ') : card.title + ' · ' + card.difficulty + ' · ' + card.points + ' points'}</p>
            <p className="mt-2 text-xs font-bold text-emerald-200/80">{notice}</p>
          </div>}
          {game.phase === 'turn' && <div className="absolute left-1/2 top-[57%] z-20 -translate-x-1/2 rounded-full bg-[#002f24]/85 px-4 py-2 text-center text-xs font-bold text-emerald-100 shadow-lg">{notice}</div>}
          <div className="absolute right-[12%] top-[58%] z-20 w-56 rounded-xl border border-emerald-100/15 bg-[#002f24]/90 p-3 text-xs text-emerald-50 shadow-xl">
            <p className="font-black uppercase tracking-[.13em] text-amber-200">{card.title} · {card.points} points</p>
            <div className="mt-2 space-y-1.5">{targetProgress.groups.map((group) => <div key={group.label} className="flex items-center justify-between gap-2"><span className="truncate">{group.label}</span><strong className={group.current === group.required ? 'text-emerald-300' : 'text-amber-100'}>{group.current}/{group.required}</strong></div>)}</div>
            <p className="mt-2 border-t border-white/10 pt-2 text-[10px] text-emerald-100/70">{targetProgress.jokers} Joker{targetProgress.jokers === 1 ? '' : 's'} held · only groups of 3+ may use them.</p>
          </div>

          <div className="absolute bottom-[20%] left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 rounded-xl bg-transparent p-3">
            {inCharleston && selectedTiles.map((tile, index) => <AmericanTile key={`${tile}-${index}`} tile={tile} selected />)}
            {inCharleston && <button type="button" onClick={pass} className="h-20 min-w-48 -skew-x-6 rounded-2xl border-2 border-emerald-950/40 bg-[#b7c8be] px-9 text-[2.15rem] font-black text-white shadow-[inset_0_-5px_0_rgba(0,0,0,.2),0_6px_10px_rgba(0,0,0,.35)]"><span className="inline-block skew-x-6">Pass</span></button>}
            {game.phase === 'second-charleston-choice' && <><button type="button" onClick={() => secondCharleston(true)} className="rounded-xl bg-amber-300 px-5 py-3 font-black text-emerald-950">Play second</button><button type="button" onClick={() => secondCharleston(false)} className="rounded-xl bg-white/80 px-5 py-3 font-black text-emerald-950">Skip</button></>}
            {game.phase === 'courtesy' && <button type="button" onClick={pass} className="h-16 rounded-xl bg-amber-300 px-7 text-xl font-black text-emerald-950">Courtesy pass</button>}
            {game.phase === 'claim' && <div className="flex gap-2"><button type="button" onClick={passClaims} className="rounded-xl bg-white/80 px-4 py-3 font-black text-emerald-950">Pass</button>{claims.includes('mah-jongg') && <button type="button" onClick={claimMahJongg} className="rounded-xl bg-rose-500 px-4 py-3 font-black text-white">Mah Jongg</button>}{claims.includes('pung') && <button type="button" onClick={() => claim('pung')} className="rounded-xl bg-amber-300 px-4 py-3 font-black text-emerald-950">Pung</button>}{claims.includes('kong') && <button type="button" onClick={() => claim('kong')} className="rounded-xl bg-amber-300 px-4 py-3 font-black text-emerald-950">Kong</button>}</div>}
            {game.phase === 'turn' && <button type="button" onClick={declare} className="rounded-xl border-2 border-amber-100 bg-amber-300 px-5 py-3 font-black text-emerald-950 shadow-lg">Declare Mah Jongg</button>}
            {!inCharleston && <div className="text-sm font-black text-emerald-100">Last discard: {lastDiscard ? <AmericanTile tile={lastDiscard} /> : '—'}</div>}
          </div>

          <div className="absolute bottom-[25%] left-3 z-30 flex w-28 flex-col gap-2 rounded-lg border border-emerald-200/15 bg-[#063d30]/80 p-2 text-sm font-black text-emerald-100/75">
            <button type="button" onClick={() => setAutoSort(true)} className="rounded bg-black/20 px-2 py-2 text-left hover:bg-black/35">Sort By Suit</button>
            <button type="button" onClick={() => setAutoSort(false)} className="rounded bg-black/20 px-2 py-2 text-left hover:bg-black/35">Sort By Rank</button>
            <span className="border-t border-white/10 pt-2 text-xs">No Call <i className="float-right inline-block h-4 w-4 rounded-full bg-emerald-950" /></span>
            <span className="text-xs">Auto Discard <i className="float-right inline-block h-4 w-4 rounded-full bg-emerald-950" /></span>
          </div>
          {game.players[0].melds.length > 0 && <div className="absolute left-[16%] top-[67%] z-30 rounded-lg bg-black/35 p-2 text-xs text-emerald-50"><p className="mb-1 font-black">Your exposed groups</p>{game.players[0].melds.map((meld, index) => <div key={index} className="mb-1 flex items-center gap-1">{meld.tiles.map((tile, tileIndex) => <AmericanTile key={tileIndex} tile={tile} compact />)}{meld.jokerIndexes.length > 0 && <button type="button" onClick={() => setJokerExchangeMeld(index)} className="rounded bg-amber-300 px-2 py-1 font-black text-emerald-950">Exchange Joker</button>}</div>)}</div>}

          <div className="absolute bottom-2 left-[12%] right-[12%] z-20">
            <div className="mb-2 flex justify-between text-xs font-bold text-emerald-100"><span>{inCharleston || game.phase === 'courtesy' ? `Choose ${game.phase === 'courtesy' ? 'up to ' : ''}3 tiles · ${selected.length}/3 selected` : 'Your turn · choose a tile to discard'}</span><span>{card.title}: {targetProgress.dots}/6 groups · {targetProgress.flowers}/2 flowers · {targetProgress.jokers} jokers</span></div>
            <div className="flex items-end justify-center gap-[2px] overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {hand.map((tile, index) => <AmericanTile key={`${tile}-${index}`} tile={tile} selected={selected.includes(index)} onClick={() => discard(index)} highlight={!inCharleston && index === hand.length - 1} />)}
            </div>
          </div>
        </div>
        <div className="mahjong-table-footer flex h-10 items-center justify-between bg-[#15583e] px-3 text-sm font-semibold text-emerald-100/75" style={isFullscreen ? { flex: '0 0 40px' } : undefined}><span>American Mahjong · Original practice-card beta</span><button type="button" onClick={enterFullscreen} className="rounded px-2 py-1 font-black hover:bg-white/10">Full Screen</button></div>
      </div>

      <div className="min-h-[620px] bg-[radial-gradient(circle_at_center,#087052_0%,#00553e_62%,#003c2d_100%)] p-3 text-white min-[700px]:hidden" style={isFullscreen ? { minHeight: '100dvh' } : undefined}>
        <div className="flex items-center justify-between"><strong className="text-xs tracking-[.18em]">AMERICAN MAHJONG · AI</strong><div className="flex gap-1"><button type="button" className="rounded bg-amber-300 px-3 py-1 text-xs font-black text-emerald-950" onClick={reset}>New</button><button type="button" className="rounded border border-white/20 px-3 py-1 text-xs font-black" onClick={toggleSound}>{soundEnabled ? 'Sound' : 'Muted'}</button><button type="button" className="rounded border border-white/20 px-3 py-1 text-xs font-black" onClick={() => setShowAccessibility(true)}>Aa</button><button type="button" className="rounded border border-white/20 px-3 py-1 text-xs font-black" onClick={enterFullscreen}>Full</button></div></div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-[#003b2d]/90 p-4 text-center"><p className="text-lg font-black">{game.phase === 'second-charleston-choice' ? 'Second Charleston?' : game.phase === 'courtesy' ? 'Courtesy Pass' : inCharleston ? `Charleston ${game.charlestonRound}-${step + 1}` : 'Your turn'}</p><p className="mt-1 text-sm text-emerald-100">{notice}</p><p className="mt-2 text-[10px] text-emerald-200">{card.title} · original practice card · not an NMJL annual card</p></div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-emerald-100"><Opponent label="P4" /><Opponent label="P3" /><Opponent label="P2" /></div>
        <div className="mt-5 rounded-xl bg-black/25 p-3"><p className="text-center text-xs font-black">{inCharleston ? `Tap 3 tiles to pass · ${selected.length}/3` : 'Tap a tile to discard'}</p><div className="mt-3 flex flex-wrap justify-center gap-1">{hand.map((tile, index) => <AmericanTile key={`${tile}-${index}`} tile={tile} selected={selected.includes(index)} onClick={() => discard(index)} highlight={!inCharleston && index === hand.length - 1} compact />)}</div></div>
        {inCharleston && <button type="button" onClick={pass} className="mt-4 w-full rounded-xl bg-amber-300 py-3 text-lg font-black text-emerald-950">Pass 3 tiles</button>}
        {game.phase === 'second-charleston-choice' && <div className="mt-4 flex gap-2"><button type="button" onClick={() => secondCharleston(true)} className="flex-1 rounded-xl bg-amber-300 py-3 font-black text-emerald-950">Play second</button><button type="button" onClick={() => secondCharleston(false)} className="flex-1 rounded-xl bg-white/80 py-3 font-black text-emerald-950">Skip</button></div>}
        {game.phase === 'courtesy' && <button type="button" onClick={pass} className="mt-4 w-full rounded-xl bg-amber-300 py-3 text-lg font-black text-emerald-950">Courtesy Pass</button>}
        {!inCharleston && game.phase === 'turn' && <button type="button" onClick={declare} className="mt-4 w-full rounded-xl border border-amber-100 bg-amber-300 py-3 text-lg font-black text-emerald-950">Declare Mah Jongg</button>}
        {game.phase === 'claim' && <div className="mt-4 grid grid-cols-3 gap-2"><button type="button" onClick={passClaims} className="rounded-xl bg-white/80 py-3 font-black text-emerald-950">Pass</button>{claims.includes('mah-jongg') && <button type="button" onClick={claimMahJongg} className="rounded-xl bg-rose-500 py-3 font-black text-white">Mah Jongg</button>}{claims.includes('pung') && <button type="button" onClick={() => claim('pung')} className="rounded-xl bg-amber-300 py-3 font-black text-emerald-950">Pung</button>}{claims.includes('kong') && <button type="button" onClick={() => claim('kong')} className="rounded-xl bg-amber-300 py-3 font-black text-emerald-950">Kong</button>}</div>}
        <div className="mt-4 rounded-xl bg-black/20 p-3 text-xs"><strong>Practice card: Garden Ladder</strong><p className="mt-1 text-emerald-100">Flowers + three or more matching Dots groups. Jokers can only replace tiles inside groups of three or more.</p></div>
        {game.players[0].melds.length > 0 && <div className="mt-3 rounded-xl bg-black/20 p-3 text-xs"><strong>Exposed groups</strong>{game.players[0].melds.map((meld, index) => <div key={index} className="mt-2 flex items-center gap-1">{meld.tiles.map((tile, tileIndex) => <AmericanTile key={tileIndex} tile={tile} compact />)}{meld.jokerIndexes.length > 0 && <button type="button" onClick={() => setJokerExchangeMeld(index)} className="rounded bg-amber-300 px-2 py-1 font-black text-emerald-950">Exchange Joker</button>}</div>)}</div>}
      </div>
      {jokerExchangeMeld !== null && exchangeMeld && exchangeNatural && <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/65 p-4">
        <div className="w-full max-w-md rounded-2xl border-2 border-amber-200 bg-[#f5f0df] p-5 text-emerald-950 shadow-2xl">
          <h2 className="text-center text-2xl font-black">Joker exchange</h2>
          <p className="mt-2 text-center text-sm">Replace the exposed Joker with its matching natural tile, then take the Joker into your hand.</p>
          <div className="mt-4 flex justify-center gap-2">{exchangeMeld.tiles.map((tile, index) => <AmericanTile key={`${tile}-${index}`} tile={tile} compact />)}</div>
          <div className="mt-4 rounded-xl bg-emerald-950/10 p-3 text-sm"><strong>Required replacement: {tileFace(exchangeNatural as Tile)}</strong><p className="mt-1">{canConfirmJokerExchange ? 'You hold the matching natural tile. This exchange is legal.' : 'You do not currently hold the matching natural tile, so this exchange is not legal yet.'}</p></div>
          <div className="mt-4 flex gap-2"><button type="button" onClick={() => setJokerExchangeMeld(null)} className="flex-1 rounded-xl border border-emerald-900/30 py-3 font-black">Cancel</button><button type="button" disabled={!canConfirmJokerExchange} onClick={() => swapJoker(jokerExchangeMeld)} className="flex-1 rounded-xl bg-amber-300 py-3 font-black disabled:cursor-not-allowed disabled:opacity-45">Exchange</button></div>
        </div>
      </div>}
      {game.phase === 'ended' && <ResultReview game={game} onNew={reset} />}
      {showAccessibility && <MahjongAccessibilityPanel preferences={preferences} onChange={(key, value) => { setPreference(key, value); trackMahjongEvent('mahjong_accessibility_changed', { setting: key, value: String(value) }); }} onClose={() => setShowAccessibility(false)} />}
    </section>
  );
}

function AmericanTile({ tile, selected = false, highlight = false, compact = false, onClick }: { tile: string; selected?: boolean; highlight?: boolean; compact?: boolean; onClick?: () => void }) {
  const classes = `${compact ? 'h-11 w-8 text-[9px]' : 'h-20 w-14 text-2xl'} ${selected ? '-translate-y-4 ring-4 ring-amber-300' : highlight ? '-translate-y-2 ring-2 ring-amber-300' : ''}`;
  if (isStandardTile(tile)) return <span className={classes}><TileFace tile={tile} size={compact ? 'xs' : 'xl'} traditional onClick={onClick ? () => onClick() : undefined} highlight={selected || highlight} /></span>;
  return <button type="button" onClick={onClick} className={`inline-flex items-center justify-center rounded-lg border-2 border-slate-500 bg-[radial-gradient(circle,#d9ddd7_0%,#8e958d_100%)] font-black text-emerald-950 shadow-[0_4px_0_rgba(0,0,0,.3)] ${classes}`}>J<br /><span className="text-[.42em]">OKER</span></button>;
}

function Wall({ className, count, vertical = false }: { className: string; count: number; vertical?: boolean }) { return <div className={`absolute flex ${vertical ? 'flex-col' : ''} ${className}`}>{Array.from({ length: count }, (_, index) => <span key={index} className={vertical ? '-my-[5px]' : '-mx-[2px]'}><TileBack size="table" /></span>)}</div>; }
function CharlestonReserve({ className, vertical = false }: { className: string; vertical?: boolean }) { return <div className={`absolute z-[3] flex ${vertical ? 'flex-col' : ''} gap-4 ${className}`}>{Array.from({ length: 3 }, (_, index) => <span key={index} className="inline-block"><TileBack size="xl" /></span>)}</div>; }
function Avatar({ seat, score, className, human = false }: { seat: string; score: string; className: string; human?: boolean }) { return <div className={`absolute z-20 flex w-24 flex-col items-center ${className}`}><div className={`flex h-14 w-14 items-center justify-center rounded-lg border-4 ${human ? 'border-amber-300 bg-sky-500' : 'border-white bg-violet-500'} text-xs font-black`}>{seat}</div><div className="mt-1 rounded-full bg-black/40 px-2 py-0.5 text-xs font-black text-amber-100">G {score}</div></div>; }
function Opponent({ label }: { label: string }) { return <div className="rounded-full bg-black/35 p-2"><span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 font-black">{label}</span><span className="ml-1 font-black text-amber-100">8900</span></div>; }
function TableButton({ children, onClick, active = false }: { children: ReactNode; onClick: () => void; active?: boolean }) { return <button type="button" onClick={onClick} className={`h-9 rounded-lg border px-4 text-xs font-black ${active ? 'border-amber-300 bg-amber-300 text-emerald-950' : 'border-white/10 bg-[#07553b] text-white'}`}>{children}</button>; }
/** One line describing what the table did while the human was not acting. */
function describeTableTurn(game: AmericanGameState): string {
  if (game.phase === 'ended') {
    if (game.endReason === 'wall-exhausted') return 'The wall ran out. The hand is a draw.';
    const winner = game.settlement?.winner;
    return winner === 0 ? 'MAH JONGG!' : `Seat ${(winner ?? 0) + 1} declared Mah Jongg.`;
  }
  if (game.phase === 'claim') return 'A tile you can call is on the table.';
  const called = game.players.find((player) => player.melds.length > 0 && player.seat !== 0);
  if (called) return `Seat ${called.seat + 1} has an exposure. Your turn — choose a tile to discard.`;
  return 'The other players took their turns. Your turn — choose a tile to discard.';
}

function ResultReview({ game, onNew }: { game: AmericanGameState; onNew: () => void }) {
  const settlement = game.settlement;
  const winner = settlement?.winner;
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 p-4">
    <div className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-2xl border-4 border-amber-200 bg-[#f5f0df] p-5 text-emerald-950 shadow-2xl">
      <h2 className="text-center text-3xl font-black">{settlement ? 'MAH JONGG!' : 'WALL GAME'}</h2>
      <p className="mt-1 text-center font-bold">{settlement ? `${settlement.reason} · ${settlement.points} points` : 'The wall ran out before anyone declared. Nobody scores this hand.'}</p>
      <p className="mt-3 text-sm font-bold">{settlement ? `Winner: Seat ${(winner ?? 0) + 1}. ` : ''}All four hands are revealed for a fair review.</p>
      {settlement && <div className="mt-3 rounded-xl bg-emerald-950/10 p-3 text-sm"><strong>Settlement ledger</strong><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{settlement.transfers.map((transfer, seat) => <span key={seat} className={`rounded-lg px-2 py-1 font-black ${transfer >= 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-800'}`}>Seat {seat + 1}: {transfer >= 0 ? '+' : ''}{transfer}</span>)}</div></div>}
      <div className="mt-3 grid gap-3 md:grid-cols-2">{game.players.map((player) => <div key={player.seat} className={`rounded-xl border p-3 ${player.seat === winner ? 'border-amber-400 bg-amber-50' : 'border-emerald-900/20 bg-white'}`}><p className="font-black">Seat {player.seat + 1} · {player.score >= 0 ? '+' : ''}{player.score}</p><div className="mt-2 flex flex-wrap gap-1">{[...player.hand, ...player.melds.flatMap((meld) => meld.tiles)].map((tile, index) => <AmericanTile key={index} tile={tile} compact />)}</div><p className="mt-2 text-xs">Discards: {player.discards.join(', ') || 'none'}</p></div>)}</div>
      <div className="mt-4 rounded-xl bg-emerald-950/10 p-3 text-xs"><strong>Replay log</strong>{game.history.map((entry, index) => <p key={index}>{index + 1}. {entry}</p>)}</div>
      <button type="button" onClick={onNew} className="mt-4 w-full rounded-xl bg-[#087052] py-3 font-black text-white">New hand</button>
    </div>
  </div>;
}
