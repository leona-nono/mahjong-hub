'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import TileFace from './TileFace';
import {
  allowedSichuanVoidSuits,
  availableRegionalKans,
  canWinSichuan,
  canWinTaiwan,
  chooseRegionalDiscard,
  chooseSichuanVoidSuit,
  createRegionalGame,
  declareRegionalTsumo,
  declareRegionalKan,
  discardRegionalTile,
  drawRegionalTile,
  passUnansweredRegionalClaims,
  REGIONAL_CLAIM_TIMEOUT_MS,
  replayRegionalActions,
  submitRegionalClaim,
  submitSichuanExchange,
  startNextRegionalHand,
  taiwanReadyDiscards,
  type RegionalClaimOption,
  type RegionalGameState,
  type RegionalMeld,
  type RegionalRuleset
} from '@/lib/mahjong/regional';
import { playMahjongSound, primeMahjongAudio } from '@/lib/mahjong/sound';
import { tileFace, tileSuit, type Suit, type Tile } from '@/lib/mahjong/tiles';

const HUMAN = 0 as const;
const SEAT_NAMES = ['East', 'South', 'West', 'North'];

function botExchange(state: RegionalGameState, seat: 1 | 2 | 3): Tile[] {
  const hand = state.players[seat].hand;
  for (const suit of ['m', 'p', 's'] as const) {
    const tiles = hand.filter((tile) => tileSuit(tile) === suit).slice(0, 3);
    if (tiles.length === 3) return tiles;
  }
  return hand.slice(0, 3);
}

