'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import TileFace, { TileBack, useTraditionalTilePreload } from './TileFace';
import MobileMahjongTable from './MobileMahjongTable';
import { tilesRemaining, type ClaimOption, type GameState, type HongKongMode, type Seat, type SelfDrawEvaluation } from '@/lib/mahjong/engine';
import { describeScore } from '@/lib/mahjong/scoring';
import { tileFace, type Tile } from '@/lib/mahjong/tiles';
import type { Difficulty } from '@/lib/mahjong/ai';
import { playMahjongSound, primeMahjongAudio } from '@/lib/mahjong/sound';
import { visibleDoraIndicators } from '@/lib/mahjong/riichi';

const HUMAN: Seat = 0;
const SEAT_LABEL: Record<Seat, string> = { 0: 'East', 1: 'South', 2: 'West', 3: 'North' };
const WIND_LABEL: Record<Tile, string> = { z1: 'East', z2: 'South', z3: 'West', z4: 'North' };
interface HongKongTableProps {
  state: GameState;
  variant?: 'hongkong' | 'riichi' | 'chinese-official';
  riichiDiscards?: Tile[];
  paused: boolean;
  difficulty: Difficulty;
  hongKongMode: HongKongMode;
  showHints: boolean;
  myTurn: boolean;
  myClaims?: ClaimOption[];
  hints: { shanten: number; waits: Tile[] } | null;
  canTsumo: boolean;
  tsumoEvaluation: SelfDrawEvaluation | null;
  kanTiles: Tile[];
  onDifficulty: (difficulty: Difficulty) => void;
  onHongKongMode: (mode: HongKongMode) => void;
  onToggleHints: () => void;
  onTogglePause: () => void;
  onNewGame: () => void;
  onNextHand: () => void;
  onDiscard: (tile: Tile) => void;
  onClaim: (option: ClaimOption) => void;
  onTsumo: () => void;
  onKan: (tile: Tile) => void;
  onRiichi?: () => void;
}

/**
 * Dedicated Hong Kong table.  The layout deliberately follows the familiar
 * landscape tabletop composition of the reference experience, while all game
 * state, artwork and interaction are owned by this project.
 */
