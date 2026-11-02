import { getAdminActor } from '../../../lib/session';
import { json } from '../../../lib/api-helpers';
import { notifAdmin } from '../../../lib/notifikasi';
import { getDb, schemaReady } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// GET    /api/admin/notif        -> daftar notifikasi admin + jumlah belum dibaca
// POST   /api/admin/notif        -> { id } | { all: true } tandai dibaca
// DELETE /api/admin/notif?id=N   -> hapus satu, ?all=1 -> bersihkan semua
export async function GET(request) {
  const admin = await getAdminActor();
  if (!admin) return json({ ok: false, error: 'forbidden' }, 403);

  const n = Number(new URL(request.url).searchParams.get('n') || 50);
  try {
    const { notif, belum } = await notifAdmin(n);
    return json({ ok: true, notif, belum });
  } catch {
    return json({ ok: true, notif: [], belum: 0 });
  }
}

export async function POST(request) {
  const admin = await getAdminActor();
  if (!admin) return json({ ok: false, error: 'forbidden' }, 403);

  let body;
  try { body = await request.json(); } catch { body = null; }

  try {
    await schemaReady();
    const db = getDb();
    const now = Date.now();
    if (body?.all === true) {
      await db.execute({ sql: 'UPDATE admin_notifications SET dibaca_at = ? WHERE dibaca_at IS NULL', args: [now] });
    } else if (body?.id) {
      await db.execute({
        sql: 'UPDATE admin_notifications SET dibaca_at = ? WHERE id = ? AND dibaca_at IS NULL',
        args: [now, Number(body.id)],
      });
    } else {
      return json({ ok: false, error: 'id atau all wajib diisi.' }, 400);
    }
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e).slice(0, 120) }, 500);
  }
  return json({ ok: true });
}

export async function DELETE(request) {
  const admin = await getAdminActor();
  if (!admin) return json({ ok: false, error: 'forbidden' }, 403);

  const sp = new URL(request.url).searchParams;
  try {
    await schemaReady();
    const db = getDb();
    if (sp.get('all') === '1') {
      await db.execute('DELETE FROM admin_notifications');
    } else {
      const id = Number(sp.get('id'));
      if (!id) return json({ ok: false, error: 'id wajib diisi.' }, 400);
      await db.execute({ sql: 'DELETE FROM admin_notifications WHERE id = ?', args: [id] });
    }
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e).slice(0, 120) }, 500);
  }
  return json({ ok: true });
}
