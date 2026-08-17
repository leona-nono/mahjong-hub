import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategorySidebar from '@/components/CategorySidebar';
import { SITE_BASE_URL, LANGUAGE_ALTERNATES } from '@/lib/seo';
import { getSiteSettings } from '@/lib/site-settings';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: {
      canonical: `${SITE_BASE_URL}/${locale}`,
      languages: LANGUAGE_ALTERNATES
    }
  };
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const site = await getSiteSettings();

  return (
    <>
      <Header siteTitle={site.siteTitle} />
      <div className="min-h-[calc(100vh-4rem)]">
        <CategorySidebar />
        <div className="md:pl-[var(--portal-sidebar-w)]">
          <main className="min-h-[calc(100vh-4rem-5rem)]">{children}</main>
          <Footer siteTitle={site.siteTitle} />
        </div>
      </div>
    </>
  );
}
