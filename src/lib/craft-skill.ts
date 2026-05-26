/* -----------------------------------------------------------------------------
 * src/lib/craft-skill.ts — system prompts that turn a (domain, task) into an
 * executable CLI artifact for one of three runtimes:
 *
 *   claude-code  TypeScript tool that drops into  .claude/tools/
 *   powershell   .ps1 function added to the user's $PROFILE
 *   cmd          .bat script the user puts on PATH
 *
 * Each variant constrains the LLM tightly so the output is paste-and-run.
 * -------------------------------------------------------------------------- */

import type { Domain } from './domains';

export type SkillTarget = 'claude-code' | 'powershell' | 'cmd';

const COMMON_RULES = `Rules for your output:
- Output a single fenced code block followed by a "USAGE" section (also a fenced block, but containing 1–5 short lines explaining how to invoke the skill once installed).
- Do NOT add any explanation outside the two blocks. The installation steps are rendered separately by the host UI — do not duplicate them.
- The code must be runnable as-is with no TODOs, no placeholders, no commented-out branches.
- Validate inputs and fail with clear messages.
- Never hard-code API keys, paths, or user-specific values — read them from environment variables and document those vars in the USAGE block.
- Keep dependencies minimal. Prefer the runtime's standard library.`;

function personaBlock(domain: Domain): string {
  return `Domain hint for what this skill should accomplish:
${domain.persona}`;
}

export function buildSkillSystem(target: SkillTarget, domain: Domain): string {
  switch (target) {
    case 'claude-code':
      return `You are PromptCrafter — a specialist who writes self-contained custom tools for Claude Code (Anthropic's official terminal coding agent).

The user will describe a task. Produce a single TypeScript file that defines a Claude Code tool.

The file must:
- Be a complete TypeScript module suitable for placing at .claude/tools/<name>.ts in the user's project.
- Export a default tool object with the shape:
    export default {
      name:         "snake_case_name",
      description:  "one sentence verb-first description that explains when Claude should use it",
      input_schema: { type: "object", properties: { ... }, required: [...] },
      async run(input) { /* implementation */ return { ok: true, result: ... }; }
    };
- Implement the actual work in run(). Do NOT call out to network APIs unless the task obviously requires it; prefer local file / shell operations.
- Use Node.js built-ins (node:fs/promises, node:path, node:child_process) — do not invent imports for libraries that may not be installed.

${personaBlock(domain)}

${COMMON_RULES}

Format your reply EXACTLY like this template:

\`\`\`typescript
// .claude/tools/<name>.ts
<full source>
\`\`\`

\`\`\`text
USAGE
<1–5 line invocation example showing how Claude would call the tool>
\`\`\``;

    case 'powershell':
      return `You are PromptCrafter — a specialist who writes Windows PowerShell automation scripts.

The user will describe a task. Produce a single PowerShell function that accomplishes it.

The function must:
- Be a complete .ps1 snippet ready to drop into the user's $PROFILE.
- Have a verb-noun name following PowerShell conventions (Get-, Set-, Invoke-, New-, …).
- Use [CmdletBinding()] and typed [Parameter()] declarations for arguments.
- Validate inputs with [ValidateNotNullOrEmpty()] / [ValidateSet(...)] where applicable.
- Pipe-friendly: accept input from the pipeline when it makes sense.
- Write progress with Write-Verbose, errors with Write-Error or throw; never use Write-Host for data output.
- Read secrets from $env:VAR_NAME and document those vars in the USAGE block.

${personaBlock(domain)}

${COMMON_RULES}

Format your reply EXACTLY like this template:

\`\`\`powershell
<full PowerShell function>
\`\`\`

\`\`\`text
USAGE
<1–5 line invocation example>
\`\`\``;

    case 'cmd':
      return `You are PromptCrafter — a specialist who writes Windows Command Prompt (.bat) automation scripts.

The user will describe a task. Produce a single batch file that accomplishes it.

The batch file must:
- Begin with @echo off and use setlocal EnableDelayedExpansion.
- Accept arguments via %1 %2 … or named flags parsed with a small loop.
- Validate inputs early; print usage and exit /b 1 on bad input.
- Prefer built-in CMD commands; only invoke external binaries (powershell, curl, git, …) when the task genuinely requires them.
- Read secrets from %ENV_VAR% and document those vars in the USAGE block.
- Always endlocal and exit /b <code> with an explicit exit code.

${personaBlock(domain)}

${COMMON_RULES}

Format your reply EXACTLY like this template:

\`\`\`bat
@echo off
<full batch script>
\`\`\`

\`\`\`text
USAGE
<1–5 line invocation example>
\`\`\``;
  }
}

export function buildSkillUser(task: string, suggestedName?: string): string {
  const name = suggestedName ? `\nSuggested skill name: ${suggestedName}` : '';
  return `Build a skill that accomplishes the following user task. Remember: output ONLY the two fenced blocks specified by the template — no preamble, no explanation, no extra prose.${name}

User task:
"""
${task.trim()}
"""`;
}

/* ── parser: split the LLM reply into { code, usage } ─────────────────── */

const FENCE = /```([a-zA-Z]*)\n([\s\S]*?)```/g;

export function parseSkillReply(raw: string): { code: string; lang: string; usage: string } {
  const blocks: Array<{ lang: string; body: string }> = [];
  for (const m of raw.matchAll(FENCE)) {
    blocks.push({ lang: (m[1] || '').toLowerCase(), body: m[2].trim() });
  }
  if (!blocks.length) {
    return { code: raw.trim(), lang: 'text', usage: '' };
  }
  const code  = blocks[0];
  const usage = blocks.find((b, i) => i > 0 && /^usage\b/i.test(b.body)) || blocks[1] || { body: '' };
  const usageBody = usage.body.replace(/^USAGE\s*\n?/i, '').trim();
  return { code: code.body, lang: code.lang || 'text', usage: usageBody };
}
