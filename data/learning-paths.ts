import enPosts from './blog-i18n/en.json';

export type LearningPathId = 'start' | 'variants' | 'advanced';

export interface LearningCourse {
  /** 必须存在于 data/blog-i18n/en.json 的 slug */
  slug: string;
  /** 路径内序号，从 1 开始，必须连续 */
  step: number;
  /**
   * 文章尚未发布时用的标题 key（`learn.course.<titleKey>`）。
   * 文章上线后仍以文章标题为准，此字段只是占位，避免页面露出 slug。
   */
  titleKey?: string;
  /** 学完这一课之后建议做的动作（可选） */
  action?: {
    /** 站内路径，例如 /tools/waits */
    href: string;
    /** i18n key 后缀，文案在 messages 的 learn.action.* 下 */
    labelKey: string;
  };
}

export interface LearningPath {
  id: LearningPathId;
  /** i18n key 后缀：learn.path.<id>.title / .subtitle */
  titleKey: string;
  /** 路径主色或图标标识，供 UI 取用，先用字符串 */
  accent?: 'jade' | 'amber' | 'ink';
  courses: LearningCourse[];
}

/**
 * Missing from en.json until the comparison article is published.
 * Once the key exists, the presence check passes on its own — this is not a
 * permanent skip.
 */
const SLUG_OPTIONAL_UNTIL_PUBLISHED = 'six-mahjongs-one-hand';

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'start',
    titleKey: 'start',
    courses: [
      { slug: 'what-is-mahjong', step: 1 },
      {
        slug: 'mahjong-tiles-meaning-guide',
        step: 2,
        action: { href: '/tools/tile-identifier', labelKey: 'tryTileTool' }
      },
      { slug: 'mahjong-rules-beginners-complete-guide', step: 3 },
      {
        slug: 'how-to-play-mahjong',
        step: 4,
        action: { href: '/games/hong-kong-mahjong', labelKey: 'playFirstHand' }
      },
      { slug: 'how-many-players-mahjong', step: 5 },
      {
        slug: 'mahjong-scoring-system-explained',
        step: 6,
        action: { href: '/tools/score', labelKey: 'scoreYourHand' }
      },
      {
        slug: 'how-to-win-mahjong',
        step: 7,
        action: { href: '/tools/waits', labelKey: 'checkWaits' }
      },
      {
        slug: 'how-to-play-mahjong-online',
        step: 8,
        action: { href: '/games/hong-kong-mahjong', labelKey: 'playWithCoach' }
      }
    ]
  },
  {
    id: 'variants',
    titleKey: 'variants',
    courses: [
      { slug: 'types-of-mahjong-games', step: 1 },
      { slug: 'american-vs-chinese-mahjong', step: 2 },
      {
        slug: 'six-mahjongs-one-hand',
        step: 3,
        titleKey: 'sixMahjongs',
        action: { href: '/kit', labelKey: 'seeKit' }
      },
      {
        slug: 'how-to-play-american-mahjong',
        step: 4,
        action: { href: '/games/american-mahjong', labelKey: 'tryAmerican' }
      }
    ]
  },
  {
    id: 'advanced',
    titleKey: 'advanced',
    courses: [
      { slug: 'mahjong-strategy', step: 1 },
      { slug: 'best-opening-hands', step: 2 },
      { slug: 'discard-strategy', step: 3 },
      { slug: 'defense-strategy', step: 4 },
      { slug: 'common-beginner-mistakes', step: 5 }
    ]
  }
];

export function pathById(id: LearningPathId): LearningPath | undefined {
  return LEARNING_PATHS.find((path) => path.id === id);
}

export function pathOfSlug(slug: string): LearningPath | undefined {
  return LEARNING_PATHS.find((path) => path.courses.some((course) => course.slug === slug));
}

export function courseNeighbours(slug: string):
  | { prev?: LearningCourse; next?: LearningCourse; step: number; total: number }
  | undefined {
  for (const path of LEARNING_PATHS) {
    const index = path.courses.findIndex((course) => course.slug === slug);
    if (index === -1) continue;
    const course = path.courses[index];
    return {
      prev: path.courses[index - 1],
      next: path.courses[index + 1],
      step: course.step,
      total: path.courses.length
    };
  }
  return undefined;
}

function knownEnglishSlugs(): Set<string> {
  return new Set(Object.keys(enPosts));
}

/**
 * Throws when a path drifts. Called at import so `next build` fails,
 * and exported so the three counterexamples can be tested without editing data.
 */
export function assertLearningPaths(
  paths: readonly LearningPath[],
  known: ReadonlySet<string>
): void {
  const owner = new Map<string, LearningPathId>();

  for (const path of paths) {
    path.courses.forEach((course, index) => {
      const expected = index + 1;
      if (course.step !== expected) {
        throw new Error(
          `learning path "${path.id}" step ${course.step} is out of order; expected ${expected} (slug "${course.slug}")`
        );
      }

      const previous = owner.get(course.slug);
      if (previous) {
        throw new Error(
          `learning path slug "${course.slug}" appears in more than one path (${previous} and ${path.id})`
        );
      }
      owner.set(course.slug, path.id);

      if (known.has(course.slug)) return;
      if (course.slug === SLUG_OPTIONAL_UNTIL_PUBLISHED) return;
      throw new Error(
        `learning path slug "${course.slug}" is not in data/blog-i18n/en.json`
      );
    });
  }
}

assertLearningPaths(LEARNING_PATHS, knownEnglishSlugs());
