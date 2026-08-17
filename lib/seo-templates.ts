/**
 * Shared SEO string helpers. Safe for server and client.
 *
 * Templates use `{name}` placeholders. Unknown keys are left as-is.
 */
export function applySeoTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value == null || value === '' ? match : value;
  });
}

export function clipSeo(text: string, max: number): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
