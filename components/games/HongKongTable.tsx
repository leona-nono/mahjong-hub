'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import TileFace, { useTraditionalTilePreload } from './TileFace';
import MobileMahjongTable from './MobileMahjongTable';
import BoardScaleFrame from './BoardScaleFrame';
import TableToolButton from './TableToolButton';
import ClaimDialog from './table/ClaimDialog';
import DiscardPool from './table/DiscardPool';
import { McrScoreCoach, ResultBanner, ScoringTipsDialog, TurnHintsBar } from './table/ScorePanel';
import { tilesRemaining, type ClaimOption, type GameState, type HongKongMode, type RiichiVariant, type Seat, type SelfDrawEvaluation } from '@/lib/mahjong/engine';
import { type Tile } from '@/lib/mahjong/tiles';
import type { Difficulty } from '@/lib/mahjong/ai';
import { playMahjongOpeningSequence, playMahjongSound, primeMahjongAudio, stopMahjongSpeech } from '@/features/table/sound';
import MahjongAccessibilityPanel, { useMahjongPreferences } from './MahjongAccessibilityPanel';
import { trackMahjongEvent } from '@/features/table/telemetry';
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
  coach?: ReactNode;
  onDiscard: (tile: Tile) => void;
  onClaim: (option: ClaimOption) => void;
  onTsumo: () => void;
  onKan: (tile: Tile) => void;
  onRiichi?: () => void;
  /** Standard-flavour Riichi only: abandon an opening nine-terminal hand. */
  canAbortNineTerminals?: boolean;
  onNineTerminals?: () => void;
  riichiVariant?: RiichiVariant;
  onRiichiVariant?: (variant: RiichiVariant) => void;
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
  coach,
  onDiscard,
  onClaim,
  onTsumo,
  onKan,
  onRiichi,
  canAbortNineTerminals = false,
  onNineTerminals,
  riichiVariant = 'wrc',
  onRiichiVariant
}: HongKongTableProps) {
  useTraditionalTilePreload();
  const t = useTranslations('mahjong');
  const human = state.players[HUMAN];
  const currentWind = SEAT_LABEL[state.turn];
  const isRiichi = variant === 'riichi';
  const isMcr = variant === 'chinese-official';
  // Keep the call-outs faithful to the ruleset, rather than to the site's UI
  // language.  Chinese Official is played with Mandarin call-outs; Hong Kong
  // remains Cantonese and Riichi remains Japanese.
  const voiceLocale = isRiichi ? 'japanese' as const : isMcr ? 'mandarin' as const : 'cantonese' as const;
  const gameName = isRiichi ? 'Japanese Riichi' : isMcr ? 'Chinese Official · MCR' : 'Hong Kong';
  const scoreUnit = t(isRiichi ? 'unitHan' : isMcr ? 'unitPoints' : 'unitFan');
  const mcrQualifying = tsumoEvaluation?.score?.qualifyingTotal ?? 0;
  const mcrFlowers = human.flowers.length;
  // Settlement is auditable: a winning hand turns every concealed rack face-up.
  const revealAllHands = state.phase === 'over' && state.result?.kind === 'win';
  // A stable three-side wall makes the remaining wall and table orientation
  // readable; it does not expose any opponent's concealed hand.
  const wallTiles = Math.max(6, Math.min(18, Math.ceil(tilesRemaining(state) / 4)));
  const roundLabel = `${WIND_LABEL[state.roundWind]} ${state.handNumber % 4 + 1}`;
  const tableShellRef = useRef<HTMLElement>(null);
  const [showScoring, setShowScoring] = useState(false);
  const { preferences, setPreference } = useMahjongPreferences();
  const soundEnabled = preferences.soundEnabled;
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previousState = useRef<GameState | null>(null);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === tableShellRef.current);
    };
    document.addEventListener('fullscreenchange', syncFullscreenState);
    syncFullscreenState();
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  const enterFullscreen = () => {
    const shell = tableShellRef.current;
    if (!shell) return;
    // Apply the layout before the browser dispatches fullscreenchange. Some
    // Chromium builds paint the first fullscreen frame before that event.
    setIsFullscreen(true);
    trackMahjongEvent('mahjong_fullscreen', { variant });
    void shell.requestFullscreen().catch(() => setIsFullscreen(false));
  };

  const toggleSound = () => {
    primeMahjongAudio();
    const next = !soundEnabled;
    if (!next) stopMahjongSpeech();
    setPreference('soundEnabled', next);
    if (next) playMahjongSound('toggle', undefined, voiceLocale);
    trackMahjongEvent('mahjong_sound_changed', { variant, enabled: next });
  };

  const startNewGame = () => {
    stopMahjongSpeech();
    primeMahjongAudio();
    if (soundEnabled) playMahjongOpeningSequence(voiceLocale);
    onNewGame();
  };

  const continueNextHand = () => {
    stopMahjongSpeech();
    onNextHand();
  };

  const togglePause = () => {
    if (!paused) stopMahjongSpeech();
    onTogglePause();
  };

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

    const previousFlowers = previous.players.reduce((total, player) => total + player.flowers.length, 0);
    const currentFlowers = state.players.reduce((total, player) => total + player.flowers.length, 0);
    if (currentFlowers > previousFlowers) {
      playMahjongSound('flower', undefined, voiceLocale, false);
      return;
    }

    const previousDiscards = previous.players.reduce((total, player) => total + player.discards.length, 0);
    const currentDiscards = state.players.reduce((total, player) => total + player.discards.length, 0);
    if (currentDiscards > previousDiscards) {
      // Human discards play inside the click gesture (desktop and mobile), so
      // the AudioContext is guaranteed to be active. This effect is for AI.
      if (state.lastDiscard?.from === HUMAN) return;
      playMahjongSound('discard', state.lastDiscard?.tile, voiceLocale);
      return;
    }

    if (state.wallIndex > previous.wallIndex) playMahjongSound('draw', undefined, voiceLocale);
  }, [state, soundEnabled, voiceLocale]);

  return (
    <section ref={tableShellRef} data-high-contrast={preferences.highContrast} data-reduced-motion={preferences.reducedMotion} data-tile-scale={preferences.tileScale} className={`mahjong-table-shell relative ${isFullscreen ? 'mahjong-table-shell--fullscreen' : ''} overflow-hidden rounded-xl bg-[#176845] p-0 shadow-[0_24px_60px_rgba(0,45,31,.35)] lg:p-3 fullscreen:rounded-none`}>
      {coach && <div className="absolute left-3 top-14 z-40 max-w-sm">{coach}</div>}
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
        onTogglePause={togglePause}
        onHongKongMode={onHongKongMode}
        onToggleHints={onToggleHints}
        onToggleSound={toggleSound}
        onNewGame={startNewGame}
        onNextHand={continueNextHand}
        onDiscard={onDiscard}
        onClaim={onClaim}
        onTsumo={onTsumo}
        onKan={onKan}
        onRiichi={onRiichi}
        onFullscreen={enterFullscreen}
        onAccessibility={() => setShowAccessibility(true)}
      />
      <div className="hidden lg:block">
        <BoardScaleFrame designWidth={980} designHeight={824}>
      <div
        className="mahjong-desktop-shell flex min-w-[980px] flex-col"
        style={isFullscreen ? { display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 16px)' } : undefined}
      >
        <div className="mahjong-table-toolbar mb-2 flex h-11 items-center justify-between gap-3" style={isFullscreen ? { flex: '0 0 44px', marginBottom: 0 } : undefined}>
          <div className="flex items-center gap-2">
            <TableToolButton tone="green" onClick={togglePause} active={paused}>
              {paused ? t('resume') : t('pause')}
            </TableToolButton>
            <TableToolButton tone="green" onClick={startNewGame}>↻ {t('newGame')}</TableToolButton>
            <TableToolButton tone="green" onClick={onToggleHints} active={showHints}>
              ◇ {t('hints')}
            </TableToolButton>
            <TableToolButton tone="green" onClick={toggleSound} active={soundEnabled}>
              {soundEnabled ? t('soundOn') : t('soundOff')}
            </TableToolButton>
            {isRiichi && onRiichiVariant && (
              <label className="flex min-h-11 items-center rounded-lg border border-white/10 bg-[#07553b] px-3 text-xs font-bold text-white">
                {t('rules')}
                <select
                  value={riichiVariant}
                  onChange={(event) => onRiichiVariant(event.target.value as RiichiVariant)}
                  className="ml-2 bg-transparent text-emerald-50 outline-none"
                  aria-label={t('rules')}
                >
                  <option value="wrc">{t('wrcVariant')}</option>
                  <option value="standard">{t('standardVariant')}</option>
                </select>
              </label>
            )}
            {variant === 'hongkong' && (
              <label className="flex min-h-11 items-center rounded-lg border border-white/10 bg-[#07553b] px-3 text-xs font-bold text-white">
                {t('mode')}
                <select
                  value={hongKongMode}
                  onChange={(event) => onHongKongMode(event.target.value as HongKongMode)}
                  className="ml-2 bg-transparent text-emerald-50 outline-none"
                  aria-label={t('mode')}
                >
                  <option className="text-slate-900" value="casual">{t('casualChickenHand')}</option>
                  <option className="text-slate-900" value="standard">{t('standard3Fan')}</option>
                </select>
              </label>
            )}
            <label className="flex min-h-11 items-center rounded-lg border border-white/10 bg-[#07553b] px-3 text-xs font-bold text-white">
              {t('ai')}
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
            <TableToolButton tone="green" onClick={() => setShowAccessibility(true)}>Aa</TableToolButton>
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

        <div
          className="mahjong-desktop-board mahjong-desktop-board--seasonal relative h-[720px] overflow-hidden border-[5px] border-[#032f22] bg-[#00553e] shadow-[inset_0_0_90px_rgba(0,30,22,.34)]"
          style={isFullscreen ? { height: 'auto', minHeight: 0, flex: '1 1 0%' } : undefined}
        >
          <div className="absolute inset-y-0 left-0 w-[11%] bg-[linear-gradient(105deg,#0b0a08_0%,#1b1914_58%,transparent_59%)]" />
          <div className="absolute inset-y-0 right-0 w-[11%] bg-[linear-gradient(255deg,#0b0a08_0%,#1b1914_58%,transparent_59%)]" />
          <div className="absolute left-4 top-3 z-20 text-xl font-semibold text-emerald-100/45">Rate: 10</div>
          <p className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full bg-[#003d2f]/85 px-3 py-1 text-sm font-bold tracking-wide text-emerald-50">{t('practiceTableAI')}</p>

          <div className="absolute left-1/2 top-8 -translate-x-1/2">
            <ConcealedRack seat={3} count={state.players[3].hand.length} tiles={revealAllHands ? state.players[3].hand : undefined} orientation="top" />
          </div>
          <div className="absolute left-[15%] top-1/2 -translate-y-1/2">
            <ConcealedRack seat={2} count={state.players[2].hand.length} tiles={revealAllHands ? state.players[2].hand : undefined} orientation="left" />
          </div>
          <div className="absolute right-[15%] top-1/2 -translate-y-1/2">
            <ConcealedRack seat={1} count={state.players[1].hand.length} tiles={revealAllHands ? state.players[1].hand : undefined} orientation="right" />
          </div>

          <PlayerBadge state={state} seat={3} className="right-[19%] top-[11%]" showFlowers={isMcr} />
          <PlayerBadge state={state} seat={2} className="left-5 top-[39%]" showFlowers={isMcr} />
          <PlayerBadge state={state} seat={1} className="right-5 top-[39%]" showFlowers={isMcr} />
          <PlayerBadge state={state} seat={0} className="bottom-[16%] left-[12%]" human showFlowers={isMcr} />

          <div className="pointer-events-none absolute left-[28%] right-[28%] top-[18%] h-[48%] border border-[#003d2f]">
          </div>

          {/* Hand racks stay on the outside of the table.  Each player's
              discard / exposed-meld area is one of these four inner zones. */}
          <DiscardPool state={state} seat={3} className="left-1/2 top-[22%] -translate-x-1/2" />
          <DiscardPool state={state} seat={2} className="left-[27%] top-[32%]" />
          <DiscardPool state={state} seat={1} className="right-[27%] top-[32%]" />
          <DiscardPool state={state} seat={0} className="bottom-[24%] left-1/2 -translate-x-1/2" />

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
            <div className="absolute left-1/2 top-[57%] z-10 -translate-x-1/2 rounded-full border border-emerald-200/30 bg-[#063d30]/90 px-3 py-1 text-sm font-black tracking-[.12em] text-emerald-100">
              {t('mcrStrip')}
            </div>
          )}
          {isMcr && (
            <McrScoreCoach
              qualifying={mcrQualifying}
              flowers={mcrFlowers}
              patterns={tsumoEvaluation?.score?.patterns}
            />
          )}
          {isRiichi && (
            <div className="absolute left-[58%] top-[24%] z-10 rounded-lg bg-black/30 p-2 text-center text-sm font-bold uppercase tracking-wider text-amber-200">
              <span className="mb-1 block">{t('doraIndicators')}</span>
              <div className="flex justify-center gap-0.5">
                {visibleDoraIndicators(state).map((tile, index) => <TileFace key={`${tile}-${index}`} tile={tile} size="sm" traditional />)}
              </div>
            </div>
          )}

          {paused && (
            <button
              type="button"
              onClick={togglePause}
              className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 text-4xl font-semibold text-amber-100 backdrop-blur-[2px]"
            >
              ▶ {t('resume')}
            </button>
          )}

          <ClaimDialog
            variant={variant}
            hongKongMode={hongKongMode}
            paused={paused}
            myClaims={myClaims}
            canTsumo={canTsumo}
            tsumoEvaluation={tsumoEvaluation}
            kanTiles={kanTiles}
            riichiDiscards={riichiDiscards}
            declaredReady={human.declaredReady}
            riichiPending={human.riichiPending}
            canAbortNineTerminals={canAbortNineTerminals}
            scoreUnit={scoreUnit}
            onClaim={onClaim}
            onTsumo={onTsumo}
            onKan={onKan}
            onRiichi={onRiichi}
            onNineTerminals={onNineTerminals}
            onHongKongMode={onHongKongMode}
          />

          <div className="absolute bottom-3 left-1/2 z-20 w-[88%] -translate-x-1/2">
            <TurnHintsBar
              myTurn={myTurn}
              currentWind={currentWind}
              hints={hints}
              tsumoEvaluation={tsumoEvaluation}
              scoreUnit={scoreUnit}
            />
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
              <div className="absolute bottom-[84px] right-0 flex items-center gap-1 rounded-lg bg-amber-50/95 px-2 py-1 text-sm font-black text-emerald-950 shadow-lg">
                <span>{t('flowersLabel')}</span>
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
                      if (!human.riichiPending || riichiDiscards.includes(tile)) {
                        if (soundEnabled) playMahjongSound('discard', tile, voiceLocale);
                        onDiscard(tile);
                      }
                    }}
                    disabled={!myTurn || paused || (human.riichiPending && !riichiDiscards.includes(tile))}
                    highlight={(myTurn && index === human.hand.length - 1) || (human.riichiPending && riichiDiscards.includes(tile))}
                  />
                </span>
              ))}
            </div>
          </div>

          {state.phase === 'over' && state.result && (
            <ResultBanner state={state} onNewGame={startNewGame} onNextHand={continueNextHand} />
          )}
        </div>

        <div className="mahjong-table-footer flex h-10 items-center justify-between bg-[#15583e] px-3 text-sm font-semibold text-emerald-100/75" style={isFullscreen ? { flex: '0 0 40px' } : undefined}>
          <span>{gameName} Mahjong</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowScoring(true)} className="rounded px-2 py-1 hover:bg-white/10">{t('scoringTips')}</button>
            <button type="button" onClick={enterFullscreen} className="rounded px-2 py-1 hover:bg-white/10">{t('fullScreen')}</button>
          </div>
        </div>
      </div>
        </BoardScaleFrame>
      </div>
      <ScoringTipsDialog
        open={showScoring}
        gameName={gameName}
        variant={variant}
        hongKongMode={hongKongMode}
        onClose={() => setShowScoring(false)}
      />
      {showAccessibility && <MahjongAccessibilityPanel preferences={preferences} onChange={(key, value) => { setPreference(key, value); trackMahjongEvent('mahjong_accessibility_changed', { setting: key, value: String(value) }); }} onClose={() => setShowAccessibility(false)} />}
    </section>
  );
}

