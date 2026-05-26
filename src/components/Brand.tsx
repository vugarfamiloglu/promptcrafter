import Link from 'next/link';

/* The wordmark uses Space Grotesk for the display name and JetBrains Mono for
 * the slash-prefix that nods to the CLI feel. */
export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 select-none">
      <Logo />
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-[18px] font-bold leading-none text-ink-1">PromptCrafter</span>
        <span className="font-mono text-[10px] text-ink-3 uppercase tracking-[.18em]">/workbench</span>
      </div>
    </Link>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* outer plate */}
      <rect x="2.5" y="2.5" width="27" height="27" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-ink-2" />
      {/* corner brackets */}
      <path d="M5 5 L5 8 M5 5 L8 5" stroke="currentColor" strokeWidth="1.4" className="text-ink-3" />
      <path d="M27 5 L27 8 M27 5 L24 5" stroke="currentColor" strokeWidth="1.4" className="text-ink-3" />
      <path d="M5 27 L5 24 M5 27 L8 27" stroke="currentColor" strokeWidth="1.4" className="text-ink-3" />
      <path d="M27 27 L27 24 M27 27 L24 27" stroke="currentColor" strokeWidth="1.4" className="text-ink-3" />
      {/* P glyph — angled like a chevron + crossbar */}
      <path d="M11 10 L11 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent" />
      <path d="M11 10 L18 10 Q22 10 22 13.5 Q22 17 18 17 L11 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className="text-accent" />
      {/* spark dot — copper */}
      <circle cx="23.5" cy="22" r="1.6" fill="currentColor" className="text-copper" />
    </svg>
  );
}