export default function RegionalMahjongTable({
  ruleset,
  onWin
}: {
  ruleset: RegionalRuleset;
  onWin?: (points: number) => void;
}) {
  const t = useTranslations('mahjong');
  const r = useTranslations('regional');
  const [state, setState] = useState<RegionalGameState>(() => {
    const fresh = createRegionalGame({ ruleset, humanSeat: HUMAN, seed: 1 });
    if (typeof window === 'undefined') return fresh;
    try {
      const encoded = new URLSearchParams(window.location.search).get('regionalReplay');
      if (!encoded) return fresh;
      const replay = JSON.parse(atob(encoded)) as { ruleset: RegionalRuleset; seed: number; actions: RegionalGameState['actions'] };
      if (replay.ruleset !== ruleset || !Array.isArray(replay.actions)) return fresh;
      const seeded = createRegionalGame({ ruleset, seed: replay.seed, humanSeat: HUMAN });
      return replayRegionalActions({ ...seeded, actions: replay.actions });
    } catch {
      return fresh;
    }
  });
  const [selectedExchange, setSelectedExchange] = useState<Tile[]>([]);
  const [reportedWin, setReportedWin] = useState(false);
  const [replayNotice, setReplayNotice] = useState('');
  const [readyIntent, setReadyIntent] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [largeTiles, setLargeTiles] = useState(false);
  const [showScoring, setShowScoring] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const tableShellRef = useRef<HTMLElement>(null);
  const isSichuan = ruleset === 'sichuan';
  const human = state.players[HUMAN];
  const isMyDiscard = state.phase === 'discard' && state.turn === HUMAN;
  const canTsumo = isMyDiscard && (isSichuan
    ? canWinSichuan(human.hand, human.voidSuit, human.melds.length)
    : canWinTaiwan(human.hand, human.melds.length));
  const myClaims: RegionalClaimOption[] | undefined = (state.phase === 'claim' || state.phase === 'added-kan-claim') && !state.submitted[HUMAN] ? state.claims[HUMAN] : undefined;
  const kanTiles = isMyDiscard ? availableRegionalKans(state, HUMAN) : [];
  const readyDiscards = useMemo(() => !isSichuan ? taiwanReadyDiscards(state, HUMAN) : [], [isSichuan, state]);
  // Both published regional tables use Mandarin tile call-outs.  Keeping this
  // explicit makes it impossible for them to inherit Hong Kong's Cantonese.
  const voiceLocale = 'mandarin' as const;
  const announceDiscard = (tile: Tile) => {
    if (!soundEnabled) return;
    primeMahjongAudio();
    playMahjongSound('discard', tile, voiceLocale);
  };

  const reset = () => {
    setState(createRegionalGame({ ruleset, humanSeat: HUMAN }));
    setSelectedExchange([]);
    setReportedWin(false);
    setReadyIntent(false);
    setPaused(false);
  };

  // Keep SSR deterministic, then replace the old fixed first-hand seed as
  // soon as the browser is ready. Replay URLs intentionally retain their seed.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('regionalReplay')) return;
    setState(createRegionalGame({ ruleset, humanSeat: HUMAN }));
  }, [ruleset]);

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(document.fullscreenElement === tableShellRef.current);
    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  const enterFullscreen = () => {
    const shell = tableShellRef.current;
    if (!shell) return;
    setIsFullscreen(true);
    void shell.requestFullscreen().catch(() => setIsFullscreen(false));
  };

  const shareReplay = async () => {
    const payload = btoa(JSON.stringify({ ruleset: state.ruleset, seed: state.seed, actions: state.actions }));
    const url = new URL(window.location.href);
    url.searchParams.set('regionalReplay', payload);
    try {
      await navigator.clipboard.writeText(url.toString());
      setReplayNotice(r('replayCopied'));
    } catch {
      setReplayNotice(r('replayCopyFallback'));
      window.history.replaceState(null, '', url);
    }
  };

  // Keep game mechanics synchronous/pure; only the table pacing belongs here.
  useEffect(() => {
    if (paused) return undefined;
    if (state.phase === 'over') return undefined;
    if (state.phase === 'exchange') {
      const bot = ([1, 2, 3] as const).find((seat) => !state.exchangeSelections[seat]);
      if (bot === undefined) return undefined;
      const timer = window.setTimeout(() => setState((current) => submitSichuanExchange(current, bot, botExchange(current, bot))), 180);
      return () => window.clearTimeout(timer);
    }
    if (state.phase === 'choose-void') {
      const bot = ([1, 2, 3] as const).find((seat) => !state.players[seat].voidSuit);
      if (bot === undefined) return undefined;
      const timer = window.setTimeout(() => setState((current) => {
        const suit = allowedSichuanVoidSuits(current.players[bot].hand)[0];
        return chooseSichuanVoidSuit(current, bot, suit);
      }), 180);
      return () => window.clearTimeout(timer);
    }
    if (state.phase === 'draw') {
      const timer = window.setTimeout(() => setState(drawRegionalTile), 280);
      return () => window.clearTimeout(timer);
    }
    if (state.phase === 'claim' || state.phase === 'added-kan-claim') {
      const bot = ([1, 2, 3] as const).find((seat) => state.claims[seat] && !state.submitted[seat]);
      if (bot !== undefined) {
        const timer = window.setTimeout(() => setState((current) => {
          const options = current.claims[bot] ?? [];
          return submitRegionalClaim(current, bot, options.find((option) => option.kind === 'ron') ?? { kind: 'pass', tiles: [] });
        }), 260);
        return () => window.clearTimeout(timer);
      }
      if (myClaims) {
        const timer = window.setTimeout(() => setState((current) => passUnansweredRegionalClaims(current, Date.now())), REGIONAL_CLAIM_TIMEOUT_MS);
        return () => window.clearTimeout(timer);
      }
      return undefined;
    }
    if (state.phase === 'discard' && state.players[state.turn].isBot) {
      const timer = window.setTimeout(() => setState((current) => {
        const seat = current.turn;
        const player = current.players[seat];
        const won = current.ruleset === 'sichuan'
          ? canWinSichuan(player.hand, player.voidSuit, player.melds.length)
          : canWinTaiwan(player.hand);
        if (won) return declareRegionalTsumo(current, seat);
        const tile = chooseRegionalDiscard(current, seat);
        announceDiscard(tile);
        return discardRegionalTile(current, seat, tile);
      }), difficulty === 'easy' ? 760 : difficulty === 'hard' ? 280 : 480);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [state, myClaims, paused, difficulty]);

  useEffect(() => {
    if (reportedWin || state.result?.kind !== 'win' || !state.result.winners.includes(HUMAN)) return;
    setReportedWin(true);
    onWin?.(state.result.tai ?? 1);
  }, [onWin, reportedWin, state.result]);

  const exchangeSuit = selectedExchange[0] ? tileSuit(selectedExchange[0]) : null;
  const voidOptions = useMemo(() => allowedSichuanVoidSuits(human.hand), [human.hand]);
  const toggleExchange = (tile: Tile) => {
    if (state.phase !== 'exchange') return;
    setSelectedExchange((current) => {
      if (current.length === 3 || (exchangeSuit && tileSuit(tile) !== exchangeSuit)) return current;
      const alreadySelected = current.filter((candidate) => candidate === tile).length;
      const available = human.hand.filter((candidate) => candidate === tile).length;
      if (alreadySelected >= available) return current;
      return [...current, tile];
    });
  };

  const seatNames = [r('seatEast'), r('seatSouth'), r('seatWest'), r('seatNorth')];
  const wallLeft = Math.max(0, state.replacementIndex - state.wallIndex + 1);
  const revealHands = state.phase === 'over' && state.result?.kind === 'win';
  // Taiwan hands have 16 tiles (17 after a draw), so the Hong Kong-sized XL
  // row overflows the board. Keep every tile comfortably readable while
  // fitting the full hand, including the separated drawn tile, on screen.
  const wideHand = human.hand.length > 14;
  const handTileSize = wideHand ? 'lg' as const : 'xl' as const;
  const suggestedDiscard = showHints && isMyDiscard ? chooseRegionalDiscard(state, HUMAN) : null;
  const actionButtons = (
    <div className="absolute bottom-[19%] left-1/2 z-30 flex max-w-[84%] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-xl border border-amber-200/50 bg-[#101711]/95 p-2 shadow-2xl">
      {state.phase === 'exchange' && <><span className="px-2 text-sm font-bold text-amber-100">{r('exchange', { n: selectedExchange.length })}</span><button type="button" disabled={selectedExchange.length !== 3} onClick={() => { setState((current) => submitSichuanExchange(current, HUMAN, selectedExchange)); setSelectedExchange([]); }} className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-black text-emerald-950 disabled:opacity-40">{r('exchangeAction')}</button><button type="button" onClick={() => setSelectedExchange([])} className="rounded-lg border border-white/30 px-4 py-2 text-sm font-bold text-white">{r('clear')}</button></>}
      {state.phase === 'choose-void' && !human.voidSuit && <><span className="px-2 text-sm font-bold text-amber-100">{r('chooseVoid')}</span>{voidOptions.map((suit) => <button key={suit} type="button" onClick={() => setState((current) => chooseSichuanVoidSuit(current, HUMAN, suit))} className="rounded-lg bg-amber-300 px-4 py-2 font-black text-emerald-950">{suit.toUpperCase()}</button>)}</>}
      {canTsumo && <button type="button" onClick={() => setState((current) => declareRegionalTsumo(current, HUMAN))} className="rounded-lg bg-rose-500 px-5 py-2 font-black text-white">{t('call.tsumo')}</button>}
      {!isSichuan && isMyDiscard && !human.declaredReady && readyDiscards.length > 0 && <button type="button" onClick={() => setReadyIntent((value) => !value)} className={`rounded-lg px-4 py-2 text-sm font-black ${readyIntent ? 'bg-emerald-700 text-white' : 'bg-amber-300 text-emerald-950'}`}>{r('declareReady')}</button>}
      {myClaims?.map((option, index) => <button key={`${option.kind}-${index}`} type="button" onClick={() => setState((current) => submitRegionalClaim(current, HUMAN, option))} className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-black text-emerald-950">{t(`call.${option.kind}`)}</button>)}
      {myClaims && <button type="button" onClick={() => setState((current) => submitRegionalClaim(current, HUMAN, { kind: 'pass', tiles: [] }))} className="rounded-lg border border-white/30 px-4 py-2 text-sm font-bold text-white">{t('call.pass')}</button>}
      {kanTiles.map((tile) => <button key={tile} type="button" onClick={() => setState((current) => declareRegionalKan(current, HUMAN, tile))} className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-black text-emerald-950">{t('call.kan')} {tileFace(tile)}</button>)}
    </div>
  );

  return (
    <section ref={tableShellRef} data-tile-scale={largeTiles ? 'large' : 'normal'} className={`mahjong-table-shell ${isFullscreen ? 'mahjong-table-shell--fullscreen' : ''} overflow-hidden rounded-xl bg-[#176845] p-0 text-white shadow-[0_22px_60px_rgba(2,44,34,.35)] lg:p-3 fullscreen:rounded-none`}>
      <div className="mahjong-desktop-shell flex min-w-[700px] flex-col" style={isFullscreen ? { height: 'calc(100dvh - 16px)' } : undefined}>
      <header className="mahjong-table-toolbar mb-2 flex h-11 items-center justify-between gap-3 rounded-xl bg-[#14704d] px-3" style={isFullscreen ? { flex: '0 0 44px', marginBottom: 0 } : undefined}>
        <div className="flex items-center gap-2">
          <TableToolButton onClick={() => setPaused((value) => !value)} active={paused}>{paused ? t('resume') : t('pause')}</TableToolButton>
          <TableToolButton onClick={reset}>↻ {t('newGame')}</TableToolButton>
          <TableToolButton onClick={() => setShowHints((value) => !value)} active={showHints}>◇ {t('hints')}</TableToolButton>
          <TableToolButton onClick={() => setSoundEnabled((value) => !value)} active={soundEnabled}>{soundEnabled ? t('soundOn') : t('soundOff')}</TableToolButton>
          <label className="flex h-9 items-center rounded-lg border border-white/10 bg-[#07553b] px-3 text-xs font-bold text-white">{t('rules')}<span className="ml-2 text-emerald-50">{isSichuan ? r('sichuanTitle') : r('taiwanTitle')}</span></label>
          <label className="flex h-9 items-center rounded-lg border border-white/10 bg-[#07553b] px-3 text-xs font-bold text-white">{t('ai')}<select value={difficulty} onChange={(event) => setDifficulty(event.target.value as 'easy' | 'normal' | 'hard')} className="ml-2 bg-transparent text-emerald-50 outline-none" aria-label={t('difficultyLabel')}><option className="text-slate-900" value="easy">{t('easy')}</option><option className="text-slate-900" value="normal">{t('normal')}</option><option className="text-slate-900" value="hard">{t('hard')}</option></select></label>
          <TableToolButton onClick={() => setLargeTiles((value) => !value)} active={largeTiles}>Aa</TableToolButton>
        </div>
        <span className="text-xs font-semibold text-emerald-100">{t('wallLeft', { n: wallLeft })}</span>
      </header>

      <div className="mahjong-desktop-board mahjong-desktop-board--seasonal relative h-[720px] overflow-hidden border-[5px] border-[#032f22] bg-[#00553e] shadow-[inset_0_0_90px_rgba(0,30,22,.34)]">
        <div className="absolute inset-y-0 left-0 w-[11%] bg-[linear-gradient(105deg,#0b0a08_0%,#1b1914_58%,transparent_59%)]" />
        <div className="absolute inset-y-0 right-0 w-[11%] bg-[linear-gradient(255deg,#0b0a08_0%,#1b1914_58%,transparent_59%)]" />
        <p className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full bg-[#003d2f]/85 px-3 py-1 text-[10px] font-bold tracking-wide text-emerald-50">{t('practiceTableAI')}</p>

        <div className="absolute left-1/2 top-8 -translate-x-1/2"><RegionalConcealedRack count={state.players[3].hand.length} tiles={revealHands ? state.players[3].hand : undefined} orientation="top" /></div>
        <div className="absolute left-[15%] top-1/2 -translate-y-1/2"><RegionalConcealedRack count={state.players[2].hand.length} tiles={revealHands ? state.players[2].hand : undefined} orientation="left" /></div>
        <div className="absolute right-[15%] top-1/2 -translate-y-1/2"><RegionalConcealedRack count={state.players[1].hand.length} tiles={revealHands ? state.players[1].hand : undefined} orientation="right" /></div>

        <RegionalPlayerBadge seat={3} active={state.turn === 3} className="right-[19%] top-[11%]" flowers={state.players[3].flowers} />
        <RegionalPlayerBadge seat={2} active={state.turn === 2} className="left-5 top-[39%]" flowers={state.players[2].flowers} />
        <RegionalPlayerBadge seat={1} active={state.turn === 1} className="right-5 top-[39%]" flowers={state.players[1].flowers} />
        {/* Keep the local player's badge in the lower-left safe area. The old
            placement overlapped West's revealed rack at end-of-hand. */}
        <RegionalPlayerBadge seat={0} active={state.turn === 0} className="bottom-[20%] left-[3%]" flowers={human.flowers} human />

        {/* The outer four sides are reserved for concealed hands.  Discards and
            exposed chi / pon / kan sets live in these four inner table areas,
            around the score display, so a played tile never drifts into a hand. */}
        <div className="pointer-events-none absolute left-[28%] right-[28%] top-[18%] h-[48%] border border-[#003d2f]">
        </div>
        <RegionalDiscardZone tiles={state.players[3].discards} melds={state.players[3].melds} className="left-1/2 top-[22%] -translate-x-1/2" orientation="top" />
        <RegionalDiscardZone tiles={state.players[2].discards} melds={state.players[2].melds} className="left-[27%] top-[32%]" orientation="left" />
        <RegionalDiscardZone tiles={state.players[1].discards} melds={state.players[1].melds} className="right-[27%] top-[32%]" orientation="right" />
        <RegionalDiscardZone tiles={human.discards} melds={human.melds} className="bottom-[24%] left-1/2 -translate-x-1/2" orientation="bottom" />

        <div className="absolute left-1/2 top-[45%] z-10 flex h-44 w-52 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border-[5px] border-[#20222d] bg-[#07090d] text-center shadow-[0_12px_20px_rgba(0,0,0,.45)]">
          <span className="text-[12px] font-black uppercase tracking-[.2em] text-cyan-300/75">{isSichuan ? r('sichuanTitle') : r('taiwanTitle')}</span>
          <strong className="mt-2 text-2xl font-normal text-cyan-200">{r('turnDealer', { turn: seatNames[state.turn], dealer: seatNames[state.dealer] })}</strong>
          <span className="mt-2 text-4xl font-light text-cyan-200">{wallLeft}</span>
        </div>
        {!isSichuan && human.flowers.length > 0 && <div className="absolute right-[12%] top-[57%] z-20 flex items-center gap-1 rounded-lg bg-amber-50/95 px-2 py-1 text-[10px] font-black text-emerald-950 shadow-lg"><span>{t('flowersLabel')}</span>{human.flowers.map((tile, index) => <TileFace key={`${tile}-${index}`} tile={tile} size="sm" traditional />)}</div>}
        {readyIntent && <p className="absolute bottom-[28%] left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#063d30]/95 px-3 py-1 text-xs font-bold text-amber-100">{r('readyHint')}</p>}
        {actionButtons}
        {state.phase === 'over' && state.result && <div className="absolute left-1/2 top-[56%] z-40 -translate-x-1/2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-slate-800 shadow-xl"><strong>{state.result.kind === 'win' ? r('winner', { seats: state.result.winners.map((seat) => seatNames[seat]).join(', ') }) : r('wallExhausted')}</strong>{state.result.tai !== undefined && <span className="ml-2">{state.result.tai} Tai</span>}<button type="button" onClick={() => setState(startNextRegionalHand)} className="ml-3 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-black text-white">{r('nextHand')}</button></div>}

        <div className={`absolute bottom-3 left-1/2 z-20 ${wideHand ? 'w-[96%]' : 'w-[88%]'} -translate-x-1/2`}><div className="mb-2 flex h-5 items-center justify-between px-1 text-xs font-semibold text-emerald-100/75"><span>{isMyDiscard ? t('yourTurnDiscard') : r('turnDealer', { turn: seatNames[state.turn], dealer: seatNames[state.dealer] })}</span>{isSichuan && human.voidSuit && <span>{r('forbidden', { suit: human.voidSuit.toUpperCase() })}</span>}</div><div className="flex items-end justify-center gap-[2px]">{human.hand.map((tile, index) => <span key={`${tile}-${index}`} className={index === human.hand.length - 1 ? 'ml-3' : ''}><TileFace tile={tile} size={handTileSize} traditional highlight={(state.phase === 'exchange' && selectedExchange.includes(tile)) || (readyIntent && readyDiscards.includes(tile)) || (isMyDiscard && (index === human.hand.length - 1 || tile === suggestedDiscard))} onClick={state.phase === 'exchange' ? toggleExchange : isMyDiscard ? (discarded) => { if (readyIntent && !readyDiscards.includes(discarded)) return; announceDiscard(discarded); setState((current) => discardRegionalTile(current, HUMAN, discarded, readyIntent)); setReadyIntent(false); } : undefined} /></span>)}</div></div>
      </div>
      <div className="mahjong-table-footer flex h-10 items-center justify-between bg-[#15583e] px-3 text-sm font-semibold text-emerald-100/75" style={isFullscreen ? { flex: '0 0 40px' } : undefined}><div className="flex items-center gap-3"><span>{r('scope')}</span><button type="button" onClick={shareReplay} className="rounded-full border border-emerald-100/50 px-3 py-1 font-bold text-emerald-50">{r('shareReplay')}</button>{replayNotice && <span className="text-emerald-100">{replayNotice}</span>}</div><div className="flex gap-2"><button type="button" onClick={() => setShowScoring(true)} className="rounded px-2 py-1 hover:bg-white/10">{t('scoringTips')}</button><button type="button" onClick={enterFullscreen} className="rounded px-2 py-1 hover:bg-white/10">{t('fullScreen')}</button></div></div>
      </div>
      {paused && <button type="button" onClick={() => setPaused(false)} className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 text-4xl font-semibold text-amber-100 backdrop-blur-[2px]">{t('resume')}</button>}
      {showScoring && <RegionalScoringTips isSichuan={isSichuan} onClose={() => setShowScoring(false)} t={t} r={r} />}
    </section>
  );
}

function TableToolButton({ children, onClick, active = false }: { children: React.ReactNode; onClick: () => void; active?: boolean }) {
  return <button type="button" onClick={onClick} className={`h-9 rounded-lg border px-4 text-xs font-black transition ${active ? 'border-amber-300 bg-amber-300 text-emerald-950' : 'border-white/10 bg-[#07553b] text-white hover:bg-[#096246]'}`}>{children}</button>;
}

function RegionalScoringTips({ isSichuan, onClose, t, r }: { isSichuan: boolean; onClose: () => void; t: ReturnType<typeof useTranslations>; r: ReturnType<typeof useTranslations> }) {
  const tips = isSichuan ? [r('scoreSichuanHand'), r('scoreSichuanKong'), r('scoreSichuanDraw')] : [r('scoreTaiwanHand'), r('scoreTaiwanFlowers'), r('scoreTaiwanSettlement')];
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-2xl bg-[#f4f0df] p-6 text-slate-900 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-black">{isSichuan ? r('sichuanTitle') : r('taiwanTitle')} {t('scoringTips')}</h2><button type="button" onClick={onClose} className="h-9 w-9 rounded-full bg-slate-900 text-white" aria-label={t('closeScoringTips')}>X</button></div><ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6">{tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></div></div>;
}

function RegionalConcealedRack({ count, tiles, orientation }: { count: number; tiles?: Tile[]; orientation: 'top' | 'left' | 'right' }) {
  const vertical = orientation !== 'top';
  return <div className={`mahjong-standing-rack mahjong-standing-rack--${orientation} flex ${vertical ? 'flex-col' : ''}`} aria-label={`Opponent concealed hand: ${count} tiles`}>{Array.from({ length: Math.min(count, 17) }, (_, index) => <span key={index} className={`mahjong-standing-tile mahjong-standing-tile--${orientation} ${vertical ? '-my-[5px]' : '-mx-[2px]'}`}>{tiles?.[index] ? <TileFace tile={tiles[index]} size="table" traditional /> : <span className={`mahjong-standing-tile__back mahjong-standing-tile__back--${orientation}`} />}</span>)}</div>;
}

function RegionalPlayerBadge({ seat, active, className, flowers, human = false }: { seat: 0 | 1 | 2 | 3; active: boolean; className: string; flowers: Tile[]; human?: boolean }) {
  const portrait = [3, 1, 2, 0][seat];
  const row = portrait > 1 ? 1 : 0;
  const column = portrait % 2;
  return <div className={`absolute z-20 flex w-24 flex-col items-center ${className}`}><div className={`relative overflow-hidden rounded-xl border-4 bg-[#f7f1df] shadow-lg ${active ? 'border-yellow-300' : 'border-[#e8ece3]'}`} aria-label={human ? 'You' : `Player ${seat + 1}`}><span className="relative block h-14 w-14 overflow-hidden rounded-[10px]"><img src="/images/mahjong/ai-avatars-default.webp" alt="" className="absolute h-[200%] w-[200%] max-w-none" style={{ left: `${-column * 100}%`, top: `${-row * 100}%` }} /></span></div>{flowers.length > 0 && <div className="mt-1 flex max-w-24 justify-center gap-px rounded bg-amber-50/90 p-0.5">{flowers.slice(0, 4).map((tile, index) => <TileFace key={`${tile}-${index}`} tile={tile} size="xs" traditional />)}</div>}</div>;
}

function RegionalDiscardZone({ tiles, melds, className, orientation }: { tiles: Tile[]; melds: RegionalMeld[]; className: string; orientation: 'top' | 'left' | 'right' | 'bottom' }) {
  const side = orientation === 'left' || orientation === 'right';
  const zoneClass = side
    ? 'h-[205px] w-[162px] grid-cols-3 grid-rows-5 px-3 py-2'
    : 'h-[112px] w-[270px] grid-cols-6 grid-rows-2 px-3 py-2';
  const exposedTiles = melds.flatMap((meld) => meld.tiles);
  const visibleDiscards = tiles.slice(-(exposedTiles.length > 0 ? 12 : 18));
  return (
    <div className={`regional-discard-zone absolute z-[5] ${zoneClass} ${className}`} aria-label={`Table area for ${orientation} player`}>
      <div className={`grid h-full content-center justify-items-center gap-0.5 ${side ? 'grid-cols-3 grid-rows-5' : 'grid-cols-6 grid-rows-2'}`}>
        {visibleDiscards.map((tile, index) => <TileFace key={`discard-${tile}-${index}`} tile={tile} size="sm" traditional muted />)}
      </div>
      {exposedTiles.length > 0 && <div className={`absolute flex flex-wrap justify-center gap-px rounded bg-black/10 p-0.5 ${side ? 'bottom-1 left-1 right-1' : 'bottom-0.5 left-2 right-2'}`}>{exposedTiles.map((tile, index) => <TileFace key={`meld-${tile}-${index}`} tile={tile} size="xs" traditional />)}</div>}
    </div>
  );
}
