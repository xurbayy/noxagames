import { getSession } from '../../lib/session';
import { json } from '../../lib/api-helpers';
import { getDb, schemaReady } from '../../lib/db';
import { rateLimitGlobal } from '../../lib/rate-limit';
import { kirimNotifAdmin } from '../../lib/notifikasi';

export const dynamic = 'force-dynamic';

// POST /api/feedback - user kirim saran / bug / laporan.
// Disimpan ke web_feedback, masuk notifikasi panel admin, lalu diantrekan ke
// bot (action 'web_feedback') supaya muncul sebagai embed di channel laporan
// Discord. Rate limit 5x / 10 menit per user (memori proses, cukup untuk VPS
// satu instance).
const JENIS = new Set(['Saran', 'Bug', 'Laporan']);

export async function POST(request) {
  const session = await getSession().catch(() => null);
  if (!session) return json({ ok: false, reason: 'Login dulu ya biar kami bisa balas.' }, 401);

  if (!rateLimitGlobal(`fb:${session.discordId}`, 5, 10 * 60_000)) {
    return json({ ok: false, reason: 'Terlalu sering kirim. Tunggu sebentar ya.' }, 429);
  }

  let body;
  try { body = await request.json(); } catch { body = null; }

  const jenis = JENIS.has(String(body?.jenis)) ? String(body.jenis) : 'Saran';
  const pesan = String(body?.pesan || '').trim().slice(0, 1500);
  const halaman = String(body?.halaman || '').slice(0, 80);

  if (pesan.length < 5) {
    return json({ ok: false, reason: 'Ceritain sedikit lebih detail ya (minimal 5 karakter).' }, 400);
  }

  try {
    await schemaReady();
    const db = getDb();
    const now = Date.now();

    await db.execute({
      sql: 'INSERT INTO web_feedback (discord_id, username, jenis, pesan, halaman, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [String(session.discordId), session.username || null, jenis, pesan, halaman || null, now],
    });

    // Notifikasi panel admin (lonceng admin di /admin).
    await kirimNotifAdmin({
      tipe: 'feedback',
      judul: `Feedback baru: ${jenis}`,
      isi: `${session.username || session.discordId} - ${pesan.slice(0, 180)}`,
      url: '/admin',
    }).catch(() => {});

    // Antrekan ke bot -> embed ke channel laporan Discord.
    await db.execute({
      sql: "INSERT INTO data_requests (discord_id, status, data, created_at) VALUES (?, 'pending', ?, ?)",
      args: [
        String(session.discordId),
        JSON.stringify({
          action: 'web_feedback',
          username: session.username || null,
          jenis,
          pesan,
          halaman: halaman || null,
        }),
        now,
      ],
    }).catch(() => {});
  } catch (e) {
    return json({ ok: false, reason: 'Gagal menyimpan feedback. Coba lagi nanti.' }, 500);
  }

  return json({ ok: true, message: 'Terkirim! Terima kasih sudah membantu NOXA jadi lebih baik.' });
}
