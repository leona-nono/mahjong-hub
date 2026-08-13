import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '@/app/globals.css';
import Providers from '@/components/providers';
import Analytics from '@/components/Analytics';
import { SITE_BASE_URL, LANGUAGE_ALTERNATES } from '@/lib/seo';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: 'Mahjong Hub · Rainbow Mahjong Games',
    template: '%s · Mahjong Hub'
  },
  description:
    'A rainbow-themed collection of relaxing mahjong solitaire, connect and tile-match games. Free to play, no login.',
  // Absolute hreflang URLs (Google requires absolute, not relative) plus an
  // x-default that falls back to the English homepage for language-agnostic
  // crawlers and visitors. Individual pages set their own canonical.
  alternates: {
    languages: LANGUAGE_ALTERNATES
  },
  // GSC site verification (meta-tag method). Set the env var in Vercel; when
  // absent, Next omits the tag. DNS TXT verification in Cloudflare is an
  // equally valid alternative that needs no code.
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined
};

// Some mobile in-app browsers otherwise select a desktop layout viewport
// (roughly 980px), which makes the four-player table overflow off-screen.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

// 根布局：只负责 <html>/<body> + i18n Provider + 全局 Providers。
// 公共页面的 Header/Footer 已下放到 app/[locale]/(public)/layout.tsx，
// 后台 app/[locale]/admin 不需要公共 chrome，因此这里不再渲染。
export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers
            enabledProviders={{
              google:
                !!process.env.AUTH_GOOGLE_ID &&
                !!process.env.AUTH_GOOGLE_SECRET,
              facebook:
                !!process.env.AUTH_FACEBOOK_ID &&
                !!process.env.AUTH_FACEBOOK_SECRET,
              x: !!process.env.AUTH_X_ID && !!process.env.AUTH_X_SECRET,
              email:
                !!process.env.AUTH_EMAIL_SERVER &&
                !!process.env.AUTH_EMAIL_FROM
            }}
          >
            {children}
          </Providers>
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
