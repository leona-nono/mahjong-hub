/**
 * Chinese prose linter — turns "the Chinese reads like a translation" into a work list.
 *
 *   npx tsx scripts/i18n/lint-zh-prose.ts                    # all posts, zh + zh-TW
 *   npx tsx scripts/i18n/lint-zh-prose.ts --locale zh        # one locale
 *   npx tsx scripts/i18n/lint-zh-prose.ts --slug what-is-mahjong
 *   npx tsx scripts/i18n/lint-zh-prose.ts --errors-only      # exit 1 on any wrong term
 *   npx tsx scripts/i18n/lint-zh-prose.ts --errors-only --max-density 3 --min-chars 800
 *
 * Severities:
 *   error — a wrong term that sends the reader to the wrong tile, set or action
 *   warn  — a calque: correct in meaning but visibly translated
 *
 * Wrong-term rules are imported from scripts/i18n/localization-spec.ts, which also
 * builds the translator's prompt. The gate and the prompt therefore cannot drift:
 * adding a red line one place enforces it in the other.
 *
 * Density is reported per 1,000 CJK characters, so a rewrite pass is measurable
 * rather than eyeballed. `--max-density` is a regression ceiling, not a quality
 * bar — the calque patterns are fingerprints, not a judgement of the writing.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { LOCALE_SHEETS, redLinesFor } from './localization-spec';
import type { GlossaryLocale } from '../../data/glossary';

type Severity = 'error' | 'warn';

type Rule = {
  /** Shown in the report, not matched. */
  label: string;
  pattern: RegExp;
  severity: Severity;
  fix: string;
};

/** Wrong terms, sourced from the localization spec so both tools agree. */
function termRulesFor(locale: string): Rule[] {
  if (!(locale in LOCALE_SHEETS)) return [];
  return redLinesFor(locale as GlossaryLocale).map((line) => ({
    label: line.why,
    pattern: new RegExp(line.pattern.source, 'g'),
    severity: line.severity,
    fix: `改成「${line.right}」`
  }));
}

/**
 * Calques. Grouped by the English habit they come from, so a rewrite pass can be
 * explained rather than just flagged.
 */
const CALQUE_RULES: Rule[] = [
  {
    label: '名词化：进行…操作 / 作出…决定',
    pattern: /进行[^。，、]{0,10}(操作|处理|选择|计算)|作出[^。，、]{0,8}(决定|选择)|做[^。，、]{0,6}(选择)/g,
    severity: 'warn',
    fix: '直接用动词：摸牌、打出、算番'
  },
  {
    label: '对于…而言 / 就…来说',
    pattern: /对于[^。]{0,14}而言|就[^。]{0,10}来说/g,
    severity: 'warn',
    fix: '删掉框架，直接说主体'
  },
  {
    label: '并不是…而是 / 不仅…而且',
    pattern: /并不是[^。]{0,24}(而是|而是)|不仅[^。]{0,16}而且/g,
    severity: 'warn',
    fix: '拆成两句，或改成「A 才对」'
  },
  {
    label: '被字句',
    pattern: /被[^。，]{0,8}(所|称为|称作|认为是|视作)/g,
    severity: 'warn',
    fix: '改成主动句'
  },
  {
    label: '抽象名词：…性 / …化',
    pattern: /(必要性|重要性|可能性|一致性|灵活性|可预测性|多样性|随机性)/g,
    severity: 'warn',
    fix: '换成具体的动作或数量'
  },
  {
    label: '翻译腔套语',
    pattern: /值得一提的是|事实上|换句话说|试想|不得不说|众所周知/g,
    severity: 'warn',
    fix: '直接陈述，不铺垫'
  },
  {
    label: '使得…成为可能',
    pattern: /使得[^。]{0,18}成为可能|这才[^。]{0,10}成为可能/g,
    severity: 'warn',
    fix: '改成「所以能…」'
  },
  {
    label: '长「的」链',
    pattern: /的[^。，、；]{1,8}的[^。，、；]{1,8}的/g,
    severity: 'warn',
    fix: '断句，或把修饰改成短句'
  },
  {
    label: '英文词序残留：一个/这个 + 抽象名词',
    pattern: /(一个|这个|那个)(问题|想法|概念|过程|情况|方法|方式|时候)/g,
    severity: 'warn',
    fix: '多数情况可删掉量词'
  }
];

