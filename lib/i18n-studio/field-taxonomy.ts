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

  if (
    /ogimage|thumbnail|cover|image|img|video|screenshot|url$/.test(leaf) ||
    /\/(images|img|video)/.test(p)
  ) {
    return 'media';
  }
  if (
    /^(title|subtitle|homeh1|pagename)$/.test(leaf) ||
    leaf.endsWith('title') ||
    leaf === 'heading' ||
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
    domain === 'messages' &&
    (/btn|button|cta|play|start|submit|label$/.test(leaf) ||
      p.includes('.cta') ||
      p.includes('button'))
  ) {
    return 'button';
  }
  if (
    leaf === 'howtoplay' ||
    leaf === 'tips' ||
    leaf === 'features' ||
    leaf === 'faq' ||
    leaf === 'sections' ||
    leaf === 'bullets' ||
    leaf === 'paragraphs' ||
    leaf === 'closing' ||
    p.includes('.howtoplay') ||
    p.includes('.features') ||
    p.includes('.tips')
  ) {
    return 'list';
  }
  return 'context';
}
