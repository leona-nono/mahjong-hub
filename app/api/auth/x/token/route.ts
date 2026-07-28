import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side PKCE token exchange for X (Twitter) OAuth2.
 * The browser sends the `code` (from the X redirect) plus the PKCE `verifier`
 * (stored in sessionStorage). We exchange them for an access token using the
 * CLIENT SECRET — which lives ONLY here, on the server, never in the bundle.
 */
export async function POST(req: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID;
  const secret = process.env.X_CLIENT_SECRET;
  if (!clientId || !secret) {
    return NextResponse.json({ error: 'X OAuth not configured' }, { status: 501 });
  }

  let code: string | undefined;
  let verifier: string | undefined;
  try {
    const body = await req.json();
    code = body.code;
    verifier = body.verifier;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  if (!code || !verifier) {
    return NextResponse.json({ error: 'Missing code or verifier' }, { status: 400 });
  }

  const redirectUri = `${new URL(req.url).origin}/api/auth/x/callback`;
  const basic = Buffer.from(`${clientId}:${secret}`).toString('base64');

  try {
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basic}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: verifier
      })
    });
    if (!tokenRes.ok) {
      const txt = await tokenRes.text();
      return NextResponse.json({ error: 'token exchange failed', detail: txt }, { status: 502 });
    }
    const token = await tokenRes.json();

    const meRes = await fetch(
      'https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username',
      { headers: { Authorization: `Bearer ${token.access_token}` } }
    );
    if (!meRes.ok) {
      return NextResponse.json({ error: 'userinfo failed' }, { status: 502 });
    }
    const me = await meRes.json();
    const u = me.data;

    return NextResponse.json({
      id: u.id,
      name: u.name ?? u.username ?? 'X User',
      email: '',
      avatar: u.profile_image_url,
      provider: 'x'
    });
  } catch (e) {
    return NextResponse.json({ error: 'x auth error', detail: String(e) }, { status: 500 });
  }
}
