import { getLocalizedBlogPost } from '@/data/blog';
import {
  LEARNING_PATHS,
  type LearningPath,
  type LearningPathId
} from '@/data/learning-paths';
import type { CourseListItem } from '@/components/learning/CourseList';

/**
 * Server-side bridge between `data/learning-paths.ts` and the view layer.
 *
 * A course whose article is not in the blog corpus yet (currently
 * `six-mahjongs-one-hand`) is still listed — it renders as "coming soon"
 * instead of pointing at a 404.
 */
export function coursesForPath(
  path: LearningPath,
  locale: string,
  actionLabel: (labelKey: string) => string,
  courseTitle?: (titleKey: string) => string
): CourseListItem[] {
  return path.courses.map((course) => {
    const post = getLocalizedBlogPost(course.slug, locale);
    // An unpublished lesson falls back to its placeholder title so the page
    // never shows a raw slug.
    const pendingTitle =
      course.titleKey && courseTitle ? courseTitle(course.titleKey) : course.slug;
    return {
      slug: course.slug,
      step: course.step,
      title: post?.title ?? pendingTitle,
      description: post?.description ?? '',
      readMinutes: post?.readMinutes ?? 0,
      pending: !post,
      action: course.action
        ? { href: course.action.href, label: actionLabel(course.action.labelKey) }
        : undefined
    };
  });
}

export function learningPath(id: LearningPathId): LearningPath {
  const path = LEARNING_PATHS.find((candidate) => candidate.id === id);
  if (!path) throw new Error(`Unknown learning path "${id}"`);
  return path;
}

/** Slugs that deliberately sit outside the three paths (culture + buying guides). */
export const OFF_PATH_SLUGS = [
  'mahjong-history-cultural-guide',
  'mahjong-etiquette-tips',
  'best-mahjong-sets-for-beginners',
  'where-to-buy-mahjong-set'
] as const;
