import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const ts = useTranslations('site');

  return (
    <footer className="mt-12 border-t border-white/60 bg-white/60">
      <div className="rainbow-bar h-1" />
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-gray-500">
        <p>
          {ts('name')} · {t('rights')}
        </p>
        <p className="mt-1 text-xs text-gray-400">{t('noGambling')}</p>
      </div>
    </footer>
  );
}
