/* -----------------------------------------------------------------------------
 * src/lib/db.ts — single-file SQLite via better-sqlite3.
 *
 * Tables
 *   provider_keys  encrypted API keys per LLM / STT provider
 *   crafts         saved prompts + skills (history)
 *   settings       single-row key/value config (theme, default models …)
 * -------------------------------------------------------------------------- */

import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DB_PATH = process.env.PC_DB_PATH || resolve(process.cwd(), 'data', 'promptcrafter.db');

let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (_db) return _db;
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const handle = new Database(DB_PATH);
  handle.pragma('journal_mode = WAL');
  handle.pragma('foreign_keys = ON');
  bootstrap(handle);
  _db = handle;
  return handle;
}

function bootstrap(d: Database.Database) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS provider_keys (
      id            TEXT PRIMARY KEY,
      provider      TEXT NOT NULL,          -- 'openai' | 'anthropic' | 'gemini'
      label         TEXT NOT NULL,
      key_encrypted TEXT NOT NULL,
      model         TEXT,                   -- preferred default model for this key
      is_default    INTEGER NOT NULL DEFAULT 0,
      created_at    INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_provider_keys_provider ON provider_keys(provider);

    CREATE TABLE IF NOT EXISTS crafts (
      id          TEXT PRIMARY KEY,
      kind        TEXT NOT NULL,            -- 'prompt' | 'claude-code' | 'powershell' | 'cmd'
      domain      TEXT NOT NULL,
      task        TEXT NOT NULL,
      output      TEXT NOT NULL,            -- the crafted artifact (XML prompt / source code)
      guidance    TEXT,                     -- short rationale or install notes from the LLM
      provider    TEXT NOT NULL,
      model       TEXT NOT NULL,
      starred     INTEGER NOT NULL DEFAULT 0,
      created_at  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_crafts_created ON crafts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_crafts_kind    ON crafts(kind);

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

/* ── tiny typed wrappers ──────────────────────────────────────────────── */

export interface ProviderKeyRow {
  id: string; provider: string; label: string; key_encrypted: string;
  model: string | null; is_default: number; created_at: number;
}
export interface CraftRow {
  id: string; kind: string; domain: string; task: string; output: string;
  guidance: string | null; provider: string; model: string; starred: number; created_at: number;
}

export function listProviderKeys(): ProviderKeyRow[] {
  return db().prepare('SELECT * FROM provider_keys ORDER BY provider, created_at').all() as ProviderKeyRow[];
}
export function getProviderKey(id: string): ProviderKeyRow | undefined {
  return db().prepare('SELECT * FROM provider_keys WHERE id = ?').get(id) as ProviderKeyRow | undefined;
}
export function getDefaultProviderKey(provider: string): ProviderKeyRow | undefined {
  const row = db().prepare('SELECT * FROM provider_keys WHERE provider = ? AND is_default = 1').get(provider) as ProviderKeyRow | undefined;
  if (row) return row;
  /* Fallback: first one we created for this provider. */
  return db().prepare('SELECT * FROM provider_keys WHERE provider = ? ORDER BY created_at LIMIT 1').get(provider) as ProviderKeyRow | undefined;
}
export function insertProviderKey(row: ProviderKeyRow) {
  if (row.is_default) {
    db().prepare('UPDATE provider_keys SET is_default = 0 WHERE provider = ?').run(row.provider);
  }
  db().prepare(`
    INSERT INTO provider_keys (id, provider, label, key_encrypted, model, is_default, created_at)
    VALUES (@id, @provider, @label, @key_encrypted, @model, @is_default, @created_at)
  `).run(row);
}
export function setDefaultProviderKey(id: string) {
  const row = getProviderKey(id);
  if (!row) return;
  const tx = db().transaction((p: string, keyId: string) => {
    db().prepare('UPDATE provider_keys SET is_default = 0 WHERE provider = ?').run(p);
    db().prepare('UPDATE provider_keys SET is_default = 1 WHERE id = ?').run(keyId);
  });
  tx(row.provider, id);
}
export function deleteProviderKey(id: string) {
  db().prepare('DELETE FROM provider_keys WHERE id = ?').run(id);
}

export function listCrafts(limit = 100): CraftRow[] {
  return db().prepare('SELECT * FROM crafts ORDER BY created_at DESC LIMIT ?').all(limit) as CraftRow[];
}
export function getCraft(id: string): CraftRow | undefined {
  return db().prepare('SELECT * FROM crafts WHERE id = ?').get(id) as CraftRow | undefined;
}
export function insertCraft(row: CraftRow) {
  db().prepare(`
    INSERT INTO crafts (id, kind, domain, task, output, guidance, provider, model, starred, created_at)
    VALUES (@id, @kind, @domain, @task, @output, @guidance, @provider, @model, @starred, @created_at)
  `).run(row);
}
export function setCraftStar(id: string, starred: boolean) {
  db().prepare('UPDATE crafts SET starred = ? WHERE id = ?').run(starred ? 1 : 0, id);
}
export function deleteCraft(id: string) {
  db().prepare('DELETE FROM crafts WHERE id = ?').run(id);
}

export function getSetting(key: string): string | undefined {
  const row = db().prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value;
}
export function setSetting(key: string, value: string) {
  db().prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}
