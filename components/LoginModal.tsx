'use client';

import { useEffect, useState } from 'react';
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
const EMAIL_CLS = 'bg-rainbow-pink text-white hover:opacity-90';
const COOLDOWN_KEY = 'mh_email_send_until';
const COOLDOWN_SECONDS = 60;

type OAuthProvider = 'google' | 'facebook' | 'twitter';

function getRemainingCooldown(): number {
  if (typeof window === 'undefined') return 0;
  const until = Number(localStorage.getItem(COOLDOWN_KEY)) || 0;
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

export default function LoginModal({
  enabledProviders
}: {
  enabledProviders: EnabledAuthProviders;
}) {
  const { loginModalOpen, closeLogin } = useAuth();
  const [submitting, setSubmitting] = useState<OAuthProvider | null>(null);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const t = useTranslations('auth');

  useEffect(() => {
    if (!loginModalOpen) return;
    setCooldown(getRemainingCooldown());
    const id = setInterval(() => {
      const remaining = getRemainingCooldown();
      setCooldown(remaining);
      if (remaining === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [loginModalOpen]);

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

  const sendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (cooldown > 0) return;

    const value = email.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(t('emailInvalid'));
      return;
    }
    setEmailSending(true);
    try {
      const result = await signIn('email', {
        email: value,
        callbackUrl: window.location.href,
        redirect: false
      });
      if (result?.error) {
        // Configuration = provider id / env mismatch; EmailSignin = SMTP failure
        if (result.error === 'Configuration') {
          setError(t('emailMisconfigured'));
        } else if (
          result.error === 'EmailSignin' ||
          result.error === 'Verification'
        ) {
          setError(t('emailSendFailed'));
        } else {
          setError(t('loginFailed'));
        }
        return;
      }
      if (result?.ok === false) {
        setError(t('emailSendFailed'));
        return;
      }
      const until = Date.now() + COOLDOWN_SECONDS * 1000;
      localStorage.setItem(COOLDOWN_KEY, String(until));
      setCooldown(COOLDOWN_SECONDS);
      setEmailSent(true);
    } catch {
      setError(t('emailSendFailed'));
    } finally {
      setEmailSending(false);
    }
  };

  const hasProvider =
    enabledProviders.google ||
    enabledProviders.facebook ||
    enabledProviders.x ||
    enabledProviders.email;

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
              disabled={submitting !== null || emailSending}
              className={`${BTN_BASE} ${GOOGLE_CLS}`}
            >
              {submitting === 'google' ? t('redirecting') : 'Google'}
            </button>
          )}
          {enabledProviders.facebook && (
            <button
              type="button"
              onClick={() => login('facebook')}
              disabled={submitting !== null || emailSending}
              className={`${BTN_BASE} ${FB_CLS}`}
            >
              {submitting === 'facebook' ? t('redirecting') : 'Facebook'}
            </button>
          )}
          {enabledProviders.x && (
            <button
              type="button"
              onClick={() => login('twitter')}
              disabled={submitting !== null || emailSending}
              className={`${BTN_BASE} ${X_CLS}`}
            >
              {submitting === 'twitter' ? t('redirecting') : 'X'}
            </button>
          )}

          {enabledProviders.email &&
            (emailSent ? (
              <div className="space-y-2">
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {t('emailSent')}
                </div>
                {cooldown > 0 && (
                  <p className="text-center text-xs text-gray-500">
                    {t('emailSendAgain', { n: cooldown })}
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={sendEmailLink} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-rainbow-pink"
                />
                <button
                  type="submit"
                  disabled={emailSending || submitting !== null || cooldown > 0}
                  className={`${BTN_BASE} ${EMAIL_CLS}`}
                >
                  {emailSending
                    ? t('redirecting')
                    : cooldown > 0
                      ? t('emailSendAgain', { n: cooldown })
                      : t('emailSend')}
                </button>
              </form>
            ))}

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
