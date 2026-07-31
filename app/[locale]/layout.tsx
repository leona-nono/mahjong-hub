import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '@/app/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/providers';

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
  alternates: {
    languages: {
      en: '/en',
      zh: '/zh',
      'zh-TW': '/zh-TW',
      ja: '/ja',
      ko: '/ko'
    }
  }
};

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
              x: !!process.env.AUTH_X_ID && !!process.env.AUTH_X_SECRET
            }}
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
