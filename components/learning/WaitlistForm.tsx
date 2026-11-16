'use client';

import { useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { WaitlistSource } from '@/lib/waitlist';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

/**
 * In-place course waitlist. Success replaces the fields; it does not navigate
 * or open a dialog. The website field is a honeypot and stays out of tab order.
 */
export default function WaitlistForm({ source = 'learn-variants' }: { source?: WaitlistSource }) {
  const t = useTranslations('learn.waitlist');
  const privacyLabel = useTranslations('consent');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const errorText =
    errorCode === 'invalid_email'
      ? t('errInvalid')
      : errorCode === 'too_fast'
        ? t('errTooFast')
        : t('errServer');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === 'submitting') return;
    setState('submitting');
    setErrorCode(null);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, source, locale, website })
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (response.ok && payload?.ok) {
        setState('success');
        return;
      }
      setErrorCode(payload?.error || 'server');
      setState('error');
    } catch {
      setErrorCode('server');
      setState('error');
    }
  }

  return (
    <section
      aria-labelledby="waitlist-title"
      data-waitlist={source}
      className="relative rounded-2xl border border-portal-border bg-portal-panel p-4 sm:p-5"
    >
      <h2 id="waitlist-title" className="font-display text-lg font-semibold text-portal-text">
        {t('title')}
      </h2>
      {state === 'success' ? (
        <p className="mt-2 text-sm leading-relaxed text-portal-text">{t('success')}</p>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-portal-muted">{t('body')}</p>
          <form className="mt-4" onSubmit={onSubmit} noValidate>
            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="waitlist-website">{'\u00a0'}</label>
              <input
                id="waitlist-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </div>
            <label htmlFor="waitlist-email" className="text-sm font-medium text-portal-text">
              {t('placeholder')}
            </label>
            <div className="mt-2 flex flex-col gap-2 min-[431px]:flex-row min-[431px]:items-center">
              <input
                id="waitlist-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                placeholder={t('placeholder')}
                aria-invalid={state === 'error' && errorCode === 'invalid_email'}
                aria-describedby={state === 'error' ? 'waitlist-error' : undefined}
                onChange={(event) => setEmail(event.target.value)}
                className="min-h-11 w-full rounded-xl border border-portal-border bg-black/20 px-3 text-sm text-portal-text min-[431px]:flex-1"
              />
              <button
                type="submit"
                disabled={state === 'submitting'}
                aria-busy={state === 'submitting'}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-portal-accent px-5 text-sm font-bold text-portal-on-accent disabled:opacity-60 min-[431px]:w-auto"
              >
                {t('button')}
              </button>
            </div>
            {state === 'error' ? (
              <p id="waitlist-error" role="alert" className="mt-2 text-sm text-red-300">
                {errorText}
              </p>
            ) : null}
          </form>
          <p className="mt-3 text-xs leading-relaxed text-portal-muted">
            {t('privacy')}{' '}
            <Link href="/privacy" className="underline hover:text-portal-accent">
              {privacyLabel('privacy')}
            </Link>
          </p>
        </>
      )}
    </section>
  );
}
