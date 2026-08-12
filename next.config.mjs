import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }]
  },
  async redirects() {
    return [
      {
        // Beginner guides moved to the canonical /blog/ hub.
        source: '/:locale/games/beginners',
        destination: '/:locale/blog',
        permanent: true
      },
      {
        source: '/:locale/games/beginners/:slug',
        destination: '/:locale/blog/:slug',
        permanent: true
      }
    ];
  }
};

export default withNextIntl(nextConfig);
