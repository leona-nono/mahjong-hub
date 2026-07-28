import { NextRequest, NextResponse } from 'next/server';

/**
 * X OAuth2 redirect target. X sends `code` here; we can't read the PKCE
 * verifier from sessionStorage on the server, so we simply forward the code
 * back to the home page as a query param. The browser-side XCallbackHandler
 * then pairs it with the stored verifier and calls /api/auth/x/token.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');

  const url = new URL('/', req.url);
  if (code) {
    url.searchParams.set('x_code', code);
    if (state) url.searchParams.set('x_state', state);
  }
  return NextResponse.redirect(url);
}
