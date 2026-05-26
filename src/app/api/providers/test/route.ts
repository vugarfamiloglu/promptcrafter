/* POST /api/providers/test — verify a stored key by making a tiny round-trip. */
import { NextResponse } from 'next/server';
import { getProviderKey } from '@/lib/db';
import { decryptString } from '@/lib/crypto';
import { chat, type Provider, PROVIDER_INFO } from '@/lib/providers';

export async function POST(req: Request) {
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const row = getProviderKey(id);
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const provider = row.provider as Provider;
  const apiKey   = decryptString(row.key_encrypted);
  const model    = row.model || PROVIDER_INFO[provider].defaultModel;
  try {
    const r = await chat(provider, {
      apiKey, model,
      system: 'You are a one-word health-check probe.',
      user:   'Reply with exactly: ok',
      temperature: 0,
      maxTokens:   8,
    });
    return NextResponse.json({ ok: true, model: r.model, reply: r.text.slice(0, 40) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 200 });
  }
}
