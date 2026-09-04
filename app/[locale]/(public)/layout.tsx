import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPublicSiteSettings } from '@/lib/site-settings';

/**
 * Do not set alternates here — Next replaces parent alternates wholesale when a
 * child sets them, but pages that omit generateMetadata (or only set title)
 * would inherit this layout's homepage canonical/hreflang and emit wrong SEO.
 * Every public page must call pageMeta() / alternatesFor() itself.
 */
export default async function PublicLayout({ children }: { children: ReactNode }) {
  const site = getPublicSiteSettings();

  return (
    <>
      <Header siteTitle={site.siteTitle} />
      <div className="min-h-[calc(100vh-4rem)]">
        <main className="min-h-[calc(100vh-4rem-5rem)]">{children}</main>
        <Footer siteTitle={site.siteTitle} />
      </div>
    </>
  );
}
