'use client';

import { useRef, useState } from 'react';
import { toast } from './Toaster';

interface Props {
  onTranscript: (text: string) => void;
  language?:    string;     /* ISO 639-1, e.g. "en", "az". Optional — Whisper auto-detects */
  disabled?:    boolean;
}

/* Browser MediaRecorder → POST to /api/transcribe (Whisper). */
export function VoiceRecorder({ onTranscript, language, disabled }: Props) {
  const [state, setState] = useState<'idle' | 'recording' | 'transcribing'>('idle');
  const recRef    = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream, { mimeType: pickMime() });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = onStopped;
      rec.start();
      recRef.current = rec;
      setState('recording');
    } catch (e: any) {
      toast('error', `Microphone error: ${e?.message || e}`);
    }
  }

  function stop() {
    recRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  async function onStopped() {
    setState('transcribing');
    const blob = new Blob(chunksRef.current, { type: recRef.current?.mimeType || 'audio/webm' });
    const form = new FormData();
    form.append('audio', blob, `recording.${(blob.type.split('/')[1] || 'webm').split(';')[0]}`);
    if (language) form.append('language', language);
    try {
      const res = await fetch('/api/transcribe', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      onTranscript(data.text || '');
      toast('success', 'Voice transcribed');
    } catch (e: any) {
      toast('error', e?.message || 'Transcription failed');
    } finally {
      setState('idle');
    }
  }

  if (state === 'transcribing') {
    return <button className="btn" disabled><span className="spinner" /> Transcribing…</button>;
  }
  if (state === 'recording') {
    return <button className="btn btn-danger" onClick={stop}>■ Stop</button>;
  }
  return (
    <button className="btn" onClick={start} disabled={disabled} title="Record your task with the microphone">
      ● Record
    </button>
  );
}

function pickMime(): string {
  /* Prefer formats Whisper handles natively. */
  for (const t of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}
