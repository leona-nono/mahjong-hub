import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Twitter from 'next-auth/providers/twitter';
import Nodemailer from 'next-auth/providers/nodemailer';
import nodemailer from 'nodemailer';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import { authConfig } from './auth.config';
import { grantFirstLoginIfNeeded } from '@/lib/points-server';

/**
 * Auth.js (NextAuth v5) wiring.
 *
 * - session.strategy = 'database' means sessions persist in the Session table
 *   (clean revocation, no JWT cookies for OAuth-only sites). Prisma adapter
 *   handles User/Account/Session/VerificationToken rows automatically.
 *
 * - Providers are conditionally registered. This is important for local dev
 *   and preview deploys that do not have credentials yet: the API route still
 *   loads, but /api/auth/providers returns an empty object. Meanwhile the
 *   legacy mock login in lib/auth.tsx remains the only path (intentional
 *   for Phase 0: backend infra is shipped first, UI switches in Phase 1).
 *
 * - Email magic-link login is the mainland-China-friendly option (no OAuth
 *   app registration needed). Configure AUTH_EMAIL_SERVER (SMTP URL) +
 *   AUTH_EMAIL_FROM and the provider activates; the Prisma VerificationToken
 *   table stores the one-time login tokens.
 *
 * X (Twitter) uses Auth.js OAuth 2.0 with PKCE. Local development is
 * served on 127.0.0.1 so the callback exactly matches X's allowlist.
 */
const googleConfigured =
  !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;
const facebookConfigured =
  !!process.env.AUTH_FACEBOOK_ID && !!process.env.AUTH_FACEBOOK_SECRET;
const xConfigured = !!process.env.AUTH_X_ID && !!process.env.AUTH_X_SECRET;
const emailConfigured =
  !!process.env.AUTH_EMAIL_SERVER && !!process.env.AUTH_EMAIL_FROM;
const databaseConfigured = !!process.env.DATABASE_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === 'production' ? undefined : 'mahjong-hub-dev-insecure-secret'),
  ...(databaseConfigured
    ? { adapter: PrismaAdapter(prisma), session: { strategy: 'database' as const } }
    : { session: { strategy: 'jwt' as const } }),
  ...authConfig,
  events: {
    async signIn({ user }) {
      if (!user?.id) return;
      try {
        await grantFirstLoginIfNeeded(user.id);
      } catch (err) {
        console.error('[points] first_login grant on signIn failed', err);
      }
    }
  },
  providers: [
    ...(googleConfigured ? [Google] : []),
    ...(facebookConfigured ? [Facebook] : []),
    ...(xConfigured
      ? [
          Twitter({
            clientId: process.env.AUTH_X_ID!,
            clientSecret: process.env.AUTH_X_SECRET!,
          }),
        ]
      : []),
    ...(emailConfigured
      ? [
          Nodemailer({
            // Client LoginModal calls signIn('email'). Auth.js default id is
            // "nodemailer" — without this alias, magic-link never sends.
            id: 'email',
            name: 'Email',
            server: process.env.AUTH_EMAIL_SERVER!,
            from: process.env.AUTH_EMAIL_FROM!,
            maxAge: 24 * 60 * 60,
            async sendVerificationRequest({ identifier, url, provider }) {
              const { host } = new URL(url);
              const transport = nodemailer.createTransport(provider.server);
              try {
                const info = await transport.sendMail({
                  to: identifier,
                  from: provider.from,
                  subject: `Sign in to ${host}`,
                  text: `Sign in to ${host}\n\n${url}\n\nIf you didn't request this, you can ignore this email.`,
                  html: `<p>Sign in to <strong>${host}</strong></p><p><a href="${url}" style="display:inline-block;padding:10px 18px;background:#ef5b5b;color:#fff;border-radius:999px;text-decoration:none;font-weight:bold;">Sign in</a></p><p>If you didn't request this email, you can safely ignore it.</p>`
                });
                if (process.env.NODE_ENV !== 'production') {
                  console.info('[auth/email] sent', {
                    to: identifier,
                    messageId: info.messageId,
                    accepted: info.accepted,
                    rejected: info.rejected
                  });
                }
              } catch (err) {
                console.error('[auth/email] SMTP send failed', err);
                throw new Error('EMAIL_SEND_FAILED');
              }
            }
          })
        ]
      : [])
  ],
});
