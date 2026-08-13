'use client';

import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import TileFace, { TileBack } from './TileFace';
import { tilesRemaining, type ClaimOption, type GameState, type HongKongMode, type Seat, type SelfDrawEvaluation } from '@/lib/mahjong/engine';
import { tileFace, type Tile } from '@/lib/mahjong/tiles';
import { playMahjongSound, primeMahjongAudio } from '@/lib/mahjong/sound';
import { visibleDoraIndicators } from '@/lib/mahjong/riichi';

const HUMAN: Seat = 0;
const NAMES: Record<Seat, string> = { 0: 'YOU', 1: 'SOUTH', 2: 'WEST', 3: 'NORTH' };

export interface MobileMahjongTableProps {
  state: GameState;
  variant: 'hongkong' | 'riichi' | 'chinese-official';
  paused: boolean;
  soundEnabled: boolean;
  hongKongMode: HongKongMode;
  showHints: boolean;
  myTurn: boolean;
  myClaims?: ClaimOption[];
  hints: { shanten: number; waits: Tile[] } | null;
  canTsumo: boolean;
  tsumoEvaluation: SelfDrawEvaluation | null;
  kanTiles: Tile[];
  riichiDiscards: Tile[];
  roundLabel: string;
  onTogglePause: () => void;
  onHongKongMode: (mode: HongKongMode) => void;
  onToggleHints: () => void;
  onToggleSound: () => void;
  onNewGame: () => void;
  onNextHand: () => void;
  onDiscard: (tile: Tile) => void;
  onClaim: (option: ClaimOption) => void;
  onTsumo: () => void;
  onKan: (tile: Tile) => void;
  onRiichi?: () => void;
  onFullscreen: () => void;
}

