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
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [showHints, setShowHints] = useState(true);
  const [state, setState] = useState<GameState>(() =>
    createGame({ ruleset: defaultRuleset, humanSeat: HUMAN })
  );

  const newGame = useCallback(
    (nextRuleset: Ruleset = ruleset) => {
      setState(createGame({ ruleset: nextRuleset, humanSeat: HUMAN }));
    },
    [ruleset]
  );

  // --- Game driver --------------------------------------------------------
  // Everything that is not a human decision is advanced here on a timer, so the
  // engine stays synchronous and the UI stays readable.
  useEffect(() => {
    if (state.phase === 'over') return undefined;

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
  }, [state, difficulty]);

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
    <div className="relative rounded-3xl rainbow-card p-4 sm:p-6">
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
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
          onClick={() => newGame()}
          className="ml-auto rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('newGame')}
        </button>
      </div>

      {/* Opponents */}
      <div className="grid gap-2 sm:grid-cols-3">
        {([1, 2, 3] as Seat[]).map((seat) => (
          <OpponentPanel key={seat} state={state} seat={seat} />
        ))}
      </div>

      {/* Table centre */}
      <div className="my-4 rounded-2xl border border-white/25 bg-cover bg-center p-4 shadow-inner" style={{ backgroundImage: 'linear-gradient(rgba(19, 58, 51, .82), rgba(19, 58, 51, .88)), var(--mahjong-table-image)' }}>
        <div className="mb-3 flex items-center justify-between text-xs text-white/75">
          <span>
            {t('wallLeft', { n: tilesRemaining(state) })}
          </span>
          <span>
            {t('turnOf', { seat: SEAT_LABEL[state.turn] })}
          </span>
        </div>

        <DiscardPool state={state} />
      </div>

      {/* Table-level settlement overlay */}
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
      <div className="rounded-2xl bg-white/80 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700">
            {t('yourHand')} · {SEAT_LABEL[HUMAN]}
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
                  <TileFace key={j} tile={tile} size="sm" />
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

function OpponentPanel({ state, seat }: { state: GameState; seat: Seat }) {
  const player = state.players[seat];
  const active = state.turn === seat && state.phase !== 'over';
  const justWon = state.result?.kind === 'win' && (state.result.winner === seat || state.result.winners?.some((winner) => winner.seat === seat));
  return (
    <div
      className={`rounded-2xl border p-2 transition ${
        active ? 'border-[#e8c476] bg-[#fff9e9]' : 'border-[#d8d7cd] bg-[#fffdf7]'
      }`}
    >
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-600">
        <span className="flex items-center gap-1.5"><span className={`h-6 w-6 rounded-full border bg-cover ${justWon ? 'border-[#d6a544] ring-2 ring-[#f6df9c]' : active ? 'border-[#1e554d] ring-2 ring-[#a8cfc5]' : 'border-[#d6c69d]'}`} aria-hidden="true" style={{ backgroundImage: "url('/images/mahjong/ai-avatars-default.webp')", backgroundSize: '200% 200%', backgroundPosition: seat === 1 ? '100% 0%' : seat === 2 ? '0% 100%' : '100% 100%' }} />{SEAT_LABEL[seat]}</span>
        <span className={`flex items-center gap-1 text-[10px] ${active ? 'text-[#1e554d]' : justWon ? 'text-[#9a6a19]' : 'text-gray-400'}`}><i className={`h-1.5 w-1.5 rounded-full ${active ? 'animate-pulse bg-[#2d756a]' : justWon ? 'bg-[#d6a544]' : 'bg-gray-300'}`} />{player.hand.length}</span>
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
                <TileFace key={j} tile={tile} size="sm" />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DiscardPool({ state }: { state: GameState }) {
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
    <div className="absolute inset-0 z-30 grid place-items-center rounded-3xl bg-[#102720]/65 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-3xl border border-[#fff6df]/45 bg-[#fffdf7]/95 p-6 text-center shadow-2xl">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f9e6b4] text-2xl">✦</div>
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
    </div>
  );
}
