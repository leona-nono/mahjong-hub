'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import TileFace, { TileBack } from './TileFace';
import {
  CLAIM_TIMEOUT_MS,
  RULESETS,
  availableConcealedKans,
  canDeclareTsumo,
  createGame,
  declareConcealedKan,
  declareTsumo,
  discard,
  drawTile,
  passUnansweredClaims,
  seatShanten,
  seatWaits,
  submitClaim,
  tilesRemaining,
  type ClaimOption,
  type GameState,
  type Ruleset,
  type Seat
} from '@/lib/mahjong/engine';
import { chooseClaim, chooseMove, type Difficulty } from '@/lib/mahjong/ai';
import { describeScore } from '@/lib/mahjong/scoring';
import { tileFace, type Tile } from '@/lib/mahjong/tiles';

const HUMAN: Seat = 0;

const SEAT_LABEL: Record<Seat, string> = {
  0: 'East',
  1: 'South',
  2: 'West',
  3: 'North'
};

/** Delays are what make the table feel like a table rather than a spreadsheet. */
const DELAY = { draw: 320, botDiscard: 620, botClaim: 280 };

export interface MahjongTableProps {
  /** Ruleset the page is dedicated to; the player can still switch. */
  defaultRuleset?: Ruleset;
  /** Points hook so a win can be reported to the site-wide points system. */
  onWin?: (points: number) => void;
}

