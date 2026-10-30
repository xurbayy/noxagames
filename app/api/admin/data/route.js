import { getAdminActor } from '../../../lib/session';
import { json } from '../../../lib/api-helpers';
import { getSnapshot, ageLabel, botAlive, totals, topSongs, topServers, topListeners, livePlayers, liveSummary } from '../../../lib/snapshot';

export const dynamic = 'force-dynamic';

// GET /api/admin/data - snapshot + ringkasan untuk panel admin (polling client).
export async function GET() {
  const admin = await getAdminActor();
  if (!admin) return json({ error: 'bukan admin' }, 403);

  const snap = await getSnapshot();
  if (!snap) {
    return json({ bot: { alive: false, ageLabel: 'belum ada data' }, totals: { servers: 0, listeners: 0, plays: 0, durationSec: 0 }, topSongs: [], topServers: [], topListeners: [], live: { players: [] } });
  }
  void botAlive;
  return json({
    bot: { alive: snap.ageSec * 1000 < 10 * 60 * 1000, ageSec: snap.ageSec, ageLabel: ageLabel(snap.ageSec) },
    totals: totals(snap.data),
    topSongs: topSongs(snap.data).slice(0, 10),
    topServers: topServers(snap.data).slice(0, 10),
    topListeners: topListeners(snap.data).slice(0, 10),
    live: { ...liveSummary(snap.data), players: livePlayers(snap.data) },
  });
}
