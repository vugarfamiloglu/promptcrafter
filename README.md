# PromptCrafter

> A workbench that turns a one-sentence task into either a Claude-grade XML prompt or a paste-and-run CLI skill (Claude Code tool · PowerShell function · CMD batch). Bring your own API key — OpenAI, Anthropic, or Google Gemini. Voice in, code out.

```
┌────────────────────────────────────────────────────────────────────────┐
│  Browser  (http://localhost:4747)                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Workbench       Library       Settings              Dark / Light │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ 01 · Domain   ⌘ Programming  ∑ Data  § Law  ✚ Medicine  …         │  │
│  │ 02 · Task     [ textarea + 🎙 record ]                            │  │
│  │ 03 · Output   PROMPT │ CLAUDE-CODE │ POWERSHELL │ CMD             │  │
│  │ 04 · Provider [ openai · anthropic · gemini ]    [ Craft ]        │  │
│  │ ── Result ────────────────────────────────────────────────────── │  │
│  │  ⎘ Copy  ↓ Save   ┌─ <role> ─ <task> ─ <output_format> … ─┐      │  │
│  │                   └──────────────────────────────────────┘      │  │
│  │  Integration guide                                                │  │
│  │  01  Open your assistant   02  Paste into Custom Instructions …   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─┬────────────────────────────────────────────────────────────────────┬─┘
  │  REST /api/craft/{prompt,skill}   /api/transcribe  /api/providers  │
  ▼                                                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Next.js 15 server (App Router, single process)                          │
│  ── lib/providers/{openai,anthropic,gemini}.ts  pluggable LLM dispatch   │
│  ── lib/crypto.ts        AES-256-GCM key vault                           │
│  ── lib/db.ts            better-sqlite3 (provider_keys, crafts, settings)│
│  ── lib/auth.ts          bcrypt passcode → HMAC session cookie           │
│  ── lib/craft-prompt.ts  meta-prompt that produces Claude-style XML      │
│  ── lib/craft-skill.ts   meta-prompts for 3 CLI runtimes + parser        │
└──────────────────────────────────────────────────────────────────────────┘
```

## Why

Most teams write the same prompt twenty times: same role boilerplate, same XML scaffolding, same "remember to cite sources" reminders. And every time someone wants to automate a tiny task they end up Googling PowerShell syntax for an hour.

PromptCrafter collapses both flows into one screen: pick the domain, describe the task once (typing or talking), and get either:

| Target | What you get |
|--------|--------------|
| **Prompt** | A Claude-flavoured XML prompt (`<role>` `<context>` `<task>` `<output_format>` `<constraints>` `<examples>`) ready to paste into Claude.ai's *Project / Custom Instructions* field, ChatGPT's *Customize*, or Gemini's *Saved Info*. |
| **Claude Code tool** | A self-contained TypeScript module you drop into `.claude/tools/<name>.ts` — Claude Code auto-loads it on next launch. |
| **PowerShell** | A `Verb-Noun` cmdlet using `[CmdletBinding()]`, validated params and `Write-Verbose` progress. Paste into `$PROFILE`. |
| **CMD batch** | A `.bat` with `setlocal EnableDelayedExpansion`, arg-parsing loop, and explicit exit codes. Drop on `PATH`. |

Every result comes with a **step-by-step integration guide** rendered right below the code block, so non-developers can install and invoke the skill without leaving the page.

## Architecture

```
PromptCrafter/
├── src/
│   ├── app/
│   │   ├── page.tsx                  ⌘ Workbench    (the main craft screen)
│   │   ├── library/page.tsx          📚 Library      (history of crafts)
│   │   ├── settings/page.tsx         ⚙ Settings      (provider keys CRUD)
│   │   ├── login/page.tsx            🔒 Lock screen  (passcode)
│   │   ├── layout.tsx                root layout + theme bootstrap
│   │   ├── globals.css               Workbench theme (light/dark blueprint)
│   │   └── api/
│   │       ├── auth/route.ts                  passcode → cookie
│   │       ├── craft/prompt/route.ts          generate Claude-grade XML prompt
│   │       ├── craft/skill/route.ts           generate CLI artifact
│   │       ├── transcribe/route.ts            Whisper STT
│   │       ├── providers/route.ts             list / create encrypted keys
│   │       ├── providers/[id]/route.ts        delete / set-default
│   │       ├── providers/test/route.ts        round-trip health check
│   │       ├── crafts/route.ts                history list
│   │       └── crafts/[id]/route.ts           one craft (get / star / delete)
│   ├── components/
│   │   ├── Brand.tsx · Logo                   wordmark + SVG glyph
│   │   ├── NavBar.tsx                         top-bar with sign-out
│   │   ├── DomainPicker.tsx                   16 curated domains + Custom
│   │   ├── VoiceRecorder.tsx                  MediaRecorder → /api/transcribe
│   │   ├── CodeBlock.tsx                      mono pre + copy/download
│   │   ├── CraftResult.tsx                    result panel + integration steps
│   │   ├── IntegrationStepper.tsx             ordered install guide
│   │   ├── Modal · ConfirmModal · PromptModal portal-rendered, ESC-closable
│   │   ├── PasswordInput.tsx                  reusable show/hide eye toggle
│   │   ├── ThemeToggle.tsx                    light ⇄ dark, localStorage
│   │   └── Toaster.tsx                        4-kind toast stack
│   ├── lib/
│   │   ├── db.ts                              better-sqlite3 + typed helpers
│   │   ├── crypto.ts                          AES-256-GCM vault + HMAC sign
│   │   ├── auth.ts                            bcrypt passcode + cookie token
│   │   ├── domains.ts                         16 personas + Custom
│   │   ├── craft-prompt.ts                    meta-prompt for XML output
│   │   ├── craft-skill.ts                     meta-prompts for 3 CLI targets
│   │   ├── integration-guides.ts              "where to paste" steps
│   │   └── providers/
│   │       ├── openai.ts                      chat completions + Whisper
│   │       ├── anthropic.ts                   messages API
│   │       ├── gemini.ts                      generateContent
│   │       └── index.ts                       provider registry + dispatcher
│   └── middleware.ts                          gate everything behind /login
├── data/                                      SQLite + .vault-key (gitignored)
├── public/                                    logo.svg, favicon.svg
├── package.json · tsconfig.json · next.config.mjs
├── tailwind.config.ts · postcss.config.js
├── .env.example                               keys + secrets template
└── README.md                                  this file
```

