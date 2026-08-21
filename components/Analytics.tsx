'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_STORAGE_KEY,
  detectGlobalPrivacyControl,
  parseConsent,
  shouldLoadAnalytics
} from '@/lib/consent';

type AnalyticsIds = { ga: string; gtm: string };

const CACHE_KEY = 'mh_analytics_ids';
const CACHE_MS = 24 * 60 * 60 * 1000;

function fromEnv(): AnalyticsIds {
  return {
    ga: process.env.NEXT_PUBLIC_GA_ID || 'G-61V8MK15S6',
    gtm: process.env.NEXT_PUBLIC_GTM_ID ?? ''
  };
}

function fromCache(): AnalyticsIds | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ids: AnalyticsIds; at: number };
    if (Date.now() - parsed.at > CACHE_MS) return null;
    return parsed.ids;
  } catch {
    return null;
  }
}

function currentConsent(): { allowed: boolean } {
  try {
    const stored = parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
    const gpc = detectGlobalPrivacyControl(navigator);
    if (!stored) return { allowed: false };
    return { allowed: shouldLoadAnalytics(stored, gpc) };
  } catch {
    return { allowed: false };
  }
}

/**
 * GA4 / GTM stay unloaded until analytics consent (GDPR/CCPA).
 */
export default function Analytics() {
  const env = fromEnv();
  const [allowed, setAllowed] = useState(false);
  const [data, setData] = useState<AnalyticsIds | null>(
    env.ga || env.gtm ? env : null
  );

  useEffect(() => {
    const apply = () => setAllowed(currentConsent().allowed);
    apply();
    const onChange = () => apply();
    window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!allowed) return;
    if (env.ga || env.gtm) return;

    const cached = fromCache();
    if (cached) {
      setData(cached);
      return;
    }

    fetch('/api/public/analytics')
      .then((r) => r.json())
      .then((ids: AnalyticsIds) => {
        setData(ids);
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ ids, at: Date.now() })
          );
        } catch {
          /* ignore */
        }
      })
      .catch(() => {});
  }, [allowed, env.ga, env.gtm]);

  if (!allowed || !data) return null;
  const { ga, gtm } = data;
  if (!ga && !gtm) return null;

  return (
    <>
      {gtm && (
        <Script id="gtm" strategy="lazyOnload">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}
      {ga && (
        <Script
          id="ga4"
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
        />
      )}
      {ga && (
        <Script id="ga4-init" strategy="lazyOnload">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}',{anonymize_ip:true});`}
        </Script>
      )}
    </>
  );
}
