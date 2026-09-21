'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import TileFace from '@/components/games/TileFace';
import { TILE_ALIASES, TILE_ID_ORDER } from '@/data/tools/tile-aliases';
import {
  isHonour,
  isTerminal,
  tileName,
  tileRank,
  tileSuit,
  type Tile
} from '@/lib/mahjong/tiles';

const SUIT_LABEL_KEY = {
  m: 'tileIdSuitCharacters',
  p: 'tileIdSuitDots',
  s: 'tileIdSuitBamboo',
  z: 'tileIdSuitHonours'
} as const;

function typeKey(tile: Tile): 'tileIdTypeHonour' | 'tileIdTypeTerminal' | 'tileIdTypeSimple' {
  if (isHonour(tile)) return 'tileIdTypeHonour';
  if (isTerminal(tile)) return 'tileIdTypeTerminal';
  return 'tileIdTypeSimple';
}

/**
 * Interactive highlight for the tile identifier.
 * The full 34-tile catalogue is also SSR'd on the page for crawlers; this
 * client block only mirrors the selected tile for a larger detail panel.
 */
export default function TileIdentifierTool({ initialTile = 's3' }: { initialTile?: Tile }) {
  const t = useTranslations('tools');
  const [selected, setSelected] = useState<Tile>(initialTile);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash && TILE_ID_ORDER.includes(hash as Tile)) {
      setSelected(hash as Tile);
    }
  }, []);

  const select = (tile: Tile) => {
    setSelected(tile);
    const url = new URL(window.location.href);
    url.hash = tile;
    window.history.replaceState(null, '', `${url.pathname}${url.search}#${tile}`);
  };

  const suit = tileSuit(selected);
  const aliases = TILE_ALIASES[selected] ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-portal-border bg-portal-panel p-4 sm:p-5">
        <h2 className="text-base font-semibold text-portal-text">{t('tileIdPick')}</h2>
        <p className="mt-1 text-xs text-portal-muted">{t('tileIdPickHint')}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {TILE_ID_ORDER.map((tile) => (
            <TileFace
              key={tile}
              tile={tile}
              size="md"
              onClick={select}
              highlight={tile === selected}
            />
          ))}
        </div>
      </section>

      <section
        className="rounded-2xl border border-portal-accent bg-portal-panel p-5"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-start gap-6">
          <TileFace tile={selected} size="xl" />
          <dl className="min-w-0 flex-1 space-y-2 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-portal-muted">
                {t('tileIdName')}
              </dt>
              <dd className="mt-0.5 text-lg font-semibold text-portal-text">{tileName(selected)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-portal-muted">
                {t('tileIdAliases')}
              </dt>
              <dd className="mt-0.5 text-portal-text">{aliases.join(' · ')}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-portal-muted">
                {t('tileIdSuit')}
              </dt>
              <dd className="mt-0.5 text-portal-text">{t(SUIT_LABEL_KEY[suit])}</dd>
            </div>
            {!isHonour(selected) ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-portal-muted">
                  {t('tileIdRank')}
                </dt>
                <dd className="mt-0.5 text-portal-text">{tileRank(selected)}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-portal-muted">
                {t('tileIdType')}
              </dt>
              <dd className="mt-0.5 text-portal-text">{t(typeKey(selected))}</dd>
            </div>
          </dl>
        </div>
        <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-portal-muted">
          <li>{t('tileIdTipChow')}</li>
          <li>{t('tileIdTipPong')}</li>
          <li>{t('tileIdTipKong')}</li>
          <li>{t('tileIdTipFlush')}</li>
        </ul>
      </section>
    </div>
  );
}
