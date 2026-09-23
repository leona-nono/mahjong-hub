'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import TileFace from '../TileFace';
import type { GameState, HongKongMode, Seat, SelfDrawEvaluation } from '@/lib/mahjong/engine';
import { formatPatternList, formatPaymentLabel, formatScoreHeadline } from '@/features/table/score-copy';
import { tileFace, type Tile } from '@/lib/mahjong/tiles';
import { buildCoachReview } from '@/lib/mahjong/coach';
import { useCoachIntensity, useCoachRevealDisclosed } from '@/features/table/coach-prefs';
import CoachReviewPanel from './CoachReviewPanel';

const HUMAN: Seat = 0;
const SEAT_KEY = { 0: 'seatEast', 1: 'seatSouth', 2: 'seatWest', 3: 'seatNorth' } as const;

export interface TurnHintsBarProps {
  myTurn: boolean;
  currentWind: string;
  hints: { shanten: number; waits: Tile[] } | null;
  tsumoEvaluation: SelfDrawEvaluation | null;
  scoreUnit: string;
}

/** Turn status + shanten / wait hints above the human rack. */
export function TurnHintsBar({ myTurn, currentWind, hints, tsumoEvaluation, scoreUnit }: TurnHintsBarProps) {
  const t = useTranslations('mahjong');
  return (
    <div className="mb-2 flex h-5 items-center justify-between px-1 text-xs font-semibold text-emerald-100/75">
      <span>{myTurn ? t('yourTurnDiscard') : t('seatPlaying', { seat: currentWind })}</span>
      {hints && (
        <span>
          {tsumoEvaluation?.complete
            ? tsumoEvaluation.legal
              ? t('winningHandScore', { score: tsumoEvaluation.score?.total ?? 0, unit: scoreUnit })
              : t('completeHandRequired', { score: tsumoEvaluation.score?.total ?? 0, min: tsumoEvaluation.minimum, unit: scoreUnit })
            : hints.shanten <= 0
              ? t('ready', { tiles: hints.waits.map(tileFace).join(' ') || '-' })
              : t('awayFromReady', { n: hints.shanten })}
        </span>
      )}
    </div>
  );
}

export interface McrScoreCoachProps {
  qualifying: number;
  flowers: number;
  patterns: { id?: string; label: string; value: number }[] | undefined;
}

/** Unpositioned MCR score body — used by CoachCabin / mobile drawers. */
export function McrScoreBody({ qualifying, flowers, patterns }: McrScoreCoachProps) {
  const t = useTranslations('mahjong');
  return (
    <div className="text-xs text-emerald-50">
      <p className="font-black uppercase tracking-[.14em] text-amber-200">{t('mcrScoreCoach')}</p>
      <div className="mt-2 flex justify-between">
        <span>{t('qualifyingHand')}</span>
        <strong>{qualifying}/8</strong>
      </div>
      <div className="mt-1 flex justify-between">
        <span>{t('flowersSeasons')}</span>
        <strong>+{flowers}</strong>
      </div>
      <p className="mt-2 text-sm leading-5 text-emerald-100/75">{t('flowerGateNote')}</p>
      {patterns?.length ? (
        <p className="mt-2 border-t border-white/10 pt-2 text-sm leading-5 text-amber-50">
          {formatPatternList(
            patterns.map((pattern) => ({ id: pattern.id ?? '', label: pattern.label, value: pattern.value })),
            t,
            'plus'
          )}
        </p>
      ) : null}
    </div>
  );
}

/** @deprecated Prefer CoachCabin + McrScoreBody — absolute card overlaps seat-1 rack. */
export function McrScoreCoach(props: McrScoreCoachProps) {
  return (
    <div className="absolute right-[12%] top-[56%] z-20 w-52 rounded-xl border border-amber-200/25 bg-[#063d30]/95 p-3 shadow-xl">
      <McrScoreBody {...props} />
    </div>
  );
}

export interface ScoringTipsDialogProps {
  open: boolean;
  gameName: string;
  variant: 'hongkong' | 'riichi' | 'chinese-official';
  hongKongMode: HongKongMode;
  onClose: () => void;
}