export default function HongKongTable({
  state,
  variant = 'hongkong',
  riichiDiscards = [],
  paused,
  difficulty,
  hongKongMode,
  showHints,
  myTurn,
  myClaims,
  hints,
  canTsumo,
  tsumoEvaluation,
  kanTiles,
  onDifficulty,
  onHongKongMode,
  onToggleHints,
  onTogglePause,
  onNewGame,
  onNextHand,
  onDiscard,
  onClaim,
  onTsumo,
  onKan,
  onRiichi
}: HongKongTableProps) {
  useTraditionalTilePreload();
  const t = useTranslations('mahjong');
  const human = state.players[HUMAN];
  const currentWind = SEAT_LABEL[state.turn];
  const isRiichi = variant === 'riichi';
  const isMcr = variant === 'chinese-official';
  const voiceLocale = isRiichi ? 'japanese' as const : 'cantonese' as const;
  const gameName = isRiichi ? 'Japanese Riichi' : isMcr ? 'Chinese Official · MCR' : 'Hong Kong';
  const scoreUnit = isRiichi ? 'Han' : isMcr ? 'Points' : 'Fan';
  // A stable three-side wall makes the remaining wall and table orientation
  // readable; it does not expose any opponent's concealed hand.
  const wallTiles = Math.max(6, Math.min(18, Math.ceil(tilesRemaining(state) / 4)));
  const roundLabel = `${WIND_LABEL[state.roundWind]} ${state.handNumber % 4 + 1}`;
  const tableShellRef = useRef<HTMLElement>(null);
  const [showScoring, setShowScoring] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousState = useRef<GameState | null>(null);

  useEffect(() => {
    const previous = previousState.current;
    previousState.current = state;
    if (!previous || !soundEnabled) return;

    if (!previous.result && state.result?.kind === 'win') {
      playMahjongSound('win', undefined, voiceLocale);
      return;
    }

    const previousMelds = previous.players.reduce((total, player) => total + player.melds.length, 0);
    const currentMelds = state.players.reduce((total, player) => total + player.melds.length, 0);
    if (currentMelds > previousMelds) {
      const changedPlayer = state.players.find((player, seat) => player.melds.length > previous.players[seat].melds.length);
      const melds = changedPlayer?.melds;
      const kind = melds?.[melds.length - 1]?.kind;
      if (kind) playMahjongSound(kind, undefined, voiceLocale);
      return;
    }

    const previousDiscards = previous.players.reduce((total, player) => total + player.discards.length, 0);
    const currentDiscards = state.players.reduce((total, player) => total + player.discards.length, 0);
    if (currentDiscards > previousDiscards) {
      // Mobile human discards already announce inside the user gesture. Keep
      // this state effect for desktop and bot discards without double speech.
      if (state.lastDiscard?.from === HUMAN && typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) return;
      playMahjongSound('discard', state.lastDiscard?.tile, voiceLocale);
      return;
    }

    if (state.wallIndex > previous.wallIndex) playMahjongSound('draw', undefined, voiceLocale);
  }, [state, soundEnabled, voiceLocale]);

  return (
    <section ref={tableShellRef} className="overflow-hidden rounded-xl bg-[#176845] p-0 shadow-[0_24px_60px_rgba(0,45,31,.35)] lg:p-3 fullscreen:rounded-none">
      <MobileMahjongTable
        state={state}
        variant={variant}
        paused={paused}
        soundEnabled={soundEnabled}
        hongKongMode={hongKongMode}
        showHints={showHints}
        myTurn={myTurn}
        myClaims={myClaims}
        hints={hints}
        canTsumo={canTsumo}
        tsumoEvaluation={tsumoEvaluation}
        kanTiles={kanTiles}
        riichiDiscards={riichiDiscards}
        roundLabel={roundLabel}
        onTogglePause={onTogglePause}
        onHongKongMode={onHongKongMode}
        onToggleHints={onToggleHints}
        onToggleSound={() => {
          primeMahjongAudio();
          setSoundEnabled((enabled) => {
            if (!enabled) playMahjongSound('toggle', undefined, voiceLocale);
            return !enabled;
          });
        }}
        onNewGame={onNewGame}
        onNextHand={onNextHand}
        onDiscard={onDiscard}
        onClaim={onClaim}
        onTsumo={onTsumo}
        onKan={onKan}
        onRiichi={onRiichi}
        onFullscreen={() => tableShellRef.current?.requestFullscreen()}
      />
      <div className="hidden min-w-[980px] lg:block">
        <div className="mb-2 flex h-11 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TableToolButton onClick={onTogglePause} active={paused}>
              {paused ? '▶ Continue' : 'Ⅱ Pause'}
            </TableToolButton>
            <TableToolButton onClick={() => {
              primeMahjongAudio();
              if (soundEnabled) playMahjongSound('shuffle', undefined, voiceLocale);
              onNewGame();
            }}>↻ New Game</TableToolButton>
            <TableToolButton onClick={onToggleHints} active={showHints}>
              ◇ Hints
            </TableToolButton>
            <TableToolButton onClick={() => {
              primeMahjongAudio();
              setSoundEnabled((enabled) => {
                if (!enabled) playMahjongSound('toggle', undefined, voiceLocale);
                return !enabled;
              });
            }} active={soundEnabled}>
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </TableToolButton>
            {variant === 'hongkong' && (
              <label className="flex h-9 items-center rounded-lg border border-white/10 bg-[#07553b] px-3 text-xs font-bold text-white">
                Mode
                <select
                  value={hongKongMode}
                  onChange={(event) => onHongKongMode(event.target.value as HongKongMode)}
                  className="ml-2 bg-transparent text-emerald-50 outline-none"
                  aria-label="Hong Kong Mahjong mode"
                >
                  <option className="text-slate-900" value="casual">Casual · Chicken Hand</option>
                  <option className="text-slate-900" value="standard">Standard · 3 Fan</option>
                </select>
              </label>
            )}
            <label className="flex h-9 items-center rounded-lg border border-white/10 bg-[#07553b] px-3 text-xs font-bold text-white">
              AI
              <select
                value={difficulty}
                onChange={(event) => onDifficulty(event.target.value as Difficulty)}
                className="ml-2 bg-transparent text-emerald-50 outline-none"
                aria-label={t('difficultyLabel')}
              >
                <option className="text-slate-900" value="easy">{t('easy')}</option>
                <option className="text-slate-900" value="normal">{t('normal')}</option>
                <option className="text-slate-900" value="hard">{t('hard')}</option>
              </select>
            </label>
          </div>
          <div className="flex items-center gap-4 text-emerald-100">
            <span className="flex items-end gap-1" aria-label="Connection good">
              <i className="h-2 w-1.5 rounded-sm bg-yellow-300" />
              <i className="h-4 w-1.5 rounded-sm bg-yellow-300" />
              <i className="h-6 w-1.5 rounded-sm bg-yellow-300" />
            </span>
            <span className="text-2xl">⚙</span>
          </div>
        </div>

        <div className="relative h-[720px] overflow-hidden border-[5px] border-[#032f22] bg-[#00553e] shadow-[inset_0_0_90px_rgba(0,30,22,.34)]">
          <div className="absolute inset-y-0 left-0 w-[11%] bg-[linear-gradient(105deg,#0b0a08_0%,#1b1914_58%,transparent_59%)]" />
          <div className="absolute inset-y-0 right-0 w-[11%] bg-[linear-gradient(255deg,#0b0a08_0%,#1b1914_58%,transparent_59%)]" />
          <div className="absolute left-4 top-3 z-20 text-xl font-semibold text-emerald-100/45">Rate: 10</div>

          <div className="absolute left-1/2 top-8 -translate-x-1/2">
            <ConcealedRack seat={3} count={wallTiles} />
          </div>
          <div className="absolute left-[15%] top-1/2 -translate-y-1/2">
            <ConcealedRack seat={2} count={wallTiles} vertical />
          </div>
          <div className="absolute right-[15%] top-1/2 -translate-y-1/2">
            <ConcealedRack seat={1} count={wallTiles} vertical />
          </div>

          <PlayerBadge state={state} seat={3} className="right-[19%] top-[11%]" showFlowers={isMcr} />
          <PlayerBadge state={state} seat={2} className="left-5 top-[39%]" showFlowers={isMcr} />
          <PlayerBadge state={state} seat={1} className="right-5 top-[39%]" showFlowers={isMcr} />
          <PlayerBadge state={state} seat={0} className="bottom-[16%] left-[12%]" human showFlowers={isMcr} />

          <div className="pointer-events-none absolute left-[28%] right-[28%] top-[18%] h-[48%] border border-[#003d2f]">
            <span className="absolute -left-[13%] top-[18%] h-[78%] w-[15%] skew-x-[-9deg] border border-[#003d2f]" />
            <span className="absolute -right-[13%] top-[18%] h-[78%] w-[15%] skew-x-[9deg] border border-[#003d2f]" />
            <span className="absolute bottom-[-16%] left-[2%] h-[17%] w-[96%] border border-[#003d2f]" />
          </div>

          <DiscardZone state={state} seat={3} className="left-1/2 top-[18%] -translate-x-1/2" />
          <DiscardZone state={state} seat={2} className="left-[25%] top-[31%]" />
          <DiscardZone state={state} seat={1} className="right-[25%] top-[31%]" />
          <DiscardZone state={state} seat={0} className="bottom-[25%] left-1/2 -translate-x-1/2" />

          <div className="absolute left-1/2 top-[45%] z-10 h-44 w-52 -translate-x-1/2 -translate-y-1/2 rounded-xl border-[5px] border-[#20222d] bg-[#11121a] shadow-[0_12px_20px_rgba(0,0,0,.45)]">
            <div className="absolute inset-5 flex flex-col items-center justify-center bg-[#07090d] text-center">
              <span className="text-[13px] uppercase tracking-[.28em] text-cyan-300/75">{gameName}</span>
              <strong className="mt-1 text-2xl font-normal text-cyan-200">{roundLabel}</strong>
              <span className="mt-1 text-4xl font-light text-cyan-200">{tilesRemaining(state)}</span>
            </div>
            <CenterWind position="top" active={state.turn === 3}>N</CenterWind>
            <CenterWind position="right" active={state.turn === 1}>S</CenterWind>
            <CenterWind position="bottom" active={state.turn === 0}>E</CenterWind>
            <CenterWind position="left" active={state.turn === 2}>W</CenterWind>
          </div>
          {isMcr && (
            <div className="absolute left-1/2 top-[57%] z-10 -translate-x-1/2 rounded-full border border-emerald-200/30 bg-[#063d30]/90 px-3 py-1 text-[10px] font-black tracking-[.12em] text-emerald-100">
              144 TILES · FLOWERS REPLACED · 8-POINT GATE
            </div>
          )}
          {isRiichi && (
            <div className="absolute left-[58%] top-[24%] z-10 rounded-lg bg-black/30 p-2 text-center text-[10px] font-bold uppercase tracking-wider text-amber-200">
              <span className="mb-1 block">Dora indicators</span>
              <div className="flex justify-center gap-0.5">
                {visibleDoraIndicators(state).map((tile, index) => <TileFace key={`${tile}-${index}`} tile={tile} size="sm" traditional />)}
              </div>
            </div>
          )}

          {paused && (
            <button
              type="button"
              onClick={onTogglePause}
              className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 text-4xl font-semibold text-amber-100 backdrop-blur-[2px]"
            >
              ▶ Continue Game
            </button>
          )}

          {(myClaims || canTsumo || tsumoEvaluation?.complete || kanTiles.length > 0 || riichiDiscards.length > 0) && !paused && (
            <div className="absolute bottom-[18%] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-amber-200/50 bg-[#101711]/95 p-2 shadow-2xl">
              {myClaims?.map((option, index) => (
                <button
                  key={`${option.kind}-${index}`}
                  type="button"
                  onClick={() => {
                    primeMahjongAudio();
                    onClaim(option);
                  }}
                  className="rounded-lg bg-amber-300 px-5 py-2 text-sm font-black text-emerald-950 hover:bg-amber-200"
                >
                  {t(`call.${option.kind}`)}
                </button>
              ))}
              {myClaims && (
                <button
                  type="button"
                  onClick={() => {
                    primeMahjongAudio();
                    onClaim({ kind: 'pass', tiles: [] });
                  }}
                  className="rounded-lg border border-white/30 px-5 py-2 text-sm font-bold text-white hover:bg-white/10"
                >
                  {t('call.pass')}
                </button>
              )}
              {tsumoEvaluation?.complete && !tsumoEvaluation.legal && (
                <div className="max-w-md rounded-lg border border-amber-300/40 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-950">
                  <span className="block">Complete hand: {tsumoEvaluation.score?.total ?? 0} {scoreUnit}. This table requires {tsumoEvaluation.minimum} {scoreUnit}, so it cannot be declared as a win.</span>
                  {tsumoEvaluation.score?.patterns.length ? <span className="mt-1 block text-xs">Current patterns: {tsumoEvaluation.score.patterns.map((pattern) => pattern.label).join(' · ')}</span> : null}
                  {variant === 'hongkong' && hongKongMode === 'standard' ? (
                    <button type="button" onClick={() => onHongKongMode('casual')} className="mt-2 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-black text-white">Switch to Casual (new hand)</button>
                  ) : null}
                </div>
              )}
              {canTsumo && (
                <button type="button" onClick={() => { primeMahjongAudio(); onTsumo(); }} className="animate-pulse rounded-lg bg-rose-500 px-6 py-3 text-base font-black text-white shadow-[0_0_24px_rgba(244,63,94,.55)]">
                  Self Draw - Win
                </button>
              )}
              {isRiichi && riichiDiscards.length > 0 && !human.declaredReady && (
                <button type="button" onClick={onRiichi} className="rounded-lg bg-red-600 px-6 py-3 text-base font-black text-white">
                  {human.riichiPending ? 'Choose highlighted discard' : 'Riichi'}
                </button>
              )}
              {kanTiles.map((tile) => (
                <button key={tile} type="button" onClick={() => { primeMahjongAudio(); onKan(tile); }} className="rounded-lg bg-amber-300 px-5 py-2 text-sm font-black text-emerald-950">
                  {t('call.kan')} {tileFace(tile)}
                </button>
              ))}
            </div>
          )}

          <div className="absolute bottom-3 left-1/2 z-20 w-[88%] -translate-x-1/2">
            <div className="mb-2 flex h-5 items-center justify-between px-1 text-xs font-semibold text-emerald-100/75">
              <span>{myTurn ? 'Your turn · choose a tile to discard' : `${currentWind} is playing`}</span>
              {hints && (
                <span>
                  {tsumoEvaluation?.complete
                    ? tsumoEvaluation.legal
                    ? `Winning hand - ${tsumoEvaluation.score?.total ?? 0} ${scoreUnit}`
                      : `Complete hand - ${tsumoEvaluation.score?.total ?? 0}/${tsumoEvaluation.minimum} ${scoreUnit} required`
                    : hints.shanten <= 0
                      ? t('ready', { tiles: hints.waits.map(tileFace).join(' ') || '-' })
                      : t('awayFromReady', { n: hints.shanten })}
                </span>
              )}
            </div>
            {human.melds.length > 0 && (
              <div className="absolute bottom-[84px] left-0 flex gap-2">
                {human.melds.map((meld, index) => (
                  <div key={index} className="flex gap-px rounded bg-emerald-950/40 p-1">
                    {meld.tiles.map((tile, tileIndex) => (
                      <TileFace key={tileIndex} tile={tile} size="md" traditional />
                    ))}
                  </div>
                ))}
              </div>
            )}
            {isMcr && human.flowers.length > 0 && (
              <div className="absolute bottom-[84px] right-0 flex items-center gap-1 rounded-lg bg-amber-50/95 px-2 py-1 text-[10px] font-black text-emerald-950 shadow-lg">
                <span>Flowers</span>
                {human.flowers.map((tile, index) => <TileFace key={`${tile}-${index}`} tile={tile} size="sm" traditional />)}
              </div>
            )}
            <div className="flex items-end justify-center gap-[2px]">
              {human.hand.map((tile, index) => (
                <span key={`${tile}-${index}`} className={index === human.hand.length - 1 ? 'ml-3' : ''}>
                  <TileFace
                    tile={tile}
                    size="xl"
                    traditional
                    onClick={(tile) => {
                      primeMahjongAudio();
                      if (!human.riichiPending || riichiDiscards.includes(tile)) onDiscard(tile);
                    }}
                    disabled={!myTurn || paused || (human.riichiPending && !riichiDiscards.includes(tile))}
                    highlight={(myTurn && index === human.hand.length - 1) || (human.riichiPending && riichiDiscards.includes(tile))}
                  />
                </span>
              ))}
            </div>
          </div>

          {state.phase === 'over' && state.result && (
            <HongKongResultBanner state={state} onNewGame={onNewGame} onNextHand={onNextHand} />
          )}
        </div>

        <div className="flex h-10 items-center justify-between bg-[#15583e] px-3 text-sm font-semibold text-emerald-100/75">
          <span>{gameName} Mahjong</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowScoring(true)} className="rounded px-2 py-1 hover:bg-white/10">Scoring Tips</button>
            <button type="button" onClick={() => tableShellRef.current?.requestFullscreen()} className="rounded px-2 py-1 hover:bg-white/10">Full Screen</button>
          </div>
        </div>
      </div>
      {showScoring && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-label={gameName + ' Mahjong scoring tips'}>
          <div className="w-full max-w-lg rounded-2xl bg-[#f4f0df] p-6 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">{gameName} Scoring Tips</h2>
              <button type="button" onClick={() => setShowScoring(false)} className="h-9 w-9 rounded-full bg-slate-900 text-white" aria-label="Close scoring tips">X</button>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6">
              {isRiichi ? (
                <>
                  <li><strong>One yaku minimum:</strong> Dora alone cannot make a hand legal.</li>
                  <li><strong>Riichi:</strong> closed tenpai may place a 1,000-point stick.</li>
                  <li><strong>Head-bump:</strong> only the first Ron claimant in turn order wins.</li>
                  <li><strong>No red fives:</strong> this WRC table uses the standard 136 tiles.</li>
                </>
              ) : isMcr ? (
                <>
                  <li><strong>144-tile wall:</strong> flowers and seasons are exposed immediately and replaced from the wall.</li>
                  <li><strong>8-point gate:</strong> a complete hand must score at least 8 points before it may win.</li>
                  <li><strong>Training table:</strong> the score panel explains recognised patterns while the remaining MCR catalogue is being completed.</li>
                  <li><strong>Open information:</strong> claimed melds, flowers and the winner&apos;s full hand are revealed after settlement.</li>
                </>
              ) : (
                <>
                  <li><strong>132-tile wall:</strong> Flowers, Seasons and the White Dragon are not used.</li>
                  <li>
                    <strong>{hongKongMode === 'casual' ? 'Casual mode:' : 'Standard mode:'}</strong>{' '}
                    {hongKongMode === 'casual'
                      ? 'any complete four-sets-and-a-pair hand may win; a zero-Fan hand is scored as a 1-Fan chicken hand.'
                      : 'a complete hand must reach at least 3 Fan before it may win.'}
                  </li>
                  <li><strong>10 Fan cap:</strong> compatible patterns combine up to the table cap.</li>
                  <li><strong>Discard win:</strong> the discarder pays the full score.</li>
                  <li><strong>Self draw:</strong> all three opponents pay.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

function TableToolButton({
  children,
  onClick,
  active = false
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-lg border px-4 text-xs font-black transition ${active ? 'border-amber-300 bg-amber-300 text-emerald-950' : 'border-white/10 bg-[#07553b] text-white hover:bg-[#096246]'}`}
    >
      {children}
    </button>
  );
}

function ConcealedRack({ count, vertical = false }: { seat: Seat; count: number; vertical?: boolean }) {
  return (
    <div className={`flex ${vertical ? 'flex-col' : ''} gap-px`} aria-hidden="true">
      {Array.from({ length: Math.min(count, 14) }, (_, index) => (
        <span key={index} className={vertical ? '-my-[5px]' : '-mx-[2px]'}>
          <TileBack size="table" />
        </span>
      ))}
    </div>
  );
}

function PlayerBadge({
  state,
  seat,
  className,
  human = false,
  showFlowers = false
}: {
  state: GameState;
  seat: Seat;
  className: string;
  human?: boolean;
  showFlowers?: boolean;
}) {
  const active = state.turn === seat && state.phase !== 'over';
  const colors = ['from-sky-300 to-cyan-600', 'from-orange-300 to-rose-500', 'from-violet-300 to-fuchsia-600', 'from-lime-300 to-emerald-600'];
  return (
    <div className={`absolute z-20 flex w-24 flex-col items-center ${className}`}>
      <div className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border-4 bg-gradient-to-br ${colors[seat]} shadow-lg ${active ? 'border-yellow-300' : 'border-[#e8ece3]'}`}>
        <span className="absolute top-2 h-3 w-8 rounded-t-full bg-slate-800/80" />
        <span className="mt-2 flex h-8 w-9 items-center justify-center rounded-full bg-amber-50 text-xs font-black text-slate-700">{human ? 'YOU' : `P${seat + 1}`}</span>
      </div>
      <div className="mt-1 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-xs font-black text-amber-100">
        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-300 text-[9px] text-amber-900">G</span>
        {state.players[seat].score}
      </div>
      {showFlowers && state.players[seat].flowers.length > 0 && (
        <div className="mt-1 flex max-w-24 justify-center gap-px rounded bg-amber-50/90 p-0.5">
          {state.players[seat].flowers.map((tile, index) => <TileFace key={`${tile}-${index}`} tile={tile} size="xs" traditional />)}
        </div>
      )}
    </div>
  );
}

function DiscardZone({ state, seat, className }: { state: GameState; seat: Seat; className: string }) {
  const player = state.players[seat];
  return (
    <div className={`absolute z-[5] w-[190px] ${className}`}>
      {player.melds.length > 0 && (
        <div className="mb-1 flex justify-center gap-1">
          {player.melds.map((meld, meldIndex) => (
            <div key={meldIndex} className="flex gap-px bg-black/10 p-0.5">
              {meld.tiles.map((tile, tileIndex) => <TileFace key={tileIndex} tile={tile} size="md" traditional />)}
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-6 justify-items-center gap-0.5">
        {player.discards.slice(-18).map((tile, index, visible) => {
          const latest = state.lastDiscard?.from === seat && index === visible.length - 1;
          return (
            <span key={`${tile}-${index}`} className={latest ? 'relative after:absolute after:-right-1 after:-top-1 after:h-2.5 after:w-2.5 after:rotate-45 after:bg-yellow-300' : ''}>
              <TileFace tile={tile} size="sm" traditional muted={!latest} highlight={latest} />
            </span>
          );
        })}
      </div>
    </div>
  );
}

function CenterWind({
  position,
  active,
  children
}: {
  position: 'top' | 'right' | 'bottom' | 'left';
  active: boolean;
  children: ReactNode;
}) {
  const classes = {
    top: 'left-1/2 top-1 -translate-x-1/2',
    right: 'right-2 top-1/2 -translate-y-1/2',
    bottom: 'bottom-1 left-1/2 -translate-x-1/2',
    left: 'left-2 top-1/2 -translate-y-1/2'
  }[position];
  return <span className={`absolute ${classes} flex h-6 w-8 items-center justify-center rounded text-sm font-black ${active ? 'bg-rose-700 text-white' : 'bg-slate-600 text-slate-100'}`}>{children}</span>;
}
function HongKongResultBanner({ state, onNewGame, onNextHand }: { state: GameState; onNewGame: () => void; onNextHand: () => void }) {
  const result = state.result!;
  const selfDrawn = result.kind === 'win' && !result.winners && result.loser === undefined;
  const humanWon = result.winner === HUMAN || result.winners?.some((item) => item.seat === HUMAN);
  const winnerSeat = result.winner ?? result.winners?.[0]?.seat;
  const winner = winnerSeat === HUMAN ? 'You' : SEAT_LABEL[winnerSeat as Seat];
  const revealedTiles = winnerSeat === undefined ? [] : [
    ...state.players[winnerSeat].hand,
    ...(result.loser !== undefined && state.lastDiscard ? [state.lastDiscard.tile] : [])
  ];
  const winnerMelds = winnerSeat === undefined ? [] : state.players[winnerSeat].melds;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[3px]">
      <div className="max-h-[92vh] min-w-[380px] overflow-y-auto rounded-2xl border-2 border-amber-300 bg-[#f4f0df] p-8 text-center text-emerald-950 shadow-[0_0_70px_rgba(251,191,36,.38)]">
        {result.kind === 'draw' ? (
          <>
            <p className="text-3xl font-black">Draw Game</p>
            {result.reason && <p className="mt-2 text-sm font-bold text-emerald-800">{drawReason(result.reason)}</p>}
          </>
        ) : (
          <>
            <p className="text-sm font-black uppercase tracking-[.3em] text-rose-600">{selfDrawn ? 'Self Draw' : 'Win on Discard'}</p>
            <p className="mt-2 text-4xl font-black">{humanWon ? 'You Win!' : `${winner} Wins`}</p>
            {result.score && (
              <>
                <p className="mt-3 text-2xl font-black text-amber-700">
                  {state.ruleset === 'riichi'
                    ? (result.score.han ?? result.score.total) + ' Han · ' + (result.score.fu ?? 0) + ' Fu · ' + (result.score.points ?? 0) + ' points'
                    : result.score.total + ' Fan' + (result.score.points ? ' · ' + result.score.points + ' points' : '')}
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-emerald-800">{describeScore(result.score)}</p>
                {result.score.paymentLabel && (
                  <p className="mt-2 text-sm font-bold">{result.score.paymentLabel}</p>
                )}
              </>
            )}
            {winnerSeat !== undefined && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-white/80 p-4 text-left">
                <p className="text-center text-sm font-black uppercase tracking-[.16em] text-emerald-800">Winning Hand · {winner}</p>
                <p className="mt-1 text-center text-xs font-bold text-slate-500">All concealed tiles, called melds and the winning tile are revealed for review.</p>
                <div className="mt-3 flex flex-wrap justify-center gap-1">
                  {revealedTiles.map((tile, index) => <TileFace key={`${tile}-${index}`} tile={tile} size="md" traditional highlight={Boolean(result.loser !== undefined && index === revealedTiles.length - 1)} />)}
                </div>
                {winnerMelds.length > 0 && (
                  <div className="mt-3 border-t border-emerald-100 pt-3">
                    <p className="mb-2 text-center text-xs font-black text-emerald-800">Called melds / Kongs</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {winnerMelds.map((meld, meldIndex) => <div key={meldIndex} className="flex gap-px rounded-lg bg-emerald-50 p-1">{meld.tiles.map((tile, tileIndex) => <TileFace key={`${tile}-${tileIndex}`} tile={tile} size="sm" traditional />)}</div>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {state.matchEnded && state.matchResult && (
          <div className="mt-5 rounded-xl border border-amber-300/70 bg-amber-50 p-3 text-left">
            <p className="text-center text-sm font-black uppercase tracking-[.16em] text-emerald-800">WRC Hanchan Result</p>
            <div className="mt-2 space-y-1 text-sm font-bold">
              {state.matchResult.rankings.map((entry) => (
                <div key={entry.seat} className="grid grid-cols-[2.5rem_1fr_auto] gap-2">
                  <span>#{entry.rank}</span>
                  <span>{SEAT_LABEL[entry.seat]}</span>
                  <span>{entry.score.toLocaleString()} · {entry.uma >= 0 ? '+' : ''}{entry.uma}P</span>
                </div>
              ))}
            </div>
            {state.matchResult.remainingRiichiSticks > 0 && <p className="mt-2 text-xs font-bold text-amber-800">Riichi deposits remain on the table: {state.matchResult.remainingRiichiSticks}.</p>}
          </div>
        )}
        <div className="mt-6 flex justify-center gap-3">
          {state.matchEnded ? (
            <p className="rounded-lg bg-amber-100 px-5 py-3 font-black text-emerald-950">South round complete · Match finished</p>
          ) : <button type="button" onClick={onNextHand} className="rounded-lg bg-[#0b6749] px-7 py-3 font-black text-white hover:bg-[#07553b]">Next Hand</button>}
          <button type="button" onClick={onNewGame} className="rounded-lg border border-[#0b6749] px-5 py-3 font-black text-[#0b6749] hover:bg-emerald-50">New Match</button>
        </div>
      </div>
    </div>
  );
}

function drawReason(reason: NonNullable<GameState['result']>['reason']): string {
  return 'Exhaustive draw · no tiles remain.';
}
