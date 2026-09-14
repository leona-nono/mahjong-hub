'use client';

import { useTranslations } from 'next-intl';

import TileFace from '../TileFace';
import type { ClaimOption, HongKongMode, SelfDrawEvaluation } from '@/lib/mahjong/engine';
import { tileFace, type Tile } from '@/lib/mahjong/tiles';
import { primeMahjongAudio } from '@/features/table/sound';

export interface ClaimDialogProps {
  variant: 'hongkong' | 'riichi' | 'chinese-official';
  hongKongMode: HongKongMode;
  paused: boolean;
  myClaims?: ClaimOption[];
  canTsumo: boolean;
  tsumoEvaluation: SelfDrawEvaluation | null;
  kanTiles: Tile[];
  riichiDiscards: Tile[];
  declaredReady: boolean;
  riichiPending: boolean;
  canAbortNineTerminals?: boolean;
  scoreUnit: string;
  onClaim: (option: ClaimOption) => void;
  onTsumo: () => void;
  onKan: (tile: Tile) => void;
  onRiichi?: () => void;
  onNineTerminals?: () => void;
  onHongKongMode: (mode: HongKongMode) => void;
}

/**
 * Floating action bar for chi / pon / kan / ron / tsumo / riichi / pass.
 */
export default function ClaimDialog({
  variant,
  hongKongMode,
  paused,
  myClaims,
  canTsumo,
  tsumoEvaluation,
  kanTiles,
  riichiDiscards,
  declaredReady,
  riichiPending,
  canAbortNineTerminals = false,
  scoreUnit,
  onClaim,
  onTsumo,
  onKan,
  onRiichi,
  onNineTerminals,
  onHongKongMode
}: ClaimDialogProps) {
  const t = useTranslations('mahjong');
  const isRiichi = variant === 'riichi';
  const visible =
    (myClaims || canTsumo || tsumoEvaluation?.complete || kanTiles.length > 0 || riichiDiscards.length > 0) &&
    !paused;

  if (!visible) return null;

  return (
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
          <span className="block">{t('completeHandBlocked', { score: tsumoEvaluation.score?.total ?? 0, unit: scoreUnit, min: tsumoEvaluation.minimum })}</span>
          {tsumoEvaluation.score?.patterns.length ? <span className="mt-1 block text-xs">{t('currentPatterns')} {tsumoEvaluation.score.patterns.map((pattern) => pattern.label).join(' · ')}</span> : null}
          {variant === 'hongkong' && hongKongMode === 'standard' ? (
            <button type="button" onClick={() => onHongKongMode('casual')} className="mt-2 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-black text-white">{t('switchToCasual')}</button>
          ) : null}
        </div>
      )}
      {canTsumo && (
        <button type="button" onClick={() => { primeMahjongAudio(); onTsumo(); }} className="animate-pulse rounded-lg bg-rose-500 px-6 py-3 text-base font-black text-white shadow-[0_0_24px_rgba(244,63,94,.55)]">
          {t('selfDrawWin')}
        </button>
      )}
      {isRiichi && riichiDiscards.length > 0 && !declaredReady && (
        <button type="button" onClick={onRiichi} className="rounded-lg bg-red-600 px-6 py-3 text-base font-black text-white">
          {riichiPending ? t('chooseHighlightedDiscard') : t('riichi')}
        </button>
      )}
      {canAbortNineTerminals && (
        <button type="button" onClick={onNineTerminals} className="rounded-lg bg-slate-700 px-5 py-2 text-sm font-black text-white">
          {t('nineTerminalsAbandon')}
        </button>
      )}
      {kanTiles.map((tile) => (
        <button key={tile} type="button" onClick={() => { primeMahjongAudio(); onKan(tile); }} className="rounded-lg bg-amber-300 px-5 py-2 text-sm font-black text-emerald-950">
          {t('call.kan')} {tileFace(tile)}
        </button>
      ))}
    </div>
  );
}
