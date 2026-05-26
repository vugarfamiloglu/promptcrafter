/* -----------------------------------------------------------------------------
 * src/lib/providers/index.ts — common interface for LLM providers.
 *
 * Each provider exports a `chat({ apiKey, model, system, user })` async fn that
 * returns the plain-text completion. The dispatcher below routes calls to the
 * right provider based on `provider` name.
 * -------------------------------------------------------------------------- */

import { openaiChat, openaiTranscribe } from './openai';
import { anthropicChat }                from './anthropic';
import { geminiChat }                   from './gemini';

export type Provider = 'openai' | 'anthropic' | 'gemini';

export interface ChatArgs {
  apiKey:      string;
  model:       string;
  system:      string;
  user:        string;
  temperature?: number;
  maxTokens?:   number;
}
export interface ChatResult { text: string; model: string; }

export const PROVIDER_INFO: Record<Provider, { label: string; defaultModel: string; models: string[]; docs: string }> = {
  openai: {
    label:        'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models:       ['gpt-4o-mini', 'gpt-4o', 'o4-mini', 'gpt-4-turbo'],
    docs:         'https://platform.openai.com/api-keys',
  },
  anthropic: {
    label:        'Anthropic',
    defaultModel: 'claude-sonnet-4-5',
    models:       ['claude-sonnet-4-5', 'claude-opus-4-5', 'claude-haiku-4-5', 'claude-3-7-sonnet-latest'],
    docs:         'https://console.anthropic.com/settings/keys',
  },
  gemini: {
    label:        'Google Gemini',
    defaultModel: 'gemini-2.0-flash',
    models:       ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro'],
    docs:         'https://aistudio.google.com/apikey',
  },
};

export async function chat(provider: Provider, args: ChatArgs): Promise<ChatResult> {
  switch (provider) {
    case 'openai':    return openaiChat(args);
    case 'anthropic': return anthropicChat(args);
    case 'gemini':    return geminiChat(args);
    default: throw new Error(`unknown provider: ${provider}`);
  }
}

/** Voice transcription is only implemented for OpenAI Whisper today. */
export async function transcribe(provider: Provider, apiKey: string, audio: Blob, language?: string): Promise<string> {
  if (provider !== 'openai') {
    throw new Error('voice transcription currently requires an OpenAI key (Whisper)');
  }
  return openaiTranscribe(apiKey, audio, language);
}
