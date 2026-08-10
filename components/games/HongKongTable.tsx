'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import TileFace, { TileBack } from './TileFace';
import { tilesRemaining, type ClaimOption, type GameState, type Seat, type SelfDrawEvaluation } from '@/lib/mahjong/engine';
import { describeScore } from '@/lib/mahjong/scoring';
import { tileFace, type Tile } from '@/lib/mahjong/tiles';
import type { Difficulty } from '@/lib/mahjong/ai';
import { playMahjongSound, primeMahjongAudio } from '@/lib/mahjong/sound';

const HUMAN: Seat = 0;
const SEAT_LABEL: Record<Seat, string> = { 0: 'East', 1: 'South', 2: 'West', 3: 'North' };
interface HongKongTableProps {
  state: GameState;
  paused: boolean;
  difficulty: Difficulty;
  showHints: boolean;
  myTurn: boolean;
  myClaims?: ClaimOption[];
  hints: { shanten: number; waits: Tile[] } | null;
  canTsumo: boolean;
  tsumoEvaluation: SelfDrawEvaluation | null;
  kanTiles: Tile[];
  onDifficulty: (difficulty: Difficulty) => void;
  onToggleHints: () => void;
  onTogglePause: () => void;
  onNewGame: () => void;
  onDiscard: (tile: Tile) => void;
  onClaim: (option: ClaimOption) => void;
  onTsumo: () => void;
  onKan: (tile: Tile) => void;
}

/**
 * Dedicated Hong Kong table.  The layout deliberately follows the familiar
 * landscape tabletop composition of the reference experience, while all game
 * state, artwork and interaction are owned by this project.
 */
