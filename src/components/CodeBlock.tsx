'use client';

import { useState } from 'react';
import { toast } from './Toaster';

interface Props {
  code:  string;
  lang?: string;
  label?: string;
}

export function CodeBlock({ code, lang, label }: Props) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast('success', 'Copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch (e: any) {
      toast('error', `Copy failed: ${e?.message || e}`);
    }
  }
  function download() {
    const ext = ({
      typescript: 'ts', powershell: 'ps1', bat: 'bat', text: 'txt', xml: 'xml',
    } as Record<string, string>)[lang || ''] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${(label || 'craft').replace(/\W+/g, '-')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="plate plate--surface">
      <div className="flex items-center justify-between px-3 py-2 border-b border-line">
        <span className="label-caps">{label || lang || 'output'}</span>
        <div className="flex gap-1">
          <button className="btn btn-sm btn-ghost" onClick={download}>↓ Save</button>
          <button className="btn btn-sm btn-primary" onClick={copy}>{copied ? '✓ Copied' : '⎘ Copy'}</button>
        </div>
      </div>
      <pre className="code-block scroll-y" style={{ border: 'none', borderRadius: 0, maxHeight: 560 }}>
        {code}
      </pre>
    </div>
  );
}
