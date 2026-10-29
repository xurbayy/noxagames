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

    invalidateSnapshot();
  } catch (e) {
    // Push tetap dianggap sukses kalau hanya penyimpanan cache yang gagal -
    // snapshot berikutnya 60 detik lagi mencoba lagi.
    return json({ ok: true, warn: String(e?.message || 'db error').slice(0, 120) });
  }

  return json({ ok: true });
}
