'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FIELD_CATEGORIES,
  type FieldCategory
} from '@/lib/i18n-studio/field-taxonomy';
import {
  clearIdenticalToEn,
  copyEnIntoEmpty,
  flattenFields,
  replaceInStrings,
  setAtPath,
  type FlatField
} from '@/lib/i18n-studio/fields';

type Domain =
  | 'messages'
  | 'blog'
  | 'games'
  | 'about'
  | 'home-guide'
  | 'glossary'
  | 'site';

type Finding = {
  severity: 'error' | 'warning';
  domain: string;
  locale?: string;
  path: string;
  message: string;
};

type IssueSort = 'severity' | 'locale' | 'domain' | 'path' | 'message';
type SeverityFilter = 'errors' | 'warnings' | 'all';

const DOMAINS: Domain[] = [
  'messages',
  'blog',
  'games',
  'about',
  'home-guide',
  'glossary',
  'site'
];

const CAT_LABEL: Record<FieldCategory, string> = {
  title: '标题',
  description: '描述',
  context: '正文',
  button: '按钮',
  list: '列表',
  media: '媒体'
};

const STATUS_CLASS: Record<string, string> = {
  ok: 'border-zinc-200 bg-white',
  residual: 'border-red-300 bg-red-50/80',
  glossary: 'border-amber-300 bg-amber-50/80',
  warn: 'border-amber-200 bg-amber-50/40'
};

