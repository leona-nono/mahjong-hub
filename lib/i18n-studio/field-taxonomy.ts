/** Studio field categories — UI filter only; does not change JSON keys. */
export type FieldCategory =
  | 'title'
  | 'description'
  | 'context'
  | 'button'
  | 'list'
  | 'media';

export const FIELD_CATEGORIES: FieldCategory[] = [
  'title',
  'description',
  'context',
  'button',
  'list',
  'media'
];

export function categorizeFieldPath(domain: string, path: string): FieldCategory {
  const p = path.toLowerCase();
  const leaf = p.split('.').pop() ?? p;

  // Decorative tile rows — art data, not prose.
  if (
    leaf === 'herotiles' ||
    leaf === 'tiles' ||
    /(^|\.)tiles$/.test(p) ||
    /ogimage|thumbnail|cover|image|img|video|screenshot|url$/.test(leaf) ||
    /\/(images|img|video)/.test(p)
  ) {
    return 'media';
  }
  // After array expansion, leaf keys decide the filter bucket.
  if (
    /^(title|subtitle|homeh1|pagename|heading)$/.test(leaf) ||
    leaf.endsWith('title') ||
    p.includes('.heading')
  ) {
    return 'title';
  }
  if (
    /^(description|desc|sitedescription|homesubtitle)$/.test(leaf) ||
    leaf.endsWith('description')
  ) {
    return 'description';
  }
  if (
    leaf === 'body' ||
    leaf === 'answer' ||
    leaf === 'question' ||
    leaf === 'paragraphs' ||
    leaf === 'intro'
  ) {
    return 'context';
  }
  if (
    domain === 'messages' &&
    (/btn|button|cta|play|start|submit|label$/.test(leaf) ||
      p.includes('.cta') ||
      p.includes('button'))
  ) {
    return 'button';
  }
  // Whole-array containers (before expansion) stay under list.
  if (
    leaf === 'howtoplay' ||
    leaf === 'tips' ||
    leaf === 'features' ||
    leaf === 'faq' ||
    leaf === 'sections' ||
    leaf === 'bullets' ||
    leaf === 'closing' ||
    p.includes('.howtoplay') ||
    p.includes('.features') ||
    p.includes('.tips')
  ) {
    return 'list';
  }
  return 'context';
}
