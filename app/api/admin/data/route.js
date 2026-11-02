import { getAdminActor } from '../../../lib/session';
import { json } from '../../../lib/api-helpers';
import { getDb, schemaReady } from '../../../lib/db';
import { getSnapshot, ageLabel, botAlive, totals, topSongs, topServers, topListeners, livePlayers, liveSummary } from '../../../lib/snapshot';

export const dynamic = 'force-dynamic';

// Tren 30 hari terakhir untuk grafik admin (baris stat_history per hari UTC).
// Kegagalan query tidak boleh mematikan polling panel - kembalikan [].
async function ambilHistory() {
  try {
    await schemaReady();
    const db = getDb();
    const res = await db.execute({
      sql: 'SELECT day, ts, servers, listeners, plays, duration_sec AS durationSec FROM stat_history ORDER BY day DESC LIMIT 30',
      args: [],
    });
    return res.rows
      .map((r) => ({
        day: Number(r.day),
        ts: Number(r.ts),
        servers: Number(r.servers) || 0,
        listeners: Number(r.listeners) || 0,
        plays: Number(r.plays) || 0,
        durationSec: Number(r.durationSec) || 0,
      }))
      .sort((a, b) => a.day - b.day);
  } catch {
    return [];
  }
}

// GET /api/admin/data - snapshot + ringkasan untuk panel admin (polling client).
export async function GET() {
  const admin = await getAdminActor();
  if (!admin) return json({ error: 'bukan admin' }, 403);

  const history = await ambilHistory();
  const snap = await getSnapshot();
  if (!snap) {
    return json({ bot: { alive: false, ageLabel: 'belum ada data' }, totals: { servers: 0, listeners: 0, plays: 0, durationSec: 0 }, topSongs: [], topServers: [], topListeners: [], live: { players: [] }, history });
  }
  void botAlive;
  return json({
    bot: { alive: snap.ageSec * 1000 < 10 * 60 * 1000, ageSec: snap.ageSec, ageLabel: ageLabel(snap.ageSec) },
    totals: totals(snap.data),
    topSongs: topSongs(snap.data).slice(0, 10),
    topServers: topServers(snap.data).slice(0, 10),
    topListeners: topListeners(snap.data).slice(0, 10),
    live: { ...liveSummary(snap.data), players: livePlayers(snap.data) },
    history,
  });
}
