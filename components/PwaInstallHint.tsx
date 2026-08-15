'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { trackSolitaireEvent } from '@/lib/mahjong-solitaire/telemetry';

const DISMISS_KEY = 'mh_pwa_install_dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandalone(): boolean {
  if (typeof window === 'undefined') return true;
  const mq = window.matchMedia('(display-mode: standalone)').matches;
  const ios = 'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || ios;
}

/** Light “Add to Home Screen” hint — hidden when already installed or dismissed. */
export default function PwaInstallHint() {
  const t = useTranslations('pwa');
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return;
    } catch {
      /* ignore */
    }

    const onBip = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
      trackSolitaireEvent('solitaire_pwa_install_prompt', { source: 'beforeinstallprompt' });
    };

    window.addEventListener('beforeinstallprompt', onBip);

    // iOS / browsers without BIP: show a soft tip after a short delay.
    const tip = window.setTimeout(() => {
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setVisible(true);
      }
    }, 4000);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.clearTimeout(tip);
    };
  }, []);

  if (!visible || isStandalone()) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!deferred) {
      dismiss();
      return;
    }
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') {
      trackSolitaireEvent('solitaire_pwa_installed', { source: 'prompt' });
    }
    setDeferred(null);
    dismiss();
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[80] flex justify-center px-3">
      <div className="pointer-events-auto flex max-w-md flex-wrap items-center gap-2 rounded-2xl border border-emerald-200/40 bg-[#13252d]/95 px-3 py-2 text-sm text-emerald-50 shadow-lg backdrop-blur">
        <p className="min-w-0 flex-1 leading-snug">{t('installHint')}</p>
        {deferred && (
          <button
            type="button"
            onClick={() => void install()}
            className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-900"
          >
            {t('installCta')}
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="rounded-full px-2 py-1.5 text-xs text-emerald-100/70 hover:text-white"
        >
          {t('dismiss')}
        </button>
      </div>
    </div>
  );
}
