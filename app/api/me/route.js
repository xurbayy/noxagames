import { getSession } from '../../lib/session';
import { json } from '../../lib/api-helpers';
import { getDb, schemaReady } from '../../lib/db';
import { ambilProfilTerbaru } from '../../lib/profile-request';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const refresh = new URL(req.url).searchParams.get('refresh') === '1';
  const session = await getSession();
  if (!session) return json({ error: 'belum login' }, 401);

  const user = { username: session.username, avatar: session.avatar };

  try {
    await schemaReady();
    const db = getDb();

    // 1. Cari profil yang SUDAH SELESAI diisi bot (status = 'done')
    // Jika ada, langsung kembalikan tanpa membuat user menunggu antrean baru!
    const profile = await ambilProfilTerbaru(db, session.discordId);
    if (profile) {
      return json({ user, profile, fresh: true, pending: false });
    }

    // 2a. Minta ulang: pengguna menekan "Minta Ulang" saat antrean lama macet.
    if (refresh) {
      const now = Date.now();
      await db.execute({
        sql: "INSERT INTO data_requests (discord_id, status, created_at) VALUES (?, 'pending', ?)",
        args: [session.discordId, now],
      }).catch(() => {});
      return json({ user, profile: null, fresh: false, pending: true, pendingSince: now, stale: false });
    }

    // 2. Jika belum ada profil selesai, cek apakah ada antrean yang sedang diproses
    const pendingRes = await db.execute({
      sql: "SELECT id, status, created_at FROM data_requests WHERE discord_id = ? ORDER BY created_at DESC LIMIT 1",
      args: [session.discordId],
    });

    const row = pendingRes.rows[0];
    if (row && (row.status === 'pending' || row.status === 'processing')) {
      const since = Number(row.created_at) || null;
      return json({
        user,
        profile: null,
        fresh: false,
        pending: true,
        pendingSince: since,
        // >90 detik tanpa jawaban bot = antrean macet; klien menampilkan
        // penjelasan + tombol minta ulang, bukan spinner tanpa akhir.
        stale: Boolean(since && Date.now() - since > 90 * 1000),
      });
    }

    // 3. Jika belum pernah ada request sama sekali, otomatis buat antrean baru
    const now = Date.now();
    await db.execute({
      sql: "INSERT INTO data_requests (discord_id, status, created_at) VALUES (?, 'pending', ?)",
      args: [session.discordId, now],
    }).catch(() => {});

    return json({ user, profile: null, fresh: false, pending: true, pendingSince: now, stale: false });
  } catch {
    return json({ user, profile: null, fresh: false });
  }
}
