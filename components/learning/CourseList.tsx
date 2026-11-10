'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';

/**
 * Ordered lesson list for a learning path (T-04).
 *
 * Progress is a local-only convenience: lesson slugs are stored in
 * localStorage, nothing is sent anywhere and no account is required.
 */

export interface CourseListItem {
  slug: string;
  step: number;
  title: string;
  description: string;
  readMinutes: number;
  /** Lesson text is missing from the blog corpus (e.g. an unpublished article). */
  pending?: boolean;
  action?: { href: string; label: string };
}

interface CourseListProps {
  pathId: string;
  courses: CourseListItem[];
  labels: {
    lessonOf: string;
    markDone: string;
    markUndone: string;
    completed: string;
    upcoming: string;
    progress: string;
    minRead: string;
  };
}

const STORAGE_KEY = 'mh:learn:done';

function readDone(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export default function CourseList({ pathId, courses, labels }: CourseListProps) {
  const [done, setDone] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDone(readDone());
    setReady(true);
  }, []);

  function toggle(slug: string) {
    setDone((current) => {
      const next = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Private mode / quota — progress simply does not persist.
      }
      return next;
    });
  }

  const doneCount = courses.filter((course) => done.includes(course.slug)).length;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-portal-muted" aria-live="polite">
          {labels.progress
            .replace('{done}', String(doneCount))
            .replace('{total}', String(courses.length))}
        </p>
        {ready ? (
          <div
            className="h-1.5 w-32 overflow-hidden rounded-full bg-black/30"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={courses.length}
            aria-valuenow={doneCount}
          >
            <div
              className="h-full rounded-full bg-portal-accent transition-all"
              style={{ width: `${courses.length ? (doneCount / courses.length) * 100 : 0}%` }}
            />
          </div>
        ) : null}
      </div>

      <ol className="mt-4 space-y-3">
        {courses.map((course) => {
          const isDone = done.includes(course.slug);
          return (
            <li
              key={`${pathId}-${course.slug}`}
              className="rounded-2xl border border-portal-border bg-portal-panel p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/30 text-xs font-bold text-portal-muted">
                  {course.step}
                </span>
                <div className="min-w-0 flex-1">
                  {course.pending ? (
                    <>
                      <h3 className="font-semibold text-portal-text">{course.title}</h3>
                      <p className="mt-1 text-sm text-portal-muted">{labels.upcoming}</p>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/blog/${course.slug}`}
                        className="font-semibold text-portal-text hover:text-portal-accent hover:underline"
                      >
                        {course.title}
                      </Link>
                      <p className="mt-1 text-sm text-portal-muted">{course.description}</p>
                      <p className="mt-2 text-xs text-portal-muted/70">
                        {labels.lessonOf.replace('{n}', String(course.step))} ·{' '}
                        {labels.minRead.replace('{n}', String(course.readMinutes))}
                      </p>
                    </>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {/* An unpublished lesson must not expose its follow-up
                        action either — that href (e.g. /kit) may not exist yet. */}
                    {course.action && !course.pending ? (
                      <Link
                        href={course.action.href}
                        className="text-sm font-semibold text-portal-accent hover:underline"
                      >
                        {course.action.label} →
                      </Link>
                    ) : null}
                    {course.pending ? null : (
                      <button
                        type="button"
                        onClick={() => toggle(course.slug)}
                        aria-pressed={isDone}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          isDone
                            ? 'border-portal-accent/60 bg-portal-accent/15 text-portal-accent'
                            : 'border-portal-border text-portal-muted hover:border-portal-accent/50 hover:text-portal-text'
                        }`}
                      >
                        {isDone ? `${labels.completed} ✓` : labels.markDone}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
