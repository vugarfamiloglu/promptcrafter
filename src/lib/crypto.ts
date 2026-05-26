/* -----------------------------------------------------------------------------
 * src/lib/crypto.ts — AES-256-GCM at-rest encryption for provider API keys.
 *
 * The encryption key is loaded from PC_VAULT_KEY (base64 32 bytes). If absent
 * we auto-generate one and persist it next to the DB so the dev experience
 * doesn't break on first boot. Production deployments should always set the
 * env var explicitly so the key isn't on the same volume as the DB.
 * -------------------------------------------------------------------------- */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const KEY_LEN = 32;
const IV_LEN  = 12;
const TAG_LEN = 16;

let cachedKey: Buffer | null = null;

function loadKey(): Buffer {
  if (cachedKey) return cachedKey;
  const fromEnv = process.env.PC_VAULT_KEY?.trim();
  if (fromEnv) {
    const buf = Buffer.from(fromEnv, 'base64');
    if (buf.length !== KEY_LEN) throw new Error('PC_VAULT_KEY must decode to exactly 32 bytes');
    cachedKey = buf;
    return buf;
  }
  /* Fall back to a file next to the DB. Auto-create if missing. */
  const filePath = resolve(dirname(process.env.PC_DB_PATH || 'data/promptcrafter.db'), '.vault-key');
  if (existsSync(filePath)) {
    cachedKey = Buffer.from(readFileSync(filePath, 'utf8').trim(), 'base64');
    return cachedKey;
  }
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const fresh = randomBytes(KEY_LEN);
  writeFileSync(filePath, fresh.toString('base64'), { mode: 0o600 });
  cachedKey = fresh;
  return fresh;
}

/** Encrypts `plain` and returns a single base64 string of `iv || tag || ciphertext`. */
export function encryptString(plain: string): string {
  const key = loadKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString('base64');
}

/** Decrypts a value produced by `encryptString`. Throws if the auth tag fails. */
export function decryptString(blob: string): string {
  const key = loadKey();
  const buf = Buffer.from(blob, 'base64');
  if (buf.length < IV_LEN + TAG_LEN) throw new Error('ciphertext too short');
  const iv  = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ct  = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

/** Mask a secret for display, keeping the first 4 and last 4 chars. */
export function maskSecret(s: string): string {
  if (!s) return '';
  if (s.length <= 12) return '••••••••';
  return s.slice(0, 4) + '…' + s.slice(-4);
}
