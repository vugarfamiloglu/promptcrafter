/* GET  /api/providers — list keys (mask the secret)
 * POST /api/providers — create or replace a key (encrypt at rest) */
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { insertProviderKey, listProviderKeys } from '@/lib/db';
import { encryptString, maskSecret, decryptString } from '@/lib/crypto';
import { PROVIDER_INFO, type Provider } from '@/lib/providers';

export async function GET() {
  const rows = listProviderKeys().map((r) => ({
    id:         r.id,
    provider:   r.provider,
    label:      r.label,
    model:      r.model,
    is_default: !!r.is_default,
    created_at: r.created_at,
    masked:     safeMask(r.key_encrypted),
  }));
  return NextResponse.json({ keys: rows });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const provider = String(body.provider || '') as Provider;
  if (!PROVIDER_INFO[provider]) {
    return NextResponse.json({ error: 'unknown provider' }, { status: 400 });
  }
  const apiKey = String(body.apiKey || '').trim();
  if (!apiKey || apiKey.length < 8) {
    return NextResponse.json({ error: 'API key looks empty or too short' }, { status: 400 });
  }
  const label   = String(body.label || PROVIDER_INFO[provider].label).slice(0, 80);
  const model   = body.model ? String(body.model).slice(0, 80) : PROVIDER_INFO[provider].defaultModel;
  const isDef   = body.makeDefault === false ? 0 : 1;
  const id      = randomUUID();
  insertProviderKey({
    id, provider, label, key_encrypted: encryptString(apiKey),
    model, is_default: isDef, created_at: Date.now(),
  });
  return NextResponse.json({ ok: true, id });
}

function safeMask(blob: string): string {
  try { return maskSecret(decryptString(blob)); } catch { return '••••••••'; }
}
