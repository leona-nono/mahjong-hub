import type { ReactNode } from 'react';
import '@/app/globals.css';

/** Minimal layout for /dev/* tools (outside [locale] tree). */
export default function DevLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-100 text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
