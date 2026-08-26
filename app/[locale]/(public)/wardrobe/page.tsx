import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

/** Wardrobe UI is paused — permanent redirect handled in next.config; keep route as soft fallback. */
export async function generateMetadata(): Promise<Metadata> {
  return { robots: { index: false, follow: false } };
}

export default async function WardrobePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}`);
}
