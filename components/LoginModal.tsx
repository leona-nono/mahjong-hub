'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';
import type { EnabledAuthProviders } from '@/components/providers';

const BTN_BASE =
  'flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';
const GOOGLE_CLS =
  'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50';
const FB_CLS = 'bg-[#1877F2] text-white hover:bg-[#166fe5]';
const X_CLS = 'bg-black text-white hover:bg-gray-800';

type OAuthProvider = 'google' | 'facebook' | 'twitter';

export default function LoginModal({
  enabledProviders
}: {
  enabledProviders: EnabledAuthProviders;
}) {
  const { loginModalOpen, closeLogin } = useAuth();
  const [submitting, setSubmitting] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState('');
  const t = useTranslations('auth');

  if (!loginModalOpen) return null;

  const login = async (provider: OAuthProvider) => {
    setSubmitting(provider);
    setError('');
    try {
      await signIn(provider, { callbackUrl: window.location.href });
    } catch {
      setError(t('loginFailed'));
      setSubmitting(null);
    }
  };

  const hasProvider =
    enabledProviders.google || enabledProviders.facebook || enabledProviders.x;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={closeLogin}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div
        className="rainbow-card w-full max-w-sm rounded-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="login-title" className="text-xl font-black rainbow-text">
          {t('loginToEarn')}
        </h2>
        <p className="mt-1 text-sm text-gray-500">{t('connectToSave')}</p>

        <div className="mt-5 flex flex-col gap-3">
          {enabledProviders.google && (
            <button
              type="button"
              onClick={() => login('google')}
              disabled={submitting !== null}
              className={`${BTN_BASE} ${GOOGLE_CLS}`}
            >
              {submitting === 'google' ? t('redirecting') : 'Google'}
            </button>
          )}
          {enabledProviders.facebook && (
            <button
              type="button"
              onClick={() => login('facebook')}
              disabled={submitting !== null}
              className={`${BTN_BASE} ${FB_CLS}`}
            >
              {submitting === 'facebook' ? t('redirecting') : 'Facebook'}
            </button>
          )}
          {enabledProviders.x && (
            <button
              type="button"
              onClick={() => login('twitter')}
              disabled={submitting !== null}
              className={`${BTN_BASE} ${X_CLS}`}
            >
              {submitting === 'twitter' ? t('redirecting') : 'X'}
            </button>
          )}
          {!hasProvider && (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {t('providerUnavailable')}
            </p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <button
          type="button"
          onClick={closeLogin}
          className="mt-4 w-full rounded-full px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-600"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
}
