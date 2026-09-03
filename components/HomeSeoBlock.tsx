import { Link } from '@/i18n/navigation';
import { getHomeGuideDoc } from '@/data/home-guide';
import { InlineLinks, RichText } from '@/components/RichText';

/** Homepage guide copy below the daily challenge, above category cards. */
export default async function HomeSeoBlock({ locale }: { locale: string }) {
  const doc = getHomeGuideDoc(locale);

  return (
    <section
      id="why-play"
      className="rounded-2xl border border-portal-border bg-portal-panel/60 px-5 py-6 sm:px-6"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-portal-accent/90">
        {doc.eyebrow}
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-portal-text sm:text-2xl">
        {doc.title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-portal-muted">{doc.intro}</p>

      {doc.sections.map((section) => (
        <div key={section.heading} className="mt-6">
          <h3 className="font-display text-base font-semibold text-portal-text">
            {section.heading}
          </h3>
          {section.bullets ? (
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-portal-muted">
              {section.bullets.map((bullet) => (
                <li key={bullet.strong}>
                  <strong className="font-semibold text-portal-text">{bullet.strong}</strong>
                  {bullet.text}
                  {bullet.link ? (
                    <Link
                      href={bullet.link.href}
                      className="font-semibold text-portal-accent hover:underline"
                    >
                      {bullet.link.label}
                    </Link>
                  ) : null}
                  {bullet.links ? <InlineLinks links={bullet.links} /> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {section.choices ? (
            <ul className="mt-3 space-y-4 text-sm leading-relaxed text-portal-muted">
              {section.choices.map((choice) => (
                <li key={choice.prompt}>
                  <p className="font-medium text-portal-text">{choice.prompt}</p>
                  <p className="mt-1">
                    {choice.answerSegments ? (
                      <RichText segments={choice.answerSegments} />
                    ) : choice.link ? (
                      <>
                        {choice.answerStrong ? (
                          <strong className="font-semibold text-portal-text">
                            {choice.answerStrong}
                          </strong>
                        ) : null}
                        {choice.answerText}
                        <Link
                          href={choice.link.href}
                          className="font-semibold text-portal-accent hover:underline"
                        >
                          {choice.link.label}
                        </Link>
                      </>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-portal-muted">
        <RichText segments={doc.closing} />
      </p>
    </section>
  );
}
