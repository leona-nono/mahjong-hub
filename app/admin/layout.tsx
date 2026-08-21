import type { ReactNode } from 'react';
import '@/app/globals.css';

/**
 * Admin layout — separate from the public locale routes.
 * No site Header/Footer, just sidebar + content area.
 * Keeps its own <html><body> because there is no root layout.tsx.
 */
export const metadata = {
  title: 'Admin · Mahjong Hub',
  robots: { index: false, follow: false }
};

const NAV_ITEMS = [
  { label: '概览', href: '/admin', icon: '📊' },
  { label: '游戏管理', href: '/admin/games', icon: '🎮' },
  { label: '外观与赛季', href: '/admin/appearance', icon: '🎨' },
  { label: '站点设置', href: '/admin/settings', icon: '⚙️' },
  { label: 'i18n 文案', href: '/admin/settings/i18n', icon: '🌐' }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-60 shrink-0 bg-gray-900 text-white">
            <div className="flex h-14 items-center px-5 text-lg font-bold tracking-wide">
              🀄️ Mahjong Hub
            </div>
            <nav className="mt-2 space-y-1 px-3">
              {NAV_ITEMS.map((item) => (
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
      </body>
    </html>
  );
}
