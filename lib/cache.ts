/**
 * Public catalogue pages are static at the edge. Admin writes already call
 * `revalidatePath`, so a long ISR window cuts Vercel regenerations + Neon
 * round-trips without delaying CMS edits.
 */
export const PUBLIC_REVALIDATE_SECONDS = 86_400;
