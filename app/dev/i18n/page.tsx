import { notFound } from 'next/navigation';
import I18nStudioClient from '@/components/dev/I18nStudioClient';

export const dynamic = 'force-dynamic';

/**
 * Local-only multilingual Content Studio.
 * Production returns 404 (also blocked in middleware).
 */
export default function DevI18nStudioPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  return <I18nStudioClient />;
}
