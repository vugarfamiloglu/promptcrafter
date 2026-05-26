/* POST /api/transcribe — multipart form upload of an audio Blob → Whisper text. */
import { NextResponse } from 'next/server';
import { getDefaultProviderKey } from '@/lib/db';
import { decryptString } from '@/lib/crypto';
import { transcribe } from '@/lib/providers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const key = getDefaultProviderKey('openai');
  if (!key) {
    return NextResponse.json(
      { error: 'voice input needs an OpenAI key (Whisper) — add one in Settings' },
      { status: 412 },
    );
  }
  let form: FormData;
  try { form = await req.formData(); }
  catch { return NextResponse.json({ error: 'expected multipart/form-data' }, { status: 400 }); }

  const file = form.get('audio');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'field "audio" must be a file' }, { status: 400 });
  }
  const language = typeof form.get('language') === 'string' ? String(form.get('language')) : undefined;
  try {
    const apiKey = decryptString(key.key_encrypted);
    const text   = await transcribe('openai', apiKey, file, language);
    return NextResponse.json({ ok: true, text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'transcription failed' }, { status: 502 });
  }
}
