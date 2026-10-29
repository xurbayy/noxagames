import { getSession } from '../../../lib/session';
import { json } from '../../../lib/api-helpers';
import { getDb, schemaReady } from '../../../lib/db';
import { dbRateLimit } from '../../../lib/rate-limit';

export const dynamic = 'force-dynamic';

// POST /api/me/refresh - antrekan bot mengirim ulang profil user.
// Rate limit 3x/menit per user via DB (dibagi semua instance).
export async function POST() {
  const session = await getSession();
  if (!session) return json({ ok: false, error: 'belum login' }, 401);

  try {
    await schemaReady();
    const db = getDb();
    const lolos = await dbRateLimit(db, `refresh:${session.discordId}`, 3, 60_000);
    if (!lolos) {
      return json({ ok: false, error: 'Terlalu sering. Coba lagi sebentar.' }, { status: 429 });
    }
    await db.execute({
      sql: "INSERT INTO data_requests (discord_id, status, created_at) VALUES (?, 'pending', ?)",
      args: [session.discordId, Date.now()],
    });
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: 'Gagal mengantrekan pembaruan.' }, { status: 500 });
  }
}