export default function HongKongTable({
  state,
  paused,
  difficulty,
  showHints,
  myTurn,
  myClaims,
  hints,
  canTsumo,
  tsumoEvaluation,
  kanTiles,
  onDifficulty,
  onToggleHints,
  onTogglePause,
  onNewGame,
  onDiscard,
  onClaim,
  onTsumo,
  onKan
}: HongKongTableProps) {
  const t = useTranslations('mahjong');
  const human = state.players[HUMAN];
  const currentWind = SEAT_LABEL[state.turn];
  const tableShellRef = useRef<HTMLElement>(null);
  const [showScoring, setShowScoring] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousState = useRef<GameState | null>(null);

  useEffect(() => {
    const previous = previousState.current;
    previousState.current = state;
    if (!previous || !soundEnabled) return;

    if (!previous.result && state.result?.kind === 'win') {
      playMahjongSound('win');
      return;
    }

    const previousMelds = previous.players.reduce((total, player) => total + player.melds.length, 0);
    const currentMelds = state.players.reduce((total, player) => total + player.melds.length, 0);
    if (currentMelds > previousMelds) {
      const changedPlayer = state.players.find((player, seat) => player.melds.length > previous.players[seat].melds.length);
      const melds = changedPlayer?.melds;
      const kind = melds?.[melds.length - 1]?.kind;
      if (kind) playMahjongSound(kind);
      return;
    }

    const previousDiscards = previous.players.reduce((total, player) => total + player.discards.length, 0);
    const currentDiscards = state.players.reduce((total, player) => total + player.discards.length, 0);
    if (currentDiscards > previousDiscards) {
      playMahjongSound('discard', state.lastDiscard?.tile);
      return;
    }

    if (state.wallIndex > previous.wallIndex) playMahjongSound('draw');
  }, [state, soundEnabled]);

  return (
    <section ref={tableShellRef} className="overflow-x-auto rounded-xl bg-[#176845] p-2 shadow-[0_24px_60px_rgba(0,45,31,.35)] sm:p-3 fullscreen:overflow-auto fullscreen:rounded-none fullscreen:p-3">
      <div className="min-w-[980px]">
        <div className="mb-2 flex h-11 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TableToolButton onClick={onTogglePause} active={paused}>
              {paused ? '▶ Continue' : 'Ⅱ Pause'}
            </TableToolButton>
            <TableToolButton onClick={() => {
              primeMahjongAudio();
              if (soundEnabled) playMahjongSound('shuffle');
              onNewGame();
            }}>↻ New Game</TableToolButton>
            <TableToolButton onClick={onToggleHints} active={showHints}>
              ◇ Hints
            </TableToolButton>
            <TableToolButton onClick={() => {
              primeMahjongAudio();
              setSoundEnabled((enabled) => {
                if (!enabled) playMahjongSound('toggle');
                return !enabled;
              });
            }} active={soundEnabled}>
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </TableToolButton>
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
            <ConcealedRack seat={3} count={state.players[3].hand.length} />
          </div>
          <div className="absolute left-[15%] top-1/2 -translate-y-1/2">
            <ConcealedRack seat={2} count={state.players[2].hand.length} vertical />
          </div>
          <div className="absolute right-[15%] top-1/2 -translate-y-1/2">
            <ConcealedRack seat={1} count={state.players[1].hand.length} vertical />
          </div>

          <PlayerBadge state={state} seat={3} className="right-[19%] top-[11%]" />
          <PlayerBadge state={state} seat={2} className="left-5 top-[39%]" />
          <PlayerBadge state={state} seat={1} className="right-5 top-[39%]" />
          <PlayerBadge state={state} seat={0} className="bottom-[16%] left-[12%]" human />

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
              <span className="text-[13px] uppercase tracking-[.28em] text-cyan-300/75">Hong Kong</span>
              <strong className="mt-1 text-2xl font-normal text-cyan-200">East 1</strong>
              <span className="mt-1 text-4xl font-light text-cyan-200">{tilesRemaining(state)}</span>
            </div>
            <CenterWind position="top" active={state.turn === 3}>N</CenterWind>
            <CenterWind position="right" active={state.turn === 1}>S</CenterWind>
            <CenterWind position="bottom" active={state.turn === 0}>E</CenterWind>
            <CenterWind position="left" active={state.turn === 2}>W</CenterWind>
          </div>

          {paused && (
            <button
              type="button"
              onClick={onTogglePause}
              className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 text-4xl font-semibold text-amber-100 backdrop-blur-[2px]"
            >
              ▶ Continue Game
            </button>
          )}

          {(myClaims || canTsumo || tsumoEvaluation?.complete || kanTiles.length > 0) && !paused && (
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
                  Complete hand: {tsumoEvaluation.score?.total ?? 0} Fan. This table requires {tsumoEvaluation.minimum} Fan, so it cannot be declared as a win.
                </div>
              )}
              {canTsumo && (
                <button type="button" onClick={() => { primeMahjongAudio(); onTsumo(); }} className="animate-pulse rounded-lg bg-rose-500 px-6 py-3 text-base font-black text-white shadow-[0_0_24px_rgba(244,63,94,.55)]">
                  Self Draw - Win
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
                      ? `Winning hand - ${tsumoEvaluation.score?.total ?? 0} Fan`
                      : `Complete hand - ${tsumoEvaluation.score?.total ?? 0}/${tsumoEvaluation.minimum} Fan required`
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
            <div className="flex items-end justify-center gap-[2px]">
              {human.hand.map((tile, index) => (
                <span key={`${tile}-${index}`} className={index === human.hand.length - 1 ? 'ml-3' : ''}>
                  <TileFace
                    tile={tile}
                    size="xl"
                    traditional
                    onClick={(tile) => {
                      primeMahjongAudio();
                      onDiscard(tile);
                    }}
                    disabled={!myTurn || paused}
                    highlight={myTurn && index === human.hand.length - 1}
                  />
                </span>
              ))}
            </div>
          </div>

          {state.phase === 'over' && state.result && (
            <HongKongResultBanner state={state} onNewGame={onNewGame} />
          )}
        </div>

        <div className="flex h-10 items-center justify-between bg-[#15583e] px-3 text-sm font-semibold text-emerald-100/75">
          <span>Hong Kong Mahjong</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowScoring(true)} className="rounded px-2 py-1 hover:bg-white/10">Scoring Tips</button>
            <button type="button" onClick={() => tableShellRef.current?.requestFullscreen()} className="rounded px-2 py-1 hover:bg-white/10">Full Screen</button>
          </div>
        </div>
      </div>
      {showScoring && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-label="Hong Kong Mahjong scoring tips">
          <div className="w-full max-w-lg rounded-2xl bg-[#f4f0df] p-6 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Hong Kong Scoring Tips</h2>
              <button type="button" onClick={() => setShowScoring(false)} className="h-9 w-9 rounded-full bg-slate-900 text-white" aria-label="Close scoring tips">X</button>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6">
              <li><strong>132-tile wall:</strong> Flowers, Seasons and the White Dragon (white board) are not used.</li>
              <li><strong>3 Fan minimum:</strong> a complete hand must reach at least 3 Fan.</li>
              <li><strong>10 Fan cap:</strong> compatible patterns combine up to the table cap.</li>
              <li><strong>Discard win:</strong> the discarder pays the full score.</li>
              <li><strong>Self draw:</strong> all three opponents pay.</li>
              <li><strong>Core calls:</strong> Chow, Pung and Kong follow Hong Kong claim priority.</li>
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
  human = false
}: {
  state: GameState;
  seat: Seat;
  className: string;
  human?: boolean;
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
function HongKongResultBanner({ state, onNewGame }: { state: GameState; onNewGame: () => void }) {
  const result = state.result!;
  const selfDrawn = result.kind === 'win' && !result.winners && result.loser === undefined;
  const humanWon = result.winner === HUMAN || result.winners?.some((item) => item.seat === HUMAN);
  const winner = result.winner === HUMAN ? 'You' : SEAT_LABEL[result.winner as Seat];
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[3px]">
      <div className="min-w-[380px] rounded-2xl border-2 border-amber-300 bg-[#f4f0df] p-8 text-center text-emerald-950 shadow-[0_0_70px_rgba(251,191,36,.38)]">
        {result.kind === 'draw' ? (
          <p className="text-3xl font-black">Draw Game</p>
        ) : (
          <>
            <p className="text-sm font-black uppercase tracking-[.3em] text-rose-600">{selfDrawn ? 'Self Draw' : 'Win on Discard'}</p>
            <p className="mt-2 text-4xl font-black">{humanWon ? 'You Win!' : `${winner} Wins`}</p>
            {result.score && (
              <>
                <p className="mt-3 text-2xl font-black text-amber-700">{result.score.total} Fan</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-emerald-800">{describeScore(result.score)}</p>
                {selfDrawn && <p className="mt-2 text-sm font-bold">Each opponent pays {result.score.total}</p>}
              </>
            )}
          </>
        )}
        <button type="button" onClick={onNewGame} className="mt-6 rounded-lg bg-[#0b6749] px-7 py-3 font-black text-white hover:bg-[#07553b]">New Game</button>
      </div>
    </div>
  );
}