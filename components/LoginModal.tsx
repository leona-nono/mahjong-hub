'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGoogleLogin, type TokenResponse } from '@react-oauth/google';
import { useAuth, type SocialProvider } from '@/lib/auth';

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

const X_AUTH_ENDPOINT = 'https://twitter.com/i/oauth2/authorize';
const X_REDIRECT = '/api/auth/x/callback';
const X_SCOPE = 'users.read tweet.read';

const BTN_BASE =
  'flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition';
const GOOGLE_CLS = 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50';
const FB_CLS = 'bg-[#1877F2] text-white hover:bg-[#166fe5]';
const X_CLS = 'bg-black text-white hover:bg-gray-900';

function base64UrlEncode(bytes: Uint8Array): string {
  let str = '';
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function randomVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

// ── Google: @react-oauth/google (must sit inside GoogleOAuthProvider) ──────
function GoogleLoginButton() {
  const { loginWithUser, login } = useAuth();
  const google = useGoogleLogin({
    onSuccess: async (res: TokenResponse) => {
      try {
        const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${res.access_token}` }
        }).then((r) => r.json());
        loginWithUser({
          id: info.sub,
          name: info.name ?? 'Google User',
          email: info.email ?? '',
          avatar: info.picture,
          provider: 'google'
        });
      } catch {
        login('google');
      }
    },
    onError: () => login('google')
  });
  return (
    <button type="button" onClick={() => google()} className={`${BTN_BASE} ${GOOGLE_CLS}`}>
      <span>Google</span>
    </button>
  );
}

// ── Facebook: dynamic SDK load + FB.login ─────────────────────────────────
function FacebookLoginButton() {
  const { loginWithUser, login } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.FB) {
      setReady(true);
      return;
    }
    if (document.getElementById('fb-sdk')) return;
    const s = document.createElement('script');
    s.id = 'fb-sdk';
    s.src = 'https://connect.facebook.net/en_US/sdk.js';
    s.async = true;
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        version: 'v19.0',
        cookie: false,
        xfbml: false
      });
      setReady(true);
    };
    document.body.appendChild(s);
  }, []);

  const onClick = () => {
    if (!ready || !window.FB) {
      login('facebook');
      return;
    }
    window.FB.login((resp: any) => {
      if (resp.authResponse) {
        window.FB.api('/me?fields=name,email,picture', (me: any) => {
          loginWithUser({
            id: me.id,
            name: me.name ?? 'Facebook User',
            email: me.email ?? '',
            avatar: me.picture?.data?.url,
            provider: 'facebook'
          });
        });
      } else {
        login('facebook');
      }
    }, { scope: 'email,public_profile' });
  };

  return (
    <button type="button" onClick={onClick} className={`${BTN_BASE} ${FB_CLS}`}>
      <span>Facebook</span>
    </button>
  );
}

// ── X: OAuth2 PKCE — jump to X, come back via our callback route ──────────
function XLoginButton() {
  const { login } = useAuth();
  const onClick = async () => {
    const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID;
    if (!clientId || typeof window === 'undefined') {
      login('x');
      return;
    }
    const verifier = randomVerifier();
    sessionStorage.setItem('mh_x_verifier', verifier);
    const challenge = await sha256Base64Url(verifier);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: `${window.location.origin}${X_REDIRECT}`,
      scope: X_SCOPE,
      state: String(Math.random()).slice(2),
      code_challenge: challenge,
      code_challenge_method: 'S256'
    });
    window.location.href = `${X_AUTH_ENDPOINT}?${params.toString()}`;
  };
  return (
    <button type="button" onClick={onClick} className={`${BTN_BASE} ${X_CLS}`}>
      <span>X</span>
    </button>
  );
}

// ── Mock fallback (no credentials configured) ─────────────────────────────
function MockButton({ provider, label, className }: { provider: SocialProvider; label: string; className: string }) {
  const { login } = useAuth();
  return (
    <button type="button" onClick={() => login(provider)} className={`${BTN_BASE} ${className}`}>
      <span>{label}</span>
    </button>
  );
}

export default function LoginModal() {
  const { loginModalOpen, closeLogin } = useAuth();
  const t = useTranslations('auth');

  const hasGoogle = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const hasFacebook = !!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  const hasX = !!process.env.NEXT_PUBLIC_X_CLIENT_ID;

  if (!loginModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={closeLogin}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="rainbow-card w-full max-w-sm rounded-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-black rainbow-text">{t('loginToEarn')}</h2>
        <p className="mt-1 text-sm text-gray-500">{t('connectToSave')}</p>

        <div className="mt-5 flex flex-col gap-3">
          {hasGoogle ? (
            <GoogleLoginButton />
          ) : (
            <MockButton provider="google" label="Google" className={GOOGLE_CLS} />
          )}
          {hasFacebook ? (
            <FacebookLoginButton />
          ) : (
            <MockButton provider="facebook" label="Facebook" className={FB_CLS} />
          )}
          {hasX ? (
            <XLoginButton />
          ) : (
            <MockButton provider="x" label="X" className={X_CLS} />
          )}
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
