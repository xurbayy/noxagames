import { getAdminActor } from '../../../lib/session';
import { json } from '../../../lib/api-helpers';
import { getDb, schemaReady } from '../../../lib/db';
import { kirimNotifUser } from '../../../lib/notifikasi';

export const dynamic = 'force-dynamic';

// POST /api/admin/kirim-notif - admin kirim pesan manual ke lonceng user.
// Body: { target: 'all' | '<discordId>', tipe: 'info'|'event'|'penting', judul, isi?, url? }
//
// Target 'all' = broadcast (discord_id NULL) -> semua user melihatnya tanpa
// perlu menyalin baris per user. `url` opsional: tombol "Buka" di notifikasi.
const TIPE = new Set(['info', 'event', 'penting']);

export async function POST(request) {
  const admin = await getAdminActor();
  if (!admin) return json({ ok: false, error: 'forbidden' }, 403);

  let body;
  try { body = await request.json(); } catch { body = null; }

  const target = String(body?.target || 'all').trim();
  const tipe = TIPE.has(String(body?.tipe)) ? String(body.tipe) : 'info';
  const judul = String(body?.judul || '').trim();
  const isi = String(body?.isi || '').trim();
  const url = String(body?.url || '').trim();

  if (!judul) return json({ ok: false, error: 'Judul wajib diisi.' }, 400);
  if (judul.length > 120) return json({ ok: false, error: 'Judul maksimal 120 karakter.' }, 400);
  if (isi.length > 500) return json({ ok: false, error: 'Isi maksimal 500 karakter.' }, 400);
  if (url && !/^\//.test(url)) {
    return json({ ok: false, error: 'URL harus path internal, contoh /premium.' }, 400);
  }

  let discordId = null;
  if (target !== 'all') {
    if (!/^\d{5,25}$/.test(target)) {
      return json({ ok: false, error: 'Target harus "all" atau Discord User ID angka.' }, 400);
    }
    discordId = target;
  }

  try {
    await schemaReady();
    const db = getDb();

    // Cek user target benar-benar punya data (kalau bukan broadcast) supaya
    // admin tidak mengirim ke ID salah ketik.
    if (discordId) {
      const cek = await db.execute({
        sql: 'SELECT COUNT(*) AS c FROM data_requests WHERE discord_id = ? LIMIT 1',
        args: [discordId],
      });
      if (!Number(cek.rows?.[0]?.c || 0)) {
        return json({ ok: false, error: 'Discord ID itu belum pernah memakai NOXA Sound. Periksa lagi.' }, 400);
      }
    }

    await kirimNotifUser({ discordId, tipe, judul, isi: isi || null, url: url || null });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e).slice(0, 140) }, 500);
  }

  return json({
    ok: true,
    target: discordId ? `user ${discordId}` : 'semua user',
    message: discordId
      ? 'Notifikasi terkirim ke user tersebut.'
      : 'Broadcast terkirim - semua user melihatnya di lonceng.',
  });
}
