import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SITE_BASE_URL, LANGUAGE_ALTERNATES } from '@/lib/seo';

// Homepage fallback metadata. The homepage has no page-level generateMetadata
// (a page-level `alternates` on the `[locale]` index route does not emit its
// `languages` in Next 15.5), so its canonical + hreflang live here instead.
// Non-homepage pages override this with their own per-path alternates.
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

// 公共页面布局（路由组，不影响 URL）：承载站点 Header / Footer。
// 后台 app/[locale]/admin 不使用此布局，避免运营后台出现公共站点导航。
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
