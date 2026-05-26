'use client';

import { useEffect, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { PasswordInput } from '@/components/PasswordInput';
import { Modal } from '@/components/Modal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { toast } from '@/components/Toaster';
import { PROVIDER_INFO, type Provider } from '@/lib/providers';

interface KeyRow {
  id: string; provider: Provider; label: string; model: string | null;
  is_default: boolean; created_at: number; masked: string;
}

export default function SettingsPage() {
  const [rows, setRows] = useState<KeyRow[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => { refresh(); }, []);
  async function refresh() {
    const r = await fetch('/api/providers').then((r) => r.json()).catch(() => ({ keys: [] }));
    setRows(r.keys || []);
  }

  async function setDefault(id: string) {
    const res = await fetch(`/api/providers/${id}`, { method: 'PATCH' });
    if (res.ok) { toast('success', 'Default updated'); refresh(); }
  }

  async function test(id: string) {
    setTestingId(id);
    try {
      const r = await fetch('/api/providers/test', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }),
      }).then((r) => r.json());
      if (r.ok) toast('success', `Key works · ${r.model} replied "${r.reply}"`);
      else      toast('error', r.error || 'Test failed');
    } catch (e: any) {
      toast('error', e?.message || 'Test failed');
    } finally {
      setTestingId(null);
    }
  }

  async function confirmDelete() {
    if (!delId) return;
    await fetch(`/api/providers/${delId}`, { method: 'DELETE' });
    setDelId(null);
    refresh();
    toast('success', 'Key removed');
  }

  return (
    <>
      <NavBar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="heading-1 mb-1">Settings</h1>
        <p className="text-ink-3 mb-8">
          Your API keys are stored locally in <code className="font-mono">data/promptcrafter.db</code> encrypted with AES-256-GCM.
          They never leave this machine.
        </p>

        <section className="plate p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="label-caps mb-0.5">Provider keys</div>
              <h2 className="heading-2">LLM &amp; voice providers</h2>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add key</button>
          </div>

          {rows.length === 0 && (
            <div className="text-ink-3 text-[13px]">
              No keys configured. Add at least one — the workbench needs a provider key to call out to an LLM.
            </div>
          )}

          <div className="divide-y divide-line">
            {rows.map((r) => (
              <div key={r.id} className="py-3 flex items-center gap-4">
                <div className="w-32 shrink-0">
                  <div className="label-caps">{PROVIDER_INFO[r.provider].label}</div>
                  {r.is_default && <span className="font-mono text-[10px] text-accent">DEFAULT</span>}
                </div>
                <div className="grow min-w-0">
                  <div className="text-ink-1 font-medium text-[13.5px] truncate">{r.label}</div>
                  <div className="font-mono text-[12px] text-ink-3 truncate">
                    {r.masked} · model: {r.model || PROVIDER_INFO[r.provider].defaultModel}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!r.is_default && (
                    <button className="btn btn-sm btn-ghost" onClick={() => setDefault(r.id)}>Make default</button>
                  )}
                  <button className="btn btn-sm" onClick={() => test(r.id)} disabled={testingId === r.id}>
                    {testingId === r.id ? <><span className="spinner" /> Testing…</> : 'Test'}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => setDelId(r.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="plate p-5 mt-6">
          <div className="label-caps mb-1">Where these are used</div>
          <ul className="text-ink-2 text-[13px] space-y-2 mt-2">
            <li>· <strong>Prompt crafting</strong> uses whichever provider you pick on the workbench.</li>
            <li>· <strong>Skill crafting</strong> same as above. Anthropic + Claude Sonnet 4.5 tends to produce the cleanest tool code.</li>
            <li>· <strong>Voice transcription</strong> always uses your OpenAI key (Whisper). Add an OpenAI key to enable the mic button.</li>
          </ul>
        </section>
      </main>

      <AddKeyDialog open={showAdd} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); refresh(); }} />

      <ConfirmModal
        open={!!delId}
        title="Delete this key?"
        message="The encrypted record is removed from the local database. You can add the key back later if needed."
        confirmText="Delete"
        destructive
        onCancel={() => setDelId(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

function AddKeyDialog({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [provider, setProvider] = useState<Provider>('openai');
  const [apiKey,   setApiKey]   = useState('');
  const [label,    setLabel]    = useState('');
  const [model,    setModel]    = useState('');
  const [busy,     setBusy]     = useState(false);

  useEffect(() => {
    if (open) { setApiKey(''); setLabel(''); setModel(''); setProvider('openai'); }
  }, [open]);

  async function save() {
    if (!apiKey.trim()) { toast('warn', 'Paste the API key first'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider, apiKey: apiKey.trim(),
          label: label.trim() || `${PROVIDER_INFO[provider].label} key`,
          model: model.trim() || PROVIDER_INFO[provider].defaultModel,
          makeDefault: true,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
      toast('success', 'Saved (encrypted locally)');
      onSaved();
    } catch (e: any) {
      toast('error', e?.message || 'Save failed');
    } finally { setBusy(false); }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a provider key"
      actions={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? <><span className="spinner" /> Saving…</> : 'Save key'}
          </button>
        </>
      }
    >
      <label className="label-caps block mb-1">Provider</label>
      <select className="select mb-3" value={provider} onChange={(e) => setProvider(e.target.value as Provider)}>
        {(Object.keys(PROVIDER_INFO) as Provider[]).map((p) => (
          <option key={p} value={p}>{PROVIDER_INFO[p].label}</option>
        ))}
      </select>

      <label className="label-caps block mb-1">API key</label>
      <PasswordInput value={apiKey} onChange={setApiKey} placeholder={`paste your ${PROVIDER_INFO[provider].label} key`} />

      <div className="text-ink-3 text-[12px] mt-1.5">
        Get one at <a className="text-accent underline" href={PROVIDER_INFO[provider].docs} target="_blank" rel="noreferrer">
          {PROVIDER_INFO[provider].docs.replace(/^https?:\/\//, '')}
        </a>
      </div>

      <label className="label-caps block mt-4 mb-1">Label (optional)</label>
      <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Personal · Work · …" />

      <label className="label-caps block mt-3 mb-1">Default model</label>
      <select className="select" value={model || PROVIDER_INFO[provider].defaultModel} onChange={(e) => setModel(e.target.value)}>
        {PROVIDER_INFO[provider].models.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
    </Modal>
  );
}