function ConcealedRack({ count, tiles, orientation }: { seat: Seat; count: number; tiles?: Tile[]; orientation: 'top' | 'left' | 'right' }) {
  const vertical = orientation !== 'top';
  const visibleCount = Math.min(count, 14);
  const perspective = orientation === 'top'
    ? '[transform:perspective(1100px)_rotateX(18deg)] origin-top'
    : orientation === 'left'
      ? '[transform:perspective(1100px)_rotateY(-18deg)] origin-left'
      : '[transform:perspective(1100px)_rotateY(18deg)] origin-right';
  return (
    <div className={`mahjong-standing-rack mahjong-standing-rack--${orientation} flex ${vertical ? 'flex-col' : ''} ${perspective}`} aria-label={`Opponent concealed hand: ${count} tiles`}>
      {Array.from({ length: visibleCount }, (_, index) => (
        <span key={index} className={`mahjong-standing-tile mahjong-standing-tile--${orientation} ${count === 14 && index === visibleCount - 1 ? 'mahjong-standing-tile--drawn' : ''} ${vertical ? '-my-[5px]' : '-mx-[2px]'}`}>
          {tiles?.[index]
            ? <TileFace tile={tiles[index]} size="table" traditional />
            : <StandingTileBack orientation={orientation} />}
        </span>
      ))}
    </div>
  );
}

