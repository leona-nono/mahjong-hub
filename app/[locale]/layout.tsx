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
import ConsentBanner from '@/components/ConsentBanner';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import PwaInstallHint from '@/components/PwaInstallHint';
import { LANGUAGE_ALTERNATES, SITE_BASE_URL, socialShareMeta } from '@/lib/seo';
import { brandName, getSiteSettings } from '@/lib/site-settings';
import { homeSeo } from '@/lib/home-seo';

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

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const site = await getSiteSettings();
  const home = await homeSeo(locale);
  const brand = brandName(site);
  const share = socialShareMeta({
    title: home.title,
    description: home.description,
    locale,
    ogImage: site.ogImage,
    siteName: brand
  });
  return {
    metadataBase: new URL(SITE_BASE_URL),
    title: {
      default: home.title,
      template: site.titleTemplate.includes('{page}')
        ? site.titleTemplate.replaceAll('{brand}', brand).replaceAll('{siteTitle}', site.siteTitle).replace('{page}', '%s')
        : `%s | ${brand}`
    },
    description: home.description,
    alternates: {
      canonical: `${SITE_BASE_URL}/${locale}`,
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
    ...share
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
            <ConsentBanner />
          </Providers>
          <Analytics />
          <ServiceWorkerRegister />
          <PwaInstallHint />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
