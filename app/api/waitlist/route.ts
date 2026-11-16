import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import {
  isWaitlistHoneypot,
  normalizeWaitlistEmail,
  normalizeWaitlistLocale,
  normalizeWaitlistSource
} from '@/lib/waitlist';

export const dynamic = 'force-dynamic';

/**
 * Best-effort per-IP gap. A serverless instance does not share this map,
 * so two cold starts can both accept a burst. It only stops accidental
 * double-clicks on one running server.
 */
const LAST_WRITE_AT = new Map<string, number>();
const THROTTLE_MS = 5000;

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  if (first) return first;
  const real = request.headers.get('x-real-ip')?.trim();
  return real || 'unknown';
}

function hashIp(ip: string): string {
  const secret = process.env.AUTH_SECRET ?? '';
  return createHash('sha256').update(`${ip}${secret}`).digest('hex').slice(0, 16);
}

function tooFast(key: string): boolean {
  const now = Date.now();
  if (LAST_WRITE_AT.size > 1000) {
    for (const [saved, at] of LAST_WRITE_AT) {
      if (now - at >= THROTTLE_MS) LAST_WRITE_AT.delete(saved);
    }
  }
  const previous = LAST_WRITE_AT.get(key);
  if (previous !== undefined && now - previous < THROTTLE_MS) return true;
  LAST_WRITE_AT.set(key, now);
  return false;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const email = normalizeWaitlistEmail(record.email);
  if (!email) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const source = normalizeWaitlistSource(record.source);
  if (!source) {
    return NextResponse.json({ error: 'invalid_source' }, { status: 400 });
  }

  const locale = normalizeWaitlistLocale(record.locale);

  if (isWaitlistHoneypot(record.website)) {
    return NextResponse.json({ ok: true });
  }

  const ipKey = hashIp(clientIp(request));
  if (tooFast(ipKey)) {
    return NextResponse.json({ error: 'too_fast' }, { status: 429 });
  }

  try {
    const existing = await prisma.waitlist.findUnique({ where: { email } });
    if (existing) {
      await prisma.waitlist.update({
        where: { email },
        data: { source, locale }
      });
      return NextResponse.json({ ok: true, existed: true });
    }

    await prisma.waitlist.create({
      data: { email, source, locale, ipHash: ipKey }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ ok: true, existed: true });
    }
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
