import { getAdminActor } from '../../../lib/session';
import { json } from '../../../lib/api-helpers';
import { getDb, schemaReady } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// DELETE /api/admin/player {discordId}
// Dipakai saat pengguna meminta datanya dihapus (sesuai Ketentuan Layanan).
// Yang dihapus di sini: seluruh baris data_requests milik ID tersebut, yaitu
// profil yang di-cache web ini (termasuk antrean yang belum diproses dan hasil
// lookup admin). Statistik asli pemilik data ada di database bot; penghapusan
// di sana dilakukan dari sisi bot.
export async function DELETE(request) {
  const admin = await getAdminActor();
  if (!admin) return json({ ok: false, error: 'bukan admin' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {}

  const discordId = String(body?.discordId || '').replace(/\D/g, '');
  if (!/^\d{17,20}$/.test(discordId)) {
    return json({ ok: false, error: 'Discord ID harus 17 sampai 20 digit angka.' }, { status: 400 });
  }

  try {
    await schemaReady();
    const db = getDb();
    // 1. Hapus cache profil & request lama milik user ini di web
    const res = await db.execute({
      sql: 'DELETE FROM data_requests WHERE discord_id = ?',
      args: [discordId],
    });
    // 2. Antrekan instruksi hapus data ke bot agar database SQLite bot ikut dibersihkan
    await db.execute({
      sql: "INSERT INTO data_requests (discord_id, status, data, created_at) VALUES (?, 'pending', ?, ?)",
      args: [discordId, JSON.stringify({ action: 'delete' }), Date.now()],
    });
    return json({ ok: true, discordId, removed: Number(res.rowsAffected) || 0, queuedToBot: true });
  } catch {
    return json({ ok: false, error: 'Gagal menghapus data. Coba lagi.' }, { status: 500 });
  }
}
