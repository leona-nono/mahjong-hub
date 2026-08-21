'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { APPEARANCES, applyAppearance, savedAppearance, type AppearanceChapter, type AppearanceId } from '@/lib/appearance';

const CHAPTERS: AppearanceChapter[] = ['foundation', 'solar', 'festival'];

function availability(id: AppearanceId) {
  const item = APPEARANCES[id];
  if (!item.availableFrom || !item.availableUntil) return 'permanent';
  const today = new Date().toISOString().slice(0, 10);
  if (today < item.availableFrom) return 'upcoming';
  if (today > item.availableUntil) return 'archive';
  return 'active';
}

export default function Wardrobe() {
  const t = useTranslations('wardrobe');
  const [selected, setSelected] = useState<AppearanceId>('jade');
  const [equipped, setEquipped] = useState<AppearanceId>('jade');
  useEffect(() => {
    const active = savedAppearance();
    setSelected(active);
    setEquipped(active);
  }, []);
  return <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
    <section className="overflow-hidden rounded-3xl border border-[#d8d7cd] bg-[#fffdf7] p-4 sm:p-6">
      <div className="mb-4"><h2 className="font-serif text-2xl font-bold text-[#1d2a44]">{t('collection')}</h2><p className="mt-1 text-sm text-[#52617a]">{t('freeNote')}</p></div>
      <div className="space-y-6">{CHAPTERS.map((chapter) => {
        const ids = (Object.keys(APPEARANCES) as AppearanceId[]).filter((id) => APPEARANCES[id].chapter === chapter);
        if (ids.length === 0) return null;
        return <section key={chapter} aria-labelledby={`chapter-${chapter}`}>
          <div className="mb-3"><h3 id={`chapter-${chapter}`} className="font-serif text-lg font-bold text-[#1d2a44]">{t(`chapters.${chapter}.title`)}</h3><p className="mt-0.5 text-xs text-[#52617a]">{t(`chapters.${chapter}.body`)}</p></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{ids.map((id) => {
        const item = APPEARANCES[id]; const state = availability(id);
        return <button key={id} type="button" onClick={() => setSelected(id)} className={`overflow-hidden rounded-2xl border text-left transition hover:-translate-y-0.5 ${selected === id ? 'border-[#1e554d] ring-2 ring-[#a8cfc5]' : 'border-[#d8d7cd]'}`}>
          <span className="block h-24 bg-cover bg-center" style={{ backgroundImage: `url('${item.table}')` }} />
          <span className="block bg-[#fffdf7] p-3"><b className="block text-sm text-[#1d2a44]">{t(`items.${id}`)}</b><small className="mt-1 inline-block rounded-full bg-[#eef2eb] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#52617a]">{t(state)}</small></span>
        </button>;
          })}</div>
        </section>;
      })}</div>
    </section>
    <aside className="rounded-3xl border border-[#d8d7cd] bg-[#fffdf7] p-5">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a66a3f]">{t('preview')}</p>
      <div className="mt-3 aspect-[16/10] rounded-2xl bg-cover bg-center p-4 shadow-inner" style={{ backgroundImage: `linear-gradient(rgba(16,62,53,.52),rgba(16,62,53,.58)),url('${APPEARANCES[selected].table}')` }}><span className="inline-block rounded-lg bg-[#fffdf7] px-3 py-2 text-sm font-bold text-[#1d2a44]">{t(`items.${selected}`)}</span></div>
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f3efe5] p-3"><span className="h-16 w-11 rounded-lg bg-cover bg-center shadow" style={{ backgroundImage: `url('${APPEARANCES[selected].back}')` }} /><p className="text-sm text-[#52617a]">{selected === equipped ? t('equipped') : t('owned')}</p></div>
      <button type="button" onClick={() => { applyAppearance(selected); setEquipped(selected); }} className="mt-4 w-full rounded-xl bg-[#1e554d] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#2d756a]">{t('apply')}</button>
    </aside>
  </div>;
}
