// Helper notifikasi (server-only): simpan + baca notifikasi user & admin.
//
// Kenapa helper terpisah: notifikasi dibuat dari BANYAK tempat (pembayaran,
// webhook QiosPay, admin grant manual, feedback, broadcast) dan dibaca dari
// beberapa route. Satu sumber = tidak ada duplikasi query dan tidak ada
// perbedaan bentuk data antara lonceng user dan lonceng admin.
import { getDb, schemaReady } from './db';

const BATAS_BACA = 300; // notifikasi terbaru yang dipertimbangkan

/** Kirim notifikasi ke satu user (discordId) atau broadcast (null). */
export async function kirimNotifUser({ discordId = null, tipe = 'info', judul, isi = null, url = null }) {
  if (!judul) return null;
  await schemaReady();
  const db = getDb();
  const res = await db.execute({
    sql: 'INSERT INTO web_notifications (discord_id, tipe, judul, isi, url, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    args: [discordId ? String(discordId) : null, tipe, String(judul).slice(0, 200), isi ? String(isi).slice(0, 1000) : null, url || null, Date.now()],
  });
  return Number(res.lastInsertRowid) || null;
}

/** Kirim notifikasi ke panel admin (pembelian, feedback, alert). */
export async function kirimNotifAdmin({ tipe = 'info', judul, isi = null, url = '/admin' }) {
  if (!judul) return null;
  await schemaReady();
  const db = getDb();
  const res = await db.execute({
    sql: 'INSERT INTO admin_notifications (tipe, judul, isi, url, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [tipe, String(judul).slice(0, 200), isi ? String(isi).slice(0, 1000) : null, url || '/admin', Date.now()],
  });
  return Number(res.lastInsertRowid) || null;
}

/**
 * Notifikasi untuk satu user: personal + broadcast, tanpa yang sudah dibaca.
 * Broadcast lama (>30 hari) tidak ditampilkan supaya lonceng tidak menumpuk
 * pengumuman usang untuk user baru.
 */
export async function notifUser(discordId) {
  await schemaReady();
  const db = getDb();
  const batasBroadcast = Date.now() - 30 * 86400000;
  const res = await db.execute({
    sql: `SELECT id, tipe, judul, isi, url, created_at
          FROM web_notifications
          WHERE (discord_id = ? OR (discord_id IS NULL AND created_at >= ?))
            AND id NOT IN (SELECT notif_id FROM web_notif_read WHERE discord_id = ?)
          ORDER BY created_at DESC
          LIMIT ?`,
    args: [String(discordId), batasBroadcast, String(discordId), BATAS_BACA],
  });
  return res.rows.map((r) => ({
    id: Number(r.id),
    tipe: r.tipe || 'info',
    judul: r.judul,
    isi: r.isi || '',
    url: r.url || null,
    createdAt: Number(r.created_at),
  }));
}

/** Tandai satu atau semua notifikasi user sebagai dibaca. */
export async function tandaiNotifUserDibaca(discordId, notifId = null) {
  await schemaReady();
  const db = getDb();
  const now = Date.now();
  if (notifId) {
    await db.execute({
      sql: 'INSERT OR REPLACE INTO web_notif_read (discord_id, notif_id, dibaca_at) VALUES (?, ?, ?)',
      args: [String(discordId), Number(notifId), now],
    });
    return;
  }
  // Semua: ambil daftar yang belum dibaca lalu simpan satu per satu
  // (UNION ALL + INSERT OR REPLACE tidak didukung seragam di libSQL).
  const belum = await notifUser(discordId);
  for (const n of belum) {
    await db.execute({
      sql: 'INSERT OR REPLACE INTO web_notif_read (discord_id, notif_id, dibaca_at) VALUES (?, ?, ?)',
      args: [String(discordId), n.id, now],
    });
  }
}

/** Daftar notifikasi admin + jumlah belum dibaca. */
export async function notifAdmin(batas = 50) {
  await schemaReady();
  const db = getDb();
  const res = await db.execute({
    sql: 'SELECT id, tipe, judul, isi, url, dibaca_at, created_at FROM admin_notifications ORDER BY created_at DESC LIMIT ?',
    args: [Math.max(1, Math.min(200, Number(batas) || 50))],
  });
  const notif = res.rows.map((r) => ({
    id: Number(r.id),
    tipe: r.tipe || 'info',
    judul: r.judul,
    isi: r.isi || '',
    url: r.url || '/admin',
    dibaca: r.dibaca_at != null,
    createdAt: Number(r.created_at),
  }));
  return { notif, belum: notif.filter((n) => !n.dibaca).length };
}
