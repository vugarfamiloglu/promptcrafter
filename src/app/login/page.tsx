'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/Brand';
import { PasswordInput } from '@/components/PasswordInput';
import { toast } from '@/components/Toaster';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={<div className="plate p-8 w-full max-w-md">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const next   = useSearchParams().get('next') || '/';
  const [passcode, setPasscode] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/auth', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      router.push(next);
    } catch (e: any) {
      toast('error', e.message || 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="plate w-full max-w-md p-8">
      <div className="flex items-center gap-3 mb-1">
        <Logo size={36} />
        <div>
          <div className="font-display text-[22px] font-bold leading-none">PromptCrafter</div>
          <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[.18em] mt-1">workbench</div>
        </div>
      </div>
      <p className="text-ink-3 text-[13px] mt-4 mb-6">
        Enter the workspace passcode. The default is{' '}
        <code className="font-mono px-1.5 py-0.5 bg-bg text-ink-1 rounded">craft-2026</code>{' '}
        — change it by setting <code className="font-mono">PC_PASSCODE_HASH</code> in <code className="font-mono">.env.local</code>.
      </p>
      <label className="label-caps block mb-2">Passcode</label>
      <PasswordInput value={passcode} onChange={setPasscode} placeholder="••••••••" autoFocus />
      <button type="submit" className="btn btn-primary w-full mt-5" disabled={busy || !passcode}>
        {busy ? <><span className="spinner" /> Unlocking…</> : 'Unlock workbench'}
      </button>
    </form>
  );
}