/**
 * Concealed opponents use a dedicated three-dimensional tile body. Reusing the
 * generic TileBack here made a standing rack read as a column of framed cards.
 */
function StandingTileBack({ orientation }: { orientation: 'top' | 'left' | 'right' }) {
  return <span className={`mahjong-standing-tile__back mahjong-standing-tile__back--${orientation}`} aria-hidden="true" />;
}

const DEFAULT_PORTRAIT_BY_SEAT: Record<Seat, 0 | 1 | 2 | 3> = {
  0: 3,
  1: 1,
  2: 2,
  3: 0
};

/** A single source image supplies the four default players, cropped as a sprite. */
function DefaultPlayerPortrait({ seat }: { seat: Seat }) {
  const index = DEFAULT_PORTRAIT_BY_SEAT[seat];
  const row = index > 1 ? 1 : 0;
  const column = index % 2;
  return (
    <span className="relative block h-14 w-14 overflow-hidden rounded-[10px]" aria-hidden="true">
      <img
        src="/images/mahjong/ai-avatars-default.webp"
        alt=""
        className="absolute h-[200%] w-[200%] max-w-none"
        style={{ left: `${-column * 100}%`, top: `${-row * 100}%` }}
      />
    </span>
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
  return (
    <div className={`absolute z-20 flex w-24 flex-col items-center ${className}`}>
      <div
        className={`relative overflow-hidden rounded-xl border-4 bg-[#f7f1df] shadow-lg ${active ? 'border-yellow-300' : 'border-[#e8ece3]'}`}
        aria-label={human ? 'You' : `Player ${seat + 1}`}
      >
        <DefaultPlayerPortrait seat={seat} />
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
