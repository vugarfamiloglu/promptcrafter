/* POST /api/auth — submit passcode; on success set the session cookie.
 * DELETE /api/auth — sign out. */
import { NextResponse } from 'next/server';
import { cookieAttributes, clearCookieAttributes, cookieName, mintSessionToken, verifyPasscode } from '@/lib/auth';

export async function POST(req: Request) {
  const { passcode } = await req.json().catch(() => ({}));
  if (typeof passcode !== 'string') {
    return NextResponse.json({ error: 'passcode required' }, { status: 400 });
  }
  const ok = await verifyPasscode(passcode);
  if (!ok) return NextResponse.json({ error: 'incorrect passcode' }, { status: 401 });
  const token = await mintSessionToken();
  const res = NextResponse.json({ ok: true });
  res.headers.set('set-cookie', `${cookieName()}=${token}; ${cookieAttributes()}`);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('set-cookie', `${cookieName()}=; ${clearCookieAttributes()}`);
  return res;
}
