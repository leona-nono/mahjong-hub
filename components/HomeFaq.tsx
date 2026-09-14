import { getTranslations } from 'next-intl/server';

const KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;

export default async function HomeFaq() {
  const t = await getTranslations('faq');
  return (
    <section aria-labelledby="home-faq">
      <h2 id="home-faq" className="font-display text-xl font-semibold text-portal-text sm:text-2xl">
        {t('title')}
      </h2>
      <div className="mt-4 divide-y divide-portal-border rounded-2xl border border-portal-border bg-portal-panel">
        {KEYS.map((key) => (
          <details key={key} className="px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-portal-text">{t(key)}</summary>
            <p className="mt-2 text-sm leading-relaxed text-portal-muted">{t(key.replace('q', 'a') as 'a1')}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export async function homeFaqJsonLd(): Promise<Record<string, unknown>> {
  const t = await getTranslations('faq');
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: KEYS.map((key) => ({
      '@type': 'Question',
      name: t(key),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(key.replace('q', 'a') as 'a1')
      }
    }))
  };
}
