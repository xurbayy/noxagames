import { getSession } from '../../lib/session';
import { json } from '../../lib/api-helpers';
import { getDb, schemaReady } from '../../lib/db';
import { ambilProfilDenganRefresh, antrekanProfilUlang } from '../../lib/profile-request';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const refresh = new URL(req.url).searchParams.get('refresh') === '1';
  const session = await getSession();
  if (!session) return json({ error: 'belum login' }, 401);

  const user = { username: session.username, avatar: session.avatar };

  try {
    await schemaReady();
    const db = getDb();

    // Paksa minta ulang: tombol "Minta Ulang" saat antrean macet atau user
    // ingin data terbaru sekarang juga.
    if (refresh) {
      const now = Date.now();
      await antrekanProfilUlang(db, session.discordId);
      const profile = await ambilProfilDenganRefresh(db, session.discordId);
      return json({
        user,
        profile: profile.profile,
        fresh: Boolean(profile.profile),
        pending: true,
        pendingSince: now,
        stale: Boolean(profile.profile),
      });
    }

    // Stale-while-revalidate: sajikan profil yang ada, dan kalau sudah basi
    // antrekan refresh di belakang layar supaya data playlist/statistik
    // menyusul tanpa membuat halaman kosong.
    const hasil = await ambilProfilDenganRefresh(db, session.discordId);
    if (hasil.profile) {
      return json({
        user,
        profile: hasil.profile,
        fresh: !hasil.stale,
        pending: hasil.stale,
        pendingSince: hasil.stale ? Date.now() : null,
        stale: false,
      });
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
    await antrekanProfilUlang(db, session.discordId);

    return json({ user, profile: null, fresh: false, pending: true, pendingSince: now, stale: false });
  } catch {
    return json({ user, profile: null, fresh: false });
  }
}
