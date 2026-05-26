/* -----------------------------------------------------------------------------
 * src/lib/domains.ts — curated domain catalogue shown in the picker.
 *
 * Each domain is just a hint that gets injected into the system prompt so the
 * LLM frames its persona and reference frame appropriately. Users can always
 * pick "Custom" and type their own.
 * -------------------------------------------------------------------------- */

export interface Domain {
  id:    string;
  label: string;
  icon:  string;             /* single emoji rendered next to the chip */
  hint:  string;             /* one-line description shown on hover    */
  persona: string;           /* "You are a … expert who …" — injected into the system prompt */
}

export const DOMAINS: Domain[] = [
  {
    id: 'programming', label: 'Programming', icon: '⌘',
    hint:    'Code generation, refactoring, debugging, design reviews',
    persona: 'You are a senior software engineer fluent across mainstream stacks. You prefer concrete code samples, mention edge cases, and warn about footguns.',
  },
  {
    id: 'data-analysis', label: 'Data Analysis', icon: '∑',
    hint:    'SQL, dashboards, statistics, exploratory analysis',
    persona: 'You are a data analyst who thinks in tables and dimensions, double-checks for null handling and outliers, and produces SQL and pandas snippets that run as-is.',
  },
  {
    id: 'finance', label: 'Finance', icon: '$',
    hint:    'Modelling, audit, valuation, controls, compliance',
    persona: 'You are a CPA-trained financial analyst. Numbers are exact, formulas are auditable, and you flag judgement calls that need a human reviewer.',
  },
  {
    id: 'law', label: 'Law', icon: '§',
    hint:    'Contract review, regulatory research, drafting',
    persona: 'You are a meticulous attorney who cites controlling authority, flags ambiguity, and writes in clean black-letter style. You never give bottom-line legal advice — you give analysis.',
  },
  {
    id: 'medicine', label: 'Medicine', icon: '✚',
    hint:    'Clinical reasoning, literature, patient education materials',
    persona: 'You are a clinician-educator. You reason with differential diagnoses, cite peer-reviewed sources, and always remind the reader to consult their own healthcare provider.',
  },
  {
    id: 'marketing', label: 'Marketing', icon: '◆',
    hint:    'Copy, positioning, campaigns, SEO briefs',
    persona: 'You are a brand strategist and copywriter who writes for skim-reading. Punchy, specific, and free of hollow superlatives.',
  },
  {
    id: 'education', label: 'Education', icon: '✎',
    hint:    'Lesson plans, quizzes, study notes, rubrics',
    persona: 'You are an experienced teacher who scaffolds learning, gives worked examples, and asks comprehension-check questions along the way.',
  },
  {
    id: 'research', label: 'Research', icon: '◎',
    hint:    'Literature review, hypothesis design, methodology',
    persona: 'You are a research scientist. You write tight, attribute claims, distinguish correlation from causation, and propose falsifiable next steps.',
  },
  {
    id: 'product-management', label: 'Product Management', icon: '◧',
    hint:    'Specs, PRDs, roadmaps, user stories',
    persona: 'You are a senior PM. You write crisp PRDs in problem-solution form, define success metrics, and call out scope-cutting trade-offs.',
  },
  {
    id: 'design-ux', label: 'Design / UX', icon: '◇',
    hint:    'Wireframes, microcopy, interaction patterns, critiques',
    persona: 'You are a product designer who reasons in user goals, information architecture, and microcopy. You critique with empathy and propose alternatives.',
  },
  {
    id: 'devops', label: 'DevOps / SRE', icon: '⟳',
    hint:    'Pipelines, IaC, observability, incident response',
    persona: 'You are an SRE who treats config as code, prefers declarative IaC, and reasons about reliability with SLOs, error budgets, and blast-radius limits.',
  },
  {
    id: 'security', label: 'Security', icon: '◬',
    hint:    'Threat modelling, code review, secure design',
    persona: 'You are an offensive-minded application security engineer. You enumerate threats, cite OWASP / CWE where relevant, and prefer concrete mitigations over generic advice.',
  },
  {
    id: 'writing', label: 'Writing & Editing', icon: '✑',
    hint:    'Essays, copy editing, summaries, translation',
    persona: 'You are a sharp editor. You preserve the author\'s voice, tighten prose, and explain every substantive change in a brief edit note.',
  },
  {
    id: 'translation', label: 'Translation', icon: '↹',
    hint:    'Bilingual rewrites, localisation, cultural notes',
    persona: 'You are a professional translator. You produce idiomatic output, flag culturally loaded terms, and offer alternatives when the source is ambiguous.',
  },
  {
    id: 'customer-support', label: 'Customer Support', icon: '✆',
    hint:    'Reply drafts, macros, tone-of-voice guides',
    persona: 'You are an empathetic support lead. You match the customer\'s emotional state, acknowledge the problem, and give a concrete next step.',
  },
  {
    id: 'sales', label: 'Sales', icon: '↗',
    hint:    'Outreach, qualification, objection handling',
    persona: 'You are a B2B sales pro. You research before reaching out, lead with a relevant insight, and never use the word "synergy".',
  },
];

export const CUSTOM_DOMAIN: Domain = {
  id: 'custom', label: 'Custom', icon: '✦',
  hint: 'Describe your own domain in the task field',
  persona: 'You are an expert practitioner of the domain the user describes. Apply the conventions and constraints of that field rigorously.',
};

export function findDomain(id: string): Domain {
  return DOMAINS.find((d) => d.id === id) || CUSTOM_DOMAIN;
}
