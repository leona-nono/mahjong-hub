'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

type Analytics = { ga: string; gtm: string };

/**
 * Injects Google Analytics 4 + Google Tag Manager at runtime.
 *
 * IDs are fetched from /api/public/analytics (which reads the `analytics`
 * SiteSetting managed in the admin panel), so the public pages stay fully
 * static — no DB read in the render path. GA/GTM are tracking pixels, so
 * client-side injection is fine; they don't affect SEO crawl.
 */
export default function Analytics() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch('/api/public/analytics')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;
  const { ga, gtm } = data;
  if (!ga && !gtm) return null;

  return (
    <>
      {gtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}
      {ga && (
        <Script
          id="ga4"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
        />
      )}
      {ga && (
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
        </Script>
      )}
    </>
  );
}
