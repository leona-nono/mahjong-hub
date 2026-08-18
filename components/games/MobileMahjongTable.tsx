'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
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
  onAccessibility: () => void;
}

export default function MobileMahjongTable(props: MobileMahjongTableProps) {
  const {
    state, variant, paused, soundEnabled, hongKongMode, showHints, myTurn, myClaims, hints,
    canTsumo, tsumoEvaluation, kanTiles, riichiDiscards, roundLabel, onTogglePause,
    onToggleHints, onToggleSound, onHongKongMode, onNewGame, onNextHand, onDiscard, onClaim, onTsumo,
    onKan, onRiichi, onFullscreen, onAccessibility
  } = props;
  const human = state.players[HUMAN];
  const isRiichi = variant === 'riichi';
  const isMcr = variant === 'chinese-official';
  const voiceLocale = isRiichi ? 'japanese' as const : 'cantonese' as const;
  const t = useTranslations('mahjong');
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
  const allReviewTiles = (seat: Seat) => [
    ...state.players[seat].hand,
    ...(seat === winnerSeat && state.result?.loser !== undefined && state.lastDiscard ? [state.lastDiscard.tile] : [])
  ];
  const hintStatus = (() => {
    if (!showHints || !hints) return null;
    if (tsumoEvaluation?.complete) {
      const fan = tsumoEvaluation.score?.total ?? 0;
      if (tsumoEvaluation.legal) return t('winAvailable', { fan });
      return t('completeFan', { fan, min: tsumoEvaluation.minimum });
    }
    if (hints.shanten <= 0) {
      const waits = hints.waits.map(tileFace).join(' ');
      return t('ready', { tiles: waits || '-' });
    }
    return t('awayFromReady', { n: hints.shanten });
  })();

  return (
    <div className="relative h-[calc(100dvh-7rem)] min-h-[520px] overflow-hidden rounded-xl bg-[#004b38] text-white lg:hidden landscape:fixed landscape:inset-0 landscape:z-[60] landscape:h-dvh landscape:min-h-0 landscape:rounded-none">
      <div className="flex h-12 items-center justify-between gap-1 border-b border-white/10 bg-[#0b6548] px-2">
        <div className="flex gap-1">
          <Tool onClick={onTogglePause}>{paused ? t('play') : t('pause')}</Tool>
          <Tool onClick={() => { primeMahjongAudio(); onNewGame(); }}>{t('newGameShort')}</Tool>
          <Tool onClick={onToggleHints} active={showHints}>{t('hints')}</Tool>
          <Tool onClick={onToggleSound} active={soundEnabled}>{soundEnabled ? t('sound') : t('muted')}</Tool>
          <Tool onClick={onAccessibility}>Aa</Tool>
        </div>
        <div className="flex gap-1">
          {variant === 'hongkong' && (
            <Tool
              onClick={() => onHongKongMode(hongKongMode === 'casual' ? 'standard' : 'casual')}
              active={hongKongMode === 'casual'}
            >
              {hongKongMode === 'casual' ? t('casualShort') : t('standard3FanShort')}
            </Tool>
          )}
          <Tool onClick={onFullscreen}>{t('full')}</Tool>
        </div>
      </div>

      <div className="relative h-[calc(100%-3rem)] overflow-hidden bg-[radial-gradient(circle_at_center,#087052_0%,#00553e_58%,#003c2d_100%)] landscape:h-[calc(100dvh-3rem)]">
        <p className="absolute left-1/2 top-1 z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#003d2f]/85 px-2 py-0.5 text-[9px] font-bold text-emerald-50">{t('allOpponentsAI')}</p>
        <Opponent state={state} seat={3} className="left-1/2 top-2 -translate-x-1/2" />
        <Opponent state={state} seat={2} className="left-1 top-[24%]" />
        <Opponent state={state} seat={1} className="right-1 top-[24%]" />

        <Rack count={state.players[3].hand.length} tiles={state.phase === 'over' && state.result?.kind === 'win' ? state.players[3].hand : undefined} className="left-1/2 top-[18%] -translate-x-1/2" />
        <Rack count={state.players[2].hand.length} tiles={state.phase === 'over' && state.result?.kind === 'win' ? state.players[2].hand : undefined} vertical className="left-2 top-[37%]" />
        <Rack count={state.players[1].hand.length} tiles={state.phase === 'over' && state.result?.kind === 'win' ? state.players[1].hand : undefined} vertical className="right-2 top-[37%]" />

        {/* Mobile-safe discard lanes: left/right discards sit outside the
            scoreboard footprint, so no opponent tile is hidden behind it. */}
        <Discards state={state} seat={3} className="left-1/2 top-[29%] -translate-x-1/2" />
        <Discards state={state} seat={2} className="left-[15%] top-[41%]" />
        <Discards state={state} seat={1} className="right-[15%] top-[41%]" />
        <Discards state={state} seat={0} className="bottom-[27%] left-1/2 -translate-x-1/2" />

        <div className="absolute left-1/2 top-[47%] z-10 flex h-20 w-[5.4rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border-4 border-[#242632] bg-[#080b10] shadow-xl">
          <span className="text-[9px] font-bold tracking-[.2em] text-cyan-300">{isRiichi ? 'RIICHI' : isMcr ? 'CHINESE MCR' : 'HONG KONG'}</span>
          <strong className="text-base font-medium text-cyan-100">{roundLabel}</strong>
          <span className="text-xl font-light text-cyan-200">{tilesRemaining(state)}</span>
          <span className="absolute -bottom-3 rounded bg-rose-600 px-2 text-[9px] font-black">{NAMES[state.turn]}</span>
        </div>

        {isRiichi && (
          <div className="absolute right-[23%] top-[29%] rounded-md bg-black/30 p-1 text-center text-[8px] font-bold text-amber-200">
            <span className="block">{t('dora')}</span>
            <div className="flex gap-px">{visibleDoraIndicators(state).map((tile, index) => <TileFace key={`${tile}-${index}`} tile={tile} size="sm" traditional />)}</div>
          </div>
        )}

        {(myClaims || tsumoEvaluation?.complete || canTsumo || kanTiles.length > 0 || riichiDiscards.length > 0) && (
          <div className="absolute bottom-[17%] left-1/2 z-30 flex max-w-[96%] -translate-x-1/2 flex-wrap justify-center gap-1 rounded-xl bg-black/75 p-1.5">
            {myClaims?.map((option, index) => (
              <Action key={option.kind + index} onClick={() => onClaim(option)}>{t(`call.${option.kind}`)}</Action>
            ))}
            {myClaims && <Action onClick={() => onClaim({ kind: 'pass', tiles: [] })}>{t('call.pass')}</Action>}
            {tsumoEvaluation?.complete && !tsumoEvaluation.legal && (
              <div className="w-full rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-center text-[11px] font-black text-amber-950 shadow-xl">
                <span className="block text-sm">{t('handComplete')}</span>
                {t('pointsRequiredNow', { score: tsumoEvaluation.score?.total ?? 0, unit: isMcr ? t('unitPoints') : t('unitFan'), min: tsumoEvaluation.minimum })}
                {tsumoEvaluation.score?.patterns.length ? (
                  <span className="mt-1 block text-[10px] font-bold text-amber-800">
                    {t('currentPatterns')}
                    {tsumoEvaluation.score.patterns.map((pattern) => pattern.label).join(' · ')}
                  </span>
                ) : null}
                {!isRiichi && hongKongMode === 'standard' && (
                  <button
                    type="button"
                    onClick={() => onHongKongMode('casual')}
                    className="mt-2 rounded-md bg-emerald-700 px-3 py-1.5 text-[10px] font-black text-white"
                  >
                    {t('switchToCasual')}
                  </button>
                )}
              </div>
            )}
            {canTsumo && <Action onClick={onTsumo} danger>{t('selfDrawWinShort')}</Action>}
            {isRiichi && riichiDiscards.length > 0 && !human.declaredReady && (
              <Action onClick={onRiichi} danger>{human.riichiPending ? t('chooseHighlightedDiscard') : t('riichi')}</Action>
            )}
            {kanTiles.map((tile) => <Action key={tile} onClick={() => onKan(tile)}>{t('call.kan')} {tileFace(tile)}</Action>)}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/15 bg-[#063d30]/95 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_22px_rgba(0,0,0,.3)]">
          <div className="flex h-6 items-center justify-between px-2 text-[10px] font-bold text-emerald-100">
            <span>{myTurn ? t('yourTurnTap') : t('seatPlaying', { seat: NAMES[state.turn] })}</span>
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
              <span className="mr-1 text-[9px] font-black text-amber-200">{t('flowersLabel')}</span>
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

        {paused && <button type="button" onClick={onTogglePause} className="absolute inset-0 z-50 bg-black/60 text-2xl font-black">{t('tapToContinue')}</button>}
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
                  ? t('drawShort')
                  : humanWon
                    ? t('youWinExclaim')
                    : t('opponentWins')}
              </h2>
              {humanWon && resultScore && (
                <div className="mt-3 rounded-xl bg-amber-100 p-3">
                  <strong className="block text-xl text-rose-700">
                    {isRiichi
                      ? `${resultScore.han ?? resultScore.total} Han · ${resultScore.fu ?? 0} Fu`
                      : `${resultScore.total} ${isMcr ? t('unitPoints') : t('unitFan')}`}
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
                  <p className="mb-1 text-center text-sm font-black">{t('hanchanResultShort')}</p>
                  {state.matchResult.rankings.map((entry) => <p key={entry.seat}>#{entry.rank} · {NAMES[entry.seat]} · {entry.score.toLocaleString()} · {entry.uma >= 0 ? '+' : ''}{entry.uma}P</p>)}
                </div>
              )}
              {opponentWon && (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-white/90 p-3 text-left">
                  <p className="text-center text-xs font-black uppercase tracking-[.12em] text-emerald-800">{t('winningHandLabel')} · {NAMES[winnerSeat]}</p>
                  <p className="mt-1 text-center text-[10px] font-bold text-slate-500">{t('completeHandRevealed')}</p>
                  {winnerScore && <p className="mt-1 text-center text-[11px] font-black text-amber-700">{isRiichi ? `${winnerScore.han ?? winnerScore.total} Han · ${winnerScore.fu ?? 0} Fu · ${winnerScore.points ?? 0} points` : `${winnerScore.total} ${isMcr ? t('unitPoints') : t('unitFan')} · ${winnerScore.points ?? 0} ${t('unitPoints')}`}</p>}
                  <div className="mt-2 flex flex-wrap justify-center gap-0.5">
                    {revealedTiles.map((tile, index) => <TileFace key={`${tile}-${index}`} tile={tile} size="sm" traditional highlight={Boolean(state.result?.loser !== undefined && index === revealedTiles.length - 1)} />)}
                  </div>
                  {winnerMelds.length > 0 && (
                    <div className="mt-2 border-t border-emerald-100 pt-2">
                      <p className="mb-1 text-center text-[10px] font-black text-emerald-800">{t('calledMelds')}</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {winnerMelds.map((meld, meldIndex) => <div key={meldIndex} className="flex gap-px rounded bg-emerald-50 p-0.5">{meld.tiles.map((tile, tileIndex) => <TileFace key={`${tile}-${tileIndex}`} tile={tile} size="xs" traditional />)}</div>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!state.matchEnded && <button type="button" onClick={onNextHand} className="mt-4 w-full rounded-xl bg-emerald-700 py-3 font-black text-white shadow-lg">{t('nextHand')}</button>}
              <button type="button" onClick={onNewGame} className="mt-2 w-full rounded-xl border border-emerald-700 py-2 text-sm font-black text-emerald-800">{t('newMatch')}</button>
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

function Opponent({ state, seat, className }: { state: GameState; seat: Seat; className: string }) {
  const active = state.turn === seat && state.phase !== 'over';
  return (
    <div className={'absolute z-20 flex items-center gap-1 rounded-full bg-black/35 p-1 pr-2 ' + className}>
      <span className={active ? 'flex h-8 w-8 items-center justify-center rounded-full border-2 border-yellow-300 bg-violet-400 text-[10px] font-black' : 'flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/60 bg-violet-500 text-[10px] font-black'}>P{seat + 1}</span>
      <span className="text-[10px] font-black text-amber-100">{state.players[seat].score}</span>
    </div>
  );
}

function Rack({ count, tiles, vertical = false, className }: { count: number; tiles?: Tile[]; vertical?: boolean; className: string }) {
  return (
    <div className={'absolute flex ' + (vertical ? 'flex-col ' : '') + className}>
      {Array.from({ length: Math.min(count, 14) }, (_, index) => (
        <span key={index} className={vertical ? '-my-3' : '-mx-2'}>{tiles?.[index] ? <TileFace tile={tiles[index]} size="xs" traditional /> : <TileBack size="sm" />}</span>
      ))}
    </div>
  );
}

function Discards({ state, seat, className }: { state: GameState; seat: Seat; className: string }) {
  const recent = state.players[seat].discards.slice(-6);
  return (
    <div className={'absolute z-[15] w-[54px] rounded-md bg-[#003d2f]/70 p-0.5 shadow-[0_1px_5px_rgba(0,0,0,.3)] ' + className}>
      <span className="mb-px block text-center text-[7px] font-black tracking-wide text-amber-200">P{seat + 1} DISCARD</span>
      <div className="grid grid-cols-3 gap-px">
      {recent.map((tile, index) => (
        <span key={tile + index} className={index === recent.length - 1 ? 'scale-[.68] rounded ring-1 ring-amber-300' : 'scale-[.68]'}><TileFace tile={tile} size="sm" traditional muted={index !== recent.length - 1} /></span>
      ))}
      </div>
    </div>
  );
}
