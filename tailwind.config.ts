import type { Config } from 'tailwindcss';

/* ─── PromptCrafter — "Workbench" theme ──────────────────────────────────
 * A blueprint / engineering aesthetic: graph-paper backgrounds, sharp 4px
 * corners, corner-bracket accents, electric blue (light) and cyan (dark)
 * for primary actions, copper for the "skill" track. */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ink:    { 1: 'var(--ink-1)', 2: 'var(--ink-2)', 3: 'var(--ink-3)', 4: 'var(--ink-4)' },
        bg:     { DEFAULT: 'var(--bg)', paper: 'var(--paper)', surface: 'var(--surface)' },
        accent: { DEFAULT: 'var(--accent)', soft: 'var(--accent-soft)' },
        copper: { DEFAULT: 'var(--copper)', soft: 'var(--copper-soft)' },
        line:   'var(--line)',
        rule:   'var(--rule)',
        ok:     'var(--success)',
        warn:   'var(--warn)',
        err:    'var(--error)',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'Cascadia Mono', 'Consolas', 'monospace'],
      },
      letterSpacing: { caps: '0.16em' },
      borderRadius: { DEFAULT: '4px', sm: '2px', md: '4px', lg: '6px' },
      boxShadow: {
        plate:  '0 1px 0 var(--rule), 0 0 0 1px var(--line)',
        ring:   '0 0 0 2px var(--accent-soft)',
        lift:   '0 12px 32px rgba(11,18,32,.18)',
      },
      backgroundImage: {
        grid: 'var(--grid-image)',
      },
    },
  },
  plugins: [],
};
export default config;
