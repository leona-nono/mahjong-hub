import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import CourseList from '@/components/learning/CourseList';
import { coursesForPath, learningPath } from '@/lib/learning-view';
import type { LearningPathId } from '@/data/learning-paths';
import { SITE_BASE_URL } from '@/lib/seo';

/**
 * Shared body for the three learning-path pages (`/learn/{start,variants,advanced}`).
 *
 * Each route keeps its own `generateMetadata` (titles differ per path) and
 * renders this with an optional trailing block — e.g. the `variants` page
 * carries the starter-kit offer.
 */
export default async function PathPageBody({
  pathId,
  locale,
  children
}: {
  pathId: LearningPathId;
  locale: string;
  children?: ReactNode;
}) {
  const nav = await getTranslations('nav');
  const learn = await getTranslations('learn');
  const path = learningPath(pathId);
  const courses = coursesForPath(
    path,
    locale,
    (key) => learn(`action.${key}`),
    (key) => learn(`course.${key}`)
  );

  // Course describes the path; a separate ItemList carries the lesson order.
  const courseLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: learn(`path.${pathId}.title`),
    description: learn(`path.${pathId}.lead`),
    inLanguage: locale,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: `PT${path.courses.length * 10}M`
    }
  };

  const lessonListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: courses.length,
    itemListElement: courses.map((course) => ({
      '@type': 'ListItem',
      position: course.step,
      name: course.title,
      url: `${SITE_BASE_URL}/${locale}/blog/${course.slug}`
    }))
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lessonListLd) }}
      />
      <Breadcrumbs
        locale={locale}
        crumbs={[
          { name: nav('home'), path: '/' },
          { name: learn('title'), path: '/learn' },
          { name: learn(`path.${pathId}.title`), path: `/learn/${pathId}` }
        ]}
      />

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-portal-accent/90">
        {learn('lessonCount', { n: path.courses.length })}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-portal-text">
        {learn(`path.${pathId}.title`)}
      </h1>
      <p className="mt-1 text-sm font-medium text-portal-muted">
        {learn(`path.${pathId}.subtitle`)}
      </p>
      <p className="mt-3 text-portal-muted">{learn(`path.${pathId}.lead`)}</p>

      <div className="mt-8">
        <CourseList
          pathId={path.id}
          courses={courses}
          labels={{
            // ICU templates: taken raw because CourseList formats them
            // client-side as the local progress count changes.
            lessonOf: learn.raw('lessonOf'),
            markDone: learn('markDone'),
            markUndone: learn('markUndone'),
            completed: learn('completed'),
            upcoming: learn('upcoming'),
            progress: learn.raw('progress'),
            minRead: learn.raw('minRead')
          }}
        />
      </div>

      {children}

      <p className="mt-8 text-sm">
        <Link href="/learn" className="text-portal-muted underline hover:text-portal-accent">
          {learn('title')}
        </Link>
      </p>
    </div>
  );
}
