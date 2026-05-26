/* Anthropic Messages API. */
import type { ChatArgs, ChatResult } from './index';

const BASE = 'https://api.anthropic.com/v1';
const API_VERSION = '2023-06-01';

export async function anthropicChat(args: ChatArgs): Promise<ChatResult> {
  const res = await fetch(`${BASE}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key':         args.apiKey,
      'anthropic-version': API_VERSION,
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:       args.model,
      system:      args.system,
      temperature: args.temperature ?? 0.4,
      max_tokens:  args.maxTokens   ?? 4096,
      messages: [{ role: 'user', content: args.user }],
    }),
  });
  if (!res.ok) {
    const body = await safeText(res);
    throw new Error(`Anthropic ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = (data.content || [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('\n');
  return { text, model: data.model || args.model };
}

async function safeText(r: Response): Promise<string> {
  try { return await r.text(); } catch { return ''; }
}
