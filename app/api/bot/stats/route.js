import { verifyBearer, json, ready } from '../../../lib/api-helpers';
import { getDb } from '../../../lib/db';
import { invalidateSnapshot } from '../../../lib/snapshot';

export const dynamic = 'force-dynamic';

// POST /api/bot/stats - bot push snapshot tiap 60 detik (Bearer BOT_API_KEY).
//
// Optimasi penyimpanan (pelajaran dari web NEXO yang DB-nya bengkak 2,3 GB):
// snapshot identik yang ditumpuk tiap menit tidak berguna. Kita simpan MAKSIMAL
// 3 baris terbaru: baris baru masuk, baris di luar 3 terbaru dihapus. Data musik
// sumber kebenarannya ada di SQLite bot; tabel ini cuma cache baca web.
export async function POST(request) {
  const denied = verifyBearer(request, 'write');
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid json' }, 400);
  }
  if (!body || typeof body !== 'object') {
    return json({ ok: false, error: 'invalid body' }, 400);
  }

  try {
    await ready();
    const db = getDb();
    const ts = Number(body.ts) || Date.now();

    await db.execute({
      sql: 'INSERT INTO monitor_snapshots (ts, data) VALUES (?, ?)',
      args: [ts, JSON.stringify(body)],
    });
    // Buang snapshot basi di luar 3 terbaru.
    await db.execute(
      'DELETE FROM monitor_snapshots WHERE id NOT IN (SELECT id FROM monitor_snapshots ORDER BY ts DESC LIMIT 3)'
    ).catch(() => {});

    // --- Tren harian untuk grafik panel admin (upsert maksimum per hari UTC) ---
    // Snapshot bot = TOTAL kumulatif seluruh bot, jadi simpan MAKSIMUM per hari:
    // maksimum hari ini = angka akhir hari. Kalau bot reset dan total sempat
    // turun, maksimum lama tetap terpakai (grafik tidak turun-naik palsu).
    const tot = body.totals || {};
    const hPlays = Number(tot.plays) || 0;
    const hDurasi = Number(tot.durationSec) || 0;
    const hServer = Number(tot.servers) || 0;
    const hPendengar = Number(tot.listeners) || 0;
    if (hPlays > 0 || hDurasi > 0 || hServer > 0) {
      const day = Math.floor(ts / 86400000) * 86400000;
      await db.execute({
        sql: `INSERT INTO stat_history (day, ts, servers, listeners, plays, duration_sec)
              VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(day) DO UPDATE SET
                ts = excluded.ts,
                servers = MAX(servers, excluded.servers),
                listeners = MAX(listeners, excluded.listeners),
                plays = MAX(plays, excluded.plays),
                duration_sec = MAX(duration_sec, excluded.duration_sec)`,
        args: [day, ts, hServer, hPendengar, hPlays, hDurasi],
      }).catch(() => {});
      // Simpan 120 hari terakhir (ringan, cukup untuk grafik 7/30/90 hari).
      await db.execute({
        sql: 'DELETE FROM stat_history WHERE day < ?',
        args: [day - 120 * 86400000],
      }).catch(() => {});
    }

    // --- Heartbeat utk halaman /status publik ---
    // Bucket 30 menit: PUSH_MS=60s berarti 1 baris per ~30 push, bukan 1 per
    // menit (hemat). Celah antar-heartbeat di halaman status = insiden nyata
    // (bot mati / web down / bridge putus), bukan angka dekorasi.
    const bucket = Math.floor(ts / 1800000) * 1800000;
    await db.execute({
      sql: 'INSERT OR IGNORE INTO status_heartbeats (ts) VALUES (?)',
      args: [bucket],
    }).catch(() => {});
    await db.execute({
      sql: 'DELETE FROM status_heartbeats WHERE ts < ?',
      args: [bucket - 31 * 86400000],
    }).catch(() => {});

    invalidateSnapshot();
  } catch (e) {
    // Push tetap dianggap sukses kalau hanya penyimpanan cache yang gagal -
    // snapshot berikutnya 60 detik lagi mencoba lagi.
    return json({ ok: true, warn: String(e?.message || 'db error').slice(0, 120) });
  }

  return json({ ok: true });
}
