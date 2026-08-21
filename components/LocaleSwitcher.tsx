'use client';

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

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => {
        const next = e.target.value as Locale;
        if (!routing.locales.includes(next) || next === locale) return;
        router.replace(pathname, { locale: next });
      }}
      className="rounded-lg border border-portal-border bg-portal-panel px-2 py-1 text-xs font-semibold text-portal-text"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>
          {LABELS[l] ?? l}
        </option>
      ))}
    </select>
  );
}
