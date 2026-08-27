'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  NATIVE_SEO_LOCALES,
  NATIVE_SEO_LOCALE_LABELS,
  type NativeSeoLocale
} from '@/lib/native-seo-locales';

/**
 * Content-locale switcher for admin pages that edit multi-language copy.
 * Persists choice in `?lang=` so editors can jump locales to spot gaps.
 */
export default function AdminContentLocaleSwitcher({
  current,
  paramName = 'lang'
}: {
  current: NativeSeoLocale;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const select = (locale: NativeSeoLocale) => {
    router.push(`${pathname}?${paramName}=${locale}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-gray-500">内容语言</span>
      <div className="flex flex-wrap gap-1">
        {NATIVE_SEO_LOCALES.map((locale) => {
          const active = locale === current;
          return (
            <button
              key={locale}
              type="button"
              onClick={() => select(locale)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {NATIVE_SEO_LOCALE_LABELS[locale]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
