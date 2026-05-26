/* -----------------------------------------------------------------------------
 * src/lib/integration-guides.ts — copy that explains, for each output kind,
 * exactly where to paste the artifact and how to invoke it afterwards.
 *
 * The stepper UI renders these on the result panel below the generated code.
 * -------------------------------------------------------------------------- */

export interface GuideStep {
  title: string;
  body:  string;            /* markdown-ish: backticks render as mono */
}

export interface Guide {
  kind:        'prompt' | 'claude-code' | 'powershell' | 'cmd';
  label:       string;
  description: string;
  steps:       GuideStep[];
}

export const GUIDES: Record<Guide['kind'], Guide> = {

  prompt: {
    kind: 'prompt',
    label: 'Use as a Claude / GPT prompt',
    description: 'Paste the XML-tagged prompt into the system / custom-instructions field of any chat assistant.',
    steps: [
      { title: 'Copy the generated prompt',
        body:  'Click `Copy` above. The full XML block is now in your clipboard.' },
      { title: 'Open your assistant',
        body:  'In Claude.ai go to **Projects → New project → Custom instructions**. In ChatGPT use the **Customize → Custom instructions** sidebar. In Gemini use **Saved Info**.' },
      { title: 'Paste and save',
        body:  'Paste into the instructions field, save, then start a new conversation in that project. The assistant now behaves as the role you crafted.' },
      { title: 'Iterate',
        body:  'If the assistant drifts, edit the `<constraints>` tag — that\'s the lever that anchors behaviour.' },
    ],
  },

  'claude-code': {
    kind: 'claude-code',
    label: 'Drop into Claude Code',
    description: 'A TypeScript tool that extends the Claude Code agent so it can perform this task on demand.',
    steps: [
      { title: 'Create the tools folder',
        body:  'From your project root run `mkdir -p .claude/tools` (Bash) or `New-Item -ItemType Directory -Force .claude/tools` (PowerShell).' },
      { title: 'Save the file',
        body:  'Click `Copy`, then save the contents as `.claude/tools/<name>.ts` (use the filename from the header comment).' },
      { title: 'Make required env vars available',
        body:  'Any `process.env.*` referenced in the code must be set in your shell profile (`~/.bashrc`, `~/.zshrc`, or PowerShell `$PROFILE`).' },
      { title: 'Restart Claude Code',
        body:  'Run `claude` from your project root. The new tool is auto-loaded and Claude can invoke it whenever the description matches your request.' },
    ],
  },

  powershell: {
    kind: 'powershell',
    label: 'Add to PowerShell $PROFILE',
    description: 'A reusable PowerShell function you can invoke from any new PowerShell session.',
    steps: [
      { title: 'Open your profile',
        body:  'In PowerShell run `notepad $PROFILE`. If it asks to create the file, click Yes.' },
      { title: 'Paste at the bottom',
        body:  'Click `Copy` and paste the function into the open file, then save.' },
      { title: 'Set any required environment variables',
        body:  'In the same profile, add `$env:VAR_NAME = "value"` for every variable listed in the USAGE block. Save.' },
      { title: 'Reload',
        body:  'Close the editor and run `. $PROFILE` in PowerShell. Type the function name to invoke it.' },
    ],
  },

  cmd: {
    kind: 'cmd',
    label: 'Install as a CMD command',
    description: 'A batch file you can call by name from any Command Prompt session.',
    steps: [
      { title: 'Save the file',
        body:  'Click `Copy`, then save the contents as `<skill>.bat` somewhere convenient — e.g. `C:\\Tools\\<skill>.bat`.' },
      { title: 'Add the folder to PATH',
        body:  'Open `System Properties → Environment Variables → Path → Edit → New` and add `C:\\Tools`. Click OK on every dialog. (Alternative: drop the .bat directly into `C:\\Windows\\System32`, which is already on PATH for admin users.)' },
      { title: 'Set any required environment variables',
        body:  'In the same Environment Variables window, add each variable listed in the USAGE block. Click OK.' },
      { title: 'Open a fresh CMD',
        body:  'Close all Command Prompt windows and open a new one (env-var changes need a fresh shell). Type the skill name to run it.' },
    ],
  },
};

export function guideFor(kind: Guide['kind']): Guide { return GUIDES[kind]; }
