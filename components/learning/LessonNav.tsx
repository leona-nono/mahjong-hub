import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getLocalizedBlogPost } from '@/data/blog';
import {
  courseNeighbours,
  pathOfSlug,
  type LearningCourse,
  type LearningPath
} from '@/data/learning-paths';

const PATH_HREF = {
  start: '/learn/start',
  variants: '/learn/variants',
  advanced: '/learn/advanced'
} as const;

function neighbourLabel(
  course: LearningCourse | undefined,
  locale: string,
  titleForKey: (key: string) => string
): { title: string; href?: string } | null {
  if (!course) return null;
  const post = getLocalizedBlogPost(course.slug, locale);
  if (post) return { title: post.title, href: `/blog/${course.slug}` };
  return {
    title: course.titleKey ? titleForKey(course.titleKey) : course.slug,
    href: undefined
  };
}

/**
 * Top-of-article course chrome (T-07).
 *
 * Renders nothing when the slug is outside the three learning paths
 * (culture / buying guides stay plain articles). Unpublished neighbours
 * are labeled but not linked — never point at a 404.
 */
export default async function LessonNav({
  slug,
  locale
}: {
  slug: string;
  locale: string;
}) {
  const path: LearningPath | undefined = pathOfSlug(slug);
  const neighbours = courseNeighbours(slug);
  if (!path || !neighbours) return null;

  const learn = await getTranslations('learn');
  const prev = neighbourLabel(neighbours.prev, locale, (key) => learn(`course.${key}`));
  const next = neighbourLabel(neighbours.next, locale, (key) => learn(`course.${key}`));

  return (
    <nav
      aria-label={learn('lessonBadge', { n: neighbours.step, total: neighbours.total })}
      className="mt-4 rounded-2xl border border-portal-border bg-portal-panel/70 px-4 py-3 sm:px-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="font-semibold text-portal-text">
          {learn('lessonBadge', { n: neighbours.step, total: neighbours.total })}
        </p>
        <Link href={PATH_HREF[path.id]} className="text-portal-accent hover:underline">
          {learn(`path.${path.id}.title`)}
        </Link>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {prev ? (
          prev.href ? (
            <Link
              href={prev.href}
              className="rounded-xl border border-portal-border bg-portal-panel px-3 py-2 text-sm transition hover:border-portal-accent/50"
            >
              <span className="block text-xs text-portal-muted">{learn('prevLesson')}</span>
              <span className="mt-0.5 block font-medium text-portal-text">{prev.title}</span>
            </Link>
          ) : (
            <div className="rounded-xl border border-dashed border-portal-border px-3 py-2 text-sm">
              <span className="block text-xs text-portal-muted">{learn('prevLesson')}</span>
              <span className="mt-0.5 block font-medium text-portal-muted">
                {prev.title} · {learn('upcoming')}
              </span>
            </div>
          )
        ) : (
          <div />
        )}

        {next ? (
          next.href ? (
            <Link
              href={next.href}
              className="rounded-xl border border-portal-border bg-portal-panel px-3 py-2 text-sm transition hover:border-portal-accent/50 sm:text-right"
            >
              <span className="block text-xs text-portal-muted">{learn('nextLesson')}</span>
              <span className="mt-0.5 block font-medium text-portal-text">{next.title}</span>
            </Link>
          ) : (
            <div className="rounded-xl border border-dashed border-portal-border px-3 py-2 text-sm sm:text-right">
              <span className="block text-xs text-portal-muted">{learn('nextLesson')}</span>
              <span className="mt-0.5 block font-medium text-portal-muted">
                {next.title} · {learn('upcoming')}
              </span>
            </div>
          )
        ) : null}
      </div>
    </nav>
  );
}
