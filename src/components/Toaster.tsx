'use client';

/* -----------------------------------------------------------------------------
 * components/Toaster.tsx — tiny event-bus toast system.
 *
 * Anywhere in the app:  toast('success', 'Saved.')  /  toast('error', e.message)
 * -------------------------------------------------------------------------- */

import { useEffect, useState } from 'react';

type Kind = 'success' | 'error' | 'info' | 'warn';
interface Item { id: number; kind: Kind; text: string; }

const listeners = new Set<(items: Item[]) => void>();
let items: Item[] = [];
let nextId = 1;

export function toast(kind: Kind, text: string, ttl = 3500) {
  const id = nextId++;
  items = [...items, { id, kind, text }];
  listeners.forEach((fn) => fn(items));
  setTimeout(() => {
    items = items.filter((i) => i.id !== id);
    listeners.forEach((fn) => fn(items));
  }, ttl);
}

export function Toaster() {
  const [stack, setStack] = useState<Item[]>([]);
  useEffect(() => {
    const fn = (next: Item[]) => setStack([...next]);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return (
    <div className="toast-stack">
      {stack.map((t) => (
        <div key={t.id} className={`toast t-${t.kind}`}>{t.text}</div>
      ))}
    </div>
  );
}
