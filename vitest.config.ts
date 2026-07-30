import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Vitest config — focuses on pure server-side modules (validators, guards).
 * Component / E2E tests can extend this later with jsdom or playwright.
 *
 * `server-only` is a Next.js shim that throws when imported in client code.
 * We stub it as an empty module here so test files can import server
 * utilities without bringing the full Next runtime in.
 */
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'server-only': path.resolve(__dirname, 'tests/_stubs/server-only.ts')
    }
  }
});
