'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    const t = (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
    setTheme(t);
  }, []);
  function flip() {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('pc-theme', next); } catch {}
    setTheme(next);
  }
  return (
    <button onClick={flip} className="btn btn-ghost btn-sm" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
      {theme === 'light' ? '◐' : '◑'} {theme === 'light' ? 'Dark' : 'Light'}
    </button>
  );
}
