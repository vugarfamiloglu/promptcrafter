/* POST /api/craft/prompt — turn (domain, task) into a polished XML prompt. */
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getDefaultProviderKey, insertCraft } from '@/lib/db';
import { decryptString } from '@/lib/crypto';
import { chat, type Provider, PROVIDER_INFO } from '@/lib/providers';
import { findDomain } from '@/lib/domains';
import { buildPromptSystem, buildPromptUser } from '@/lib/craft-prompt';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const task     = String(body.task     || '').trim();
  const domainId = String(body.domain   || 'custom');
  const provider = String(body.provider || 'anthropic') as Provider;
  const modelOverride = body.model ? String(body.model) : undefined;

  if (!task)                       return NextResponse.json({ error: 'task is required' }, { status: 400 });
  if (!PROVIDER_INFO[provider])    return NextResponse.json({ error: 'unknown provider' },  { status: 400 });

  const key = getDefaultProviderKey(provider);
  if (!key) {
    return NextResponse.json(
      { error: `no ${PROVIDER_INFO[provider].label} key configured — add one in Settings first` },
      { status: 412 },
    );
  }
  const apiKey = decryptString(key.key_encrypted);
  const model  = modelOverride || key.model || PROVIDER_INFO[provider].defaultModel;
  const domain = findDomain(domainId);

  let result;
  try {
    result = await chat(provider, {
      apiKey, model,
      system: buildPromptSystem(domain),
      user:   buildPromptUser(task),
      temperature: 0.4,
      maxTokens:   2048,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'LLM call failed' }, { status: 502 });
  }

  const id = randomUUID();
  insertCraft({
    id, kind: 'prompt', domain: domain.id, task,
    output:   result.text.trim(),
    guidance: null,
    provider, model: result.model, starred: 0, created_at: Date.now(),
  });
  return NextResponse.json({
    id, kind: 'prompt', domain: domain.id, task,
    output: result.text.trim(),
    provider, model: result.model,
  });
}
