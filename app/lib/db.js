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

// --- Transient retry ala NEXO (audit VPS 2 Nov 2026) ---------------------
// Turso lewat jaringan: blip (fetch failed / ECONNRESET / timeout) sering
// sekali lewat. Tanpa retry, satu blip = 500 / halaman "Gangguan". Semua
// execute() dibungkus retry 3x dengan jeda 300ms; error BUKAN jaringan
// (SQL salah, tabel tidak ada) tidak diulang supaya request gagal tidak
// jadi lambat.
const TRANSIENT = /ConnectTimeout|fetch failed|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up|Connection terminated|timeout|too many connections|busy|locked/i;
function withTransientRetry(client) {
  for (const name of ['execute', 'executeMultiple']) {
    const orig = client[name].bind(client);
    client[name] = async (...args) => {
      for (let i = 0; i < 3; i++) {
        try {
          return await orig(...args);
        } catch (e) {
          const msg = String(e?.message) + ' ' + String(e?.cause?.message);
          if (i === 2 || !TRANSIENT.test(msg)) throw e;
          await new Promise((res) => setTimeout(res, 300 * (i + 1)));
        }
      }
    };
  }
  return client;
}

let _db = null;

export function getDb() {
  if (_db) return _db;
  const url = process.env.TURSO_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (url && url.startsWith('libsql://')) {
    _db = withTransientRetry(createClient({ url, authToken: token || undefined }));
  } else {
    // Dev lokal: file SQLite di folder .data/. Folder HARUS dibuat dulu -
    // libsql tidak membuat folder sendiri dan gagal CANTOPEN kalau hilang.
    const file = resolve('.data/noxa-web.db');
    mkdirSync(dirname(file), { recursive: true });
    _db = withTransientRetry(createClient({ url: `file:${file}` }));
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

    -- Tren harian untuk grafik panel admin. SATU baris per hari kalender
    -- (day = tanggal UTC 00:00 dalam ms). Di-upsert tiap bot push snapshot,
    -- menyimpan nilai MAKSIMUM sepanjang hari (total plays/durasi/server
    -- bersifat kumulatif, jadi maksimum = angka akhir hari). Sumber
    -- kebenaran tetap SQLite bot; ini cuma ringkasan ringan untuk grafik.
    CREATE TABLE IF NOT EXISTS stat_history (
      day           INTEGER PRIMARY KEY,
      ts            INTEGER NOT NULL,
      servers       INTEGER NOT NULL DEFAULT 0,
      listeners     INTEGER NOT NULL DEFAULT 0,
      plays         INTEGER NOT NULL DEFAULT 0,
      duration_sec  INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_sh_day ON stat_history(day);

    -- Inbox notifikasi USER (lonceng di navbar). Baris dengan discord_id NULL
    -- = broadcast ke semua user. Status baca per user disimpan di tabel
    -- web_notif_read supaya broadcast tidak perlu disalin per user.
    CREATE TABLE IF NOT EXISTS web_notifications (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id  TEXT,
      tipe        TEXT DEFAULT 'info',
      judul       TEXT NOT NULL,
      isi         TEXT,
      url         TEXT,
      created_at  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_wn_user ON web_notifications(discord_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_wn_created ON web_notifications(created_at);

    -- Status baca per user (dipakai untuk broadcast maupun personal).
    CREATE TABLE IF NOT EXISTS web_notif_read (
      discord_id   TEXT NOT NULL,
      notif_id     INTEGER NOT NULL,
      dibaca_at    INTEGER NOT NULL,
      PRIMARY KEY (discord_id, notif_id)
    );

    -- Notifikasi PANEL ADMIN: pembelian baru, feedback masuk, alert sistem.
    CREATE TABLE IF NOT EXISTS admin_notifications (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      tipe        TEXT DEFAULT 'info',
      judul       TEXT NOT NULL,
      isi         TEXT,
      url         TEXT,
      dibaca_at   INTEGER,
      created_at  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_an_created ON admin_notifications(created_at);

    -- Feedback / laporan dari user web (diteruskan bot ke channel Discord).
    CREATE TABLE IF NOT EXISTS web_feedback (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id  TEXT NOT NULL,
      username    TEXT,
      jenis       TEXT DEFAULT 'Saran',
      pesan       TEXT NOT NULL,
      halaman     TEXT,
      created_at  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_wf_created ON web_feedback(created_at);
  `);

  // Kolom ganti server (migrasi idempoten; error = kolom sudah ada)
  try {
    await db.execute('ALTER TABLE premium_subscriptions ADD COLUMN last_switch_at INTEGER');
  } catch {}
  try {
    await db.execute('ALTER TABLE transactions ADD COLUMN guild_name TEXT');
  } catch {}
  // Nama tampilan pelanggan (diisi saat aktivasi manual dari panel admin).
  try {
    await db.execute('ALTER TABLE premium_subscriptions ADD COLUMN username TEXT');
  } catch {}
}
