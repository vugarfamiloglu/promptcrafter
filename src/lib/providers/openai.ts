/* OpenAI Chat Completions + Whisper transcription. */
import type { ChatArgs, ChatResult } from './index';

const BASE = 'https://api.openai.com/v1';

export async function openaiChat(args: ChatArgs): Promise<ChatResult> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${args.apiKey}`,
      'content-type':  'application/json',
    },
    body: JSON.stringify({
      model:       args.model,
      temperature: args.temperature ?? 0.4,
      max_tokens:  args.maxTokens   ?? 4096,
      messages: [
        { role: 'system', content: args.system },
        { role: 'user',   content: args.user   },
      ],
    }),
  });
  if (!res.ok) {
    const body = await safeText(res);
    throw new Error(`OpenAI ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '';
  return { text, model: data.model || args.model };
}

export async function openaiTranscribe(apiKey: string, audio: Blob, language?: string): Promise<string> {
  const form = new FormData();
  form.append('file', audio, 'recording.webm');
  form.append('model', 'whisper-1');
  if (language) form.append('language', language);
  form.append('response_format', 'text');
  const res = await fetch(`${BASE}/audio/transcriptions`, {
    method:  'POST',
    headers: { 'authorization': `Bearer ${apiKey}` },
    body:    form,
  });
  if (!res.ok) {
    const body = await safeText(res);
    throw new Error(`Whisper ${res.status}: ${body.slice(0, 300)}`);
  }
  return (await res.text()).trim();
}

async function safeText(r: Response): Promise<string> {
  try { return await r.text(); } catch { return ''; }
}
