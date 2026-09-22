'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import TileFace from '@/components/games/TileFace';
import {
  buildShareText,
  dealChallenge,
  specialtyIdForAnswers,
  specialtyLabel,
  titleIdForScore,
  titleLabel,
  type ChallengeLocale,
  type ChallengeLink,
  type DealtQuestion,
  type SpecialtyId,
  type TitleId
} from '@/lib/challenge';

function asChallengeLocale(locale: string): ChallengeLocale {
  if (locale === 'zh' || locale === 'zh-TW') return locale;
  return 'en';
}

function localized(
  map: Record<ChallengeLocale, string>,
  locale: ChallengeLocale
): string {
  return map[locale] ?? map.en;
}

function linkHref(link: ChallengeLink): string {
  if (link.type === 'glossary') return `/learn/glossary#${link.key}`;
  return `/blog/${link.slug}`;
}

type Phase = 'intro' | 'quiz' | 'done';

export default function ChallengeQuiz({
  seed,
  shared,
  dateKey
}: {
  seed: number;
  shared: boolean;
  dateKey?: string;
}) {
  const t = useTranslations('challenge');
  const locale = asChallengeLocale(useLocale());
  const deal = useMemo(() => dealChallenge(seed), [seed]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const question: DealtQuestion | undefined = deal.questions[index];
  const total = deal.questions.length;
  const correctCount = correctIds.length;

  const titleId: TitleId = titleIdForScore(correctCount);
  const specialty: SpecialtyId | null = specialtyIdForAnswers(
    deal.questions.map((q) => ({
      group: q.group,
      correct: correctIds.includes(q.id)
    }))
  );

  const onPick = (optionId: string) => {
    if (revealed || !question) return;
    setPicked(optionId);
    setRevealed(true);
    if (optionId === question.answerId) {
      setCorrectIds((prev) => (prev.includes(question.id) ? prev : [...prev, question.id]));
    }
  };

  const onNext = () => {
    if (index + 1 >= total) {
      setPhase('done');
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setRevealed(false);
  };

  const share = async () => {
    const text = buildShareText({
      locale,
      correct: correctCount,
      total,
      titleId,
      specialtyId: specialty,
      seed,
      dateKey: shared ? undefined : dateKey,
      origin: typeof window !== 'undefined' ? window.location.origin : undefined
    });
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      /* fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (phase === 'intro') {
    return (
      <div className="rounded-2xl border border-portal-border bg-portal-panel p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-portal-accent/90">
          {shared ? t('sharedEyebrow') : t('eyebrow')}
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold text-portal-text">
          {shared ? t('sharedTitle') : t('playTitle')}
        </h2>
        <p className="mt-2 text-sm text-portal-muted">{t('playLead')}</p>
        <button
          type="button"
          onClick={() => setPhase('quiz')}
          className="mt-5 rounded-lg bg-portal-accent px-4 py-2.5 text-sm font-semibold text-portal-on-accent"
        >
          {t('start')}
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="rounded-2xl border border-portal-border bg-portal-panel p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-portal-accent/90">
          {t('resultEyebrow')}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-portal-text">
          {t('scoreLine', { n: correctCount, total })}
        </h2>
        <p className="mt-2 text-lg font-semibold text-portal-text">
          {titleLabel(titleId, locale)}
          {specialty ? ` · ${specialtyLabel(specialty, locale)}` : ''}
        </p>
        <p className="mt-3 text-sm text-portal-muted">{t('resultHint')}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={share}
            className="rounded-lg bg-portal-accent px-4 py-2.5 text-sm font-semibold text-portal-on-accent"
          >
            {copied ? t('copied') : t('share')}
          </button>
          <Link
            href="/learn/glossary"
            className="rounded-lg border border-portal-border px-4 py-2.5 text-sm font-semibold text-portal-text"
          >
            {t('readGlossary')}
          </Link>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="rounded-2xl border border-portal-border bg-portal-panel p-5 sm:p-6">
      <p className="text-xs font-semibold text-portal-muted">
        {t('progress', { n: index + 1, total })}
      </p>
      <h2 className="mt-2 font-display text-lg font-semibold text-portal-text sm:text-xl">
        {localized(question.prompt, locale)}
      </h2>

      {question.kind === 'identify' ? (
        <div className="mt-5 flex justify-center">
          <TileFace tile={question.tile} size="xl" traditional />
        </div>
      ) : null}

      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {question.options.map((opt) => {
          const isPicked = picked === opt.id;
          const isAnswer = opt.id === question.answerId;
          let style =
            'border-portal-border bg-portal-bg text-portal-text hover:border-portal-accent';
          if (revealed && isAnswer) {
            style = 'border-emerald-500/60 bg-emerald-500/10 text-portal-text';
          } else if (revealed && isPicked && !isAnswer) {
            style = 'border-rose-500/50 bg-rose-500/10 text-portal-text';
          }
          return (
            <li key={opt.id}>
              <button
                type="button"
                disabled={revealed}
                onClick={() => onPick(opt.id)}
                className={`w-full rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${style}`}
              >
                {localized(opt.label, locale)}
              </button>
            </li>
          );
        })}
      </ul>

      {revealed ? (
        <div className="mt-5 space-y-3 rounded-xl border border-portal-border bg-portal-bg/60 p-4">
          <p className="text-sm font-semibold text-portal-text">
            {picked === question.answerId ? t('correct') : t('wrong')}
          </p>
          <p className="text-sm leading-relaxed text-portal-muted">
            {localized(question.why, locale)}
          </p>
          <Link
            href={linkHref(question.link)}
            className="inline-block text-sm font-semibold text-portal-accent underline"
          >
            {t('learnMore')}
          </Link>
          <div>
            <button
              type="button"
              onClick={onNext}
              className="mt-2 rounded-lg bg-portal-accent px-4 py-2 text-sm font-semibold text-portal-on-accent"
            >
              {index + 1 >= total ? t('seeResult') : t('next')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
