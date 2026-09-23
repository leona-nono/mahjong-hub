'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import TileFace, { TileBack } from './TileFace';
import {
  tilesRemaining,
  type ClaimOption,
  type GameState,
  type HongKongMode,
  type Seat,
  type SelfDrawEvaluation
} from '@/lib/mahjong/engine';
import { tileFace, type Tile } from '@/lib/mahjong/tiles';
import { playMahjongSound, primeMahjongAudio } from '@/features/table/sound';
import { formatPatternList, formatPaymentLabel, formatRiichiHanFu, formatScoreHeadline } from '@/features/table/score-copy';
import { visibleDoraIndicators } from '@/lib/mahjong/riichi';
import TableToolButton from './TableToolButton';
import { McrScoreBody } from './table/ScorePanel';

const HUMAN: Seat = 0;
const SEAT_KEY = { 0: 'seatEast', 1: 'seatSouth', 2: 'seatWest', 3: 'seatNorth' } as const;

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
  coachPanel?: ReactNode | null;
  coachChipLabel?: string | null;
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
    state,
    variant,
    paused,
    soundEnabled,
    hongKongMode,
    showHints,
    myTurn,
    myClaims,
    hints,
    canTsumo,
    tsumoEvaluation,
    kanTiles,
    riichiDiscards,
    roundLabel,
    coachPanel = null,
    coachChipLabel = null,
    onTogglePause,
    onToggleHints,
    onToggleSound,
    onHongKongMode,
    onNewGame,
    onNextHand,
    onDiscard,
    onClaim,
    onTsumo,
    onKan,
    onRiichi,
    onFullscreen,
    onAccessibility
  } = props;
  const human = state.players[HUMAN];
  const isRiichi = variant === 'riichi';
  const isMcr = variant === 'chinese-official';
  const voiceLocale = isRiichi ? ('japanese' as const) : ('cantonese' as const);
  const t = useTranslations('mahjong');
  const seats = useTranslations('regional');
  const seatName = (seat: number) => (seat === HUMAN ? t('youLabel') : seats(SEAT_KEY[seat as Seat]));
  const [toolsOpen, setToolsOpen] = useState(false);
  const [drawer, setDrawer] = useState<'coach' | 'mcr' | null>(null);

  const humanWon =
    state.result?.winner === HUMAN || state.result?.winners?.some((winner) => winner.seat === HUMAN);
  const resultScore =
    state.result?.winner === HUMAN
      ? state.result.score
      : state.result?.winners?.find((winner) => winner.seat === HUMAN)?.score;
  const winnerSeat = state.result?.winner ?? state.result?.winners?.[0]?.seat;
  const winnerScore = state.result?.score ?? state.result?.winners?.[0]?.score;
  const opponentWon = state.phase === 'over' && winnerSeat !== undefined && winnerSeat !== HUMAN;
  const revealedTiles =
    winnerSeat === undefined
      ? []
      : [
          ...state.players[winnerSeat].hand,
          ...(state.result?.loser !== undefined && state.lastDiscard ? [state.lastDiscard.tile] : [])
        ];
  const winnerMelds = winnerSeat === undefined ? [] : state.players[winnerSeat].melds;
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

  const mcrQualifying = tsumoEvaluation?.score?.qualifyingTotal ?? 0;
  const mcrFlowers = human.flowers.length;
  const showCoachChip = Boolean(coachChipLabel && coachPanel);
  const showActions =
    myClaims || tsumoEvaluation?.complete || canTsumo || kanTiles.length > 0 || riichiDiscards.length > 0;

  return (
    <div
      data-debug-mobile-table
      className="relative flex h-[calc(100dvh-7rem)] min-h-[520px] flex-col overflow-hidden rounded-xl bg-transparent text-white lg:hidden landscape:fixed landscape:inset-0 landscape:z-[60] landscape:h-dvh landscape:min-h-0 landscape:rounded-none"
    >
      {/* M1: single-row toolbar — pause + ☰ */}
      <div className="relative z-40 flex min-h-11 items-center justify-between gap-2 border-b border-white/10 bg-[#0b6548] px-2">
        <TableToolButton label={paused ? t('play') : t('pause')} onClick={onTogglePause}>
          {paused ? t('play') : t('pause')}
        </TableToolButton>
        <TableToolButton
          label={t('moreTools')}
          onClick={() => setToolsOpen((open) => !open)}
          active={toolsOpen}
        >
          ☰
        </TableToolButton>
        {toolsOpen && (
          <div className="absolute inset-x-0 top-11 z-40 flex flex-wrap gap-1 border-b border-white/10 bg-[#0b6548] p-2 shadow-lg">
            <TableToolButton
              label={t('newGameShort')}
              onClick={() => {
                primeMahjongAudio();
                setToolsOpen(false);
                onNewGame();
              }}
            >
              {t('newGameShort')}
            </TableToolButton>
            <TableToolButton
              label={t('hints')}
              onClick={() => {
                setToolsOpen(false);
                onToggleHints();
              }}
              active={showHints}
            >
              {t('hints')}
            </TableToolButton>
            <TableToolButton
              label={soundEnabled ? t('sound') : t('muted')}
              onClick={() => {
                setToolsOpen(false);
                onToggleSound();
              }}
              active={soundEnabled}
            >
              {soundEnabled ? t('sound') : t('muted')}
            </TableToolButton>
            <TableToolButton
              label="Accessibility"
              onClick={() => {
                setToolsOpen(false);
                onAccessibility();
              }}
            >
              Aa
            </TableToolButton>
            {variant === 'hongkong' && (
              <TableToolButton
                label={hongKongMode === 'casual' ? t('casualShort') : t('standard3FanShort')}
                onClick={() => {
                  setToolsOpen(false);
                  onHongKongMode(hongKongMode === 'casual' ? 'standard' : 'casual');
                }}
                active={hongKongMode === 'casual'}
              >
                {hongKongMode === 'casual' ? t('casualShort') : t('standard3FanShort')}
              </TableToolButton>
            )}
            <TableToolButton
              label={t('full')}
              onClick={() => {
                setToolsOpen(false);
                onFullscreen();
              }}
            >
              {t('full')}
            </TableToolButton>
          </div>
        )}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_center,#087052_0%,#00553e_58%,#003c2d_100%)] landscape:h-[calc(100dvh-3rem)]">
        {/* M7: info strip */}
        <p className="pointer-events-none z-30 flex h-5 shrink-0 items-center justify-center gap-1 bg-[#003d2f]/70 px-2 text-[10px] font-bold text-emerald-50">
          {t('allOpponentsAI')}
          <span className="text-emerald-200/50">·</span>
          <span className="text-cyan-100">{roundLabel}</span>
          <span className="text-emerald-200/50">·</span>
          <span className="tabular-nums text-amber-100">{tilesRemaining(state)}</span>
        </p>

        {/* Upper playfield: opponent row + side racks + discard pools */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="absolute left-1 top-[26px] right-1 flex items-start justify-between gap-2">
            <Rack
              count={state.players[3].hand.length}
              tiles={
                state.phase === 'over' && state.result?.kind === 'win' ? state.players[3].hand : undefined
              }
              className="relative"
            />
            <Opponent state={state} seat={3} className="relative shrink-0" />
          </div>

          <Discards state={state} seat={3} cols={6} className="left-1/2 top-[74px] -translate-x-1/2" />

          <div className="absolute left-1 top-[74px] flex w-[100px] flex-col gap-1">
            <Rack
              count={state.players[2].hand.length}
              tiles={
                state.phase === 'over' && state.result?.kind === 'win' ? state.players[2].hand : undefined
              }
              horizontal
              className="relative"
            />
            <Opponent state={state} seat={2} className="relative" />
            <Discards state={state} seat={2} cols={3} className="relative max-h-[273px] w-fit" scrollable />
          </div>

          <div className="absolute right-1 top-[74px] flex w-[100px] flex-col items-end gap-1">
            <Rack
              count={state.players[1].hand.length}
              tiles={
                state.phase === 'over' && state.result?.kind === 'win' ? state.players[1].hand : undefined
              }
              horizontal
              className="relative"
            />
            <Opponent state={state} seat={1} className="relative" />
            <Discards state={state} seat={1} cols={3} className="relative max-h-[273px] w-fit" scrollable />
          </div>

          {isRiichi && (
            <div className="absolute right-[28%] top-[30%] rounded-md bg-black/30 p-1 text-center text-xs font-bold text-amber-200">
              <span className="block">{t('dora')}</span>
              <div className="flex gap-px">
                {visibleDoraIndicators(state).map((tile, index) => (
                  <TileFace key={`${tile}-${index}`} tile={tile} size="sm" traditional />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* M9: bottom flex stack — self pool / chips / actions / footer */}
        <div className="relative z-20 flex min-h-0 shrink-0 flex-col border-t border-white/15 bg-[#063d30]/95 pb-[max(.4rem,env(safe-area-inset-bottom))] shadow-[0_-8px_22px_rgba(0,0,0,.3)]">
          <div className="flex min-h-0 max-h-[228px] flex-1 justify-center overflow-hidden px-2 pt-1">
            <Discards
              state={state}
              seat={0}
              cols={4}
              className="relative max-h-full w-fit min-h-0"
              scrollable
            />
          </div>

          {/* M4 / M5 chip row */}
          {(showCoachChip || isMcr) && (
            <div className="flex h-7 shrink-0 items-center gap-1.5 px-2">
              {showCoachChip ? (
                <button
                  type="button"
                  onClick={() => setDrawer((d) => (d === 'coach' ? null : 'coach'))}
                  className={`max-w-[55%] truncate rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                    drawer === 'coach' ? 'bg-amber-300 text-emerald-950' : 'bg-black/40 text-emerald-50'
                  }`}
                >
                  {coachChipLabel}
                </button>
              ) : null}
              {isMcr ? (
                <button
                  type="button"
                  onClick={() => setDrawer((d) => (d === 'mcr' ? null : 'mcr'))}
                  className={`ml-auto truncate rounded-full px-2.5 py-0.5 text-[11px] font-black tabular-nums ${
                    drawer === 'mcr' ? 'bg-amber-300 text-emerald-950' : 'bg-black/40 text-amber-100'
                  }`}
                >
                  {t('mcrChipShort', { q: mcrQualifying, f: mcrFlowers })}
                </button>
              ) : null}
            </div>
          )}

          {showActions && (
            <div className="flex shrink-0 flex-wrap justify-center gap-1 px-1.5 py-1">
              {myClaims?.map((option, index) => (
                <Action key={option.kind + index} onClick={() => onClaim(option)}>
                  {t(`call.${option.kind}`)}
                </Action>
              ))}
              {myClaims && (
                <Action onClick={() => onClaim({ kind: 'pass', tiles: [] })}>{t('call.pass')}</Action>
              )}
              {tsumoEvaluation?.complete && !tsumoEvaluation.legal && (
                <div className="w-full rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-center text-[11px] font-black text-amber-950 shadow-xl">
                  <span className="block text-sm">{t('handComplete')}</span>
                  {t('pointsRequiredNow', {
                    score: tsumoEvaluation.score?.total ?? 0,
                    unit: isMcr ? t('unitPoints') : t('unitFan'),
                    min: tsumoEvaluation.minimum
                  })}
                  {tsumoEvaluation.score?.patterns.length ? (
                    <span className="mt-1 block text-sm font-bold text-amber-800">
                      {t('currentPatterns')}
                      {tsumoEvaluation.score.patterns.map((pattern) => pattern.label).join(' · ')}
                    </span>
                  ) : null}
                  {!isRiichi && hongKongMode === 'standard' && (
                    <button
                      type="button"
                      onClick={() => onHongKongMode('casual')}
                      className="mt-2 rounded-md bg-emerald-700 px-3 py-2 text-sm font-black text-white"
                    >
                      {t('switchToCasual')}
                    </button>
                  )}
                </div>
              )}
              {canTsumo && (
                <Action onClick={onTsumo} danger>
                  {t('selfDrawWinShort')}
                </Action>
              )}
              {isRiichi && riichiDiscards.length > 0 && !human.declaredReady && (
                <Action onClick={onRiichi} danger>
                  {human.riichiPending ? t('chooseHighlightedDiscard') : t('riichi')}
                </Action>
              )}
              {kanTiles.map((tile) => (
                <Action key={tile} onClick={() => onKan(tile)}>
                  {t('call.kan')} {tileFace(tile)}
                </Action>
              ))}
            </div>
          )}

          {/* M8 footer */}
          <div className="shrink-0">
            <div className="flex h-7 items-center justify-between px-2 text-sm font-bold text-emerald-100">
              <span>{myTurn ? t('yourTurnTap') : t('seatPlaying', { seat: seatName(state.turn) })}</span>
              {hintStatus && (
                <span className={tsumoEvaluation?.complete ? 'text-amber-200' : ''}>{hintStatus}</span>
              )}
            </div>
            {(human.melds.length > 0 || (isMcr && human.flowers.length > 0)) && (
              <div className="mb-1 flex items-center gap-2 overflow-x-auto px-2">
                {human.melds.map((meld, index) => (
                  <div key={index} className="flex shrink-0 gap-px rounded bg-black/25 p-0.5">
                    {meld.tiles.map((tile, tileIndex) => (
                      <TileFace key={tileIndex} tile={tile} size="sm" traditional />
                    ))}
                  </div>
                ))}
                {isMcr && human.flowers.length > 0 && (
                  <div className="flex shrink-0 items-center gap-px">
                    <span className="mr-1 text-xs font-black text-amber-200">{t('flowersLabel')}</span>
                    {human.flowers.map((tile, index) => (
                      <TileFace key={`${tile}-${index}`} tile={tile} size="xs" traditional />
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="overflow-x-auto overscroll-x-contain px-1 pb-0.5 [-webkit-overflow-scrolling:touch]">
              <div className="mx-auto flex w-max min-w-full items-end justify-center gap-px px-1">
                {human.hand.map((tile, index) => (
                  <span key={tile + index} className={index === human.hand.length - 1 ? 'ml-1.5' : ''}>
                    <TileFace
                      tile={tile}
                      size="xs"
                      traditional
                      onClick={(selected) => {
                        primeMahjongAudio();
                        if (!human.riichiPending || riichiDiscards.includes(selected)) {
                          if (soundEnabled) playMahjongSound('discard', selected, voiceLocale);
                          onDiscard(selected);
                        }
                      }}
                      disabled={
                        !myTurn || paused || (human.riichiPending && !riichiDiscards.includes(tile))
                      }
                      highlight={
                        (myTurn && index === human.hand.length - 1) ||
                        (human.riichiPending && riichiDiscards.includes(tile))
                      }
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Coach / MCR drawer — may cover hand */}
        {drawer && (
          <div className="absolute inset-x-0 bottom-0 z-50 max-h-[62%] overflow-y-auto rounded-t-2xl border-t border-amber-200/30 bg-[#063d30]/98 p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[.12em] text-amber-200">
                {drawer === 'mcr' ? t('mcrScoreCoach') : t('coachIntensity')}
              </span>
              <button
                type="button"
                onClick={() => setDrawer(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-sm font-bold"
                aria-label={t('closeScoringTips')}
              >
                ×
              </button>
            </div>
            {drawer === 'coach' && coachPanel}
            {drawer === 'mcr' && (
              <McrScoreBody
                qualifying={mcrQualifying}
                flowers={mcrFlowers}
                patterns={tsumoEvaluation?.score?.patterns}
              />
            )}
          </div>
        )}

        {paused && (
          <button
            type="button"
            onClick={onTogglePause}
            className="absolute inset-0 z-50 bg-black/60 text-2xl font-black"
          >
            {t('tapToContinue')}
          </button>
        )}
        {state.phase === 'over' && state.result && (
          <div
            role="dialog"
            aria-live="assertive"
            className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#001f18]/80 p-5 backdrop-blur-sm"
          >
            {humanWon &&
              Array.from({ length: 14 }, (_, index) => (
                <span
                  key={index}
                  className="absolute animate-bounce text-xl"
                  style={{
                    left: `${5 + ((index * 37) % 90)}%`,
                    top: `${4 + ((index * 53) % 82)}%`,
                    animationDelay: `${(index % 7) * 90}ms`
                  }}
                  aria-hidden="true"
                >
                  {index % 2 === 0 ? '🀄' : '✨'}
                </span>
              ))}
            <div
              className={
                humanWon
                  ? 'relative w-full max-w-xs rounded-3xl border-4 border-amber-300 bg-[#fff8dc] p-5 text-center text-slate-900 shadow-[0_0_60px_rgba(251,191,36,.65)]'
                  : 'relative w-full max-w-xs rounded-2xl bg-[#f4f0df] p-5 text-center text-slate-900'
              }
            >
              {humanWon && (
                <div className="mx-auto mb-2 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-rose-600 text-4xl font-black text-white shadow-lg">
                  胡
                </div>
              )}
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
                      ? formatRiichiHanFu(resultScore, t)
                      : formatScoreHeadline(variant, { ...resultScore, points: undefined }, t)}
                  </strong>
                  {resultScore.points ? (
                    <span className="mt-1 block text-xs font-black text-emerald-800">
                      {resultScore.paymentLabel
                        ? t('scorePointsLine', {
                            points: resultScore.points,
                            unit: t('unitPoints'),
                            payment: formatPaymentLabel(resultScore.paymentLabel, t, seatName)
                          })
                        : `${resultScore.points} ${t('unitPoints')}`}
                    </span>
                  ) : null}
                  <span className="mt-1 block text-xs font-bold text-slate-600">
                    {formatPatternList(resultScore.patterns, t, 'plus')}
                  </span>
                </div>
              )}
              {state.matchEnded && state.matchResult && (
                <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-left text-xs font-bold text-emerald-950">
                  <p className="mb-1 text-center text-sm font-black">{t('hanchanResultShort')}</p>
                  {state.matchResult.rankings.map((entry) => (
                    <p key={entry.seat}>
                      #{entry.rank} · {seatName(entry.seat)} · {entry.score.toLocaleString()} ·{' '}
                      {entry.uma >= 0 ? '+' : ''}
                      {entry.uma}P
                    </p>
                  ))}
                </div>
              )}
              {opponentWon && (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-white/90 p-3 text-left">
                  <p className="text-center text-xs font-black uppercase tracking-[.12em] text-emerald-800">
                    {t('winningHandLabel')} · {seatName(winnerSeat)}
                  </p>
                  <p className="mt-1 text-center text-sm font-bold text-slate-500">
                    {t('completeHandRevealed')}
                  </p>
                  {winnerScore && (
                    <p className="mt-1 text-center text-[11px] font-black text-amber-700">
                      {formatScoreHeadline(variant, winnerScore, t)}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap justify-center gap-0.5">
                    {revealedTiles.map((tile, index) => (
                      <TileFace
                        key={`${tile}-${index}`}
                        tile={tile}
                        size="sm"
                        traditional
                        highlight={Boolean(
                          state.result?.loser !== undefined && index === revealedTiles.length - 1
                        )}
                      />
                    ))}
                  </div>
                  {winnerMelds.length > 0 && (
                    <div className="mt-2 border-t border-emerald-100 pt-2">
                      <p className="mb-1 text-center text-sm font-black text-emerald-800">
                        {t('calledMelds')}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {winnerMelds.map((meld, meldIndex) => (
                          <div key={meldIndex} className="flex gap-px rounded bg-emerald-50 p-0.5">
                            {meld.tiles.map((tile, tileIndex) => (
                              <TileFace key={`${tile}-${tileIndex}`} tile={tile} size="xs" traditional />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!state.matchEnded && (
                <button
                  type="button"
                  onClick={onNextHand}
                  className="mt-4 w-full rounded-xl bg-emerald-700 py-3 font-black text-white shadow-lg"
                >
                  {t('nextHand')}
                </button>
              )}
              <button
                type="button"
                onClick={onNewGame}
                className="mt-2 w-full rounded-xl border border-emerald-700 py-2 text-sm font-black text-emerald-800"
              >
                {t('newMatch')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Action({
  children,
  onClick,
  danger = false
}: {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        danger
          ? 'min-h-10 min-w-11 rounded-lg bg-rose-500 px-4 text-sm font-black'
          : 'min-h-10 min-w-11 rounded-lg bg-amber-300 px-4 text-sm font-black text-emerald-950'
      }
    >
      {children}
    </button>
  );
}

function Opponent({ state, seat, className }: { state: GameState; seat: Seat; className: string }) {
  const t = useTranslations('mahjong');
  const active = state.turn === seat && state.phase !== 'over';
  const meldCount = state.players[seat].melds.length;
  return (
    <div
      className={
        'flex items-center gap-1 rounded-full bg-black/35 p-1 pr-2 transition-transform duration-200 ease-out ' +
        (active ? 'z-30 scale-110 shadow-[0_0_14px_rgba(251,191,36,.55)] ' : 'z-20 scale-100 ') +
        className
      }
    >
      <span
        className={
          active
            ? 'flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-300 bg-violet-400 text-xs font-black'
            : 'flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/60 bg-violet-500 text-xs font-black'
        }
        aria-current={active ? 'true' : undefined}
      >
        P{seat + 1}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-black text-amber-100">{state.players[seat].score}</span>
        {meldCount > 0 && (
          <span className="text-[11px] font-bold text-amber-300">{t('meldsCount', { n: meldCount })}</span>
        )}
      </span>
    </div>
  );
}

/** M2: side racks show at most 5 backs + count badge; across still shows full row (capped 14). */
function Rack({
  count,
  tiles,
  horizontal = false,
  className
}: {
  count: number;
  tiles?: Tile[];
  horizontal?: boolean;
  className: string;
}) {
  const maxVisible = horizontal ? 5 : Math.min(count, 14);
  const visible = Math.min(count, maxVisible);
  return (
    <div
      className={'relative flex ' + (horizontal ? '' : '') + className}
      aria-hidden={tiles ? undefined : true}
      aria-label={horizontal ? `Concealed ${count}` : undefined}
    >
      {Array.from({ length: visible }, (_, index) => (
        <span key={index} className={horizontal ? '-ml-1 first:ml-0' : '-mx-1'}>
          {tiles?.[index] ? <TileFace tile={tiles[index]} size="xs" traditional /> : <TileBack size="xs" />}
        </span>
      ))}
      {horizontal && count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[1.45rem] items-center justify-center rounded-full bg-amber-300 px-1 text-[10px] font-black text-emerald-950">
          ×{count}
        </span>
      )}
    </div>
  );
}

/** M3 / M10: 18 tiles, per-seat columns, optional scroll on short screens. */
function Discards({
  state,
  seat,
  cols,
  className,
  scrollable = false
}: {
  state: GameState;
  seat: Seat;
  cols: 3 | 4 | 6;
  className: string;
  scrollable?: boolean;
}) {
  const recent = state.players[seat].discards.slice(-18);
  if (recent.length === 0) return null;
  const gridCols =
    cols === 6 ? 'grid-cols-6' : cols === 4 ? 'grid-cols-4' : 'grid-cols-3';
  return (
    <div
      className={
        'z-[15] w-fit rounded-md bg-[#003d2f]/55 p-0.5 shadow-[0_1px_5px_rgba(0,0,0,.28)] ' +
        (scrollable ? 'max-h-full min-h-[5.5rem] overflow-y-auto ' : '') +
        (className.includes('absolute') || className.includes('relative') ? '' : 'absolute ') +
        className
      }
      aria-label={`P${seat + 1} discards`}
    >
      <div className={`grid ${gridCols} justify-items-center gap-px`}>
        {recent.map((tile, index) => (
          <span
            key={tile + index}
            className={index === recent.length - 1 ? 'rounded ring-1 ring-amber-300' : 'opacity-90'}
          >
            <TileFace tile={tile} size="xs" traditional muted={index !== recent.length - 1} />
          </span>
        ))}
      </div>
    </div>
  );
}