function fieldTitle(path: string): string {
  const leaf = path.split('.').pop() ?? path;
  const spaced = leaf
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function parseJsonSafe(text: string): unknown | null {
  try {
    return text.trim() ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function toStudioDomain(domain: string): Domain | null {
  if (domain === 'about-i18n') return 'about';
  if (domain === 'home-guide-i18n') return 'home-guide';
  if (domain.startsWith('glossary')) return 'glossary';
  if ((DOMAINS as string[]).includes(domain)) return domain as Domain;
  return null;
}

function defaultEntryId(studio: Domain): string {
  switch (studio) {
    case 'messages':
      return 'tree';
    case 'about':
    case 'home-guide':
      return 'doc';
    case 'glossary':
      return 'terms';
    case 'site':
      return 'settings';
    default:
      return '';
  }
}

/** Map a finding to studio navigation + field focus path. */
function resolveFindingNav(f: Finding): {
  domain: Domain;
  id: string;
  locale?: string;
  fieldPath: string;
} | null {
  const studio = toStudioDomain(f.domain);
  if (!studio) return null;

  let id = defaultEntryId(studio);
  let fieldPath = f.path;

  if (studio === 'blog' || studio === 'games') {
    const parts = f.path.split('.');
    if (parts.length >= 1 && parts[0] && !parts[0].includes('/')) {
      if (f.message.includes('locale file missing') || f.path === f.locale) {
        id = '';
        fieldPath = f.path;
      } else {
        id = parts[0];
        fieldPath = parts.slice(1).join('.') || parts[0];
      }
    }
  }

  if (studio === 'about' || studio === 'home-guide') {
    if (f.path === f.locale || f.path.endsWith('.sections')) {
      fieldPath = f.path.replace(new RegExp(`^${f.locale}\\.`), '');
    }
  }

  return {
    domain: studio,
    id: id || defaultEntryId(studio),
    locale: f.locale,
    fieldPath
  };
}

function fieldStatus(
  path: string,
  enVal: unknown,
  locVal: unknown,
  findings: Finding[],
  locale: string
): 'ok' | 'residual' | 'glossary' | 'warn' {
  // Exact path only — loose includes() caused false "英文残稿" when another
  // key shared a leaf (e.g. wardrobe.subtitle residual painting challenge.subtitle).
  const related = findings.filter(
    (f) =>
      (f.locale === locale || !f.locale) &&
      (f.path === path || f.path.endsWith(`.${path}`))
  );
  if (
    related.some(
      (f) =>
        f.message.includes('English residual') ||
        f.message.includes('identical to EN') ||
        f.message.includes('still English')
    )
  ) {
    return 'residual';
  }
  if (
    related.some(
      (f) => f.path.startsWith('glossary:') || f.message.includes('glossary')
    )
  ) {
    return 'glossary';
  }
  if (
    JSON.stringify(enVal) === JSON.stringify(locVal) &&
    enVal !== '' &&
    enVal != null
  ) {
    return 'residual';
  }
  if (related.some((f) => f.severity === 'warning')) return 'warn';
  return 'ok';
}

function findingMatchesEntry(
  f: Finding,
  domain: Domain,
  entryId: string,
  locale: string
): boolean {
  const nav = resolveFindingNav(f);
  if (!nav) return false;
  if (nav.domain !== domain) return false;
  if (f.locale && f.locale !== locale) return false;
  if (entryId && nav.id && nav.id !== entryId) return false;
  return true;
}

function sortFindings(list: Finding[], sort: IssueSort): Finding[] {
  const sev = (s: Finding['severity']) => (s === 'error' ? 0 : 1);
  return [...list].sort((a, b) => {
    if (sort === 'severity') {
      const d = sev(a.severity) - sev(b.severity);
      if (d) return d;
      return (
        (a.locale ?? '').localeCompare(b.locale ?? '') ||
        a.domain.localeCompare(b.domain) ||
        a.path.localeCompare(b.path)
      );
    }
    if (sort === 'locale') {
      return (
        (a.locale ?? '').localeCompare(b.locale ?? '') ||
        sev(a.severity) - sev(b.severity) ||
        a.path.localeCompare(b.path)
      );
    }
    if (sort === 'domain') {
      return (
        a.domain.localeCompare(b.domain) ||
        (a.locale ?? '').localeCompare(b.locale ?? '') ||
        a.path.localeCompare(b.path)
      );
    }
    if (sort === 'message') {
      return a.message.localeCompare(b.message) || a.path.localeCompare(b.path);
    }
    return (
      a.path.localeCompare(b.path) ||
      (a.locale ?? '').localeCompare(b.locale ?? '') ||
      sev(a.severity) - sev(b.severity)
    );
  });
}

function padIndex(n: number, width: number) {
  return String(n).padStart(width, '0');
}

export default function I18nStudioClient() {
  const [locales, setLocales] = useState<string[]>(['en']);
  const [domain, setDomain] = useState<Domain>('messages');
  const [items, setItems] = useState<{ id: string; label: string }[]>([]);
  const [id, setId] = useState('tree');
  const [itemQuery, setItemQuery] = useState('');
  const [locale, setLocale] = useState('zh');
  const [enObj, setEnObj] = useState<unknown>(null);
  const [locObj, setLocObj] = useState<unknown>(null);
  const [status, setStatus] = useState('');
  const [findings, setFindings] = useState<Finding[]>([]);
  const [cats, setCats] = useState<FieldCategory[]>([...FIELD_CATEGORIES]);
  const [focusPath, setFocusPath] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [replaceFrom, setReplaceFrom] = useState('');
  const [replaceTo, setReplaceTo] = useState('');
  const [checking, setChecking] = useState(false);

  const [sevFilter, setSevFilter] = useState<SeverityFilter>('errors');
  const [issueDomain, setIssueDomain] = useState<string>('all');
  const [issueLocale, setIssueLocale] = useState<string>('all');
  const [issueQuery, setIssueQuery] = useState('');
  const [issueSort, setIssueSort] = useState<IssueSort>('locale');
  const [onlyCurrentEntry, setOnlyCurrentEntry] = useState(false);
  const [activeIssueKey, setActiveIssueKey] = useState<string | null>(null);
  const [issuesCollapsed, setIssuesCollapsed] = useState(false);

  const undoStack = useRef<unknown[]>([]);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const pendingJumpId = useRef<string | null>(null);

  const pushUndo = (snapshot: unknown) => {
    undoStack.current = [
      ...undoStack.current.slice(-29),
      structuredClone(snapshot)
    ];
  };

  const loadCatalog = useCallback(async (d: Domain) => {
    const res = await fetch(`/api/dev/i18n?domain=${d}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'list failed');
    setLocales(data.locales ?? ['en']);
    const nextItems: { id: string; label: string }[] = data.items ?? [];
    setItems(nextItems);
    const want = pendingJumpId.current;
    pendingJumpId.current = null;
    setId((prev) => {
      if (want && nextItems.some((i) => i.id === want)) return want;
      if (nextItems.some((i) => i.id === prev)) return prev;
      return nextItems[0]?.id ?? prev;
    });
  }, []);

  const loadEntry = useCallback(async () => {
    setStatus('Loading…');
    const res = await fetch(
      `/api/dev/i18n/entry?domain=${domain}&id=${encodeURIComponent(id)}&locale=${locale}`
    );
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || 'load failed');
      return;
    }
    setEnObj(data.en);
    setLocObj(data.locale);
    undoStack.current = [];
    setStatus('Loaded');
  }, [domain, id, locale]);

  const runCheck = useCallback(async () => {
    setChecking(true);
    setStatus('Checking…');
    try {
      const res = await fetch('/api/dev/i18n/check');
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || 'check failed');
        return;
      }
      setFindings([...(data.errors ?? []), ...(data.warnings ?? [])]);
      setStatus(
        `Check: ${data.errors?.length ?? 0} errors, ${data.warnings?.length ?? 0} warnings`
      );
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog(domain).catch((e) => setStatus(String(e)));
  }, [domain, loadCatalog]);

  useEffect(() => {
    if (!id) return;
    loadEntry().catch((e) => setStatus(String(e)));
  }, [id, locale, loadEntry]);

  useEffect(() => {
    void runCheck();
  }, [runCheck]);

  useEffect(() => {
    if (!focusPath) return;
    const el = fieldRefs.current[focusPath];
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusPath, locObj]);

  const errorCount = useMemo(
    () => findings.filter((f) => f.severity === 'error').length,
    [findings]
  );
  const warningCount = useMemo(
    () => findings.filter((f) => f.severity === 'warning').length,
    [findings]
  );

  const issueDomains = useMemo(() => {
    const s = new Set(findings.map((f) => f.domain));
    return ['all', ...[...s].sort()];
  }, [findings]);

  const issueLocales = useMemo(() => {
    const s = new Set(
      findings.map((f) => f.locale).filter((l): l is string => Boolean(l))
    );
    return ['all', ...[...s].sort()];
  }, [findings]);

  const listedIssues = useMemo(() => {
    const q = issueQuery.trim().toLowerCase();
    const filtered = findings.filter((f) => {
      if (sevFilter === 'errors' && f.severity !== 'error') return false;
      if (sevFilter === 'warnings' && f.severity !== 'warning') return false;
      if (issueDomain !== 'all' && f.domain !== issueDomain) return false;
      if (issueLocale !== 'all' && f.locale !== issueLocale) return false;
      if (onlyCurrentEntry && !findingMatchesEntry(f, domain, id, locale)) {
        return false;
      }
      if (!q) return true;
      return (
        f.path.toLowerCase().includes(q) ||
        f.message.toLowerCase().includes(q) ||
        f.domain.toLowerCase().includes(q) ||
        (f.locale ?? '').toLowerCase().includes(q)
      );
    });
    return sortFindings(filtered, issueSort);
  }, [
    findings,
    sevFilter,
    issueDomain,
    issueLocale,
    issueQuery,
    issueSort,
    onlyCurrentEntry,
    domain,
    id,
    locale
  ]);

  const entryIssueCounts = useMemo(() => {
    const map = new Map<string, { errors: number; warnings: number }>();
    for (const f of findings) {
      const nav = resolveFindingNav(f);
      if (!nav || nav.domain !== domain) continue;
      if (f.locale && f.locale !== locale) continue;
      const key = nav.id || '_';
      const cur = map.get(key) ?? { errors: 0, warnings: 0 };
      if (f.severity === 'error') cur.errors += 1;
      else cur.warnings += 1;
      map.set(key, cur);
    }
    return map;
  }, [findings, domain, locale]);

  const filteredItems = useMemo(() => {
    const q = itemQuery.trim().toLowerCase();
    let list = items;
    if (q) {
      list = list.filter(
        (i) =>
          i.id.toLowerCase().includes(q) || i.label.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const ca = entryIssueCounts.get(a.id) ?? { errors: 0, warnings: 0 };
      const cb = entryIssueCounts.get(b.id) ?? { errors: 0, warnings: 0 };
      if (ca.errors !== cb.errors) return cb.errors - ca.errors;
      if (ca.warnings !== cb.warnings) return cb.warnings - ca.warnings;
      return a.label.localeCompare(b.label);
    });
  }, [items, itemQuery, entryIssueCounts]);

  const enFields = useMemo(
    () => (enObj == null ? [] : flattenFields(domain, enObj)),
    [enObj, domain]
  );
  const locFields = useMemo(
    () => (locObj == null ? [] : flattenFields(domain, locObj)),
    [locObj, domain]
  );

  const visiblePaths = useMemo(() => {
    const map = new Map<string, { en?: FlatField; loc?: FlatField }>();
    for (const f of enFields) {
      if (!cats.includes(f.category)) continue;
      map.set(f.path, { ...map.get(f.path), en: f });
    }
    for (const f of locFields) {
      if (!cats.includes(f.category)) continue;
      map.set(f.path, { ...map.get(f.path), loc: f });
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [enFields, locFields, cats]);

  const grouped = useMemo(() => {
    const g: Record<FieldCategory, typeof visiblePaths> = {
      title: [],
      description: [],
      context: [],
      button: [],
      list: [],
      media: []
    };
    for (const entry of visiblePaths) {
      const cat =
        entry[1].en?.category ?? entry[1].loc?.category ?? 'context';
      g[cat].push(entry);
    }
    return g;
  }, [visiblePaths]);

  const localeErrorBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of findings) {
      if (f.severity !== 'error') continue;
      const loc = f.locale ?? '(none)';
      map.set(loc, (map.get(loc) ?? 0) + 1);
    }
    return [...map.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
    );
  }, [findings]);

  const enEditable =
    domain === 'messages' ||
    domain === 'about' ||
    domain === 'home-guide' ||
    domain === 'glossary' ||
    domain === 'site';

  const saveLocale = async (payload: unknown) => {
    if (payload == null) {
      setStatus('Nothing to save');
      return;
    }
    const fields = flattenFields(domain, payload);
    for (const f of fields) {
      if (
        f.kind === 'string' &&
        (f.category === 'title' || f.category === 'description') &&
        String(f.value).trim() === ''
      ) {
        setStatus(`Blocked: empty required field ${f.path}`);
        return;
      }
    }
    const res = await fetch('/api/dev/i18n/entry', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ domain, id, locale, payload })
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || 'save failed');
      return;
    }
    setStatus(`Saved ${domain}/${id} @ ${locale}`);
    await runCheck();
  };

  const saveEn = async () => {
    if (enObj == null) return;
    const res = await fetch('/api/dev/i18n/entry', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ domain, id, locale: 'en', payload: enObj })
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || 'EN save failed');
      return;
    }
    setStatus('Saved EN — sync locale structures if shape changed');
    await runCheck();
  };

  const updateLocField = (path: string, value: unknown) => {
    pushUndo(locObj);
    setLocObj(setAtPath(locObj ?? {}, path, value));
  };

  const markIdiom = async (fieldPath: string) => {
    const res = await fetch('/api/dev/i18n/override', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        domain,
        id,
        locale,
        fieldPath,
        reason: 'locale_idiom',
        note: 'Marked from Content Studio'
      })
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || 'override failed');
      return;
    }
    setLocObj(data.entry);
    setStatus(`Marked ${fieldPath} as locale_idiom`);
    await runCheck();
  };

  const applyGlossaryFix = (message: string) => {
    const m = message.match(
      /English term "(.+?)" left in text; glossary expects "(.+?)"/
    );
    if (!m || !locObj) return;
    pushUndo(locObj);
    setLocObj(replaceInStrings(locObj, domain, m[1], m[2]));
    setStatus(`Replaced "${m[1]}" → "${m[2]}" (save to persist)`);
  };

  const downloadSnapshot = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { domain, id, locale, en: enObj, localePayload: locObj },
          null,
          2
        )
      ],
      { type: 'application/json' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${domain}-${id}-${locale}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copyIssueList = async () => {
    const width = String(listedIssues.length).length;
    const lines = listedIssues.map((f, i) => {
      const n = padIndex(i + 1, width);
      return `#${n}\t${f.severity}\t${f.domain}\t${f.locale ?? '-'}\t${f.path}\t${f.message}`;
    });
    const header = `#\tseverity\tdomain\tlocale\tpath\tmessage`;
    await navigator.clipboard.writeText([header, ...lines].join('\n'));
    setStatus(`Copied ${listedIssues.length} issues to clipboard`);
  };

  const downloadIssueList = () => {
    const width = String(listedIssues.length).length;
    const lines = listedIssues.map((f, i) => {
      const n = padIndex(i + 1, width);
      return `#${n}\t${f.severity}\t${f.domain}\t${f.locale ?? '-'}\t${f.path}\t${f.message}`;
    });
    const blob = new Blob(
      [[`#\tseverity\tdomain\tlocale\tpath\tmessage`, ...lines].join('\n')],
      { type: 'text/plain;charset=utf-8' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `i18n-${sevFilter}-${listedIssues.length}.tsv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const jumpToFinding = (f: Finding, index: number) => {
    const key = `${f.severity}:${f.domain}:${f.locale ?? ''}:${f.path}:${index}`;
    setActiveIssueKey(key);
    const nav = resolveFindingNav(f);
    if (!nav) {
      setStatus(`Cannot navigate: ${f.domain} / ${f.path}`);
      return;
    }
    if (nav.locale && nav.locale !== locale) setLocale(nav.locale);
    if (nav.domain !== domain) {
      pendingJumpId.current = nav.id;
      setDomain(nav.domain);
    } else if (nav.id && nav.id !== id) {
      setId(nav.id);
    }
    setFocusPath(nav.fieldPath);
    setCats([...FIELD_CATEGORIES]);
    setStatus(
      `Jump #${index + 1} → ${nav.domain}/${nav.id} @ ${nav.locale ?? locale} · ${nav.fieldPath}`
    );
  };

  const toggleCat = (c: FieldCategory) => {
    setCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const copyOneField = (path: string, enField?: FlatField) => {
    if (!enField) return;
    pushUndo(locObj);
    setLocObj(setAtPath(locObj ?? {}, path, structuredClone(enField.value)));
    setStatus(`Copied Original → Translation: ${path}`);
  };

  const boxClass = (readOnly: boolean) =>
    readOnly
      ? 'w-full rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2.5 text-sm text-zinc-800'
      : 'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100';

  const renderEditor = (
    side: 'en' | 'loc',
    field: FlatField | undefined,
    path: string,
    readOnly: boolean,
    /** When locale is missing this key, reuse EN shape so Translation stays editable. */
    fallback?: FlatField
  ) => {
    const effective: FlatField | undefined =
      field ??
      (side === 'loc' && !readOnly && fallback
        ? {
            path,
            kind: fallback.kind,
            value:
              fallback.kind === 'string'
                ? ''
                : fallback.kind === 'string[]'
                  ? ['']
                  : fallback.kind === 'json'
                    ? null
                    : '',
            category: fallback.category
          }
        : undefined);

    if (!effective) {
      return (
        <div className={`${boxClass(true)} text-zinc-400`}>—</div>
      );
    }

    if (effective.kind === 'string') {
      const isMedia =
        effective.category === 'media' ||
        /ogimage|image|cover|url/i.test(path.split('.').pop() ?? '');
      const val = String(effective.value ?? '');
      const long = val.length > 80 || val.includes('\n');
      return (
        <div className="space-y-2">
          {long ? (
            <textarea
              className={`${boxClass(readOnly)} min-h-[88px] resize-y leading-relaxed`}
              rows={4}
              value={val}
              readOnly={readOnly}
              placeholder={
                side === 'loc' && !readOnly ? '输入翻译…' : undefined
              }
              onChange={(e) =>
                side === 'loc' && updateLocField(path, e.target.value)
              }
            />
          ) : (
            <input
              className={boxClass(readOnly)}
              value={val}
              readOnly={readOnly}
              placeholder={
                side === 'loc' && !readOnly ? '输入翻译…' : undefined
              }
              onChange={(e) =>
                side === 'loc' && updateLocField(path, e.target.value)
              }
            />
          )}
          {isMedia && val && (val.startsWith('/') || val.startsWith('http')) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={val}
              alt=""
              className="max-h-24 rounded-lg border border-zinc-200 object-contain"
            />
          )}
        </div>
      );
    }
    if (effective.kind === 'string[]') {
      const arr = (effective.value as string[]) ?? [];
      const rows = arr.length > 0 ? arr : [''];
      return (
        <div className="space-y-2">
          {rows.map((line, i) => (
            <input
              key={i}
              className={boxClass(readOnly)}
              value={line}
              readOnly={readOnly}
              placeholder={
                side === 'loc' && !readOnly ? '输入翻译…' : undefined
              }
              onChange={(e) => {
                if (side !== 'loc') return;
                const next = [...rows];
                next[i] = e.target.value;
                updateLocField(path, next);
              }}
            />
          ))}
          {!readOnly && (
            <button
              type="button"
              className="text-xs font-medium text-sky-600 hover:text-sky-700"
              onClick={() => updateLocField(path, [...rows, ''])}
            >
              + item
            </button>
          )}
        </div>
      );
    }
    return (
      <textarea
        className={`${boxClass(readOnly)} font-mono text-xs`}
        rows={6}
        value={
          effective.value == null
            ? ''
            : JSON.stringify(effective.value, null, 2)
        }
        readOnly={readOnly}
        placeholder={side === 'loc' && !readOnly ? '{ }' : undefined}
        onChange={(e) => {
          if (side !== 'loc') return;
          const raw = e.target.value.trim();
          if (!raw) {
            updateLocField(path, null);
            return;
          }
          try {
            updateLocField(path, JSON.parse(raw));
          } catch {
            /* keep typing */
          }
        }}
      />
    );
  };

  const indexWidth = String(Math.max(listedIssues.length, 1)).length;
  const entryLabel =
    items.find((i) => i.id === id)?.label ?? id;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-5 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
              <span>Studio</span>
              <span className="text-zinc-300">/</span>
              <span className="font-medium text-zinc-700">{domain}</span>
              <span className="text-zinc-300">/</span>
              <span className="font-medium text-zinc-700">{locale}</span>
              <span className="text-zinc-300">/</span>
              <span className="truncate font-medium text-zinc-700">
                {entryLabel}
              </span>
            </div>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-zinc-900">
              Edit translations
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="rounded-full bg-red-50 px-2.5 py-1 font-medium text-red-700 ring-1 ring-red-100">
              {errorCount} errors
            </span>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-800 ring-1 ring-amber-100">
              {warningCount} warnings
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void runCheck()}
              disabled={checking}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              {checking ? 'Checking…' : 'Sync check'}
            </button>
            {enEditable && (
              <button
                type="button"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                onClick={() => void saveEn()}
              >
                Save EN
              </button>
            )}
            <button
              type="button"
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
              onClick={() => void saveLocale(locObj)}
            >
              Save {locale}
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 border-t border-zinc-100 px-5 py-2.5">
          <div className="flex flex-wrap gap-1">
            {DOMAINS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDomain(d)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  domain === d
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <select
            className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            aria-label="Locale"
          >
            {locales.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <div className="h-4 w-px bg-zinc-200" />
          {FIELD_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCat(c)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                cats.includes(c)
                  ? 'bg-sky-50 text-sky-800 ring-1 ring-sky-200'
                  : 'bg-zinc-50 text-zinc-400'
              }`}
            >
              {CAT_LABEL[c]}
            </button>
          ))}
          <div className="h-4 w-px bg-zinc-200" />
          <button
            type="button"
            className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50"
            onClick={() => {
              pushUndo(locObj);
              setLocObj(copyEnIntoEmpty(enObj, locObj, domain));
              setStatus('Filled empty/residual from EN (not saved)');
            }}
          >
            Copy EN→empty
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50"
            onClick={() => {
              if (!confirm('Clear fields identical to EN?')) return;
              pushUndo(locObj);
              setLocObj(clearIdenticalToEn(enObj, locObj, domain));
              setStatus('Cleared residual fields (not saved)');
            }}
          >
            Clear residual
          </button>
          <input
            className="w-24 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-[11px]"
            placeholder="Find"
            value={replaceFrom}
            onChange={(e) => setReplaceFrom(e.target.value)}
          />
          <input
            className="w-24 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-[11px]"
            placeholder="Replace"
            value={replaceTo}
            onChange={(e) => setReplaceTo(e.target.value)}
          />
          <button
            type="button"
            className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50"
            onClick={() => {
              pushUndo(locObj);
              setLocObj(
                replaceInStrings(locObj, domain, replaceFrom, replaceTo)
              );
              setStatus('Replaced in locale (not saved)');
            }}
          >
            Replace
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50"
            onClick={() => {
              const prev = undoStack.current.pop();
              if (prev === undefined) {
                setStatus('Nothing to undo');
                return;
              }
              setLocObj(prev);
              setStatus('Undo');
            }}
          >
            Undo
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50"
            onClick={downloadSnapshot}
          >
            JSON
          </button>
          <span className="ml-auto max-w-md truncate text-xs text-zinc-500">
            {status}
          </span>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-zinc-200 bg-white lg:border-b-0 lg:border-r lg:border-zinc-200">
          <div className="sticky top-[120px] space-y-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                Entries · {filteredItems.length}
              </span>
              <span className="text-[10px] text-zinc-400">errors first</span>
            </div>
            <input
              className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-sm"
              placeholder="Search entries…"
              value={itemQuery}
              onChange={(e) => setItemQuery(e.target.value)}
            />
            <div className="max-h-[calc(100vh-400px)] min-h-[200px] space-y-0.5 overflow-auto">
              {filteredItems.map((item) => {
                const counts = entryIssueCounts.get(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setId(item.id)}
                    className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm ${
                      id === item.id
                        ? 'bg-sky-50 text-sky-950 ring-1 ring-sky-200'
                        : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{item.label}</div>
                      <div className="truncate font-mono text-[10px] text-zinc-400">
                        {item.id}
                      </div>
                    </div>
                    {counts && (counts.errors > 0 || counts.warnings > 0) && (
                      <div className="shrink-0 space-y-0.5 text-right text-[10px] leading-none">
                        {counts.errors > 0 && (
                          <div className="rounded-full bg-red-100 px-1.5 py-0.5 font-medium text-red-700">
                            {counts.errors}
                          </div>
                        )}
                        {counts.warnings > 0 && (
                          <div className="rounded-full bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">
                            {counts.warnings}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-4 p-5 pb-[min(42vh,420px)]">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm text-zinc-500">
                Original (EN) on the left · Translation ({locale}) on the right
              </p>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-100">
              Editing /{locale}/
            </div>
          </div>

          {FIELD_CATEGORIES.filter((c) => cats.includes(c)).map((cat) => {
            const rows = grouped[cat];
            if (!rows.length) return null;
            return (
              <section key={cat} className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {CAT_LABEL[cat]}
                  <span className="ml-2 font-normal normal-case text-zinc-300">
                    {rows.length}
                  </span>
                </h2>
                {rows.map(([path, pair]) => {
                  const st = fieldStatus(
                    path,
                    pair.en?.value,
                    pair.loc?.value,
                    findings,
                    locale
                  );
                  return (
                    <article
                      key={path}
                      ref={(el) => {
                        fieldRefs.current[path] = el;
                      }}
                      className={`rounded-xl border p-4 shadow-sm ${STATUS_CLASS[st]} ${
                        focusPath === path
                          ? 'ring-2 ring-sky-400 ring-offset-2'
                          : ''
                      }`}
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-900">
                          {fieldTitle(path)}
                        </h3>
                        <span className="font-mono text-[10px] text-zinc-400">
                          {path}
                        </span>
                        {st === 'residual' && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                            英文残稿
                          </span>
                        )}
                        {st === 'glossary' && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                            术语
                          </span>
                        )}
                        <div className="ml-auto flex items-center gap-1.5">
                          {locale !== 'en' && (
                            <button
                              type="button"
                              className="rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                              onClick={() => void markIdiom(path)}
                            >
                              locale_idiom
                            </button>
                          )}
                          <button
                            type="button"
                            className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50"
                            onClick={() => copyOneField(path, pair.en)}
                            title="Copy Original into Translation"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <div className="mb-1.5 text-xs font-medium text-zinc-500">
                            Original
                          </div>
                          {renderEditor('en', pair.en, path, true)}
                        </div>
                        <div>
                          <div className="mb-1.5 text-xs font-medium text-zinc-500">
                            Translation
                          </div>
                          {renderEditor('loc', pair.loc, path, false, pair.en)}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            );
          })}

          <details
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            open={showAdvanced}
            onToggle={(e) =>
              setShowAdvanced((e.target as HTMLDetailsElement).open)
            }
          >
            <summary className="cursor-pointer text-sm font-medium text-zinc-600">
              Advanced · raw JSON
            </summary>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs text-zinc-500">Original JSON</div>
                <textarea
                  className="h-64 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-800"
                  value={enObj == null ? '' : JSON.stringify(enObj, null, 2)}
                  readOnly={!enEditable}
                  onChange={(e) => {
                    const v = parseJsonSafe(e.target.value);
                    if (v !== null) setEnObj(v);
                  }}
                />
              </div>
              <div>
                <div className="mb-1 text-xs text-zinc-500">
                  Translation JSON
                </div>
                <textarea
                  className="h-64 w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-xs text-zinc-900"
                  value={locObj == null ? '' : JSON.stringify(locObj, null, 2)}
                  onChange={(e) => {
                    const v = parseJsonSafe(e.target.value);
                    if (v !== null) {
                      pushUndo(locObj);
                      setLocObj(v);
                    }
                  }}
                />
              </div>
            </div>
          </details>
        </main>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-zinc-300 bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.08)] ${
          issuesCollapsed ? 'h-10' : 'h-[min(42vh,420px)]'
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1400px] flex-col">
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-3 py-1.5">
            <button
              type="button"
              className="rounded px-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              onClick={() => setIssuesCollapsed((v) => !v)}
              aria-label={issuesCollapsed ? 'Expand issues' : 'Collapse issues'}
            >
              {issuesCollapsed ? '▴' : '▾'}
            </button>
            <h2 className="text-sm font-semibold text-zinc-800">Issues</h2>
            <div className="flex rounded-lg bg-zinc-100 p-0.5 text-xs">
              {(
                [
                  ['errors', `Errors ${errorCount}`],
                  ['warnings', `Warnings ${warningCount}`],
                  ['all', `All ${findings.length}`]
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSevFilter(key);
                    setIssuesCollapsed(false);
                  }}
                  className={`rounded-md px-2.5 py-1 font-medium ${
                    sevFilter === key
                      ? key === 'errors'
                        ? 'bg-red-600 text-white'
                        : key === 'warnings'
                          ? 'bg-amber-500 text-white'
                          : 'bg-zinc-800 text-white'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {!issuesCollapsed && (
              <>
                <select
                  className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs"
                  value={issueDomain}
                  onChange={(e) => setIssueDomain(e.target.value)}
                  aria-label="Filter domain"
                >
                  {issueDomains.map((d) => (
                    <option key={d} value={d}>
                      {d === 'all' ? 'All domains' : d}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs"
                  value={issueLocale}
                  onChange={(e) => setIssueLocale(e.target.value)}
                  aria-label="Filter locale"
                >
                  {issueLocales.map((l) => (
                    <option key={l} value={l}>
                      {l === 'all' ? 'All locales' : l}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs"
                  value={issueSort}
                  onChange={(e) => setIssueSort(e.target.value as IssueSort)}
                  aria-label="Sort"
                >
                  <option value="locale">Sort: locale → path</option>
                  <option value="severity">Sort: severity</option>
                  <option value="domain">Sort: domain</option>
                  <option value="path">Sort: path</option>
                  <option value="message">Sort: message</option>
                </select>
                <input
                  className="min-w-[140px] flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs sm:max-w-xs"
                  placeholder="Filter path / message…"
                  value={issueQuery}
                  onChange={(e) => setIssueQuery(e.target.value)}
                />
                <label className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                  <input
                    type="checkbox"
                    checked={onlyCurrentEntry}
                    onChange={(e) => setOnlyCurrentEntry(e.target.checked)}
                  />
                  Current entry only
                </label>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50"
                  onClick={() => void copyIssueList()}
                >
                  Copy list
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50"
                  onClick={downloadIssueList}
                >
                  Download TSV
                </button>
                <span className="text-[11px] text-zinc-500">
                  showing {listedIssues.length}
                </span>
              </>
            )}
          </div>

          {!issuesCollapsed && (
            <>
              {sevFilter === 'errors' && localeErrorBreakdown.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border-b border-zinc-100 px-3 py-1.5">
                  <span className="text-[10px] uppercase text-zinc-400">
                    Errors by locale
                  </span>
                  {localeErrorBreakdown.map(([loc, n]) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setIssueLocale(loc === '(none)' ? 'all' : loc);
                        setSevFilter('errors');
                      }}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        issueLocale === loc
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {loc} · {n}
                    </button>
                  ))}
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-auto font-mono text-[11px]">
                {listedIssues.length === 0 ? (
                  <p className="p-4 text-sm text-zinc-500">
                    {findings.length === 0
                      ? 'Run check to load issues.'
                      : 'No issues match the current filters.'}
                  </p>
                ) : (
                  <table className="w-full border-collapse text-left">
                    <thead className="sticky top-0 bg-zinc-50 text-[10px] uppercase tracking-wide text-zinc-500">
                      <tr>
                        <th className="w-12 px-2 py-1.5 font-medium">#</th>
                        <th className="w-14 px-2 py-1.5 font-medium">Sev</th>
                        <th className="w-24 px-2 py-1.5 font-medium">Domain</th>
                        <th className="w-16 px-2 py-1.5 font-medium">Locale</th>
                        <th className="min-w-[180px] px-2 py-1.5 font-medium">
                          Path
                        </th>
                        <th className="px-2 py-1.5 font-medium">Message</th>
                        <th className="w-20 px-2 py-1.5 font-medium"> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {listedIssues.map((f, i) => {
                        const key = `${f.severity}:${f.domain}:${f.locale ?? ''}:${f.path}:${i}`;
                        const active = activeIssueKey === key;
                        return (
                          <tr
                            key={key}
                            className={`cursor-pointer border-t border-zinc-100 ${
                              active
                                ? 'bg-sky-50'
                                : f.severity === 'error'
                                  ? 'hover:bg-red-50'
                                  : 'hover:bg-amber-50'
                            }`}
                            onClick={() => jumpToFinding(f, i)}
                          >
                            <td className="px-2 py-1.5 tabular-nums text-zinc-400">
                              {padIndex(i + 1, indexWidth)}
                            </td>
                            <td className="px-2 py-1.5">
                              <span
                                className={
                                  f.severity === 'error'
                                    ? 'font-semibold text-red-600'
                                    : 'font-semibold text-amber-600'
                                }
                              >
                                {f.severity === 'error' ? 'ERR' : 'WARN'}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-zinc-500">
                              {f.domain}
                            </td>
                            <td className="px-2 py-1.5 text-zinc-700">
                              {f.locale ?? '—'}
                            </td>
                            <td
                              className="max-w-[280px] truncate px-2 py-1.5 text-zinc-800"
                              title={f.path}
                            >
                              {f.path}
                            </td>
                            <td
                              className="max-w-[420px] truncate px-2 py-1.5 text-zinc-500"
                              title={f.message}
                            >
                              {f.message}
                            </td>
                            <td className="px-2 py-1.5 text-right">
                              {f.message.includes('glossary expects') && (
                                <button
                                  type="button"
                                  className="font-sans text-sky-600 underline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    applyGlossaryFix(f.message);
                                  }}
                                >
                                  Fix term
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