export default function MahjongTable({
  defaultRuleset = 'hongkong',
  onWin
}: MahjongTableProps) {
  const t = useTranslations('mahjong');
  const [ruleset, setRuleset] = useState<Ruleset>(defaultRuleset);
  const traditional = ruleset === 'hongkong' || ruleset === 'chinese-official';
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [showHints, setShowHints] = useState(true);
  const [paused, setPaused] = useState(false);
  const [state, setState] = useState<GameState>(() =>
    createGame({ ruleset: defaultRuleset, humanSeat: HUMAN, seed: 1 })
  );

  const newGame = useCallback(
    (nextRuleset: Ruleset = ruleset) => {
      setState(createGame({ ruleset: nextRuleset, humanSeat: HUMAN }));
      setPaused(false);
    },
    [ruleset]
  );

  // --- Game driver --------------------------------------------------------
  // Everything that is not a human decision is advanced here on a timer, so the
  // engine stays synchronous and the UI stays readable.
  useEffect(() => {
    if (paused || state.phase === 'over') return undefined;

    if (state.phase === 'claim') {
      const pending = (Object.keys(state.claims).map(Number) as Seat[]).filter(
        (seat) => state.submitted[seat] === undefined
      );
      const timers: ReturnType<typeof setTimeout>[] = [];

      // Bots answer their own windows.
      const botSeat = pending.find((seat) => state.players[seat].isBot);
      if (botSeat !== undefined) {
        timers.push(
          setTimeout(() => {
            setState((current) => {
              const options = current.claims[botSeat];
              if (!options) return current;
              return submitClaim(
                current,
                botSeat,
                chooseClaim(current, botSeat, options, difficulty)
              );
            });
          }, DELAY.botClaim)
        );
      }

      // The person auto-passes once the claim window expires.
      if (pending.includes(HUMAN)) {
        const openedAt = state.claimOpenedAt ?? Date.now();
        const delay = Math.max(0, CLAIM_TIMEOUT_MS - (Date.now() - openedAt));
        timers.push(
          setTimeout(() => {
            setState((current) => passUnansweredClaims(current, Date.now()));
          }, delay)
        );
      }

      if (timers.length === 0) return undefined;
      return () => timers.forEach((timer) => clearTimeout(timer));
    }

    if (state.phase === 'draw') {
      const timer = setTimeout(() => setState((c) => drawTile(c)), DELAY.draw);
      return () => clearTimeout(timer);
    }

    if (state.phase === 'discard' && state.players[state.turn].isBot) {
      const timer = setTimeout(() => {
        setState((current) => {
          const seat = current.turn;
          const move = chooseMove(current, seat, difficulty);
          if (move.type === 'tsumo') return declareTsumo(current, seat);
          if (move.type === 'kan') return declareConcealedKan(current, seat, move.tile);
          return discard(current, move.tile);
        });
      }, DELAY.botDiscard);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [state, difficulty, paused]);

  // Report a human win to the site points system exactly once. A double ron
  // has no single `winner`, so the human seat has to be looked up in `winners`.
  useEffect(() => {
    if (state.result?.kind !== 'win') return;
    if (state.result.winner === HUMAN) {
      onWin?.(state.result.score?.total ?? 0);
    } else if (state.result.winners) {
      const mine = state.result.winners.find((w) => w.seat === HUMAN);
      if (mine) onWin?.(mine.score.total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.result]);

  const human = state.players[HUMAN];
  const myTurn = state.turn === HUMAN && state.phase === 'discard';
  const myClaims: ClaimOption[] | undefined =
    state.phase === 'claim' && state.submitted[HUMAN] === undefined
      ? state.claims[HUMAN]
      : undefined;

  const hints = useMemo(() => {
    if (!showHints) return null;
    const value = seatShanten(state, HUMAN);
    const waits = human.hand.length % 3 === 1 ? seatWaits(state, HUMAN) : [];
    return { shanten: value, waits };
  }, [state, human.hand.length, showHints]);

  const canTsumo = myTurn && canDeclareTsumo(state, HUMAN);
  const kanTiles = myTurn ? availableConcealedKans(state, HUMAN) : [];

  const handleDiscard = (tile: Tile) => {
    if (!myTurn) return;
    setState((current) => discard(current, tile));
  };

  const handleClaim = (option: ClaimOption) => {
    setState((current) => submitClaim(current, HUMAN, option));
  };

  return (
    <div className={traditional ? "relative min-h-[820px] overflow-hidden rounded-none border-[6px] border-[#073727] bg-[#07553f] p-2 text-white shadow-[0_24px_70px_rgba(2,44,34,.45)] sm:rounded-xl sm:p-4" : "rounded-3xl border border-emerald-900/20 bg-[radial-gradient(circle_at_center,#f8fffc_0%,#e4f6ef_62%,#d4eee4_100%)] p-3 shadow-[0_24px_70px_rgba(15,118,110,.16)] sm:p-6"}>
      {/* Controls */}
      {traditional && <div className="absolute right-5 top-5 z-20 text-sm font-semibold tracking-wide text-emerald-100/70">Rate: 10</div>}
      <div className={traditional ? "absolute left-3 top-3 z-30 flex flex-wrap items-center gap-2 rounded-lg border border-emerald-800/80 bg-[#062b23]/95 p-2 text-sm shadow-lg backdrop-blur" : "relative z-20 mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/80 bg-white/90 p-2 text-sm shadow-md backdrop-blur lg:absolute lg:left-3 lg:top-3 lg:mb-0"}>
        <select
          value={ruleset}
          onChange={(e) => {
            const next = e.target.value as Ruleset;
            setRuleset(next);
            newGame(next);
          }}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium"
          aria-label={t('rulesetLabel')}
        >
          {Object.values(RULESETS).map((config) => (
            <option key={config.id} value={config.id}>
              {config.label}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium"
          aria-label={t('difficultyLabel')}
        >
          <option value="easy">{t('easy')}</option>
          <option value="normal">{t('normal')}</option>
          <option value="hard">{t('hard')}</option>
        </select>

        <button
          type="button"
          onClick={() => setShowHints((v) => !v)}
          className={`rounded-full border px-3 py-1.5 font-medium transition ${
            showHints
              ? 'border-transparent rainbow-bar text-white'
              : 'border-gray-200 bg-white text-gray-600'
          }`}
        >
          {t('hints')}
        </button>

        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          className="rounded-full border border-emerald-700 bg-emerald-900/70 px-3 py-1.5 font-bold text-emerald-50 hover:bg-emerald-800"
        >
          {paused ? '▶ 继续' : 'Ⅱ 暂停'}
        </button>
        <button
          type="button"
          onClick={() => newGame()}
          className="ml-auto rounded-full border border-amber-300/70 bg-amber-300 px-3 py-1.5 font-bold text-emerald-950 hover:bg-amber-200"
        >
          {t('newGame')}
        </button>
      </div>

      {/* Opponents / table seats */}
      <div className={traditional ? "relative z-10 grid min-h-[650px] gap-2 rounded-[1.5rem] border border-emerald-950/40 bg-[linear-gradient(135deg,#064e3b,#07553f,#064e3b)] p-2 shadow-inner sm:grid-cols-3 sm:grid-rows-[auto_auto] lg:block" : "grid gap-2 rounded-[1.5rem] border border-emerald-900/10 bg-[linear-gradient(135deg,#0f766e,#115e59)] p-2 shadow-inner sm:grid-cols-3 sm:grid-rows-[auto_auto]"}>
        <div className="sm:col-span-3 lg:absolute lg:left-1/2 lg:top-8 lg:w-[48%] lg:-translate-x-1/2">
          <OpponentPanel state={state} seat={3} traditional={traditional} />
        </div>
        <div className="sm:col-start-1 sm:row-start-2 lg:absolute lg:left-5 lg:top-1/2 lg:w-40 lg:-translate-y-1/2">
          <OpponentPanel state={state} seat={2} traditional={traditional} />
        </div>
        <div className="sm:col-start-3 sm:row-start-2 lg:absolute lg:right-5 lg:top-1/2 lg:w-40 lg:-translate-y-1/2">
          <OpponentPanel state={state} seat={1} traditional={traditional} />
        </div>
      </div>

      {/* Table centre */}
      <div className={traditional ? "relative z-20 my-3 min-h-[470px] overflow-hidden rounded-2xl border border-emerald-950/80 bg-[#07553f] p-3 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.04),inset_0_20px_60px_rgba(0,0,0,.18)] sm:p-5 lg:absolute lg:left-1/2 lg:top-[155px] lg:my-0 lg:w-[58%] lg:-translate-x-1/2" : "my-4 rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm"}>
        {traditional && <>
          <WallRail position="top" />
          <WallRail position="left" />
          <WallRail position="right" />
          <WallRail position="bottom" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-44 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-950/80 bg-[#10131d] p-4 text-center shadow-2xl">
            <div className="text-[10px] uppercase tracking-[.24em] text-emerald-300">Hong Kong</div>
            <div className="mt-2 text-3xl font-light text-cyan-200">East 1</div>
            <div className="mt-1 text-xs text-slate-400">牌墙 {tilesRemaining(state)} · {SEAT_LABEL[state.turn]} 回合</div>
          </div>
        </>}
        <div className="relative z-10 mb-3 flex items-center justify-between text-xs text-gray-500">
          <span className={traditional ? "text-emerald-50" : ""}>
            {t('wallLeft', { n: tilesRemaining(state) })}
          </span>
          <span className={traditional ? "font-semibold text-amber-200" : ""}>
            {t('turnOf', { seat: SEAT_LABEL[state.turn] })}
          </span>
        </div>

        {traditional && (<div className="mb-3 grid grid-cols-2 gap-2 rounded-xl border border-white/15 bg-black/10 p-2 text-center text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-100 sm:grid-cols-4">{(["East", "South", "West", "North"] as const).map((seat) => (<span key={seat} className={SEAT_LABEL[state.turn] === seat ? "rounded-lg bg-amber-300/25 py-1 text-amber-100" : "py-1 opacity-70"}>{seat} {SEAT_LABEL[state.turn] === seat ? "· PLAYING" : ""}</span>))}</div>)}
        <div className={traditional ? "relative z-10 mt-36 rounded-xl border border-white/10 bg-black/15 p-2" : ""}><DiscardPool state={state} traditional={traditional} /></div>
      </div>

      {/* Result banner */}
      {state.phase === 'over' && state.result && (
        <ResultBanner state={state} onNewGame={() => newGame()} />
      )}

      {/* Claim prompt */}
      {myClaims && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <p className="mb-2 text-sm font-semibold text-amber-800">
            {t('claimPrompt', {
              tile: state.lastDiscard ? tileFace(state.lastDiscard.tile) : ''
            })}
          </p>
          <div className="flex flex-wrap gap-2">
            {myClaims.map((option, i) => (
              <button
                key={`${option.kind}-${i}`}
                type="button"
                onClick={() => handleClaim(option)}
                className="rounded-full rainbow-bar px-4 py-1.5 text-sm font-bold text-white shadow-sm hover:opacity-90"
              >
                {t(`call.${option.kind}`)}
                {option.tiles.length > 1 && option.kind === 'chi' && (
                  <span className="ml-1 opacity-80">
                    {option.tiles.map(tileFace).join('')}
                  </span>
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleClaim({ kind: 'pass', tiles: [] })}
              className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              {t('call.pass')}
            </button>
          </div>
        </div>
      )}

      {/* Player actions */}
      {(canTsumo || kanTiles.length > 0) && (
        <div className="mb-3 flex flex-wrap gap-2">
          {canTsumo && (
            <button
              type="button"
              onClick={() => setState((c) => declareTsumo(c, HUMAN))}
              className="rounded-full rainbow-bar px-5 py-2 text-sm font-black text-white shadow"
            >
              {t('call.tsumo')}
            </button>
          )}
          {kanTiles.map((tile) => (
            <button
              key={tile}
              type="button"
              onClick={() => setState((c) => declareConcealedKan(c, HUMAN, tile))}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700"
            >
              {t('call.kan')} {tileFace(tile)}
            </button>
          ))}
        </div>
      )}

      {/* Hand */}
      <div className="relative z-30 rounded-2xl border border-emerald-900/80 bg-[#f5f5ed]/95 p-3 shadow-[0_-10px_28px_rgba(15,23,42,.12)] backdrop-blur lg:absolute lg:bottom-4 lg:left-1/2 lg:w-[72%] lg:-translate-x-1/2">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700">
            {t('yourHand')} 路 {SEAT_LABEL[HUMAN]}
          </span>
          {hints && (
            <span className="text-xs text-gray-500">
              {hints.shanten <= 0
                ? t('ready', { tiles: hints.waits.map(tileFace).join(' ') || '—' })
                : t('awayFromReady', { n: hints.shanten })}
            </span>
          )}
        </div>

        {human.melds.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-3">
            {human.melds.map((meld, i) => (
              <div key={i} className="flex gap-0.5 rounded-lg bg-gray-50 p-1">
                {meld.tiles.map((tile, j) => (
                  <TileFace key={j} tile={tile} size="sm" traditional={traditional} />
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {human.hand.map((tile, i) => (
            <TileFace
              key={`${tile}-${i}`}
              tile={tile}
              size="lg"
              onClick={handleDiscard}
              disabled={!myTurn}
              highlight={myTurn && i === human.hand.length - 1}
              traditional={traditional}
            />
          ))}
        </div>

        {!myTurn && state.phase !== 'over' && !myClaims && (
          <p className="mt-2 text-xs text-gray-400">{t('waiting')}</p>
        )}
      </div>
    </div>
  );
}

function OpponentPanel({ state, seat, traditional }: { state: GameState; seat: Seat; traditional: boolean }) {
  const player = state.players[seat];
  const active = state.turn === seat && state.phase !== 'over';
  return (
    <div
      className={`rounded-2xl border p-3 transition ${
        active ? 'border-amber-300 bg-amber-50 shadow-[0_0_0_3px_rgba(251,191,36,.25)]' : 'border-white/20 bg-white/10 text-white'
      }`}
    >
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-emerald-50">
        <span className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 text-xs text-amber-200">{SEAT_LABEL[seat][0]}</span>{SEAT_LABEL[seat]}</span>
        <span className="text-gray-400">{player.hand.length}</span>
      </div>
      <div className="flex flex-wrap gap-0.5">
        {player.hand.map((_, i) => (
          <TileBack key={i} size="sm" />
        ))}
      </div>
      {player.melds.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {player.melds.map((meld, i) => (
            <div key={i} className="flex gap-0.5">
              {meld.tiles.map((tile, j) => (
                <TileFace key={j} tile={tile} size="sm" traditional={traditional} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WallRail({ position }: { position: 'top' | 'right' | 'bottom' | 'left' }) {
  const vertical = position === 'left' || position === 'right';
  const positionClass = position === 'top' ? 'left-1/2 top-5 -translate-x-1/2' : position === 'bottom' ? 'bottom-5 left-1/2 -translate-x-1/2' : position === 'left' ? 'left-5 top-1/2 -translate-y-1/2' : 'right-5 top-1/2 -translate-y-1/2';
  return <div aria-hidden="true" className={`absolute z-10 flex ${vertical ? 'flex-col' : 'flex-row'} gap-0.5 rounded-lg bg-[#0a7b4e]/80 p-1 shadow-[0_5px_0_rgba(0,0,0,.2)] ${positionClass}`}>
    {Array.from({ length: 13 }, (_, index) => <TileBack key={index} size="sm" />)}
  </div>;
}

function DiscardPool({ state, traditional }: { state: GameState; traditional: boolean }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {state.players.map((player) => (
        <div key={player.seat}>
          <div className="mb-1 text-[11px] font-medium text-gray-400">
            {SEAT_LABEL[player.seat]}
          </div>
          <div className="flex flex-wrap gap-0.5">
            {player.discards.map((tile, i) => {
              const isLatest =
                state.lastDiscard?.from === player.seat &&
                i === player.discards.length - 1;
              return (
                <TileFace
                  key={`${tile}-${i}`}
                  tile={tile}
                  size="sm"
                  muted={!isLatest}
                  highlight={isLatest}
                  traditional={traditional}
                />
              );
            })}
            {player.discards.length === 0 && (
              <span className="text-[11px] text-gray-300">—</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultBanner({
  state,
  onNewGame
}: {
  state: GameState;
  onNewGame: () => void;
}) {
  const t = useTranslations('mahjong');
  const result = state.result!;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-slate-950/40 p-4 text-center">
      {result.kind === 'draw' ? (
        <p className="font-bold text-emerald-800">{t('drawnGame')}</p>
      ) : result.winners ? (
        <>
          <p className="font-bold text-emerald-800">{t('doubleRon')}</p>
          {result.winners.map((w) => (
            <div key={w.seat} className="mt-1">
              <p className="font-semibold text-emerald-800">
                {w.seat === 0
                  ? t('youWin', { score: w.score.total })
                  : t('seatWins', {
                      seat: SEAT_LABEL[w.seat as Seat],
                      score: w.score.total
                    })}
              </p>
              <p className="text-sm text-emerald-700">
                {describeScore(w.score)}
              </p>
            </div>
          ))}
        </>
      ) : (
        <>
          <p className="font-bold text-emerald-800">
            {result.winner === 0
              ? t('youWin', { score: result.score?.total ?? 0 })
              : t('seatWins', {
                  seat: SEAT_LABEL[result.winner as Seat],
                  score: result.score?.total ?? 0
                })}
          </p>
          {result.score && (
            <p className="mt-1 text-sm text-emerald-700">
              {describeScore(result.score)}
            </p>
          )}
        </>
      )}
      <button
        type="button"
        onClick={onNewGame}
        className="mt-3 rounded-full rainbow-bar px-5 py-2 text-sm font-bold text-white shadow"
      >
        {t('newGame')}
      </button>
    </div>
  );
}
