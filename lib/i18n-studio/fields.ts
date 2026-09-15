import {
  categorizeFieldPath,
  type FieldCategory
} from '@/lib/i18n-studio/field-taxonomy';

export type FlatFieldKind = 'string' | 'string[]' | 'json';

export interface FlatField {
  path: string;
  kind: FlatFieldKind;
  value: unknown;
  category: FieldCategory;
}

const SKIP = new Set(['_meta']);

/**
 * Keys whose value is structured art data rather than prose. These stay as a
 * single JSON field instead of expanding, so a 14-tile row does not turn into
 * 28 suit/rank inputs that drown out the text around it.
 */
const JSON_BLOB_KEYS = new Set(['tiles', 'heroTiles']);

function isPlainObject(value: unknown): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Flatten editable leaves for Studio (skip _meta). */
export function flattenFields(
  domain: string,
  value: unknown,
  prefix = ''
): FlatField[] {
  if (value === null || value === undefined) return [];
  if (typeof value === 'string') {
    return [
      {
        path: prefix || '(root)',
        kind: 'string',
        value,
        category: categorizeFieldPath(domain, prefix || 'root')
      }
    ];
  }
  if (Array.isArray(value)) {
    if (value.every((x) => typeof x === 'string')) {
      return [
        {
          path: prefix || '(root)',
          kind: 'string[]',
          value,
          category: categorizeFieldPath(domain, prefix || 'root')
        }
      ];
    }
    // Arrays of objects expand into indexed paths (sections.0.heading,
    // faq.2.answer) so headings and paragraphs can be diffed side by side.
    // Anything else (numbers, nested arrays, mixed) keeps one editor.
    if (value.length === 0 || !value.every(isPlainObject)) {
      return [
        {
          path: prefix || '(root)',
          kind: 'json',
          value,
          category: categorizeFieldPath(domain, prefix || 'root')
        }
      ];
    }
    const out: FlatField[] = [];
    value.forEach((item, index) => {
      out.push(...flattenFields(domain, item, prefix ? `${prefix}.${index}` : String(index)));
    });
    return out;
  }
  if (typeof value === 'object') {
    const out: FlatField[] = [];
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SKIP.has(k)) continue;
      const p = prefix ? `${prefix}.${k}` : k;
      if (JSON_BLOB_KEYS.has(k)) {
        if (v === null || v === undefined) continue;
        if (Array.isArray(v) && v.length === 0) continue;
        out.push({
          path: p,
          kind: 'json',
          value: v,
          category: categorizeFieldPath(domain, p)
        });
        continue;
      }
      out.push(...flattenFields(domain, v, p));
    }
    return out;
  }
  return [
    {
      path: prefix || '(root)',
      kind: 'json',
      value,
      category: categorizeFieldPath(domain, prefix || 'root')
    }
  ];
}

export function getAtPath(root: unknown, path: string): unknown {
  if (!path || path === '(root)') return root;
  const parts = path.split('.');
  let cur: unknown = root;
  for (const part of parts) {
    if (cur === null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

export function setAtPath(root: unknown, path: string, value: unknown): unknown {
  if (!path || path === '(root)') return value;
  const parts = path.split('.');
  const clone = structuredClone(root) as Record<string, unknown>;
  let cur: Record<string, unknown> = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = cur[p];
    if (Array.isArray(next)) {
      // Walk *through* array containers. Overwriting an array with {} here
      // would rewrite `sections: [...]` as `{"0": ...}` and silently break
      // both the renderer and blog-i18n-structure.test.ts.
      cur[p] = structuredClone(next);
    } else if (next === null || typeof next !== 'object') {
      cur[p] = {};
    } else {
      cur[p] = structuredClone(next);
    }
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
  return clone;
}

/** Copy EN leaf into locale only when empty or identical to EN. */
export function copyEnIntoEmpty(
  en: unknown,
  loc: unknown,
  domain: string
): unknown {
  const enFields = flattenFields(domain, en);
  let next: unknown = loc == null ? {} : structuredClone(loc);
  for (const f of enFields) {
    const cur = getAtPath(next, f.path);
    const empty =
      cur === undefined ||
      cur === null ||
      cur === '' ||
      (Array.isArray(cur) && cur.length === 0);
    const identical = JSON.stringify(cur) === JSON.stringify(f.value);
    if (empty || identical) {
      next = setAtPath(next, f.path, structuredClone(f.value));
    }
  }
  return next;
}

/** Clear fields that are identical to EN (residual). */
export function clearIdenticalToEn(en: unknown, loc: unknown, domain: string): unknown {
  const enFields = flattenFields(domain, en);
  let next: unknown = loc == null ? {} : structuredClone(loc);
  for (const f of enFields) {
    const cur = getAtPath(next, f.path);
    if (JSON.stringify(cur) === JSON.stringify(f.value)) {
      if (f.kind === 'string') next = setAtPath(next, f.path, '');
      else if (f.kind === 'string[]') next = setAtPath(next, f.path, []);
    }
  }
  return next;
}

export function replaceInStrings(
  loc: unknown,
  domain: string,
  from: string,
  to: string
): unknown {
  if (!from) return loc;
  const fields = flattenFields(domain, loc);
  let next: unknown = loc == null ? {} : structuredClone(loc);
  for (const f of fields) {
    if (f.kind === 'string' && typeof f.value === 'string' && f.value.includes(from)) {
      next = setAtPath(next, f.path, f.value.split(from).join(to));
    }
    if (f.kind === 'string[]' && Array.isArray(f.value)) {
      next = setAtPath(
        next,
        f.path,
        (f.value as string[]).map((s) => s.split(from).join(to))
      );
    }
  }
  return next;
}