## Quick start

```bash
git clone <repo>
cd PromptCrafter
npm install
cp .env.example .env.local         # optional — defaults work for a single user
npm run dev                        # → http://localhost:4747
```

On first visit:

1. **Lock screen** — enter the default passcode `craft-2026` (set `PC_PASSCODE_HASH` in `.env.local` to change it).
2. **Settings** — add at least one provider key. The encrypted blob lives in `data/promptcrafter.db`; the key never leaves your machine.
3. **Workbench** — pick a domain, type or speak the task, choose an output target, hit **Craft**.

## Provider keys

| Provider | Where to get a key | Default model |
|----------|--------------------|---------------|
| Anthropic | https://console.anthropic.com/settings/keys | `claude-sonnet-4-5` |
| OpenAI | https://platform.openai.com/api-keys | `gpt-4o-mini` |
| Google Gemini | https://aistudio.google.com/apikey | `gemini-2.0-flash` |

Keys are encrypted at rest with AES-256-GCM using a 32-byte secret from `PC_VAULT_KEY` (or auto-generated and saved to `data/.vault-key` with mode `0600` on first boot).

Voice transcription always uses the OpenAI key (Whisper). Add an OpenAI key to enable the 🎙 button.

## REST surface

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/auth` | submit passcode → sets `pc_session` cookie |
| `DELETE` | `/api/auth` | sign out |
| `POST` | `/api/craft/prompt` | `{ domain, task, provider, model? }` → `{ output }` |
| `POST` | `/api/craft/skill` | `{ target, domain, task, provider, model? }` → `{ output, usage }` |
| `POST` | `/api/transcribe` | multipart `audio` → `{ text }` (Whisper) |
| `GET` | `/api/providers` | list keys (masked) |
| `POST` | `/api/providers` | `{ provider, apiKey, label?, model?, makeDefault? }` |
| `PATCH` | `/api/providers/:id` | mark as default for its provider |
| `DELETE` | `/api/providers/:id` | remove |
| `POST` | `/api/providers/test` | `{ id }` → round-trip health check |
| `GET` | `/api/crafts?limit=` | last N crafts (history) |
| `GET/PATCH/DELETE` | `/api/crafts/:id` | open / star / remove |

## Safety guarantees

- Every page + every `/api/*` route is gated by the lock-screen middleware.
- Provider keys are AES-256-GCM-encrypted before they touch disk.
- The session cookie is HMAC-signed (`PC_SESSION_SECRET`) and `HttpOnly · SameSite=Lax`.
- LLM responses are stored verbatim — no silent edits, no telemetry.
- `data/` is git-ignored. You'll never accidentally commit a key or a transcript.

## Theme

"Workbench" — bone-paper light mode with a faint graph-paper grid, deep-navy dark mode, electric-blue accents for prompts, copper for skills, Space Grotesk display + JetBrains Mono throughout. Sharp 4-px corners and corner brackets evoke an engineer's drawing.

## Screenshots

<img width="1903" height="868" alt="111" src="https://github.com/user-attachments/assets/c56479c0-696c-44de-b74f-764dc82f04b0" />

<img width="1015" height="707" alt="222" src="https://github.com/user-attachments/assets/d1036104-5ba0-4a11-999f-6355041b09b9" />

<img width="1000" height="333" alt="333" src="https://github.com/user-attachments/assets/239ce9b6-e851-4523-8b34-2913d5f99e56" />

## License

PromptCrafter is licensed under the **Apache License, Version 2.0** —
see [LICENSE](LICENSE) and [NOTICE](NOTICE).

> Copyright 2026 Vugar Familoglu &nbsp;·&nbsp; <vuqar.qenberov@gmail.com>

If you fork, redistribute, or build a derivative of PromptCrafter, the
License (section 4) requires you to:

1. Carry forward a copy of the **LICENSE** file.
2. Carry forward a readable copy of the **NOTICE** file — this is the line
   that ensures my authorship stays visible in your distribution.
3. Mark any modified files as changed.
4. Retain every copyright, patent, trademark and attribution notice present
   in the source.

Want to cite PromptCrafter in a paper, blog post or talk? GitHub renders a
"Cite this repository" button from [CITATION.cff](CITATION.cff) in BibTeX
and APA formats.
