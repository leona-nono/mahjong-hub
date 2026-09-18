'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import TileFace from '../TileFace';
import type { CoachReview, Evidence } from '@/lib/mahjong/coach/review';
import { expandSet } from '@/lib/mahjong/scoring';
import { evidenceTemplateKey } from '@/features/table/coach-evidence';
import type { Tile } from '@/lib/mahjong/tiles';

export interface CoachReviewPanelProps {
  review: CoachReview;
  onClose: () => void;
  /** Default open layers: first-time A+B, normal A+C. */
  defaultOpen?: Array<'A' | 'B' | 'C' | 'D' | 'miss'>;
}

/**
 * Settlement teaching panel — layers A–D + miss coverage.
 * Does not consume in-hand L0–L4 budget.
 */
export default function CoachReviewPanel({
  review,
  onClose,
  defaultOpen
}: CoachReviewPanelProps) {
  const t = useTranslations('review');
  const fan = useTranslations('mahjong.fan');
  const initial = new Set(
    defaultOpen ??
      (review.outcome === 'iWon' ? (['A', 'C'] as const) : (['miss'] as const))
  );
  const [open, setOpen] = useState<Set<string>>(new Set(initial));

  const toggle = (key: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
    >
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-amber-200/40 bg-[#f4f0df] p-5 text-left text-emerald-950 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-amber-800">{t('title')}</p>
            <p className="mt-1 text-lg font-black">
              {review.outcome === 'iWon'
                ? t('outcome.iWon')
                : review.outcome === 'opponentWon'
                  ? t('outcome.opponentWon')
                  : t('outcome.draw')}
            </p>
            {review.capability === 'partial' && (
              <p className="mt-1 text-xs font-bold text-amber-900/80">{t('partialNote')}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-900 text-white"
            aria-label={t('close')}
          >
            ×
          </button>
        </div>

        {review.discloseReveal && (
          <p className="mt-3 rounded-lg bg-emerald-900/10 px-3 py-2 text-sm leading-snug text-emerald-900">
            {t('discloseReveal')}
          </p>
        )}

        {review.missInfo && (
          <Accordion
            id="miss"
            title={t('layers.miss')}
            open={open.has('miss')}
            onToggle={() => toggle('miss')}
          >
            <p className="text-sm">
              {review.missInfo.shanten <= 0
                ? t('miss.ready', { tiles: review.missInfo.waits.join(' ') || '—' })
                : t('miss.shanten', { n: review.missInfo.shanten })}
            </p>
            {review.missInfo.note === 'dealt_in' && (
              <p className="mt-2 text-sm font-semibold text-rose-800">{t('miss.dealtIn')}</p>
            )}
            {review.missInfo.waits.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {review.missInfo.waits.map((tile) => (
                  <TileFace key={tile} tile={tile} size="sm" traditional />
                ))}
              </div>
            )}
          </Accordion>
        )}

        {review.shape && (
          <Accordion id="A" title={t('layers.A')} open={open.has('A')} onToggle={() => toggle('A')}>
            <ShapeBlock shape={review.shape} winningTile={review.shape.winningTile} />
          </Accordion>
        )}

        {review.gate && (
          <Accordion id="B" title={t('layers.B')} open={open.has('B')} onToggle={() => toggle('B')}>
            <p className="text-sm font-semibold">
              {review.gate.kind === 'yaku'
                ? t('gate.yaku', { actual: review.gate.actual, required: review.gate.required })
                : t('gate.minFan', { actual: review.gate.actual, required: review.gate.required })}
              {review.gate.passed ? ' ✓' : ''}
            </p>
            {review.capability === 'partial' && (
              <p className="mt-1 text-xs text-amber-900/80">{t('gate.unverified')}</p>
            )}
            {review.gate.reasonKey && (
              <p className="mt-1 text-sm text-emerald-800">{t(`gate.reason.${review.gate.reasonKey}`)}</p>
            )}
          </Accordion>
        )}

        {review.fans && review.fans.length > 0 && (
          <Accordion id="C" title={t('layers.C')} open={open.has('C')} onToggle={() => toggle('C')}>
            <dl className="space-y-2">
              {review.fans.map((item) => (
                <div key={`${item.id}-${item.value}`} className="rounded-lg bg-white/70 p-2">
                  <dt className="flex justify-between text-sm font-bold">
                    <span>{safeFanName(fan, item.id)}</span>
                    <span className="text-amber-800">+{item.value}</span>
                  </dt>
                  <dd className="mt-1 text-xs leading-snug text-emerald-800">
                    {formatEvidence(t, item.evidence)}
                  </dd>
                </div>
              ))}
            </dl>
          </Accordion>
        )}

        {review.formula && (
          <Accordion id="D" title={t('layers.D')} open={open.has('D')} onToggle={() => toggle('D')}>
            <ul className="space-y-1 text-sm">
              {review.formula.items.map((item) => (
                <li key={item.labelKey} className="flex justify-between gap-3">
                  <span>{t(`formula.${item.labelKey}`)}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
            <p className="mt-2 border-t border-emerald-200 pt-2 text-base font-black">
              {t('formula.total')}: {review.formula.total}
            </p>
          </Accordion>
        )}
      </div>
    </div>
  );
}

function Accordion({
  id,
  title,
  open,
  onToggle,
  children
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="mt-3 rounded-xl border border-emerald-200/80 bg-white/50">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-black text-emerald-950"
        aria-expanded={open}
        aria-controls={`review-${id}`}
        onClick={onToggle}
      >
        <span>{title}</span>
        <span aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div id={`review-${id}`} className="border-t border-emerald-100 px-3 py-3">
          {children}
        </div>
      )}
    </section>
  );
}

function ShapeBlock({
  shape,
  winningTile
}: {
  shape: NonNullable<CoachReview['shape']>;
  winningTile?: Tile;
}) {
  const t = useTranslations('review');
  if (shape.kind !== 'standard' || !shape.sets?.length) {
    return <p className="text-sm font-semibold">{t(`shape.${shape.kind}`)}</p>;
  }
  return (
    <ol className="space-y-2">
      {shape.sets.map((set, index) => {
        const tiles = expandSet(set);
        return (
          <li key={`${set.kind}-${set.tile}-${index}`} className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-[10px] font-black uppercase text-emerald-700/70">
              {set.open ? '○' : '●'} {t(`setKind.${set.kind}`)}
            </span>
            {tiles.map((tile, tileIndex) => (
              <TileFace
                key={`${tile}-${tileIndex}`}
                tile={tile}
                size="sm"
                traditional
                highlight={Boolean(winningTile && tile === winningTile && tileIndex === tiles.length - 1)}
              />
            ))}
            {winningTile && tiles.includes(winningTile) && index === shape.sets!.length - 1 ? (
              <span className="ml-1 text-xs font-bold text-amber-800">▸</span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function safeFanName(fan: ReturnType<typeof useTranslations>, id: string): string {
  try {
    return fan(id as 'allSimples');
  } catch {
    return id;
  }
}

function formatEvidence(t: ReturnType<typeof useTranslations>, evidence: Evidence): string {
  const key = evidenceTemplateKey(evidence);
  try {
    if (evidence.kind === 'kongCount') {
      return t(`evidence.${key}`, { concealed: evidence.concealed, melded: evidence.melded });
    }
    if (evidence.kind === 'flowerCount') {
      return t(`evidence.${key}`, { n: evidence.tiles.length });
    }
    if (evidence.kind === 'gate') {
      return t(`evidence.${key}`, { required: evidence.required, actual: evidence.actual });
    }
    if (evidence.kind === 'fallback') {
      return t('evidence.fallback');
    }
    return t(`evidence.${key}`);
  } catch {
    return t('evidence.fallback');
  }
}
