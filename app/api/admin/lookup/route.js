import { getAdminSession } from '../../../lib/session';
import { json } from '../../../lib/api-helpers';
import { getDb, schemaReady } from '../../../lib/db';
import { dbRateLimit } from '../../../lib/rate-limit';

export const dynamic = 'force-dynamic';

// POST /api/admin/lookup {discordId} - antrekan pengambilan profil user.
// GET  /api/admin/lookup?discordId=... - ambil hasil profil terbaru user itu.
export async function POST(request) {
  const admin = await getAdminSession();
  if (!admin) return json({ ok: false, error: 'bukan admin' }, 403);

  let body;
  try { body = await request.json(); } catch {}
  const discordId = String(body?.discordId || '').replace(/\D/g, '');
  if (!/^\d{17,20}$/.test(discordId)) {
    return json({ ok: false, error: 'Discord ID harus 17 sampai 20 digit angka.' }, { status: 400 });
  }

  try {
    await schemaReady();
    const db = getDb();
    const lolos = await dbRateLimit(db, `lookup:${admin.adminDiscordId}`, 20, 60_000);
    if (!lolos) return json({ ok: false, error: 'Terlalu sering. Tunggu sebentar.' }, { status: 429 });
    await db.execute({
      sql: "INSERT INTO data_requests (discord_id, status, created_at) VALUES (?, 'pending', ?)",
      args: [discordId, Date.now()],
    });
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: 'Gagal mengantrekan lookup.' }, { status: 500 });
  }
}

export async function GET(request) {
  const admin = await getAdminSession();
  if (!admin) return json({ error: 'bukan admin' }, 403);

  const url = new URL(request.url);
  const discordId = String(url.searchParams.get('discordId') || '').replace(/\D/g, '');
  if (!discordId) return json({ profile: null, pending: false });

  try {
    await schemaReady();
    const db = getDb();
    const res = await db.execute({
      sql: "SELECT status, data, filled_at FROM data_requests WHERE discord_id = ? ORDER BY created_at DESC LIMIT 1",
      args: [discordId],
    });
    const row = res.rows[0];
    if (!row) return json({ profile: null, pending: false });
    if (row.status === 'processing' || row.status === 'pending') {
      return json({ profile: null, pending: true });
    }
    if (row.status === 'done' && row.data) {
      let profile = null;
      try { profile = JSON.parse(row.data); } catch {}
      return json({ profile, pending: false });
    }
    return json({ profile: null, pending: false, failed: true });
  } catch {
    return json({ profile: null, pending: false });
  }
}
