import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '@/app/globals.css';
import Providers from '@/components/providers';
import Analytics from '@/components/Analytics';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import PwaInstallHint from '@/components/PwaInstallHint';
import { LANGUAGE_ALTERNATES } from '@/lib/seo';
import { getSiteSettings } from '@/lib/site-settings';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-portal-display',
  display: 'swap'
});

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-portal-sans',
  display: 'swap'
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: {
      default: site.siteTitle,
      template: `%s · ${site.siteTitle.split('·')[0].trim()}`
    },
    description: site.siteDescription,
    alternates: {
      languages: LANGUAGE_ALTERNATES
    },
    verification: {
      ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
        ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
        : {}),
      other: {
        'msvalidate.01':
          process.env.NEXT_PUBLIC_BING_VERIFICATION ??
          '51451E3156FA88DDC9C608C49C6FD0AC'
      }
    },
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      title: site.siteTitle,
      statusBarStyle: 'black-translucent'
    },
    icons: {
      icon: [{ url: '/icons/icon-192.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/icons/icon-192.svg' }]
    },
    openGraph: {
      title: site.siteTitle,
      description: site.siteDescription,
      images: site.ogImage ? [site.ogImage] : undefined
    }
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b1220'
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">
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
          <ServiceWorkerRegister />
          <PwaInstallHint />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
