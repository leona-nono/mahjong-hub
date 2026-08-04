import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
