'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';
import { ConfirmModal } from './ConfirmModal';

const TABS = [
  { href: '/',         label: 'Workbench' },
  { href: '/library',  label: 'Library' },
  { href: '/settings', label: 'Settings' },
];

export function NavBar() {
  const path   = usePathname();
  const router = useRouter();
  const [confirmOut, setConfirmOut] = useState(false);

  async function signOut() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  }

  return (
    <header className="border-b border-line bg-paper/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6">
        <Brand />
        <nav className="flex gap-1 ml-4">
          {TABS.map((t) => {
            const active = t.href === '/' ? path === '/' : path?.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`px-3 py-1.5 text-[13px] font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-accent text-accent'
                    : 'border-transparent text-ink-3 hover:text-ink-1'
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirmOut(true)}>Sign out</button>
        </div>
      </div>
      <ConfirmModal
        open={confirmOut}
        title="Sign out"
        message="You'll need to enter the passcode again on next visit."
        confirmText="Sign out"
        onCancel={() => setConfirmOut(false)}
        onConfirm={() => { setConfirmOut(false); signOut(); }}
      />
    </header>
  );
}
