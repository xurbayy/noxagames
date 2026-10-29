import { getSession } from '../../lib/session';
import { json } from '../../lib/api-helpers';
import { getDb, schemaReady } from '../../lib/db';

export const dynamic = 'force-dynamic';

// GET /api/me - profil pendengar dari snapshot data_requests terbaru.
// Kalau profil basi (>10 menit) atau belum ada, kirim profile: null supaya
// client memanggil /api/me/refresh lalu polling di sini.
const PROFILE_STALE_MS = 10 * 60 * 1000;

export async function GET() {
  const session = await getSession();
  if (!session) return json({ error: 'belum login' }, 401);

  const user = { username: session.username, avatar: session.avatar };

  try {
    await schemaReady();
    const db = getDb();
    const res = await db.execute({
      sql: "SELECT id, status, data, created_at, filled_at FROM data_requests WHERE discord_id = ? ORDER BY created_at DESC LIMIT 1",
      args: [session.discordId],
    });
    const row = res.rows[0];
    if (!row) {
      return json({ user, profile: null, fresh: false });
    }
    if (row.status === 'done' && row.data) {
      let profile;
      try { profile = JSON.parse(row.data); } catch { profile = null; }
      const age = Date.now() - Number(row.filled_at || row.created_at);
      return json({ user, profile, fresh: age < PROFILE_STALE_MS });
    }
    return json({ user, profile: null, fresh: false, pending: true });
  } catch {
    return json({ user, profile: null, fresh: false });
  }
}
