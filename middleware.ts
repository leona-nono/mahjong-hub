import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for static assets, api, and files with an extension.
  matcher: ['/', '/(en|zh|zh-TW|ja|ko)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
