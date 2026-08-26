import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

/** Lightweight SEO copy + internal links to replace removed wardrobe text mass. */
export default async function HomeSeoBlock() {
  const t = await getTranslations('home');

  return (
    <section className="rounded-2xl border border-portal-border bg-portal-panel/60 px-5 py-6 sm:px-6">
      <h2 className="font-display text-xl font-semibold text-portal-text">
        {t('seoTitle')}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-portal-muted">
        {t('seoBody')}
      </p>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
        <li>
          <Link href="/games/solitaire" className="text-portal-accent hover:underline">
            {t('seoLinkSolitaire')}
          </Link>
        </li>
        <li>
          <Link href="/games/classic" className="text-portal-accent hover:underline">
            {t('seoLinkClassic')}
          </Link>
        </li>
        <li>
          <Link href="/games/mahjong-solitaire-classic" className="text-portal-accent hover:underline">
            {t('seoLinkPlay')}
          </Link>
        </li>
        <li>
          <Link href="/blog" className="text-portal-accent hover:underline">
            {t('seoLinkBeginners')}
          </Link>
        </li>
      </ul>
    </section>
  );
}
