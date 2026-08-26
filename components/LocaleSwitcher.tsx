'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

const LABELS: Record<string, string> = {
  en: 'EN',
  zh: '简',
  'zh-TW': '繁',
  ja: '日',
  ko: '한',
  es: 'ES',
  'pt-BR': 'PT',
  fr: 'FR',
  de: 'DE'
};

const NATIVE_NAMES: Record<string, string> = {
  en: 'English',
  zh: '简体中文',
  'zh-TW': '繁體中文',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  'pt-BR': 'Português (BR)',
  fr: 'Français',
  de: 'Deutsch'
};

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const switchLang = (next: Locale) => {
    if (!routing.locales.includes(next) || next === locale) return;
    setOpen(false);
    router.replace(pathname, { locale: next });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 items-center gap-1.5 rounded-lg border border-portal-border bg-portal-panel px-3 text-xs font-semibold text-portal-text hover:bg-portal-panel/80"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
      >
        <span aria-hidden>🌐</span>
        {LABELS[locale] ?? locale}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Language"
          className="absolute right-0 z-50 mt-2 min-w-[140px] rounded-xl border border-portal-border bg-portal-panel p-1 shadow-xl"
        >
          {routing.locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => switchLang(l)}
                className={`flex w-full min-h-11 items-center rounded-lg px-3 py-2.5 text-sm text-portal-text hover:bg-white/5 ${
                  l === locale ? 'bg-white/10 font-semibold' : ''
                }`}
              >
                {NATIVE_NAMES[l] ?? l}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
