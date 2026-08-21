'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_OPEN_EVENT,
  CONSENT_STORAGE_KEY,
  acceptAll,
  customizeConsent,
  detectGlobalPrivacyControl,
  hasDecided,
  parseConsent,
  rejectNonEssential,
  type ConsentState
} from '@/lib/consent';
import { FIRST_SEEN_KEY } from '@/lib/flags';

function readStored(): ConsentState | null {
  try {
    return parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

function persist(next: ConsentState) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: next }));
}

function markFirstSeen() {
  try {
    if (!localStorage.getItem(FIRST_SEEN_KEY)) {
      localStorage.setItem(FIRST_SEEN_KEY, String(Date.now()));
    }
  } catch {
    /* ignore */
  }
}

export default function ConsentBanner() {
  const t = useTranslations('consent');
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);
  const [gpc, setGpc] = useState(false);

  const apply = useCallback((next: ConsentState) => {
    persist(next);
    setOpen(false);
    setCustomize(false);
  }, []);

  useEffect(() => {
    markFirstSeen();
    const gpcOn = detectGlobalPrivacyControl(navigator);
    setGpc(gpcOn);
    const stored = readStored();
    if (!hasDecided(stored)) {
      setOpen(true);
      if (gpcOn) {
        setAnalytics(false);
        setAdvertising(false);
      }
    }
    setReady(true);

    const onOpen = () => {
      const current = readStored();
      setAnalytics(current?.analytics === true);
      setAdvertising(current?.advertising === true);
      setCustomize(true);
      setOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
  }, []);

  if (!ready || !open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="mh-consent-title"
      className="fixed inset-x-0 bottom-0 z-[120] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-portal-border bg-portal-panel px-4 py-4 text-sm text-portal-text">
        <h2 id="mh-consent-title" className="font-display text-base font-semibold">
          {t('title')}
        </h2>
        <p className="mt-2 text-portal-muted">
          {gpc ? t('bodyGpc') : t('body')}
        </p>
        <p className="mt-2 text-xs text-portal-muted">
          <Link href="/privacy" className="text-portal-accent hover:underline">
            {t('privacy')}
          </Link>
          {' · '}
          <Link href="/cookies" className="text-portal-accent hover:underline">
            {t('cookies')}
          </Link>
        </p>

        {customize && (
            <div className="mt-3 space-y-2 rounded-xl border border-portal-border bg-portal-elevated/40 p-3">
            <label className="flex items-start gap-3">
              <input type="checkbox" checked disabled className="mt-1" />
              <span>
                <span className="font-semibold">{t('necessary')}</span>
                <span className="block text-xs text-portal-muted">{t('necessaryHelp')}</span>
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
              <span>
                <span className="font-semibold">{t('analytics')}</span>
                <span className="block text-xs text-portal-muted">{t('analyticsHelp')}</span>
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={advertising}
                onChange={(e) => setAdvertising(e.target.checked)}
              />
              <span>
                <span className="font-semibold">{t('advertising')}</span>
                <span className="block text-xs text-portal-muted">{t('advertisingHelp')}</span>
              </span>
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full bg-portal-accent px-4 py-2 text-xs font-bold text-slate-900"
            onClick={() => apply(acceptAll())}
          >
            {t('acceptAll')}
          </button>
          <button
            type="button"
            className="rounded-full border border-portal-border px-4 py-2 text-xs font-semibold hover:border-portal-accent/50"
            onClick={() => apply(rejectNonEssential())}
          >
            {t('reject')}
          </button>
          {customize ? (
            <button
              type="button"
              className="rounded-full border border-portal-border px-4 py-2 text-xs font-semibold hover:border-portal-accent/50"
              onClick={() => apply(customizeConsent({ analytics, advertising }))}
            >
              {t('save')}
            </button>
          ) : (
            <button
              type="button"
              className="rounded-full px-3 py-2 text-xs text-portal-muted hover:text-portal-text"
              onClick={() => setCustomize(true)}
            >
              {t('customize')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
