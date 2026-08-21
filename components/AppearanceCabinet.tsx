'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { APPEARANCES, applyAppearance, savedAppearance, type AppearanceId } from '@/lib/appearance';

export default function AppearanceCabinet() {
  const t = useTranslations('wardrobe');
  const [selected, setSelected] = useState<AppearanceId>('jade');
  useEffect(() => setSelected(savedAppearance()), []);
  return <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
    {(Object.keys(APPEARANCES) as AppearanceId[]).map((id) => (
      <button key={id} type="button" onClick={() => { applyAppearance(id); setSelected(id); }} className={`overflow-hidden rounded-2xl border text-left transition hover:-translate-y-0.5 ${selected === id ? 'border-[#1e554d] ring-2 ring-[#a8cfc5]' : 'border-[#d8d7cd]'}`}>
        <span className="block h-20 bg-cover bg-center" style={{ backgroundImage: `url('${APPEARANCES[id].table}')` }} />
        <span className="flex items-center justify-between bg-[#fffdf7] px-3 py-2 text-sm font-bold text-[#1d2a44]">{t(`items.${id}`)}{selected === id && <b className="text-[#1e554d]">✓</b>}</span>
      </button>
    ))}
  </div>;
}
