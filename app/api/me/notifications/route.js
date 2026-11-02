import { getSession } from '../../../lib/session';
import { json } from '../../../lib/api-helpers';
import { notifUser, tandaiNotifUserDibaca } from '../../../lib/notifikasi';

export const dynamic = 'force-dynamic';

// GET  /api/me/notifications       -> daftar notifikasi belum dibaca + jumlah
// POST /api/me/notifications       -> { id } tandai satu, { all: true } semua
//
// Tamu (belum login) mendapat daftar kosong - bukan 401 - supaya lonceng di
// navbar tidak pernah error saat halaman publik dibuka.
export async function GET() {
  const session = await getSession().catch(() => null);
  if (!session) return json({ ok: true, notifications: [], belum: 0, tamu: true });

  try {
    const notifications = await notifUser(session.discordId);
    return json({ ok: true, notifications, belum: notifications.length });
  } catch {
    // Notifikasi pelengkap: DB bermasalah jangan bikin UI error.
    return json({ ok: true, notifications: [], belum: 0, degraded: true });
  }
}

export async function POST(request) {
  const session = await getSession().catch(() => null);
  if (!session) return json({ ok: false, error: 'Login dulu ya.' }, 401);

  let body;
  try { body = await request.json(); } catch { body = null; }

  try {
    if (body?.all === true) await tandaiNotifUserDibaca(session.discordId, null);
    else if (body?.id) await tandaiNotifUserDibaca(session.discordId, Number(body.id));
    else return json({ ok: false, error: 'id atau all wajib diisi.' }, 400);
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e).slice(0, 120) }, 500);
  }

  return json({ ok: true });
}
