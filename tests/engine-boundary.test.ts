import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Executable guard for the pure-engine boundary.
 * Client/DOM code belongs in features/* — not under these dirs.
 *
 * Temporary allowlist entries must shrink as P1/P4 land; prefer empty.
 */
const ENGINE_ROOTS = ['lib/mahjong', 'lib/mahjong-solitaire'] as const;

/** Paths relative to repo root that may still touch browser APIs until migrated. */
const ALLOWLIST = new Set<string>([
  // P4 complete — guest storage lives in features/guest
]);

const FORBIDDEN = [
  { name: "'use client'", re: /['"]use client['"]/ },
  { name: 'react import', re: /from\s+['"]react(?:\/[^'"]*)?['"]/ },
  { name: 'window usage', re: /\btypeof\s+window\b|\bwindow\.(?:[A-Za-z_$]|\()|\bwindow\s*as\b|\(window\s+as\b/ },
  { name: 'document usage', re: /\btypeof\s+document\b|\bdocument\.[A-Za-z_$]/ },
  { name: 'localStorage usage', re: /\blocalStorage\b/ }
] as const;

/** Drop line/block comments so prose like "claim window." does not false-positive. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...listTsFiles(full));
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts')) {
      out.push(full);
    }
  }
  return out;
}

describe('engine boundary (no React/DOM in pure engines)', () => {
  const root = path.resolve(__dirname, '..');
  const files = ENGINE_ROOTS.flatMap((rel) => listTsFiles(path.join(root, rel)));

  it('discovers engine TypeScript sources', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  for (const file of files) {
    const rel = path.relative(root, file).replaceAll('\\', '/');
    if (ALLOWLIST.has(rel)) continue;

    it(`${rel} stays free of client/DOM APIs`, () => {
      const source = stripComments(readFileSync(file, 'utf8'));
      const hits = FORBIDDEN.filter((rule) => rule.re.test(source)).map((rule) => rule.name);
      expect(hits, `${rel} violates engine boundary: ${hits.join(', ')}`).toEqual([]);
    });
  }

  it('allowlist only contains existing files', () => {
    for (const rel of ALLOWLIST) {
      const full = path.join(root, rel);
      expect(statSync(full).isFile(), `missing allowlisted file: ${rel}`).toBe(true);
    }
  });
});