/** Modal with ruleset scoring tips. */
export function ScoringTipsDialog({ open, gameName, variant, hongKongMode, onClose }: ScoringTipsDialogProps) {
  const t = useTranslations('mahjong');
  if (!open) return null;
  const isRiichi = variant === 'riichi';
  const isMcr = variant === 'chinese-official';
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-label={gameName + ' Mahjong scoring tips'}>
      <div className="w-full max-w-lg rounded-2xl bg-[#f4f0df] p-6 text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">{gameName} {t('scoringTips')}</h2>
          <button type="button" onClick={onClose} className="flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full bg-slate-900 text-white" aria-label={t('closeScoringTips')}>X</button>
        </div>
        <ul className="mt-4 space-y-2 text-sm leading-6">
          {isRiichi ? (
            <>
              <li>{t('tipRiichiYaku')}</li>
              <li>{t('tipRiichiDeclaration')}</li>
              <li>{t('tipRiichiHeadBump')}</li>
              <li>{t('tipRiichiNoRed')}</li>
            </>
          ) : isMcr ? (
            <>
              <li>{t('tipMcrWall')}</li>
              <li>{t('tipMcrGate')}</li>
              <li>{t('tipMcrTraining')}</li>
              <li>{t('tipMcrOpenInfo')}</li>
            </>
          ) : (
            <>
              <li>{t('tipHkWall')}</li>
              <li>
                <strong>{hongKongMode === 'casual' ? t('tipHkCasualLabel') : t('tipHkStandardLabel')}</strong>{' '}
                {hongKongMode === 'casual' ? t('tipHkCasualBody') : t('tipHkStandardBody')}
              </li>
              <li>{t('tipHkCap')}</li>
              <li>{t('tipHkDiscardWin')}</li>
              <li>{t('tipHkSelfDraw')}</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export interface ResultBannerProps {
  state: GameState;
  onNewGame: () => void;
  onNextHand: () => void;
}

/** End-of-hand result overlay with score breakdown and hand review. */
export function ResultBanner({ state, onNewGame, onNextHand }: ResultBannerProps) {
  const t = useTranslations('mahjong');
  const reviewT = useTranslations('review');
  const seats = useTranslations('regional');
  const seatName = (seat: number) => seats(SEAT_KEY[seat as Seat]);
  const result = state.result!;
  const selfDrawn = result.kind === 'win' && !result.winners && result.loser === undefined;
  const humanWon = result.winner === HUMAN || result.winners?.some((item) => item.seat === HUMAN);
  const winnerSeat = result.winner ?? result.winners?.[0]?.seat;
  const winner = winnerSeat === HUMAN ? t('youLabel') : winnerSeat !== undefined ? seatName(winnerSeat) : '';
  const reviewTiles = (seat: Seat) => [
    ...state.players[seat].hand,
    ...(seat === winnerSeat && result.loser !== undefined && state.lastDiscard ? [state.lastDiscard.tile] : [])
  ];

  const [coachIntensity] = useCoachIntensity();
  const [revealDisclosed, markRevealDisclosed] = useCoachRevealDisclosed();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [showDisclose, setShowDisclose] = useState(false);
  const coachReview = useMemo(
    () =>
      buildCoachReview(state, HUMAN, {
        discloseReveal: showDisclose
      }),
    [state, showDisclose]
  );

  const openReview = () => {
    setShowDisclose(!revealDisclosed);
    setReviewOpen(true);
    if (!revealDisclosed) markRevealDisclosed();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[3px]">
      <div className="max-h-[92vh] min-w-[380px] overflow-y-auto rounded-2xl border-2 border-amber-300 bg-[#f4f0df] p-8 text-center text-emerald-950 shadow-[0_0_70px_rgba(251,191,36,.38)]">
        {result.kind === 'draw' ? (
          <>
            <p className="text-3xl font-black">{t('drawGame')}</p>
            {result.reason && <p className="mt-2 text-sm font-bold text-emerald-800">{result.reason === 'nine-terminals' ? t('drawReasonNine') : result.reason === 'four-winds' ? t('drawReasonFourWinds') : result.reason === 'four-kans' ? t('drawReasonFourKans') : t('drawReasonExhaustive')}</p>}
          </>
        ) : (
          <>
            <p className="text-sm font-black uppercase tracking-[.3em] text-rose-600">{selfDrawn ? t('selfDrawLabel') : t('winOnDiscardLabel')}</p>
            <p className="mt-2 text-4xl font-black">{humanWon ? t('youWinExclaim') : t('seatWinsExclaim', { seat: winner })}</p>
            {result.score && (
              <>
                <p className="mt-3 text-2xl font-black text-amber-700">
                  {formatScoreHeadline(state.ruleset, result.score, t)}
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-emerald-800">{formatPatternList(result.score.patterns, t)}</p>
                {result.score.paymentLabel && (
                  <p className="mt-2 text-sm font-bold">{formatPaymentLabel(result.score.paymentLabel, t, seatName)}</p>
                )}
              </>
            )}
            {winnerSeat !== undefined && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-white/80 p-4 text-left">
                <p className="text-center text-sm font-black uppercase tracking-[.16em] text-emerald-800">{t('winningHandReview', { winner })}</p>
                <p className="mt-1 text-center text-xs font-bold text-slate-500">{t('revealReviewNote')}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {([0, 1, 2, 3] as Seat[]).map((seat) => {
                    const isWinner = seat === winnerSeat;
                    const tiles = reviewTiles(seat);
                    return <div key={seat} className={`rounded-lg border p-2 ${isWinner ? 'border-amber-400 bg-amber-50' : 'border-emerald-100 bg-white'}`}>
                      <p className="text-center text-[11px] font-black text-emerald-800">{seat === HUMAN ? t('youLabel') : seatName(seat)}{isWinner ? ` - ${t('winnerLabel')}` : ''}</p>
                      <div className="mt-1 flex flex-wrap justify-center gap-px">{tiles.map((tile, index) => <TileFace key={`${tile}-${index}`} tile={tile} size="sm" traditional highlight={Boolean(isWinner && result.loser !== undefined && index === tiles.length - 1)} />)}</div>
                      {state.players[seat].melds.length > 0 && <div className="mt-1 flex flex-wrap justify-center gap-1 border-t border-emerald-100 pt-1">{state.players[seat].melds.map((meld, meldIndex) => <div key={meldIndex} className="flex gap-px rounded bg-emerald-50 p-0.5">{meld.tiles.map((tile, tileIndex) => <TileFace key={`${tile}-${tileIndex}`} tile={tile} size="xs" traditional />)}</div>)}</div>}
                    </div>;
                  })}
                </div>
              </div>
            )}
          </>
        )}
        {state.matchEnded && state.matchResult && (
          <div className="mt-5 rounded-xl border border-amber-300/70 bg-amber-50 p-3 text-left">
            <p className="text-center text-sm font-black uppercase tracking-[.16em] text-emerald-800">{t('wrcHanchanResult')}</p>
            <div className="mt-2 space-y-1 text-sm font-bold">
              {state.matchResult.rankings.map((entry) => (
                <div key={entry.seat} className="grid grid-cols-[2.5rem_1fr_auto] gap-2">
                  <span>#{entry.rank}</span>
                  <span>{entry.seat === HUMAN ? t('youLabel') : seatName(entry.seat)}</span>
                  <span>{entry.score.toLocaleString()} · {entry.uma >= 0 ? '+' : ''}{entry.uma}P</span>
                </div>
              ))}
            </div>
            {state.matchResult.remainingRiichiSticks > 0 && <p className="mt-2 text-xs font-bold text-amber-800">{t('riichiDepositsRemain', { n: state.matchResult.remainingRiichiSticks })}</p>}
          </div>
        )}

        {/* Settlement teaching entry: live/ask = coach CTA; silent = table-local static link (P1-10). */}
        <div className="mt-5">
          {coachIntensity === 'silent' ? (
            <button
              type="button"
              onClick={openReview}
              className="text-sm font-bold text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
            >
              {reviewT('staticEntry')}
            </button>
          ) : (
            <button
              type="button"
              onClick={openReview}
              className="rounded-lg border border-amber-500/50 bg-amber-100 px-5 py-2.5 text-sm font-black text-emerald-950 hover:bg-amber-200"
            >
              {reviewT('offerCta')}
            </button>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          {state.matchEnded ? (
            <p className="rounded-lg bg-amber-100 px-5 py-3 font-black text-emerald-950">{t('southRoundComplete')}</p>
          ) : <button type="button" onClick={onNextHand} className="rounded-lg bg-[#0b6749] px-7 py-3 font-black text-white hover:bg-[#07553b]">{t('nextHand')}</button>}
          <button type="button" onClick={onNewGame} className="rounded-lg border border-[#0b6749] px-5 py-3 font-black text-[#0b6749] hover:bg-emerald-50">{t('newMatch')}</button>
        </div>
      </div>
      {reviewOpen && (
        <CoachReviewPanel
          key={showDisclose ? 'first-review' : 'review'}
          review={coachReview}
          onClose={() => setReviewOpen(false)}
          defaultOpen={
            showDisclose
              ? ['A', 'B']
              : coachReview.outcome === 'iWon'
                ? ['A', 'C']
                : ['miss']
          }
        />
      )}
    </div>
  );
}
