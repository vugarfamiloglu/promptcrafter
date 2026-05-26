import { guideFor, type Guide } from '@/lib/integration-guides';

export function IntegrationStepper({ kind }: { kind: Guide['kind'] }) {
  const guide = guideFor(kind);
  return (
    <div className="plate plate--surface mt-4">
      <div className="px-4 py-3 border-b border-line">
        <div className="label-caps mb-1">Integration guide</div>
        <div className="font-display font-semibold text-ink-1">{guide.label}</div>
        <div className="text-ink-3 text-[12.5px] mt-0.5">{guide.description}</div>
      </div>
      <ol className="px-4 py-3 space-y-3">
        {guide.steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="font-mono text-accent font-semibold w-6 shrink-0 text-right">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <div className="font-semibold text-ink-1 text-[13px]">{s.title}</div>
              <div className="text-ink-2 text-[13px] mt-0.5" dangerouslySetInnerHTML={{ __html: renderInline(s.body) }} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* Render `code spans` and **bold** lightweight markdown without pulling a parser. */
function renderInline(s: string): string {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code class="font-mono px-1 py-0.5 bg-bg rounded text-[12px]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-ink-1">$1</strong>');
}
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]!));
}
