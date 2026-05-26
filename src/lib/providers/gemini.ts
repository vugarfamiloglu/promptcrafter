/* Google Gemini generateContent. */
import type { ChatArgs, ChatResult } from './index';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

export async function geminiChat(args: ChatArgs): Promise<ChatResult> {
  const url = `${BASE}/models/${encodeURIComponent(args.model)}:generateContent?key=${encodeURIComponent(args.apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { role: 'system', parts: [{ text: args.system }] },
      contents: [{ role: 'user', parts: [{ text: args.user }] }],
      generationConfig: {
        temperature:      args.temperature ?? 0.4,
        maxOutputTokens:  args.maxTokens   ?? 4096,
      },
    }),
  });
  if (!res.ok) {
    const body = await safeText(res);
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? '';
  return { text, model: args.model };
}

async function safeText(r: Response): Promise<string> {
  try { return await r.text(); } catch { return ''; }
}
