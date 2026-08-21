'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import TileFace, { TileBack, useTraditionalTilePreload } from './TileFace';
import { sortTiles, tileFace, type Tile } from '@/lib/mahjong/tiles';
import { AMERICAN_PRACTICE_SEASONS, americanBotStyleForSeat, americanClosestLine, americanCoachAdvice, applyAmericanPass, canExchangeJoker, claimAmericanDiscard, claimAmericanMahJong, createAmericanGame, decideSecondCharleston, declareAmericanMahJong, exchangeAmericanJoker, getPracticeCard, legalAmericanClaims, lockAmericanPracticeCard, passAmericanClaims, playAmericanDiscard, practiceGroupCount, previewPracticeGroups, rankAmericanLines, withAmericanReplayAction, type AmericanGameState, type AmericanReplayAction } from '@/lib/mahjong/american';
import { playMahjongOpeningSequence, playMahjongSound, primeMahjongAudio, stopMahjongSpeech } from '@/lib/mahjong/sound';
import MahjongAccessibilityPanel, { useMahjongPreferences } from './MahjongAccessibilityPanel';
import { trackMahjongEvent } from '@/lib/mahjong/telemetry';
import { AMERICAN_LESSONS, startAmericanLesson } from '@/lib/mahjong/american-learning';

type CharlestonStep = 0 | 1 | 2 | 3;

const STANDARD = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7'] as Tile[];
const AMERICAN_SAVE_KEY = 'mahjong-hub.american.practice.v2';
const FLOWERS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];
// Physical American set: four copies of every standard face, eight distinct
// flowers and eight distinct Joker tiles. Deal operations always consume this
// wall; no presentation path may create a fifth copy of a standard tile.
const WALL = [...STANDARD.flatMap((tile) => [tile, tile, tile, tile]), ...FLOWERS, ...Array.from({ length: 8 }, (_, index) => `j${index + 1}`)];
function shuffledWall(seed: number): string[] {
  const tiles = [...WALL];
  let state = seed >>> 0;
  for (let index = tiles.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swap = state % (index + 1);
    [tiles[index], tiles[swap]] = [tiles[swap], tiles[index]];
  }
  return tiles;
}

function initialDeal(seed: number): { hand: string[]; wall: string[] } {
  const wall = shuffledWall(seed);
  // Four 13-tile hands are removed before the human hand is returned. The
  // opponents are intentionally concealed, but their tiles still leave wall.
  return { hand: wall.slice(0, 13), wall: wall.slice(52) };
}

function isStandardTile(tile: string): tile is Tile {
  return STANDARD.includes(tile as Tile) || FLOWERS.includes(tile);
}

function sortAmerican(tiles: string[]): string[] {
  const ordinary = tiles.filter(isStandardTile);
  const specials = tiles.filter((tile) => !isStandardTile(tile));
  return [...sortTiles(ordinary), ...specials];
}

