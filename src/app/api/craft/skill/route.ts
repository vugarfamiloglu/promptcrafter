/* POST /api/craft/skill — turn (domain, task, target) into a CLI artifact. */
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getDefaultProviderKey, insertCraft } from '@/lib/db';
import { decryptString } from '@/lib/crypto';
import { chat, type Provider, PROVIDER_INFO } from '@/lib/providers';
import { findDomain } from '@/lib/domains';
import { buildSkillSystem, buildSkillUser, parseSkillReply, type SkillTarget } from '@/lib/craft-skill';

const VALID_TARGETS: SkillTarget[] = ['claude-code', 'powershell', 'cmd'];

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const task     = String(body.task     || '').trim();
  const domainId = String(body.domain   || 'custom');
  const target   = String(body.target   || '') as SkillTarget;
  const provider = String(body.provider || 'anthropic') as Provider;
  const modelOverride  = body.model ? String(body.model) : undefined;
  const suggestedName  = body.name  ? String(body.name)  : undefined;

  if (!task)                          return NextResponse.json({ error: 'task is required' }, { status: 400 });
  if (!VALID_TARGETS.includes(target)) return NextResponse.json({ error: 'invalid target' },   { status: 400 });
  if (!PROVIDER_INFO[provider])        return NextResponse.json({ error: 'unknown provider' }, { status: 400 });

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

  let raw;
  try {
    raw = await chat(provider, {
      apiKey, model,
      system: buildSkillSystem(target, domain),
      user:   buildSkillUser(task, suggestedName),
      temperature: 0.3,
      maxTokens:   3072,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'LLM call failed' }, { status: 502 });
  }
  const parsed = parseSkillReply(raw.text);

  const id = randomUUID();
  insertCraft({
    id, kind: target, domain: domain.id, task,
    output:   parsed.code,
    guidance: parsed.usage || null,
    provider, model: raw.model, starred: 0, created_at: Date.now(),
  });
  return NextResponse.json({
    id, kind: target, domain: domain.id, task,
    output: parsed.code, lang: parsed.lang, usage: parsed.usage,
    provider, model: raw.model,
  });
}
