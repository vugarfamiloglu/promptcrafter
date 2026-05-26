/* -----------------------------------------------------------------------------
 * src/lib/auth.ts — passcode-based lock screen.
 *
 * One workspace, one passcode. Bcrypt hash lives in PC_PASSCODE_HASH or
 * (for first-boot ergonomics) we compare against the literal default
 * "craft-2026" so a fresh clone runs immediately.
 *
 * Successful login mints a 30-day HMAC-signed cookie. Middleware (Edge
 * runtime) checks it on every non-public route — so everything in this file
 * must be Edge-safe: Web Crypto only, no `node:` imports, no Buffer.
 * -------------------------------------------------------------------------- */

import bcrypt from 'bcryptjs';

const DEFAULT_PASSCODE = 'craft-2026';
const COOKIE_NAME      = 'pc_session';
const TTL_MS           = 30 * 24 * 60 * 60 * 1000; /* 30 days */

function sessionSecret(): string {
  return process.env.PC_SESSION_SECRET || 'dev-session-secret-change-me-for-production';
}

export function cookieName(): string { return COOKIE_NAME; }

export async function verifyPasscode(input: string): Promise<boolean> {
  const hashed = process.env.PC_PASSCODE_HASH?.trim();
  if (hashed) {
    try { return await bcrypt.compare(input, hashed); }
    catch { return false; }
  }
  return input === DEFAULT_PASSCODE;
}

/* ── Edge-safe HMAC (Web Crypto + manual base64url) ─────────────────── */

function bytesToBase64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function base64urlDecode(s: string): string {
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  return atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
}
async function hmacSha256(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return bytesToBase64url(sig);
}

/** Mint a `payload.signature` cookie value valid for 30 days. */
export async function mintSessionToken(): Promise<string> {
  const payloadJson = JSON.stringify({ exp: Date.now() + TTL_MS });
  const payload     = bytesToBase64url(new TextEncoder().encode(payloadJson));
  const sig         = await hmacSha256(payload, sessionSecret());
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  const expectedSig = await hmacSha256(payload, sessionSecret());
  if (expectedSig !== sig) return false;
  try {
    const { exp } = JSON.parse(base64urlDecode(payload));
    return typeof exp === 'number' && exp > Date.now();
  } catch { return false; }
}

export function cookieAttributes(): string {
  return [
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${Math.floor(TTL_MS / 1000)}`,
  ].join('; ');
}

export function clearCookieAttributes(): string {
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