export default function AmericanMahjongTable({ onWin }: { onWin?: (points: number) => void }) {
  useTraditionalTilePreload();
  const t = useTranslations('american');
  const tableRef = useRef<HTMLElement>(null);
  const [game, setGame] = useState<AmericanGameState>(() => createAmericanGame(20260813));
  const [selected, setSelected] = useState<number[]>([]);
  const [step, setStep] = useState<CharlestonStep>(0);
  const [lastDiscard, setLastDiscard] = useState<string | null>(null);
  const [pinnedCardId, setPinnedCardId] = useState<string | null>(null);
  const [autoSort, setAutoSort] = useState(true);
  const [notice, setNotice] = useState(() => t('chooseThreeTiles'));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [jokerExchangeTarget, setJokerExchangeTarget] = useState<{ seat: number; meldIndex: number } | null>(null);
  const { preferences, setPreference } = useMahjongPreferences();
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [restored, setRestored] = useState(false);
  const [lessonGoal, setLessonGoal] = useState<string | null>(null);
  const soundEnabled = preferences.soundEnabled;

  useEffect(() => {
    const restore = async () => {
      try {
      const replay = new URLSearchParams(window.location.search).get('americanReplay');
      const token = new URLSearchParams(window.location.search).get('americanReplayToken');
      let parsed: AmericanGameState | null = null;
      if (token) {
        const response = await fetch('/api/american/replay', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'verify', token }) });
        if (!response.ok) throw new Error('Replay verification failed.');
        parsed = (await response.json()).state as AmericanGameState;
      } else {
        const encoded = replay || localStorage.getItem(AMERICAN_SAVE_KEY);
        if (!encoded) return;
        parsed = JSON.parse(decodeURIComponent(escape(window.atob(encoded)))) as AmericanGameState;
      }
      if (!parsed || !Array.isArray(parsed.players) || !Array.isArray(parsed.wall) || !parsed.seasonId) return;
      setGame(parsed);
      setNotice(token ? 'Verified practice replay loaded.' : replay ? 'Shared practice snapshot loaded.' : 'Your saved American Mahjong hand has been restored.');
      } catch {
      // A stale or manually edited local snapshot must never prevent a new hand.
      localStorage.removeItem(AMERICAN_SAVE_KEY);
      } finally {
      setRestored(true);
      }
    };
    void restore();
  }, []);

  useEffect(() => {
    if (!restored || game.phase === 'ended') return;
    try {
      localStorage.setItem(AMERICAN_SAVE_KEY, window.btoa(unescape(encodeURIComponent(JSON.stringify(game)))));
    } catch {
      // Storage can be unavailable in private browsing; the hand remains playable.
    }
  }, [game, restored]);

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(document.fullscreenElement === tableRef.current);
    document.addEventListener('fullscreenchange', syncFullscreenState);
    syncFullscreenState();
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  const enterFullscreen = () => {
    const table = tableRef.current;
    if (!table) return;
    setIsFullscreen(true);
    trackMahjongEvent('mahjong_fullscreen', { variant: 'american' });
    void table.requestFullscreen().catch(() => setIsFullscreen(false));
  };

  const toggleSound = () => {
    primeMahjongAudio();
    const next = !soundEnabled;
    if (!next) stopMahjongSpeech();
    setPreference('soundEnabled', next);
    if (next) playMahjongSound('toggle', undefined, 'english');
    trackMahjongEvent('mahjong_sound_changed', { variant: 'american', enabled: next });
  };

  const hand = autoSort ? sortAmerican(game.players[0].hand) : game.players[0].hand;
  const deal = { hand: [], wall: game.wall };
  const inCharleston = game.phase === 'charleston';
  const fullHand = [...game.players[0].hand, ...game.players[0].melds.flatMap((meld) => meld.tiles)];
  const rankedLines = rankAmericanLines(game, fullHand);
  // Every line is live; the panel follows whichever one the hand is closest to
  // until the player pins one to work towards.
  const card = pinnedCardId ? getPracticeCard(pinnedCardId) : americanClosestLine(game, fullHand);
  const claims = legalAmericanClaims(game);
  const selectedTiles = selected.map((index) => hand[index]).filter(Boolean);
  const openingStep = game.phase === 'charleston'
    ? game.charlestonRound === 1 ? 1 : 2
    : game.phase === 'second-charleston-choice' ? 2
      : game.phase === 'courtesy' ? 3 : 4;
  const exchangeMeld = jokerExchangeTarget === null ? null : game.players[jokerExchangeTarget.seat].melds[jokerExchangeTarget.meldIndex];
  const exchangeNatural = exchangeMeld?.tile;
  const canConfirmJokerExchange = Boolean(exchangeMeld && exchangeNatural && canExchangeJoker(exchangeMeld, exchangeNatural) && game.players[0].hand.includes(exchangeNatural));
  const coach = useMemo(() => americanCoachAdvice(game), [game]);
  const botStatus = (seat: 1 | 2 | 3) => {
    if (game.phase === 'ended' && game.settlement?.winner === seat) return 'Mah Jongg!';
    if (game.phase === 'claim' && game.lastDiscard?.seat !== seat) return americanBotStyleForSeat(seat) === 'speed' ? 'Fast call' : americanBotStyleForSeat(seat) === 'steady' ? 'Checking' : 'Defending';
    if (game.phase === 'turn' && game.currentSeat === seat) return 'Thinking';
    if (game.players[seat].melds.length > 0) return 'Exposed';
    return 'Ready';
  };
  const targetProgress = useMemo(() => {
    const all = [...hand, ...game.players[0].melds.flatMap((meld) => meld.tiles)];
    let remainingJokers = all.filter((tile) => tile.startsWith('j')).length;
    const groups = previewPracticeGroups(card).map((group) => {
      const required = practiceGroupCount(group);
      const natural = group.face === 'flower'
        ? all.filter((tile) => tile.startsWith('f')).length
        : all.filter((tile) => tile === group.face).length;
      const usedJokers = group.jokerAllowed ? Math.min(Math.max(0, required - natural), remainingJokers) : 0;
      remainingJokers -= usedJokers;
      const relation = group.matcher?.type === 'rank' ? group.matcher.suitKey : undefined;
      const relationRule = group.matcher?.type === 'rank'
        ? group.matcher.sameAs ? `same as ${group.matcher.sameAs}` : group.matcher.differentFrom?.length ? `different from ${group.matcher.differentFrom.join('/')}` : undefined
        : undefined;
      return { label: group.label, current: Math.min(required, natural + usedJokers), required, relation, relationRule };
    });
    return {
      jokers: all.filter((tile) => tile.startsWith('j')).length,
      flowers: all.filter((tile) => tile.startsWith('f')).length,
      dots: Math.min(6, all.filter((tile) => tile === 'p2' || tile === 'p3' || tile === 'p4').length),
      groups
    };
  }, [hand, game.players, card]);

  const record = (next: AmericanGameState, action: AmericanReplayAction) => withAmericanReplayAction(next, action);

  const reset = () => {
    primeMahjongAudio();
    stopMahjongSpeech();
    if (soundEnabled) playMahjongOpeningSequence('english');
    const next = createAmericanGame(Date.now(), game.cardId, undefined, game.seasonId);
    setGame(next);
    setSelected([]);
    setStep(0);
    setLastDiscard(null);
    setJokerExchangeTarget(null);
    setNotice(t('chooseThreeTiles'));
    trackMahjongEvent('mahjong_game_started', { variant: 'american', card: next.cardId, source: 'new_hand' });
  };

  const chooseSeason = (seasonId: string) => {
    const season = AMERICAN_PRACTICE_SEASONS.find((item) => item.id === seasonId);
    if (!season) return;
    const next = createAmericanGame(Date.now(), season.cardIds[0], undefined, season.id);
    setGame(next); setPinnedCardId(null); setSelected([]); setStep(0); setLastDiscard(null);
    setNotice(`${season.title}: ${season.cardIds.length} original practice cards loaded.`);
    trackMahjongEvent('mahjong_card_focused', { variant: 'american', season: season.id, card: 'season-switch' });
  };

  const chooseLesson = (lessonId: string) => {
    if (!lessonId) { setLessonGoal(null); return; }
    const { lesson, game: lessonGame } = startAmericanLesson(lessonId);
    setGame(lessonGame); setPinnedCardId(lesson.cardId); setSelected([]); setStep(0); setLastDiscard(null); setLessonGoal(lesson.goal);
    setNotice(`Lesson: ${lesson.goal}`);
    trackMahjongEvent('mahjong_card_focused', { variant: 'american', card: lesson.cardId, source: lesson.stage });
  };

  const shareReplay = async () => {
    try {
      const response = await fetch('/api/american/replay', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'issue', state: game }) });
      if (!response.ok) throw new Error('Replay signing unavailable.');
      const { token } = await response.json() as { token: string };
      const url = `${window.location.origin}${window.location.pathname}?americanReplayToken=${encodeURIComponent(token)}`;
      await navigator.clipboard.writeText(url);
      setNotice('Verified replay link copied. It expires in 30 days.');
    } catch {
      setNotice('Unable to copy the replay link in this browser.');
    }
  };

  const chooseCard = (cardId: string) => {
    setPinnedCardId(cardId || null);
    setGame((current) => record(lockAmericanPracticeCard(current, cardId || undefined), { type: 'lock-card', cardId: cardId || undefined }));
    setNotice(cardId
      ? t('trackingCard', { card: getPracticeCard(cardId).title })
      : t('trackingClosest'));
    trackMahjongEvent('mahjong_card_focused', { variant: 'american', card: cardId || 'auto' });
  };

  useEffect(() => {
    trackMahjongEvent('mahjong_game_started', { variant: 'american', card: game.cardId, source: 'initial_load' });
    // The initial board is intentionally tracked once; subsequent hands use reset/chooseCard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const secondCharleston = (play: boolean) => {
    try {
      const next = decideSecondCharleston(game, play);
      setGame(record(next, { type: 'second-charleston', play })); setStep(0); setSelected([]);
      setNotice(play ? t('secondCharlestonSelect') : next.phase === 'courtesy' ? t('courtesyPassSelect') : t('chooseTileDiscard'));
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Choice failed.'); }
  };
  const declare = () => {
    const result = declareAmericanMahJong(game);
    if (result.declared) { if (soundEnabled) playMahjongSound('win', undefined, 'english'); setGame(record(result.state, { type: 'declare-mah-jongg' })); setNotice(t('mahJonggExclaim') + ' ' + result.evaluation.message); onWin?.(result.state.settlement?.points ?? 0); }
    else setNotice(t('cannotDeclare', { reason: result.evaluation.message }));
  };
  const claim = (kind: 'pung' | 'kong' | 'quint' | 'sextet') => {
    try {
      const next = claimAmericanDiscard(game, 0, kind);
      if (soundEnabled) playMahjongSound(kind === 'pung' ? 'pon' : 'kan', undefined, 'english'); setGame(record(next, { type: 'claim', claim: kind })); setNotice(t('youCalled', { kind }));
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Call failed.'); }
  };
  const claimMahJongg = () => {
    try {
      const result = claimAmericanMahJong(game);
      if (!result.declared) { setNotice(result.evaluation.message); return; }
      if (soundEnabled) playMahjongSound('win', undefined, 'english'); setGame(record(result.state, { type: 'claim-mah-jongg' })); setNotice(t('mahJonggExclaim') + ' ' + result.evaluation.message); onWin?.(result.state.settlement?.points ?? 0);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Mah Jongg claim failed.'); }
  };
  const passClaims = () => {
    try {
      const next = passAmericanClaims(game);
      setGame(record(next, { type: 'pass-claims' })); setNotice(describeTableTurn(next, t));
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Pass failed.'); }
  };
  const swapJoker = () => {
    if (!jokerExchangeTarget) return;
    const { seat, meldIndex } = jokerExchangeTarget;
    const meld = game.players[seat].melds[meldIndex];
    const replacement = meld?.tile;
    if (!replacement) return;
    try {
      const next = exchangeAmericanJoker(game, 0, seat as 0 | 1 | 2 | 3, meldIndex, replacement);
      setGame(record(next, { type: 'exchange-joker', owner: seat as 0 | 1 | 2 | 3, meldIndex, replacement })); setJokerExchangeTarget(null); setNotice(t('jokerExchanged'));
    } catch (error) { setNotice(error instanceof Error ? error.message : t('jokerExchangeFailed')); }
  };

  const pass = () => {
    if (game.phase === 'courtesy' && selected.length > 3) {
      setNotice(t('courtesyMaxThree'));
      return;
    }
    if (game.phase === 'charleston' && selected.length !== 3) {
      setNotice(t('selectExactlyThree'));
      return;
    }
    try {
      const direction = game.phase === 'courtesy' ? 'right' : game.charlestonRound === 2 ? (['left', 'across', 'right'] as const)[game.passIndex] : (['right', 'across', 'left'] as const)[game.passIndex];
      const next = applyAmericanPass(game, selectedTiles, direction);
      if (soundEnabled) playMahjongSound('draw', undefined, 'english');
      setGame(record(next, { type: 'pass', tiles: selectedTiles, direction }));
      setSelected([]);
      if (next.phase === 'second-charleston-choice') { setStep(3); setNotice(t('firstCharlestonDone')); }
      else if (next.phase === 'courtesy') { setStep(3); setNotice(t('courtesySelectZeroThree')); }
      else if (next.phase === 'turn') { setStep(3); setNotice(t('charlestonCompleteEast')); }
      else { setStep((value) => (value + 1) as CharlestonStep); setNotice([t('passLabel1'), t('passLabel2'), t('passLabel3')][next.passIndex]); }
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Pass failed.'); }
  };

  const discard = (index: number) => {
    if (inCharleston || game.phase === 'courtesy') {
      if (hand[index]?.startsWith('j')) {
        setNotice('Jokers cannot be passed in Charleston or a Courtesy Pass.');
        return;
      }
      setSelected((current) => current.includes(index) ? current.filter((item) => item !== index) : current.length === 3 ? [...current.slice(1), index] : [...current, index]);
      return;
    }
    const tile = hand[index];
    try {
      const next = playAmericanDiscard(game, tile);
      primeMahjongAudio(); if (soundEnabled) playMahjongSound('discard', tile as Tile, 'english'); setGame(record(next, { type: 'discard', tile })); setLastDiscard(tile); setNotice(describeTableTurn(next, t));
      setNotice(t('youDiscarded', { tile: tile.startsWith('j') ? 'Joker' : tileFace(tile as Tile) }));
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Discard failed.'); }
  };

  return (
    <section ref={tableRef} data-high-contrast={preferences.highContrast} data-reduced-motion={preferences.reducedMotion} data-tile-scale={preferences.tileScale} className={`mahjong-table-shell ${isFullscreen ? 'mahjong-table-shell--fullscreen' : ''} overflow-hidden rounded-xl bg-[#176845] p-0 shadow-[0_24px_60px_rgba(0,45,31,.35)] lg:p-3`}>
      {/* A browser at 110–125% zoom often reports <1024 CSS pixels.  The
          tabletop must still be the default on desktop-sized screens; only
          genuinely narrow phones use the compact interaction layout. */}
      <div className="mahjong-desktop-shell hidden min-w-[700px] min-[700px]:block" style={isFullscreen ? { display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 16px)' } : undefined}>
        <div className="mahjong-table-toolbar mb-2 flex h-11 items-center justify-between gap-3" style={isFullscreen ? { flex: '0 0 44px', marginBottom: 0 } : undefined}>
          <div className="flex gap-2">
            <TableButton onClick={reset}>↻ {t('newGame')}</TableButton>
            <TableButton onClick={() => setAutoSort((value) => !value)} active={autoSort}>{t('sortBySuit')}</TableButton>
            <TableButton onClick={toggleSound} active={soundEnabled}>{soundEnabled ? t('soundOn') : t('soundOff')}</TableButton>
            <TableButton onClick={() => setShowAccessibility(true)}>Aa</TableButton>
            <select aria-label={t('practiceCard')} value={pinnedCardId ?? ''} onChange={(event) => chooseCard(event.target.value)} className="h-9 rounded-lg border border-white/10 bg-[#07553b] px-3 text-xs font-black text-white">
              <option value="">{t('closestLine')}</option>
              {rankedLines.map(({ card: item, distance }) => <option key={item.id} value={item.id}>{item.title} · {item.points} · {t('awayN', { n: distance })}</option>)}
            </select>
            <select aria-label="Original practice season" value={game.seasonId} onChange={(event) => chooseSeason(event.target.value)} className="h-9 rounded-lg border border-white/10 bg-[#07553b] px-3 text-xs font-black text-white">
              {AMERICAN_PRACTICE_SEASONS.map((season) => <option key={season.id} value={season.id}>{season.title}</option>)}
            </select>
            <select aria-label="American Mahjong lesson" defaultValue="" onChange={(event) => chooseLesson(event.target.value)} className="h-9 max-w-40 rounded-lg border border-white/10 bg-[#07553b] px-3 text-xs font-black text-white"><option value="">Practice lessons</option>{AMERICAN_LESSONS.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</select>
            <TableButton onClick={() => setNotice(card.description + ' Jokers never fill flowers or pairs.')}>◇ {t('practiceCard')}</TableButton>
          </div>
          <div className="flex items-center gap-3 text-emerald-100"><span className="text-xs font-black">{t('originalPracticeCard')}</span><span className="text-2xl">⚙</span></div>
        </div>

        <div className="mahjong-desktop-board mahjong-desktop-board--seasonal relative h-[720px] overflow-hidden border-[5px] border-[#032f22] bg-[#00553e] shadow-[inset_0_0_90px_rgba(0,30,22,.34)]" style={isFullscreen ? { height: 'auto', minHeight: 0, flex: '1 1 0%' } : undefined}>
          <div className="absolute inset-y-0 left-0 w-[11%] bg-[linear-gradient(105deg,#0b0a08_0%,#1b1914_58%,transparent_59%)]" />
          <div className="absolute inset-y-0 right-0 w-[11%] bg-[linear-gradient(255deg,#0b0a08_0%,#1b1914_58%,transparent_59%)]" />
          <div className="absolute left-4 top-3 text-xl font-semibold leading-6 text-emerald-100/45">NMJL-STYLE<br />PRACTICE<br />Rate: 10</div>
          <p className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full bg-[#003d2f]/85 px-3 py-1 text-[10px] font-bold tracking-wide text-emerald-50">{t('practiceTableNotice')}</p>
          {lessonGoal && <p className="absolute left-1/2 top-9 z-20 -translate-x-1/2 rounded-full bg-amber-300/90 px-3 py-1 text-[10px] font-black text-emerald-950">Lesson goal · {lessonGoal}</p>}

          <Wall className="left-1/2 top-8 -translate-x-1/2" count={13} />
          <Wall className="left-[16%] top-1/2 -translate-y-1/2" count={13} vertical />
          <Wall className="right-[16%] top-1/2 -translate-y-1/2" count={13} vertical />
          <CharlestonReserve className="left-1/2 top-[13%] -translate-x-1/2" />
          <CharlestonReserve className="left-[31%] top-[39%]" vertical />
          <CharlestonReserve className="right-[31%] top-[39%]" vertical />
          <Avatar seat="P4" score="8900" portrait={3} status={botStatus(3)} className="right-[20%] top-[9%]" />
          <Avatar seat="P3" score="8900" portrait={2} status={botStatus(2)} className="left-5 top-[37%]" />
          <Avatar seat="P2" score="8900" portrait={1} status={botStatus(1)} className="right-5 top-[37%]" />
          <Avatar seat="YOU" score="8920" className="bottom-[15%] left-[13%]" human />

          <div className="absolute left-1/2 top-[16%] z-30 flex -translate-x-1/2 gap-1 rounded-full bg-[#002f24]/90 p-1 text-[10px] font-black shadow-lg">
            {[t('step1'), t('step2'), t('step3'), t('step4')].map((label, index) => {
              const number = index + 1;
              return <span key={label} className={`rounded-full px-2 py-1 ${number === openingStep ? 'bg-amber-300 text-emerald-950' : number < openingStep ? 'bg-emerald-500/35 text-emerald-50' : 'text-emerald-100/65'}`}>{label}</span>;
            })}
          </div>

          <div className="pointer-events-none absolute left-[28%] right-[28%] top-[18%] h-[48%] border border-[#003d2f]" />
          <div className="absolute left-1/2 top-[45%] z-10 flex h-40 w-52 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border-[5px] border-[#20222d] bg-[#07090d] text-center shadow-xl">
            <span className="text-[11px] font-black tracking-[.26em] text-cyan-300">AMERICAN</span>
            <strong className="mt-2 text-2xl font-normal text-cyan-100">{game.phase === 'second-charleston-choice' ? t('chooseRound2') : game.phase === 'courtesy' ? t('courtesyPass') : inCharleston ? `${t('charleston')} ${game.charlestonRound}-${step + 1}/3` : t('yourTurn')}</strong>
            <span className="mt-1 text-4xl font-light text-cyan-200">{deal.wall.length}</span>
            <span className="mt-1 text-[10px] font-bold text-emerald-200">{t('tilesLeft')}</span>
          </div>

          {(inCharleston || game.phase === 'second-charleston-choice' || game.phase === 'courtesy' || game.phase === 'claim') && <div className="absolute left-1/2 top-[46%] z-20 w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-emerald-200/15 bg-[#002f24]/95 px-6 py-5 text-center shadow-2xl">
            <p className="text-[2rem] font-black leading-tight text-amber-50">{game.phase === 'second-charleston-choice' ? t('secondCharlestonQ') : game.phase === 'courtesy' ? t('courtesyPass') : inCharleston ? `${t('charleston')} ${game.charlestonRound}-${step + 1}` : t('originalPracticeCard')}</p>
            <p className="mt-1 text-[1.45rem] font-semibold leading-tight text-emerald-100">{game.phase === 'second-charleston-choice' ? t('optionalLeftAcrossRight') : game.phase === 'courtesy' ? t('passZeroThree') : inCharleston ? [t('passLabel1'), t('passLabel2'), t('passLabel3')][step].replace(' · ', ': ') : t('cardDetail', { card: card.title, difficulty: card.difficulty, points: card.points })}</p>
            <p className="mt-2 text-xs font-bold text-emerald-200/80">{notice}</p>
          </div>}
          {game.phase === 'turn' && <div className="absolute left-1/2 top-[57%] z-20 -translate-x-1/2 rounded-full bg-[#002f24]/85 px-4 py-2 text-center text-xs font-bold text-emerald-100 shadow-lg">{notice}</div>}
          <div className="absolute right-[12%] top-[58%] z-20 w-56 rounded-xl border border-emerald-100/15 bg-[#002f24]/90 p-3 text-xs text-emerald-50 shadow-xl">
            <p className="font-black uppercase tracking-[.13em] text-amber-200">{card.title} · {card.points} {t('points')}</p>
            <div className="mt-2 space-y-1.5">{targetProgress.groups.map((group) => <div key={group.label} className="flex items-center justify-between gap-2"><span className="flex min-w-0 items-center gap-1 truncate">{group.relation && <b title={group.relationRule} className={`inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded text-[9px] ${group.relation === 'A' ? 'bg-amber-300 text-amber-950' : 'bg-sky-300 text-sky-950'}`}>{group.relation}</b>}<span className="truncate">{group.label}</span></span><strong className={group.current === group.required ? 'text-emerald-300' : 'text-amber-100'}>{group.current}/{group.required}</strong></div>)}</div>
            <p className="mt-2 border-t border-white/10 pt-2 text-[10px] text-emerald-100/70">{t('jokersHeld', { n: targetProgress.jokers, s: targetProgress.jokers === 1 ? '' : 's' })}</p>
          </div>
          <CoachPanel coach={coach} t={t} className="absolute left-[12%] top-[58%] z-20 w-56" />

          <div className="absolute bottom-[20%] left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 rounded-xl bg-transparent p-3">
            {inCharleston && selectedTiles.map((tile, index) => <AmericanTile key={`${tile}-${index}`} tile={tile} selected />)}
            {inCharleston && <button type="button" onClick={pass} className="h-20 min-w-48 -skew-x-6 rounded-2xl border-2 border-emerald-950/40 bg-[#b7c8be] px-9 text-[2.15rem] font-black text-white shadow-[inset_0_-5px_0_rgba(0,0,0,.2),0_6px_10px_rgba(0,0,0,.35)]"><span className="inline-block skew-x-6">{t('pass')}</span></button>}
            {game.phase === 'second-charleston-choice' && <><button type="button" onClick={() => secondCharleston(true)} className="rounded-xl bg-amber-300 px-5 py-3 font-black text-emerald-950">{t('playSecond')}</button><button type="button" onClick={() => secondCharleston(false)} className="rounded-xl bg-white/80 px-5 py-3 font-black text-emerald-950">{t('skip')}</button></>}
            {game.phase === 'courtesy' && <button type="button" onClick={pass} className="h-16 rounded-xl bg-amber-300 px-7 text-xl font-black text-emerald-950">{t('courtesyPass')}</button>}
            {game.phase === 'claim' && <div className="flex gap-2"><button type="button" onClick={passClaims} className="rounded-xl bg-white/80 px-4 py-3 font-black text-emerald-950">{t('pass')}</button>{claims.includes('mah-jongg') && <button type="button" onClick={claimMahJongg} className="rounded-xl bg-rose-500 px-4 py-3 font-black text-white">{t('mahJongg')}</button>}{(['pung', 'kong', 'quint', 'sextet'] as const).filter((kind) => claims.includes(kind)).map((kind) => <button key={kind} type="button" onClick={() => claim(kind)} className="rounded-xl bg-amber-300 px-4 py-3 font-black text-emerald-950">{kind}</button>)}</div>}
            {game.phase === 'turn' && <button type="button" onClick={declare} className="rounded-xl border-2 border-amber-100 bg-amber-300 px-5 py-3 font-black text-emerald-950 shadow-lg">{t('declareMahJongg')}</button>}
            {!inCharleston && <div className="text-sm font-black text-emerald-100">{t('lastDiscard')} {lastDiscard ? <AmericanTile tile={lastDiscard} /> : '—'}</div>}
          </div>

          <div className="absolute bottom-[25%] left-3 z-30 flex w-28 flex-col gap-2 rounded-lg border border-emerald-200/15 bg-[#063d30]/80 p-2 text-sm font-black text-emerald-100/75">
            <button type="button" onClick={() => setAutoSort(true)} className="rounded bg-black/20 px-2 py-2 text-left hover:bg-black/35">{t('sortBySuit')}</button>
            <button type="button" onClick={() => setAutoSort(false)} className="rounded bg-black/20 px-2 py-2 text-left hover:bg-black/35">{t('sortByRank')}</button>
            <span className="border-t border-white/10 pt-2 text-xs">{t('noCall')} <i className="float-right inline-block h-4 w-4 rounded-full bg-emerald-950" /></span>
            <span className="text-xs">{t('autoDiscard')} <i className="float-right inline-block h-4 w-4 rounded-full bg-emerald-950" /></span>
          </div>
          {game.players.some((player) => player.melds.length > 0) && <div className="absolute left-[12%] top-[67%] z-30 max-w-[34%] rounded-lg bg-black/35 p-2 text-xs text-emerald-50"><p className="mb-1 font-black">{t('exposedGroups')}</p>{game.players.flatMap((player) => player.melds.map((meld, index) => ({ player, meld, index }))).map(({ player, meld, index }) => <div key={`${player.seat}-${index}`} className="mb-1 flex items-center gap-1"><span className="w-5 font-black">{player.seat === 0 ? 'Y' : `P${player.seat + 1}`}</span>{meld.tiles.map((tile, tileIndex) => <AmericanTile key={tileIndex} tile={tile} compact />)}{meld.jokerIndexes.length > 0 && game.players[0].hand.includes(meld.tile) && <button type="button" onClick={() => setJokerExchangeTarget({ seat: player.seat, meldIndex: index })} className="rounded bg-amber-300 px-2 py-1 font-black text-emerald-950">{t('exchangeJoker')}</button>}</div>)}</div>}

          <div className="absolute bottom-2 left-[12%] right-[12%] z-20">
            <div className="mb-2 flex justify-between text-xs font-bold text-emerald-100"><span>{inCharleston || game.phase === 'courtesy' ? (game.phase === 'courtesy' ? t('chooseUpTo3Tiles', { n: selected.length }) : t('choose3Tiles', { n: selected.length })) : t('chooseTileDiscard')}</span><span>{card.title}: {t('progressSummary', { groups: targetProgress.dots, flowers: targetProgress.flowers, jokers: targetProgress.jokers })}</span></div>
            <div className="flex items-end justify-center gap-[2px] overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {hand.map((tile, index) => <AmericanTile key={`${tile}-${index}`} tile={tile} selected={selected.includes(index)} onClick={() => discard(index)} highlight={!inCharleston && index === hand.length - 1} />)}
            </div>
          </div>
        </div>
        <div className="mahjong-table-footer flex h-10 items-center justify-between bg-[#15583e] px-3 text-sm font-semibold text-emerald-100/75" style={isFullscreen ? { flex: '0 0 40px' } : undefined}><span>{t('footer')}</span><button type="button" onClick={enterFullscreen} className="rounded px-2 py-1 font-black hover:bg-white/10">{t('fullScreen')}</button></div>
      </div>

      <div className="min-h-[620px] bg-[radial-gradient(circle_at_center,#087052_0%,#00553e_62%,#003c2d_100%)] p-3 text-white min-[700px]:hidden" style={isFullscreen ? { minHeight: '100dvh' } : undefined}>
        <div className="flex items-center justify-between"><strong className="text-xs tracking-[.18em]">{t('aiTitle')}</strong><div className="flex gap-1"><button type="button" className="rounded bg-amber-300 px-3 py-1 text-xs font-black text-emerald-950" onClick={reset}>{t('newGame')}</button><button type="button" className="rounded border border-white/20 px-3 py-1 text-xs font-black" onClick={toggleSound}>{soundEnabled ? t('soundOn') : t('soundOff')}</button><button type="button" className="rounded border border-white/20 px-3 py-1 text-xs font-black" onClick={() => setShowAccessibility(true)}>Aa</button><button type="button" className="rounded border border-white/20 px-3 py-1 text-xs font-black" onClick={enterFullscreen}>{t('fullScreen')}</button></div></div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-[#003b2d]/90 p-4 text-center"><p className="text-lg font-black">{game.phase === 'second-charleston-choice' ? t('secondCharlestonQ') : game.phase === 'courtesy' ? t('courtesyPass') : inCharleston ? `${t('charleston')} ${game.charlestonRound}-${step + 1}` : t('yourTurn')}</p><p className="mt-1 text-sm text-emerald-100">{notice}</p><p className="mt-2 text-[10px] text-emerald-200">{t('cardHint', { card: card.title })}</p></div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-emerald-100"><Opponent label="P4" portrait={3} status={botStatus(3)} /><Opponent label="P3" portrait={2} status={botStatus(2)} /><Opponent label="P2" portrait={1} status={botStatus(1)} /></div>
        <CoachPanel coach={coach} t={t} className="mt-4" compact />
        <div className="mt-5 rounded-xl bg-black/25 p-3"><p className="text-center text-xs font-black">{inCharleston ? t('tap3Tiles', { n: selected.length }) : t('tapTileDiscard')}</p><div className="mt-3 flex flex-wrap justify-center gap-1">{hand.map((tile, index) => <AmericanTile key={`${tile}-${index}`} tile={tile} selected={selected.includes(index)} onClick={() => discard(index)} highlight={!inCharleston && index === hand.length - 1} compact />)}</div></div>
        {inCharleston && <button type="button" onClick={pass} className="mt-4 w-full rounded-xl bg-amber-300 py-3 text-lg font-black text-emerald-950">{t('pass3Tiles')}</button>}
        {game.phase === 'second-charleston-choice' && <div className="mt-4 flex gap-2"><button type="button" onClick={() => secondCharleston(true)} className="flex-1 rounded-xl bg-amber-300 py-3 font-black text-emerald-950">{t('playSecond')}</button><button type="button" onClick={() => secondCharleston(false)} className="flex-1 rounded-xl bg-white/80 py-3 font-black text-emerald-950">{t('skip')}</button></div>}
        {game.phase === 'courtesy' && <button type="button" onClick={pass} className="mt-4 w-full rounded-xl bg-amber-300 py-3 text-lg font-black text-emerald-950">{t('courtesyPass')}</button>}
        {!inCharleston && game.phase === 'turn' && <button type="button" onClick={declare} className="mt-4 w-full rounded-xl border border-amber-100 bg-amber-300 py-3 text-lg font-black text-emerald-950">{t('declareMahJongg')}</button>}
        {game.phase === 'claim' && <div className="mt-4 grid grid-cols-3 gap-2"><button type="button" onClick={passClaims} className="rounded-xl bg-white/80 py-3 font-black text-emerald-950">{t('pass')}</button>{claims.includes('mah-jongg') && <button type="button" onClick={claimMahJongg} className="rounded-xl bg-rose-500 py-3 font-black text-white">{t('mahJongg')}</button>}{(['pung', 'kong', 'quint', 'sextet'] as const).filter((kind) => claims.includes(kind)).map((kind) => <button key={kind} type="button" onClick={() => claim(kind)} className="rounded-xl bg-amber-300 py-3 font-black text-emerald-950">{kind}</button>)}</div>}
        <div className="mt-4 rounded-xl bg-black/20 p-3 text-xs"><strong>Practice card: Garden Ladder</strong><p className="mt-1 text-emerald-100">Flowers + three or more matching Dots groups. Jokers can only replace tiles inside groups of three or more.</p></div>
        {game.players.some((player) => player.melds.length > 0) && <div className="mt-3 rounded-xl bg-black/20 p-3 text-xs"><strong>{t('exposedGroups')}</strong>{game.players.flatMap((player) => player.melds.map((meld, index) => ({ player, meld, index }))).map(({ player, meld, index }) => <div key={`${player.seat}-${index}`} className="mt-2 flex items-center gap-1"><span className="w-5 font-black">{player.seat === 0 ? 'Y' : `P${player.seat + 1}`}</span>{meld.tiles.map((tile, tileIndex) => <AmericanTile key={tileIndex} tile={tile} compact />)}{meld.jokerIndexes.length > 0 && game.players[0].hand.includes(meld.tile) && <button type="button" onClick={() => setJokerExchangeTarget({ seat: player.seat, meldIndex: index })} className="rounded bg-amber-300 px-2 py-1 font-black text-emerald-950">{t('exchangeJoker')}</button>}</div>)}</div>}
      </div>
      {jokerExchangeTarget !== null && exchangeMeld && exchangeNatural && <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/65 p-4">
        <div className="w-full max-w-md rounded-2xl border-2 border-amber-200 bg-[#f5f0df] p-5 text-emerald-950 shadow-2xl">
          <h2 className="text-center text-2xl font-black">{t('jokerExchangeTitle')}</h2>
          <p className="mt-2 text-center text-sm">{t('jokerExchangeDesc')}</p>
          <div className="mt-4 flex justify-center gap-2">{exchangeMeld.tiles.map((tile, index) => <AmericanTile key={`${tile}-${index}`} tile={tile} compact />)}</div>
          <div className="mt-4 rounded-xl bg-emerald-950/10 p-3 text-sm"><strong>{t('requiredReplacement', { tile: tileFace(exchangeNatural as Tile) })}</strong><p className="mt-1">{canConfirmJokerExchange ? t('legalExchange') : t('illegalExchange')}</p></div>
          <div className="mt-4 flex gap-2"><button type="button" onClick={() => setJokerExchangeTarget(null)} className="flex-1 rounded-xl border border-emerald-900/30 py-3 font-black">{t('cancel')}</button><button type="button" disabled={!canConfirmJokerExchange} onClick={swapJoker} className="flex-1 rounded-xl bg-amber-300 py-3 font-black disabled:cursor-not-allowed disabled:opacity-45">{t('exchange')}</button></div>
        </div>
      </div>}
      {game.phase === 'ended' && <ResultReview game={game} onNew={reset} onShare={shareReplay} />}
      {showAccessibility && <MahjongAccessibilityPanel preferences={preferences} onChange={(key, value) => { setPreference(key, value); trackMahjongEvent('mahjong_accessibility_changed', { setting: key, value: String(value) }); }} onClose={() => setShowAccessibility(false)} />}
    </section>
  );
}

function AmericanTile({ tile, selected = false, highlight = false, compact = false, onClick }: { tile: string; selected?: boolean; highlight?: boolean; compact?: boolean; onClick?: () => void }) {
  const classes = `${compact ? 'h-11 w-8 text-[9px]' : 'h-20 w-14 text-2xl'} ${selected ? '-translate-y-4 ring-4 ring-amber-300' : highlight ? '-translate-y-2 ring-2 ring-amber-300' : ''}`;
  if (isStandardTile(tile)) return <span className={classes}><TileFace tile={tile} size={compact ? 'xs' : 'xl'} traditional onClick={onClick ? () => onClick() : undefined} highlight={selected || highlight} /></span>;
  return <button type="button" onClick={onClick} className={`inline-flex items-center justify-center rounded-lg border-2 border-slate-500 bg-[radial-gradient(circle,#d9ddd7_0%,#8e958d_100%)] font-black text-emerald-950 shadow-[0_4px_0_rgba(0,0,0,.3)] ${classes}`}>J<br /><span className="text-[.42em]">OKER</span></button>;
}

function Wall({ className, count, vertical = false }: { className: string; count: number; vertical?: boolean }) { return <div className={`absolute flex ${vertical ? 'flex-col' : ''} ${className}`}>{Array.from({ length: count }, (_, index) => <span key={index} className={vertical ? '-my-[5px]' : '-mx-[2px]'}><TileBack size="table" /></span>)}</div>; }
function CharlestonReserve({ className, vertical = false }: { className: string; vertical?: boolean }) { return <div className={`absolute z-[3] flex ${vertical ? 'flex-col' : ''} gap-4 ${className}`}>{Array.from({ length: 3 }, (_, index) => <span key={index} className="inline-block"><TileBack size="xl" /></span>)}</div>; }
function CoachPanel({ coach, t, className, compact = false }: { coach: ReturnType<typeof americanCoachAdvice>; t: (key: string, values?: Record<string, string | number>) => string; className: string; compact?: boolean }) {
  const exposureKey = coach.exposure === 'wait-for-mah-jongg' ? 'coachExposureWait' : coach.exposure === 'call-commits-to-line' ? 'coachExposureCommit' : 'coachExposureCompatible';
  const tileRow = (label: string, tiles: string[]) => <div className="mt-2"><p className="text-[10px] font-black uppercase tracking-wide text-amber-200">{label}</p><div className="mt-1 flex gap-1">{tiles.map((tile, index) => <AmericanTile key={`${tile}-${index}`} tile={tile} compact />)}</div></div>;
  return <aside className={`rounded-xl border border-emerald-100/15 bg-[#002f24]/90 p-3 text-xs text-emerald-50 shadow-xl ${className}`} aria-label={t('coachTitle')}>
    <p className="font-black uppercase tracking-[.13em] text-amber-200">{t('coachTitle')}</p>
    <div className="mt-2 space-y-1"><p className="text-[10px] font-black text-emerald-100/70">{t('coachRankings')}</p>{coach.rankings.map(({ card, distance }) => <div key={card.id} className="flex justify-between gap-2"><span className="truncate">{card.title}</span><strong className="text-amber-100">{t('awayN', { n: distance })}</strong></div>)}</div>
    {tileRow(t('coachKeep'), coach.keep)}
    {(compact || coach.pass.length > 0) && tileRow(t('coachPass'), coach.pass)}
    {coach.discard && <p className="mt-2 border-t border-white/10 pt-2 text-emerald-100/80"><strong>{t('coachDiscard')}:</strong> {coach.discard}</p>}
    {coach.outs.length > 0 && <div className="mt-2 border-t border-white/10 pt-2"><p className="text-[10px] font-black uppercase tracking-wide text-amber-200">{t('coachOuts')}</p><p className="mt-1 text-emerald-100/80">{coach.outs.map((out) => `${out.tile} ×${out.remaining}`).join(' · ')}</p></div>}
    {coach.discardRisk && <p className={`mt-2 rounded-md p-2 leading-snug ${coach.discardRisk.level === 'high' ? 'bg-rose-400/15 text-rose-100' : coach.discardRisk.level === 'low' ? 'bg-emerald-300/15 text-emerald-100' : 'bg-white/10 text-emerald-100'}`}>{t(coach.discardRisk.level === 'high' ? 'coachRiskHigh' : coach.discardRisk.level === 'low' ? 'coachRiskLow' : 'coachRiskMedium', { tile: coach.discardRisk.tile })}</p>}
    <p className="mt-2 border-t border-white/10 pt-2 leading-snug text-emerald-100/80">{t(exposureKey)}</p>
    {coach.jokerExchange && <p className="mt-2 rounded-md bg-amber-300/15 p-2 font-bold text-amber-100">{t('coachJokerExchange', { tile: coach.jokerExchange })}</p>}
  </aside>;
}
function Portrait({ index, label, compact = false }: { index: 0 | 1 | 2 | 3; label: string; compact?: boolean }) {
  const row = index > 1 ? 1 : 0;
  const column = index % 2;
  return <span className={`relative inline-block shrink-0 overflow-hidden rounded-full ${compact ? 'h-8 w-8' : 'h-14 w-14'}`} aria-label={label}>
    <img src="/images/mahjong/ai-avatars-default.webp" alt="" className="absolute h-[200%] w-[200%] max-w-none" style={{ left: `${-column * 100}%`, top: `${-row * 100}%` }} />
  </span>;
}
function Avatar({ seat, score, className, human = false, portrait = 0, status }: { seat: string; score: string; className: string; human?: boolean; portrait?: 0 | 1 | 2 | 3; status?: string }) { return <div className={`absolute z-20 flex w-24 flex-col items-center ${className}`}><div className={`rounded-full border-4 ${human ? 'border-amber-300 bg-sky-500' : 'border-white bg-violet-500'} shadow-lg`}>{human ? <span className="flex h-14 w-14 items-center justify-center text-xs font-black">{seat}</span> : <Portrait index={portrait} label={seat} />}</div><div className="mt-1 rounded-full bg-black/40 px-2 py-0.5 text-xs font-black text-amber-100">{status ?? `G ${score}`}</div></div>; }
function Opponent({ label, portrait, status }: { label: string; portrait: 0 | 1 | 2 | 3; status: string }) { return <div className="flex items-center rounded-full bg-black/35 p-2"><Portrait index={portrait} label={label} compact /><span className="ml-1 font-black text-amber-100">{status}</span></div>; }
function TableButton({ children, onClick, active = false }: { children: ReactNode; onClick: () => void; active?: boolean }) { return <button type="button" onClick={onClick} className={`h-9 rounded-lg border px-4 text-xs font-black ${active ? 'border-amber-300 bg-amber-300 text-emerald-950' : 'border-white/10 bg-[#07553b] text-white'}`}>{children}</button>; }
/** One line describing what the table did while the human was not acting. */
function describeTableTurn(game: AmericanGameState, t: (key: string, values?: any) => string): string {
  if (game.phase === 'ended') {
    if (game.endReason === 'wall-exhausted') return t('wallRanOut');
    const winner = game.settlement?.winner;
    return winner === 0 ? t('mahJonggExclaim') : t('seatDeclared', { n: (winner ?? 0) + 1 });
  }
  if (game.phase === 'claim') return t('callOnTable');
  const called = game.players.find((player) => player.melds.length > 0 && player.seat !== 0);
  if (called) return t('seatExposure', { n: called.seat + 1 });
  return t('othersTookTurns');
}

function ResultReview({ game, onNew, onShare }: { game: AmericanGameState; onNew: () => void; onShare: () => void }) {
  const t = useTranslations('american');
  const settlement = game.settlement;
  const winner = settlement?.winner;
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 p-4">
    <div className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-2xl border-4 border-amber-200 bg-[#f5f0df] p-5 text-emerald-950 shadow-2xl">
      <h2 className="text-center text-3xl font-black">{settlement ? t('mahJonggExclaim') : t('wallGame')}</h2>
      <p className="mt-1 text-center font-bold">{settlement ? `${settlement.reason} · ${settlement.points} ${t('points')}` : t('drawNobody')}</p>
      <p className="mt-3 text-sm font-bold">{settlement ? t('winnerSeat', { n: (winner ?? 0) + 1 }) : ''}{t('allRevealed')}</p>
      {settlement && <div className="mt-3 rounded-xl bg-emerald-950/10 p-3 text-sm"><strong>{t('settlementLedger')}</strong><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{settlement.transfers.map((transfer, seat) => <span key={seat} className={`rounded-lg px-2 py-1 font-black ${transfer >= 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-800'}`}>{t('seatScore', { seat: seat + 1, score: (transfer >= 0 ? '+' : '') + transfer })}</span>)}</div></div>}
      <div className="mt-3 grid gap-3 md:grid-cols-2">{game.players.map((player) => <div key={player.seat} className={`rounded-xl border p-3 ${player.seat === winner ? 'border-amber-400 bg-amber-50' : 'border-emerald-900/20 bg-white'}`}><p className="font-black">{t('seatScore', { seat: player.seat + 1, score: (player.score >= 0 ? '+' : '') + player.score })}</p><div className="mt-2 flex flex-wrap gap-1">{[...player.hand, ...player.melds.flatMap((meld) => meld.tiles)].map((tile, index) => <AmericanTile key={index} tile={tile} compact />)}</div><p className="mt-2 text-xs">{t('discards', { tiles: player.discards.join(', ') || t('none') })}</p></div>)}</div>
      <div className="mt-4 rounded-xl bg-emerald-950/10 p-3 text-xs"><strong>{t('replayLog')}</strong>{game.history.map((entry, index) => <p key={index}>{index + 1}. {entry}</p>)}</div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2"><button type="button" onClick={onShare} className="rounded-xl border border-emerald-800/30 bg-white py-3 font-black text-emerald-950">Share replay</button><button type="button" onClick={onNew} className="rounded-xl bg-[#087052] py-3 font-black text-white">{t('newHand')}</button></div>
    </div>
  </div>;
}