type Hit = { where: string; rule: Rule; excerpt: string };

const DEFAULT_LOCALES = ['zh', 'zh-TW'];

function parseArgs() {
  const args = process.argv.slice(2);
  let locales: string[] = [...DEFAULT_LOCALES];
  let slug: string | undefined;
  let errorsOnly = false;
  let maxDensity = 0;
  let minChars = 0;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--locale') locales = [args[++i]];
    else if (arg === '--slug') slug = args[++i];
    else if (arg === '--errors-only') errorsOnly = true;
    else if (arg === '--max-density') maxDensity = Number(args[++i]);
    else if (arg === '--min-chars') minChars = Number(args[++i]);
  }
  return { locales, slug, errorsOnly, maxDensity, minChars };
}

function cjkLength(text: string): number {
  return (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
}

function excerpt(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 12);
  return `…${text.slice(start, index + length + 12)}…`;
}

function lintText(text: string, where: string, rules: Rule[], out: Hit[]) {
  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = rule.pattern.exec(text)) !== null) {
      out.push({ where, rule, excerpt: excerpt(text, match.index, match[0].length) });
    }
  }
}

function main() {
  const { locales, slug, errorsOnly, maxDensity, minChars } = parseArgs();
  let errorTotal = 0;
  let warnTotal = 0;
  let densityFailures = 0;

  for (const locale of locales) {
    const file = path.join(process.cwd(), 'data', 'blog-i18n', `${locale}.json`);
    const posts = JSON.parse(readFileSync(file, 'utf8')) as Record<
      string,
      {
        title?: string;
        description?: string;
        sections?: Array<{ heading?: string; body?: string[] }>;
        faq?: Array<{ question?: string; answer?: string }>;
      }
    >;

    const rules = [...termRulesFor(locale), ...CALQUE_RULES];
    console.log(`\n================ ${locale} ================`);

    for (const [postSlug, post] of Object.entries(posts)) {
      if (slug && postSlug !== slug) continue;

      const hits: Hit[] = [];
      let chars = 0;

      const add = (text: string | undefined, where: string) => {
        if (typeof text !== 'string' || !text.trim()) return;
        chars += cjkLength(text);
        lintText(text, where, rules, hits);
      };

      add(post.title, 'title');
      add(post.description, 'description');
      post.sections?.forEach((section, index) => {
        add(section.heading, `§${index}.heading`);
        section.body?.forEach((para, paragraphIndex) =>
          add(para, `§${index}.${paragraphIndex}`)
        );
      });
      post.faq?.forEach((entry, index) => {
        add(entry.question, `faq${index}.question`);
        add(entry.answer, `faq${index}.answer`);
      });

      const errors = hits.filter((hit) => hit.rule.severity === 'error');
      const warns = hits.filter((hit) => hit.rule.severity === 'warn');
      errorTotal += errors.length;
      warnTotal += warns.length;

      const density = (hits.length / Math.max(chars, 1)) * 1000;
      const overCeiling = Boolean(maxDensity) && chars >= minChars && density > maxDensity;
      if (overCeiling) densityFailures += 1;

      if (!hits.length) {
        console.log(`  ✓ ${postSlug}  (${chars} 字, 0 处)`);
        continue;
      }

      console.log(
        `  ${errors.length || overCeiling ? '✗' : '!'} ${postSlug}  (${chars} 字, ${errors.length} 错译 / ${warns.length} 翻译腔, 密度 ${density.toFixed(1)}/千字${overCeiling ? ` > 上限 ${maxDensity}` : ''})`
      );
      for (const hit of hits) {
        console.log(`      [${hit.rule.severity}] ${hit.where}  ${hit.rule.label} → ${hit.rule.fix}`);
        console.log(`              ${hit.excerpt}`);
      }
    }
  }

  console.log(`\n---- 合计：${errorTotal} 处错译 / ${warnTotal} 处翻译腔 ----`);
  if (errorTotal) {
    console.log('错译必须改（读取器会看到错误的牌名或动作）。');
  }
  if (densityFailures) {
    console.log(`翻译腔密度超限的文章：${densityFailures} 篇（上限 ${maxDensity}/千字，仅统计 ≥${minChars} 字的文章）。`);
  }

  if ((errorsOnly && errorTotal > 0) || densityFailures > 0) process.exit(1);
}

main();
