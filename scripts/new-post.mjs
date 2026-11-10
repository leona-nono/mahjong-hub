#!/usr/bin/env node
/**
 * Scaffold a new blog post across blog.extra.ts + 9 blog-i18n JSON files
 * (and optionally learning-paths.ts). See 工单/T-12_new-post脚手架.md.
 *
 * Usage:
 *   npm run new:post -- --slug=<kebab-case> [--title="..."] [--path=start|variants|advanced] [--step=N] [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const LOCALES = ['en', 'zh', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'pt-BR'];
const CONTENT_TODO = '[TODO 待翻译]';
const PATH_IDS = new Set(['start', 'variants', 'advanced']);
const EXTRA_ANCHOR = 'export const extraPosts: BlogPost[] = [';
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const out = {
    slug: null,
    title: null,
    pathId: null,
    step: null,
    dryRun: false
  };
  for (const arg of argv) {
    if (arg === '--dry-run') {
      out.dryRun = true;
      continue;
    }
    if (arg.startsWith('--slug=')) out.slug = arg.slice('--slug='.length).trim();
    else if (arg.startsWith('--title=')) out.title = arg.slice('--title='.length).trim();
    else if (arg.startsWith('--path=')) out.pathId = arg.slice('--path='.length).trim();
    else if (arg.startsWith('--step=')) {
      const n = Number(arg.slice('--step='.length).trim());
      out.step = Number.isInteger(n) ? n : NaN;
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        'Usage: npm run new:post -- --slug=<kebab-case> [--title="..."] [--path=start|variants|advanced] [--step=N] [--dry-run]'
      );
      process.exit(0);
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }
  return out;
}

function titleCaseFromSlug(slug) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function structureShape(entry) {
  return {
    sectionCount: entry.sections.length,
    bodies: entry.sections.map((s) => s.body.length),
    faqCount: entry.faq.length
  };
}

function shapesEqual(a, b) {
  return (
    a.sectionCount === b.sectionCount &&
    a.faqCount === b.faqCount &&
    a.bodies.length === b.bodies.length &&
    a.bodies.every((n, i) => n === b.bodies[i])
  );
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function localePath(locale) {
  return path.join(ROOT, 'data', 'blog-i18n', `${locale}.json`);
}

function slugExistsInExtra(source, slug) {
  const re = new RegExp(`slug:\\s*['"]${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
  return re.test(source);
}

function buildTsPostLiteral(slug, title) {
  // JSON-as-TS object literal (quoted keys are valid in the TS array).
  // description/faq must be non-empty so content-i18n-integrity / gate pass
  // on a freshly scaffolded draft (工单 template '' / [] fails those checks).
  const obj = {
    slug,
    title,
    description: 'TODO description',
    readMinutes: 8,
    keywords: 'TODO',
    sections: [{ heading: 'TODO heading', body: ['TODO body'] }],
    faq: [{ question: 'TODO question', answer: 'TODO answer' }]
  };
  const json = JSON.stringify(obj, null, 2)
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n');
  return `${json},`;
}

function buildLocaleEntry(slug, title, mode) {
  if (mode === 'todo') {
    return {
      title: CONTENT_TODO,
      description: CONTENT_TODO,
      sections: [{ heading: CONTENT_TODO, body: [CONTENT_TODO] }],
      faq: [{ question: CONTENT_TODO, answer: CONTENT_TODO }]
    };
  }
  return {
    title,
    description: 'TODO description',
    sections: [{ heading: 'TODO heading', body: ['TODO body'] }],
    faq: [{ question: 'TODO question', answer: 'TODO answer' }]
  };
}

function insertIntoExtraTs(source, literal) {
  const idx = source.indexOf(EXTRA_ANCHOR);
  if (idx === -1) {
    throw new Error(`Anchor not found in data/blog.extra.ts: ${EXTRA_ANCHOR}`);
  }
  const insertAt = idx + EXTRA_ANCHOR.length;
  const before = source.slice(0, insertAt);
  const after = source.slice(insertAt).replace(/^\r?\n/, '');
  return `${before}\n${literal}\n${after}`;
}

function insertLearningPathCourse(source, pathId, slug, step) {
  const idMarker = `id: '${pathId}'`;
  const idIdx = source.indexOf(idMarker);
  if (idIdx === -1) throw new Error(`learning-paths.ts: path "${pathId}" not found`);

  const coursesIdx = source.indexOf('courses: [', idIdx);
  if (coursesIdx === -1 || coursesIdx - idIdx > 200) {
    throw new Error(`learning-paths.ts: courses array for "${pathId}" not found`);
  }

  const openBracket = source.indexOf('[', coursesIdx);
  let depth = 0;
  let closeBracket = -1;
  for (let i = openBracket; i < source.length; i++) {
    const ch = source[i];
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) {
        closeBracket = i;
        break;
      }
    }
  }
  if (closeBracket === -1) {
    throw new Error(`learning-paths.ts: could not close courses for "${pathId}"`);
  }

  const coursesBlock = source.slice(openBracket, closeBracket + 1);
  if (coursesBlock.includes(`slug: '${slug}'`) || coursesBlock.includes(`slug: "${slug}"`)) {
    throw new Error(`learning-paths.ts: slug "${slug}" already on path "${pathId}"`);
  }

  const stepMatches = [...coursesBlock.matchAll(/step:\s*(\d+)/g)].map((m) => Number(m[1]));
  if (stepMatches.includes(step)) {
    throw new Error(`learning-paths.ts: step ${step} already exists on path "${pathId}"`);
  }
  // assertLearningPaths requires contiguous 1..N — reject gaps early.
  const nextStep = stepMatches.length ? Math.max(...stepMatches) + 1 : 1;
  if (step !== nextStep) {
    throw new Error(
      `learning-paths.ts: next step for "${pathId}" must be ${nextStep} (got ${step}); steps must be contiguous`
    );
  }

  // Last course often has no trailing comma; add one, then append the new last item.
  const beforeClose = source.slice(0, closeBracket).replace(/\s*$/, '');
  const withComma = beforeClose.endsWith(',') ? beforeClose : `${beforeClose},`;
  const courseLiteral = `\n      { slug: '${slug}', step: ${step} }\n    `;
  return withComma + courseLiteral + source.slice(closeBracket);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.slug) fail('Missing required --slug=<kebab-case>');
  if (!KEBAB.test(args.slug)) fail(`Slug must be kebab-case: got "${args.slug}"`);
  if (args.pathId != null || args.step != null) {
    if (!args.pathId || args.step == null || Number.isNaN(args.step)) {
      fail('Provide both --path=start|variants|advanced and --step=N together');
    }
    if (!PATH_IDS.has(args.pathId)) fail(`--path must be one of ${[...PATH_IDS].join(', ')}`);
    if (args.step < 1) fail('--step must be a positive integer');
  }

  const title = args.title || titleCaseFromSlug(args.slug);
  const slug = args.slug;

  const extraFile = path.join(ROOT, 'data', 'blog.extra.ts');
  const pathsFile = path.join(ROOT, 'data', 'learning-paths.ts');
  const enFile = localePath('en');

  if (!fs.existsSync(extraFile)) fail('data/blog.extra.ts is missing');
  if (!fs.existsSync(enFile)) fail('data/blog-i18n/en.json is missing');

  const enJson = readJson(enFile);
  if (enJson[slug]) fail(`Slug "${slug}" already exists in data/blog-i18n/en.json`);

  const extraSource = fs.readFileSync(extraFile, 'utf8');
  if (slugExistsInExtra(extraSource, slug)) {
    fail(`Slug "${slug}" already exists in data/blog.extra.ts`);
  }

  for (const locale of LOCALES) {
    const file = localePath(locale);
    if (!fs.existsSync(file)) fail(`Missing locale file: ${file}`);
    const json = readJson(file);
    if (json[slug]) fail(`Slug "${slug}" already exists in data/blog-i18n/${locale}.json`);
  }

  // Validate path insert before any writes (throw → no partial state).
  let nextPaths = null;
  if (args.pathId) {
    try {
      nextPaths = insertLearningPathCourse(
        fs.readFileSync(pathsFile, 'utf8'),
        args.pathId,
        slug,
        args.step
      );
    } catch (err) {
      fail(err && err.message ? err.message : String(err));
    }
  }

  const enEntry = buildLocaleEntry(slug, title, 'en');
  const todoEntry = buildLocaleEntry(slug, title, 'todo');
  const tsLiteral = buildTsPostLiteral(slug, title);

  const plan = [
    'data/blog.extra.ts             +1 post',
    'data/blog-i18n/en.json         +1 entry',
    'data/blog-i18n/zh.json         +1 entry (TODO)',
    'data/blog-i18n/zh-TW.json      +1 entry (TODO)',
    'data/blog-i18n/{ja,ko,es,fr,de,pt-BR}.json   +1 entry each'
  ];
  if (args.pathId) {
    plan.push(`data/learning-paths.ts         ${args.pathId} step ${args.step}`);
  }

  console.log(args.dryRun ? 'Dry-run plan (no writes):\n' : 'Writing:\n');
  for (const line of plan) console.log(`  ${line}`);

  if (args.dryRun) {
    console.log('\n(no files changed)');
    process.exit(0);
  }

  /** @type {{ file: string, before: string }[]} */
  const backups = [];
  const touch = (file) => {
    backups.push({ file, before: fs.readFileSync(file, 'utf8') });
  };

  try {
    touch(extraFile);
    const nextExtra = insertIntoExtraTs(extraSource, tsLiteral);
    fs.writeFileSync(extraFile, nextExtra, 'utf8');

    for (const locale of LOCALES) {
      const file = localePath(locale);
      touch(file);
      const json = readJson(file);
      const entry =
        locale === 'en'
          ? enEntry
          : locale === 'zh' || locale === 'zh-TW'
            ? todoEntry
            : enEntry;
      json[slug] = entry;
      writeJson(file, json);
    }

    if (args.pathId && nextPaths) {
      touch(pathsFile);
      fs.writeFileSync(pathsFile, nextPaths, 'utf8');
    }

    // Structure self-check against en.
    const enShape = structureShape(enEntry);
    for (const locale of LOCALES) {
      const entry = readJson(localePath(locale))[slug];
      if (!entry) throw new Error(`Missing written entry for ${locale}/${slug}`);
      const shape = structureShape(entry);
      if (!shapesEqual(enShape, shape)) {
        throw new Error(
          `Structure mismatch in ${locale}.json vs en (sections/bodies/faq)`
        );
      }
    }
  } catch (err) {
    for (const { file, before } of backups.reverse()) {
      fs.writeFileSync(file, before, 'utf8');
    }
    fail(`Rolled back. ${err && err.message ? err.message : String(err)}`);
  }

  console.log('\n✓ data/blog.extra.ts             +1 post');
  console.log('✓ data/blog-i18n/en.json         +1 entry');
  console.log('✓ data/blog-i18n/zh.json         +1 entry (TODO)');
  console.log('✓ data/blog-i18n/zh-TW.json      +1 entry (TODO)');
  console.log('✓ data/blog-i18n/{ja,ko,es,fr,de,pt-BR}.json   +1 entry each');
  if (args.pathId) {
    console.log(`✓ data/learning-paths.ts         ${args.pathId} step ${args.step}`);
  }
  console.log(`
下一步：
1. 填 data/blog-i18n/en.json 的正文（或用 Studio）
2. 填 zh / zh-TW 正文
3. 手工把 ${slug} 加进 data/blog-clusters.ts 的某个簇（必需：tests/article-links.test.ts 要求每篇文章都有簇）
4. npm run gate
`);
}

main();
