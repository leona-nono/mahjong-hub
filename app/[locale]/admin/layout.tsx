import type { ReactNode } from 'react';
import '@/app/globals.css';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

// 后台布局：嵌套在 app/[locale]/layout.tsx 之下，因此【不能】再渲染
// <html>/<body>（根布局已提供）。这里只输出后台外壳（侧边栏 + 顶栏 + 内容区），
// 且不挂载公共站点的 Header/Footer。
export const metadata = {
  title: 'Admin · Mahjong Hub',
  robots: { index: false, follow: false }
};

// 后台是私有区：强制动态渲染，避免被静态预渲染 + CDN 缓存成 200 后
// 任何人都能直接访问（边缘 middleware 的重定向对缓存页面不可靠）。
export const dynamic = 'force-dynamic';

const NAV_ITEMS = (locale: string) => [
  { label: '概览', href: `/${locale}/admin`, icon: '📊' },
  { label: '游戏管理', href: `/${locale}/admin/games`, icon: '🎮' },
  { label: '站点设置', href: `/${locale}/admin/settings`, icon: '⚙️' },
  { label: 'i18n 文案', href: `/${locale}/admin/settings/i18n`, icon: '🌐' }
];

export default async function AdminLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 服务端会话校验：未登录一律重定向到对应语言的站点首页。
  // （当前尚无可用登录通道——OAuth 凭证未配、无独立登录页；配好后即可进入。）
  // auth() 在 NextAuth v5 为重载类型，故用 .catch 推导而非手写 ReturnType 注解。
  const session = await auth().catch(() => null);
  if (!session?.user) {
    redirect(`/${locale}?auth=required`);
  }

  const items = NAV_ITEMS(locale);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-gray-900 text-white">
        <div className="flex h-14 items-center px-5 text-lg font-bold tracking-wide">
          🀄️ Mahjong Hub
        </div>
        <nav className="mt-2 space-y-1 px-3">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-end border-b bg-white px-6 shadow-sm">
          <span className="text-sm text-gray-500">运营后台</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