export default function MobileMahjongTable(props: MobileMahjongTableProps) {
  const {
    state, variant, paused, soundEnabled, hongKongMode, showHints, myTurn, myClaims, hints,
    canTsumo, tsumoEvaluation, kanTiles, riichiDiscards, roundLabel, onTogglePause,
    onToggleHints, onToggleSound, onHongKongMode, onNewGame, onNextHand, onDiscard, onClaim, onTsumo,
    onKan, onRiichi, onFullscreen
  } = props;
  const human = state.players[HUMAN];
  const isRiichi = variant === 'riichi';
  const isMcr = variant === 'chinese-official';
  const voiceLocale = isRiichi ? 'japanese' as const : 'cantonese' as const;
  const locale = useLocale();
  const isZh = locale.startsWith('zh');
  const humanWon = state.result?.winner === HUMAN || state.result?.winners?.some((winner) => winner.seat === HUMAN);
  const resultScore = state.result?.winner === HUMAN
    ? state.result.score
    : state.result?.winners?.find((winner) => winner.seat === HUMAN)?.score;
  const winnerSeat = state.result?.winner ?? state.result?.winners?.[0]?.seat;
  const winnerScore = state.result?.score ?? state.result?.winners?.[0]?.score;
  const opponentWon = state.phase === 'over' && winnerSeat !== undefined && winnerSeat !== HUMAN;
  const revealedTiles = winnerSeat === undefined ? [] : [
    ...state.players[winnerSeat].hand,
    ...(state.result?.loser !== undefined && state.lastDiscard ? [state.lastDiscard.tile] : [])
  ];
  const winnerMelds = winnerSeat === undefined ? [] : state.players[winnerSeat].melds;
  const hintStatus = (() => {
    if (!showHints || !hints) return null;
    if (tsumoEvaluation?.complete) {
      const fan = tsumoEvaluation.score?.total ?? 0;
      if (tsumoEvaluation.legal) return isZh ? `可以胡牌 · ${fan} 番` : `WIN AVAILABLE · ${fan} FAN`;
      return isZh
        ? `牌型已成 · 当前 ${fan}/${tsumoEvaluation.minimum} 番`
        : `COMPLETE · ${fan}/${tsumoEvaluation.minimum} FAN`;
    }
    if (hints.shanten <= 0) {
      const waits = hints.waits.map(tileFace).join(' ');
      return isZh ? `已经听牌${waits ? ` · 等 ${waits}` : ''}` : `READY${waits ? ` · ${waits}` : ''}`;
    }
    return isZh ? `距听牌 ${hints.shanten} 步` : `${hints.shanten} AWAY`;
  })();

  return (
    <div className="relative h-[calc(100dvh-7rem)] min-h-[520px] overflow-hidden rounded-xl bg-[#004b38] text-white lg:hidden landscape:fixed landscape:inset-0 landscape:z-[60] landscape:h-dvh landscape:min-h-0 landscape:rounded-none">
      <div className="flex h-12 items-center justify-between gap-1 border-b border-white/10 bg-[#0b6548] px-2">
        <div className="flex gap-1">
          <Tool onClick={onTogglePause}>{paused ? 'Play' : 'Pause'}</Tool>
          <Tool onClick={() => { primeMahjongAudio(); onNewGame(); }}>New</Tool>
          <Tool onClick={onToggleHints} active={showHints}>Hint</Tool>
          <Tool onClick={onToggleSound} active={soundEnabled}>{soundEnabled ? 'Sound' : 'Muted'}</Tool>
        </div>
        <div className="flex gap-1">
          {variant === 'hongkong' && (
            <Tool
              onClick={() => onHongKongMode(hongKongMode === 'casual' ? 'standard' : 'casual')}
              active={hongKongMode === 'casual'}
            >
              {hongKongMode === 'casual' ? (isZh ? '休闲' : 'Casual') : (isZh ? '标准3番' : '3 Fan')}
            </Tool>
          )}
          <Tool onClick={onFullscreen}>Full</Tool>
        </div>
      </div>

      <div className="relative h-[calc(100%-3rem)] overflow-hidden bg-[radial-gradient(circle_at_center,#087052_0%,#00553e_58%,#003c2d_100%)] landscape:h-[calc(100dvh-3rem)]">
        <Opponent state={state} seat={3} className="left-1/2 top-2 -translate-x-1/2" />
        <Opponent state={state} seat={2} className="left-1 top-[24%]" />
        <Opponent state={state} seat={1} className="right-1 top-[24%]" />

        <Rack count={state.players[3].hand.length} className="left-1/2 top-[18%] -translate-x-1/2" />
        <Rack count={9} vertical className="left-2 top-[37%]" />
        <Rack count={9} vertical className="right-2 top-[37%]" />

        <Discards state={state} seat={3} className="left-1/2 top-[28%] -translate-x-1/2" />
        <Discards state={state} seat={2} className="left-[18%] top-[39%]" />
        <Discards state={state} seat={1} className="right-[18%] top-[39%]" />
        <Discards state={state} seat={0} className="bottom-[25%] left-1/2 -translate-x-1/2" />

        <div className="absolute left-1/2 top-[44%] z-10 flex h-24 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border-4 border-[#242632] bg-[#080b10] shadow-xl">
          <span className="text-[9px] font-bold tracking-[.2em] text-cyan-300">{isRiichi ? 'RIICHI' : isMcr ? 'CHINESE MCR' : 'HONG KONG'}</span>
          <strong className="text-lg font-medium text-cyan-100">{roundLabel}</strong>
          <span className="text-2xl font-light text-cyan-200">{tilesRemaining(state)}</span>
          <span className="absolute -bottom-3 rounded bg-rose-600 px-2 text-[9px] font-black">{NAMES[state.turn]}</span>
        </div>

        {isRiichi && (
          <div className="absolute right-[23%] top-[29%] rounded-md bg-black/30 p-1 text-center text-[8px] font-bold text-amber-200">
            <span className="block">DORA</span>
            <div className="flex gap-px">{visibleDoraIndicators(state).map((tile, index) => <TileFace key={`${tile}-${index}`} tile={tile} size="sm" traditional />)}</div>
          </div>
        )}

        {(myClaims || tsumoEvaluation?.complete || canTsumo || kanTiles.length > 0 || riichiDiscards.length > 0) && (
          <div className="absolute bottom-[17%] left-1/2 z-30 flex max-w-[96%] -translate-x-1/2 flex-wrap justify-center gap-1 rounded-xl bg-black/75 p-1.5">
            {myClaims?.map((option, index) => (
              <Action key={option.kind + index} onClick={() => onClaim(option)}>{claimLabel(option.kind, isZh)}</Action>
            ))}
            {myClaims && <Action onClick={() => onClaim({ kind: 'pass', tiles: [] })}>{isZh ? '过' : 'PASS'}</Action>}
            {tsumoEvaluation?.complete && !tsumoEvaluation.legal && (
              <div className="w-full rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-center text-[11px] font-black text-amber-950 shadow-xl">
                <span className="block text-sm">{isZh ? '牌型已经完成' : 'HAND COMPLETE'}</span>
                {isZh
                    ? `当前 ${tsumoEvaluation.score?.total ?? 0} ${isMcr ? '分' : '番'}，${isMcr ? '国标麻将' : '香港麻将'}需要 ${tsumoEvaluation.minimum} ${isMcr ? '分' : '番'}才能胡；还差 ${Math.max(0, tsumoEvaluation.minimum - (tsumoEvaluation.score?.total ?? 0))}${isMcr ? '分' : '番'}。`
                  : `${tsumoEvaluation.score?.total ?? 0} ${isMcr ? 'points' : 'Fan'} now; ${tsumoEvaluation.minimum} ${isMcr ? 'points' : 'Fan'} required to win.`}
                {tsumoEvaluation.score?.patterns.length ? (
                  <span className="mt-1 block text-[10px] font-bold text-amber-800">
                    {isZh ? '已有番种：' : 'Current patterns: '}
                    {tsumoEvaluation.score.patterns.map((pattern) => pattern.label).join(' · ')}
                  </span>
                ) : null}
                {!isRiichi && hongKongMode === 'standard' && (
                  <button
                    type="button"
                    onClick={() => onHongKongMode('casual')}
                    className="mt-2 rounded-md bg-emerald-700 px-3 py-1.5 text-[10px] font-black text-white"
                  >
                    {isZh ? '改用休闲模式（重新开局）' : 'Switch to Casual (new hand)'}
                  </button>
                )}
              </div>
            )}
            {canTsumo && <Action onClick={onTsumo} danger>{isZh ? '自摸 · 胡牌' : 'SELF DRAW · WIN'}</Action>}
            {isRiichi && riichiDiscards.length > 0 && !human.declaredReady && (
              <Action onClick={onRiichi} danger>{human.riichiPending ? 'DISCARD' : 'RIICHI'}</Action>
            )}
            {kanTiles.map((tile) => <Action key={tile} onClick={() => onKan(tile)}>{isZh ? '杠' : 'KAN'} {tileFace(tile)}</Action>)}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/15 bg-[#063d30]/95 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_22px_rgba(0,0,0,.3)]">
          <div className="flex h-6 items-center justify-between px-2 text-[10px] font-bold text-emerald-100">
            <span>{myTurn ? (isZh ? '轮到你 · 请选择一张牌' : 'Your turn · tap a tile') : NAMES[state.turn] + (isZh ? ' 出牌中' : ' is playing')}</span>
            {hintStatus && <span className={tsumoEvaluation?.complete ? 'text-amber-200' : ''}>{hintStatus}</span>}
          </div>
          {human.melds.length > 0 && (
            <div className="mb-1 flex overflow-x-auto px-2">
              {human.melds.map((meld, index) => (
                <div key={index} className="mr-1 flex shrink-0 gap-px rounded bg-black/25 p-0.5">
                  {meld.tiles.map((tile, tileIndex) => <TileFace key={tileIndex} tile={tile} size="sm" traditional />)}
                </div>
              ))}
            </div>
          )}
          {isMcr && human.flowers.length > 0 && (
            <div className="mb-1 flex items-center justify-center gap-px">
              <span className="mr-1 text-[9px] font-black text-amber-200">{isZh ? '花牌' : 'Flowers'}</span>
              {human.flowers.map((tile, index) => <TileFace key={`${tile}-${index}`} tile={tile} size="xs" traditional />)}
            </div>
          )}
          <div className="flex w-max min-w-full items-end justify-center px-0.5">
            {human.hand.map((tile, index) => (
              <span key={tile + index} className={index === human.hand.length - 1 ? 'ml-1' : '-ml-px'}>
                <TileFace
                  tile={tile}
                  size="xs"
                  traditional
                  onClick={(selected) => {
                    primeMahjongAudio();
                    if (!human.riichiPending || riichiDiscards.includes(selected)) {
                      // Speech must run inside the tap gesture on mobile;
                      // deferred React effects are often blocked by the browser.
                      if (soundEnabled) playMahjongSound('discard', selected, voiceLocale);
                      onDiscard(selected);
                    }
                  }}
                  disabled={!myTurn || paused || (human.riichiPending && !riichiDiscards.includes(tile))}
                  highlight={(myTurn && index === human.hand.length - 1) || (human.riichiPending && riichiDiscards.includes(tile))}
                />
              </span>
            ))}
          </div>
        </div>

        {paused && <button type="button" onClick={onTogglePause} className="absolute inset-0 z-50 bg-black/60 text-2xl font-black">TAP TO CONTINUE</button>}
        {state.phase === 'over' && state.result && (
          <div role="dialog" aria-live="assertive" className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#001f18]/80 p-5 backdrop-blur-sm">
            {humanWon && Array.from({ length: 14 }, (_, index) => (
              <span
                key={index}
                className="absolute animate-bounce text-xl"
                style={{ left: `${5 + ((index * 37) % 90)}%`, top: `${4 + ((index * 53) % 82)}%`, animationDelay: `${(index % 7) * 90}ms` }}
                aria-hidden="true"
              >{index % 2 === 0 ? '🀄' : '✨'}</span>
            ))}
            <div className={humanWon ? 'relative w-full max-w-xs rounded-3xl border-4 border-amber-300 bg-[#fff8dc] p-5 text-center text-slate-900 shadow-[0_0_60px_rgba(251,191,36,.65)]' : 'relative w-full max-w-xs rounded-2xl bg-[#f4f0df] p-5 text-center text-slate-900'}>
              {humanWon && <div className="mx-auto mb-2 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-rose-600 text-4xl font-black text-white shadow-lg">胡</div>}
              <h2 className="text-3xl font-black">
                {state.result.kind === 'draw'
                  ? (isZh ? '本局流局' : 'Draw')
                  : humanWon
                    ? (isZh ? '恭喜，你胡了！' : 'You Win!')
                    : (isZh ? '本局由对手胡牌' : 'Opponent Wins')}
              </h2>
              {humanWon && resultScore && (
                <div className="mt-3 rounded-xl bg-amber-100 p-3">
                  <strong className="block text-xl text-rose-700">
                    {isRiichi
                      ? `${resultScore.han ?? resultScore.total} Han · ${resultScore.fu ?? 0} Fu`
                      : `${resultScore.total} ${isMcr ? (isZh ? '分' : 'points') : (isZh ? '番' : 'Fan')}`}
                  </strong>
                  {resultScore.points && (
                    <span className="mt-1 block text-xs font-black text-emerald-800">{resultScore.points} points · {resultScore.paymentLabel}</span>
                  )}
                  <span className="mt-1 block text-xs font-bold text-slate-600">
                    {resultScore.patterns.map((pattern) => `${pattern.label} +${pattern.value}`).join(' · ')}
                  </span>
                </div>
              )}
              {state.matchEnded && state.matchResult && (
                <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-left text-xs font-bold text-emerald-950">
                  <p className="mb-1 text-center text-sm font-black">WRC HANCHAN RESULT</p>
                  {state.matchResult.rankings.map((entry) => <p key={entry.seat}>#{entry.rank} · {NAMES[entry.seat]} · {entry.score.toLocaleString()} · {entry.uma >= 0 ? '+' : ''}{entry.uma}P</p>)}
                </div>
              )}
              {opponentWon && (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-white/90 p-3 text-left">
                  <p className="text-center text-xs font-black uppercase tracking-[.12em] text-emerald-800">Winning Hand · {NAMES[winnerSeat]}</p>
                  <p className="mt-1 text-center text-[10px] font-bold text-slate-500">Complete hand revealed for review</p>
                  {winnerScore && <p className="mt-1 text-center text-[11px] font-black text-amber-700">{isRiichi ? `${winnerScore.han ?? winnerScore.total} Han · ${winnerScore.fu ?? 0} Fu · ${winnerScore.points ?? 0} points` : `${winnerScore.total} ${isMcr ? (isZh ? '分' : 'points') : (isZh ? '番' : 'Fan')} · ${winnerScore.points ?? 0} points`}</p>}
                  <div className="mt-2 flex flex-wrap justify-center gap-0.5">
                    {revealedTiles.map((tile, index) => <TileFace key={`${tile}-${index}`} tile={tile} size="sm" traditional highlight={Boolean(state.result?.loser !== undefined && index === revealedTiles.length - 1)} />)}
                  </div>
                  {winnerMelds.length > 0 && (
                    <div className="mt-2 border-t border-emerald-100 pt-2">
                      <p className="mb-1 text-center text-[10px] font-black text-emerald-800">Called melds / Kongs</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {winnerMelds.map((meld, meldIndex) => <div key={meldIndex} className="flex gap-px rounded bg-emerald-50 p-0.5">{meld.tiles.map((tile, tileIndex) => <TileFace key={`${tile}-${tileIndex}`} tile={tile} size="xs" traditional />)}</div>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!state.matchEnded && <button type="button" onClick={onNextHand} className="mt-4 w-full rounded-xl bg-emerald-700 py-3 font-black text-white shadow-lg">{isZh ? '继续下一局' : 'Next Hand'}</button>}
              <button type="button" onClick={onNewGame} className="mt-2 w-full rounded-xl border border-emerald-700 py-2 text-sm font-black text-emerald-800">{isZh ? '新对局' : 'New Match'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Tool({ children, onClick, active = false }: { children: ReactNode; onClick: () => void; active?: boolean }) {
  return <button type="button" onClick={onClick} className={active ? 'rounded-md bg-amber-300 px-2 py-1 text-[10px] font-black text-emerald-950' : 'rounded-md border border-white/15 bg-black/10 px-2 py-1 text-[10px] font-black'}>{children}</button>;
}

function Action({ children, onClick, danger = false }: { children: ReactNode; onClick?: () => void; danger?: boolean }) {
  return <button type="button" onClick={onClick} className={danger ? 'min-h-10 rounded-lg bg-rose-500 px-4 text-sm font-black' : 'min-h-10 rounded-lg bg-amber-300 px-4 text-sm font-black text-emerald-950'}>{children}</button>;
}

function claimLabel(kind: ClaimOption['kind'], isZh: boolean): string {
  if (!isZh) return kind.toUpperCase();
  const labels: Record<ClaimOption['kind'], string> = { chi: '吃', pon: '碰', kan: '杠', ron: '胡', pass: '过' };
  return labels[kind];
}

function Opponent({ state, seat, className }: { state: GameState; seat: Seat; className: string }) {
  const active = state.turn === seat && state.phase !== 'over';
  return (
    <div className={'absolute z-20 flex items-center gap-1 rounded-full bg-black/35 p-1 pr-2 ' + className}>
      <span className={active ? 'flex h-8 w-8 items-center justify-center rounded-full border-2 border-yellow-300 bg-violet-400 text-[10px] font-black' : 'flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/60 bg-violet-500 text-[10px] font-black'}>P{seat + 1}</span>
      <span className="text-[10px] font-black text-amber-100">{state.players[seat].score}</span>
    </div>
  );
}

function Rack({ count, vertical = false, className }: { count: number; vertical?: boolean; className: string }) {
  return (
    <div className={'absolute flex ' + (vertical ? 'flex-col ' : '') + className}>
      {Array.from({ length: Math.min(count, 14) }, (_, index) => (
        <span key={index} className={vertical ? '-my-3' : '-mx-2'}><TileBack size="sm" /></span>
      ))}
    </div>
  );
}

function Discards({ state, seat, className }: { state: GameState; seat: Seat; className: string }) {
  const recent = state.players[seat].discards.slice(-6);
  return (
    <div className={'absolute z-[5] grid w-[60px] grid-cols-3 gap-px ' + className}>
      {recent.map((tile, index) => (
        <span key={tile + index} className="scale-75"><TileFace tile={tile} size="sm" traditional muted={index !== recent.length - 1} /></span>
      ))}
    </div>
  );
}
