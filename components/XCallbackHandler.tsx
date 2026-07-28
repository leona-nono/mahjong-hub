'use client';

import { useEffect } from 'react';
import { loginWithUser } from '@/lib/auth';

/**
 * Headless client component. After X redirects back to /api/auth/x/callback
 * (which forwards the `code` to the home page as ?x_code=...), this picks up
 * the code, pairs it with the PKCE verifier stored in sessionStorage, and asks
 * our serverless route to exchange it for the user profile.
 */
export default function XCallbackHandler() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('x_code');
    if (!code) return;

    const verifier = sessionStorage.getItem('mh_x_verifier');
    if (!verifier) return;

    (async () => {
      try {
        const res = await fetch('/api/auth/x/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, verifier })
        });
        if (res.ok) {
          const user = await res.json();
          loginWithUser(user);
        }
      } finally {
        sessionStorage.removeItem('mh_x_verifier');
        // Clean the code out of the URL without reloading.
        window.history.replaceState({}, '', window.location.pathname);
      }
    })();
  }, []);

  return null;
}
