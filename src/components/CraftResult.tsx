'use client';

import { CodeBlock } from './CodeBlock';
import { IntegrationStepper } from './IntegrationStepper';
import type { Guide } from '@/lib/integration-guides';

export interface CraftResultData {
  id?:       string;
  kind:      Guide['kind'];
  output:    string;
  lang?:     string;
  usage?:    string;          /* only for skill kinds */
  provider:  string;
  model:     string;
}

export function CraftResult({ data }: { data: CraftResultData }) {
  const label = ({
    'prompt':       'Crafted prompt (XML)',
    'claude-code':  '.claude/tools/<name>.ts',
    'powershell':   '<skill>.ps1 (paste into $PROFILE)',
    'cmd':          '<skill>.bat',
  } as const)[data.kind];

  const lang = data.lang || ({
    'prompt': 'xml',
    'claude-code': 'typescript',
    'powershell':  'powershell',
    'cmd':         'bat',
  } as const)[data.kind];

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="heading-2">Result</h2>
        <div className="label-caps">{data.provider} · {data.model}</div>
      </div>
      <CodeBlock code={data.output} lang={lang} label={label} />
      {data.usage && (
        <div className="plate plate--surface mt-3 px-4 py-3">
          <div className="label-caps mb-1.5">Usage</div>
          <pre className="font-mono text-[12.5px] text-ink-2 whitespace-pre-wrap">{data.usage}</pre>
        </div>
      )}
      <IntegrationStepper kind={data.kind} />
    </section>
  );
}
