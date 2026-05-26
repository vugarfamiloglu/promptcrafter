'use client';

/* The Workbench — main craft page. One screen: domain → task → output type
 * → Craft button → result card with integration guide. */

import { useEffect, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { DomainPicker } from '@/components/DomainPicker';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { CraftResult, type CraftResultData } from '@/components/CraftResult';
import { toast } from '@/components/Toaster';
import { PROVIDER_INFO, type Provider } from '@/lib/providers';
import type { Guide } from '@/lib/integration-guides';

type Kind = Guide['kind'];

const KINDS: Array<{ key: Kind; label: string; tag: string }> = [
  { key: 'prompt',      label: 'Prompt (XML)',     tag: 'Claude / GPT / Gemini' },
  { key: 'claude-code', label: 'Claude Code tool', tag: '.claude/tools/*.ts' },
  { key: 'powershell',  label: 'PowerShell',       tag: '.ps1 → $PROFILE' },
  { key: 'cmd',         label: 'CMD batch',        tag: '.bat → PATH' },
];

export default function WorkbenchPage() {
  const [domain,   setDomain]   = useState('programming');
  const [task,     setTask]     = useState('');
  const [kind,     setKind]     = useState<Kind>('prompt');
  const [provider, setProvider] = useState<Provider>('anthropic');
  const [keys,     setKeys]     = useState<Array<{ provider: string }>>([]);
  const [busy,     setBusy]     = useState(false);
  const [result,   setResult]   = useState<CraftResultData | null>(null);

  useEffect(() => {
    fetch('/api/providers').then((r) => r.json()).then((d) => setKeys(d.keys || [])).catch(() => {});
  }, []);

  const hasProviderKey = keys.some((k) => k.provider === provider);

  async function craft() {
    if (!task.trim()) { toast('warn', 'Describe your task first.'); return; }
    if (!hasProviderKey) {
      toast('warn', `Add a ${PROVIDER_INFO[provider].label} key in Settings first.`);
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const url  = kind === 'prompt' ? '/api/craft/prompt' : '/api/craft/skill';
      const body: Record<string, any> = { domain, task, provider };
      if (kind !== 'prompt') body.target = kind;
      const res  = await fetch(url, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult({
        id:       data.id,
        kind:     kind,
        output:   data.output,
        lang:     data.lang,
        usage:    data.usage,
        provider: data.provider,
        model:    data.model,
      });
      toast('success', 'Crafted!');
    } catch (e: any) {
      toast('error', e?.message || 'Craft failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <NavBar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="heading-1">Craft a prompt or a skill</h1>
          <p className="text-ink-3 mt-1">
            Pick the domain you work in, describe the task, choose the output target — get a paste-ready artifact.
          </p>
        </div>

        <section className="plate p-5 mb-5">
          <div className="label-caps mb-2">01 · Domain</div>
          <DomainPicker value={domain} onChange={setDomain} />
        </section>

        <section className="plate p-5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="label-caps">02 · Task</div>
            <VoiceRecorder onTranscript={(t) => setTask((prev) => (prev ? prev + ' ' + t : t))} />
          </div>
          <textarea
            className="textarea"
            placeholder="e.g. Audit a PHP/Laravel migration file for breaking changes, then propose a downgrade path with code snippets."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            rows={5}
          />
        </section>

        <section className="plate p-5 mb-5">
          <div className="label-caps mb-2">03 · Output target</div>
          <div className="pin-tabs">
            {KINDS.map((k) => (
              <button
                key={k.key}
                className={`pin-tab ${kind === k.key ? 'is-active' : ''}`}
                onClick={() => setKind(k.key)}
              >
                {k.label}
              </button>
            ))}
          </div>
          <p className="text-ink-3 text-[12px] mt-3 font-mono">→ {KINDS.find((k) => k.key === kind)?.tag}</p>
        </section>

        <section className="plate p-5 mb-5 flex flex-wrap gap-4 items-end">
          <div className="grow min-w-[180px]">
            <div className="label-caps mb-2">04 · Provider</div>
            <select className="select" value={provider} onChange={(e) => setProvider(e.target.value as Provider)}>
              {(Object.keys(PROVIDER_INFO) as Provider[]).map((p) => (
                <option key={p} value={p}>
                  {PROVIDER_INFO[p].label} {!keys.some((k) => k.provider === p) ? '· (no key)' : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            className={kind === 'prompt' ? 'btn btn-primary' : 'btn btn-copper'}
            onClick={craft}
            disabled={busy || !task.trim() || !hasProviderKey}
          >
            {busy ? <><span className="spinner" /> Crafting…</> : '⚙  Craft'}
          </button>
        </section>

        {!hasProviderKey && (
          <div className="plate plate--surface p-4 mb-5 border-l-4" style={{ borderLeftColor: 'var(--warn)' }}>
            <div className="font-semibold text-ink-1 mb-0.5">No {PROVIDER_INFO[provider].label} key configured</div>
            <div className="text-ink-3 text-[13px]">
              Open <a href="/settings" className="text-accent underline">Settings</a> to add one. Get a key from{' '}
              <a href={PROVIDER_INFO[provider].docs} target="_blank" rel="noreferrer" className="text-accent underline">
                {PROVIDER_INFO[provider].docs.replace(/^https?:\/\//, '')}
              </a>.
            </div>
          </div>
        )}

        {result && <CraftResult data={result} />}
      </main>
    </>
  );
}
