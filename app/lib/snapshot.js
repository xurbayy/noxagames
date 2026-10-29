// Snapshot bridge: data musik dari bot (push tiap 60 detik) di-cache di memori
// proses + fallback baris terbaru di DB. Kalau bot sedang offline, snapshot
// basi (<= 10 menit) tetap dilayani supaya halaman tidak kosong.
import { getDb, schemaReady } from './db';

const CACHE_MS = 30 * 1000;        // usia cache memori sebelum baca ulang DB
const STALE_MS = 10 * 60 * 1000;   // snapshot lebih tua dari ini = dianggap mati

let _mem = { data: null, dbTs: 0, readAt: 0 };

export function invalidateSnapshot() {
  _mem = { data: null, dbTs: 0, readAt: 0 };
}

/** Snapshot terakhir + usia detik, atau null kalau bot belum pernah push. */
export async function getSnapshot() {
  const now = Date.now();
  if (_mem.data && now - _mem.readAt < CACHE_MS) {
    return { data: _mem.data, ageSec: Math.floor((now - _mem.data.ts) / 1000) };
  }
  try {
    await schemaReady();
    const db = getDb();
    const res = await db.execute('SELECT ts, data FROM monitor_snapshots ORDER BY ts DESC LIMIT 1');
    if (!res.rows.length) return null;
    const ts = Number(res.rows[0].ts);
    let data;
    try { data = JSON.parse(res.rows[0].data); } catch { return null; }
    if (!data || typeof data !== 'object') return null;
    _mem = { data, dbTs: ts, readAt: now };
    return { data, ageSec: Math.floor((now - ts) / 1000) };
  } catch {
    // DB gagal -> pakai cache memori kalau ada walau basi.
    if (_mem.data) return { data: _mem.data, ageSec: Math.floor((now - _mem.data.ts) / 1000) };
    return null;
  }
}

/** Apakah bot bridge hidup (snapshot masih segar). */
export function botAlive(snap) {
  if (!snap) return false;
  return snap.ageSec * 1000 < STALE_MS;
}

// ---------- Normalisasi bentuk data (bot bisa kirim field kosong/null) ----------

function arr(v) { return Array.isArray(v) ? v : []; }

/** Angka total dengan default 0. */
export function totals(snapData) {
  const t = snapData?.totals || {};
  return {
    servers: Number(t.servers) || 0,
    listeners: Number(t.listeners) || 0,
    plays: Number(t.plays) || 0,
    durationSec: Number(t.durationSec) || 0,
  };
}

export function topSongs(snapData) { return arr(snapData?.topSongs); }
export function topServers(snapData) { return arr(snapData?.topServers); }
export function topListeners(snapData) { return arr(snapData?.topListeners); }

/** Player live: hanya server yang sedang memutar sesuatu. */
export function livePlayers(snapData) {
  return arr(snapData?.live?.players);
}

export function liveSummary(snapData) {
  const live = snapData?.live || {};
  return {
    active: Boolean(live.active),
    playingServers: arr(live.players).length,
    listeners: Number(live.listeners) || 0,
    botPingMs: Number(live.botPingMs) || null,
    uptimeSec: Number(live.uptimeSec) || null,
  };
}

// ---------- Format (implementasi murni ada di lib/format.js, re-export di
// sini supaya server component bisa import semuanya dari satu tempat) ----------
export { durasi, formatDuration, ageLabel } from './format';
