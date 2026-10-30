// DB web NOXA Sound: Turso (libSQL/SQLite cloud) dengan fallback file SQLite
// lokal untuk dev. Antarmuka tetap db.execute({sql,args}) + res.rows supaya
// semua query di web seragam (pola yang sama dengan web NEXO).
//
// Kenapa Turso: hosting Vercel itu serverless, file SQLite di disk tidak
// persisten antar instance. Turso = SQLite asli yang di-host, tier gratis,
// dan satu tempat yang sama untuk semua instance.
import { createClient } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

let _db = null;

export function getDb() {
  if (_db) return _db;
  const url = process.env.TURSO_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (url && url.startsWith('libsql://')) {
    _db = createClient({ url, authToken: token || undefined });
  } else {
    // Dev lokal: file SQLite di folder .data/. Folder HARUS dibuat dulu -
    // libsql tidak membuat folder sendiri dan gagal CANTOPEN kalau hilang.
    const file = resolve('.data/noxa-web.db');
    mkdirSync(dirname(file), { recursive: true });
    _db = createClient({ url: `file:${file}` });
  }
  return _db;
}

let _schemaReady = null;

export function schemaReady() {
  if (!_schemaReady) {
    _schemaReady = ensureSchema().catch((e) => {
      _schemaReady = null;
      throw e;
    });
  }
  return _schemaReady;
}

async function ensureSchema() {
  const db = getDb();
  await db.executeMultiple(`
    -- Snapshot terakhir dari bot (bridge push tiap 60 detik).
    -- Web hanya menyimpan beberapa titik terakhir, bukan history panjang:
    -- data musik sumber kebenarannya ada di SQLite bot, di sini cukup cache.
    CREATE TABLE IF NOT EXISTS monitor_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      data TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ms_ts ON monitor_snapshots(ts);

    -- Permintaan profil user: web minta, bot isi dari SQLite stats-nya lalu ack.
    CREATE TABLE IF NOT EXISTS data_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      data TEXT,
      created_at INTEGER NOT NULL,
      filled_at INTEGER,
      claimed_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_dr_status ON data_requests(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_dr_user ON data_requests(discord_id, created_at);

    -- Rate limit persisten (dibagi semua instance Vercel) untuk endpoint sensitif.
    CREATE TABLE IF NOT EXISTS rate_limit (
      bucket       TEXT NOT NULL,
      window_start INTEGER NOT NULL,
      hits         INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (bucket, window_start)
    );
    CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON rate_limit(window_start);

    -- Transaksi pembayaran QiosPay (QRIS / Virtual Account)
    CREATE TABLE IF NOT EXISTS transactions (
      id                 TEXT PRIMARY KEY,
      discord_id         TEXT NOT NULL,
      username           TEXT,
      guild_id           TEXT,
      plan_id            TEXT NOT NULL,
      duration_months    INTEGER NOT NULL,
      amount             INTEGER NOT NULL,
      status             TEXT DEFAULT 'pending',
      qiospay_invoice_id TEXT,
      qris_url           TEXT,
      qris_string        TEXT,
      created_at         INTEGER NOT NULL,
      paid_at            INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_trx_user ON transactions(discord_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_trx_status ON transactions(status);

    -- Langganan premium aktif
    CREATE TABLE IF NOT EXISTS premium_subscriptions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id  TEXT NOT NULL,
      guild_id    TEXT,
      plan_id     TEXT NOT NULL,
      tier_name   TEXT NOT NULL,
      status      TEXT DEFAULT 'active',
      starts_at   INTEGER NOT NULL,
      expires_at  INTEGER NOT NULL,
      created_at  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sub_user ON premium_subscriptions(discord_id, status);
    CREATE INDEX IF NOT EXISTS idx_sub_guild ON premium_subscriptions(guild_id, status);
  `);

  // Kolom ganti server (migrasi idempoten; error = kolom sudah ada)
  try {
    await db.execute('ALTER TABLE premium_subscriptions ADD COLUMN last_switch_at INTEGER');
  } catch {}
  try {
    await db.execute('ALTER TABLE transactions ADD COLUMN guild_name TEXT');
  } catch {}
}
