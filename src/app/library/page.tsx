'use client';

import { useEffect, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { CraftResult, type CraftResultData } from '@/components/CraftResult';
import { ConfirmModal } from '@/components/ConfirmModal';
import { toast } from '@/components/Toaster';
import { DOMAINS, CUSTOM_DOMAIN } from '@/lib/domains';
import type { Guide } from '@/lib/integration-guides';

interface Row {
  id: string; kind: Guide['kind']; domain: string; task: string;
  provider: string; model: string; starred: boolean;
  created_at: number; preview: string;
}

const KIND_LABEL: Record<Guide['kind'], string> = {
  prompt:       'Prompt',
  'claude-code': 'Claude Code',
  powershell:   'PowerShell',
  cmd:          'CMD',
};

const KIND_BADGE: Record<Guide['kind'], string> = {
  prompt:       'bg-accent-soft text-accent',
  'claude-code': 'bg-copper-soft text-copper',
  powershell:   'bg-copper-soft text-copper',
  cmd:          'bg-copper-soft text-copper',
};

export default function LibraryPage() {
  const [rows,   setRows]   = useState<Row[]>([]);
  const [active, setActive] = useState<CraftResultData | null>(null);
  const [delId,  setDelId]  = useState<string | null>(null);
  const [query,  setQuery]  = useState('');
  const [kindF,  setKindF]  = useState<'all' | Guide['kind']>('all');

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    const r = await fetch('/api/crafts').then((r) => r.json()).catch(() => ({ crafts: [] }));
    setRows(r.crafts || []);
  }

  async function open(id: string) {
    const data = await fetch(`/api/crafts/${id}`).then((r) => r.json());
    if (data.error) { toast('error', data.error); return; }
    setActive({
      id: data.id, kind: data.kind, output: data.output,
      usage: data.usage, provider: data.provider, model: data.model,
    });
    document.getElementById('craft-detail')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function confirmDelete() {
    if (!delId) return;
    await fetch(`/api/crafts/${delId}`, { method: 'DELETE' });
    setDelId(null);
    if (active?.id === delId) setActive(null);
    refresh();
    toast('success', 'Deleted');
  }

  async function toggleStar(id: string, starred: boolean) {
    await fetch(`/api/crafts/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ starred }),
    });
    refresh();
  }

  const filtered = rows.filter((r) => {
    if (kindF !== 'all' && r.kind !== kindF) return false;
    if (query && !(`${r.task} ${r.domain} ${r.preview}`.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  function domainLabel(id: string): string {
    const d = DOMAINS.find((x) => x.id === id);
    return d ? d.label : CUSTOM_DOMAIN.label;
  }

  return (
    <>
      <NavBar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="heading-1">Library</h1>
            <p className="text-ink-3 mt-1">Every craft is saved here. Click to re-open the result.</p>
          </div>
          <div className="flex gap-2 items-center">
            <select className="select" value={kindF} onChange={(e) => setKindF(e.target.value as any)}>
              <option value="all">All kinds</option>
              {(Object.keys(KIND_LABEL) as Guide['kind'][]).map((k) => (
                <option key={k} value={k}>{KIND_LABEL[k]}</option>
              ))}
            </select>
            <input
              className="input"
              placeholder="search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: 200 }}
            />
          </div>
        </div>

        <div className="plate divide-y divide-line">
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-ink-3">No crafts match the filters.</div>
          )}
          {filtered.map((r) => (
            <div key={r.id} className="px-5 py-3 flex items-start gap-4 hover:bg-bg/40">
              <button onClick={() => toggleStar(r.id, !r.starred)} className="text-lg leading-none mt-0.5" title="Star">
                <span className={r.starred ? 'text-copper' : 'text-ink-4'}>{r.starred ? '★' : '☆'}</span>
              </button>
              <div className="grow min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${KIND_BADGE[r.kind]}`}>
                    {KIND_LABEL[r.kind].toUpperCase()}
                  </span>
                  <span className="label-caps">{domainLabel(r.domain)} · {r.provider} · {r.model}</span>
                  <span className="text-ink-4 text-[11px] ml-auto">{new Date(r.created_at).toLocaleString()}</span>
                </div>
                <div className="text-ink-1 text-[13.5px] font-medium truncate">{r.task}</div>
                <div className="text-ink-3 text-[12px] font-mono truncate mt-0.5">{r.preview}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button className="btn btn-sm" onClick={() => open(r.id)}>Open</button>
                <button className="btn btn-sm btn-danger" onClick={() => setDelId(r.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div id="craft-detail">
          {active && <CraftResult data={active} />}
        </div>
      </main>

      <ConfirmModal
        open={!!delId}
        title="Delete this craft?"
        message="This permanently removes the artifact. The integration in your shell stays intact — only the saved copy here is removed."
        confirmText="Delete"
        destructive
        onCancel={() => setDelId(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
