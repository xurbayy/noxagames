import { getSession } from '../../../lib/session';
import { json, ready } from '../../../lib/api-helpers';
import { getDb } from '../../../lib/db';
import { kirimNotifUser, kirimNotifAdmin } from '../../../lib/notifikasi';

export const dynamic = 'force-dynamic';

// ==========================================
// /api/me/trial - Trial NOXA Premium 3 hari, SATU KALI seumur hidup per user
// ==========================================
// Pola Soundly ("first X days free, no card") - versi kita: QRIS tidak perlu
// kartu, jadi trial murni alat konversi: user yang belum pernah bayar DAN
// belum aktif bisa cicipi benefit Premium tanpa bayar apa pun.
//
// Aturan:
//   - GET  -> { boleh, alasan }  (dipakai tombol di /premium)
//   - POST -> klaim: insert premium_subscriptions (plan individu terkecil,
//     3 hari) + web_trials (satu kali seumur hidup) + antre activate_premium
//     ke bot + notifikasi user.
//   - Ditolak bila: belum login; pernah trial (web_trials); pernah ada
//     transaksi paid (bekas pelanggan tidak dapat trial balik); ada langganan
//     individu aktif (trial tidak ditumpuk); session Ultimate saja TETAP boleh
//     (cakupannya beda - individu ikut orang, ultimate ikut server).
//   - Setelah trial: beli plan SAMA = perpanjang cerdas (trial + dibayar
//     menyambung, tidak ada hari hilang). Beli plan individu BEDA saat trial
//     aktif ditolak aturan stacking yang sudah ada - pesannya jelas dan trial
//     cuma 3 hari, disengaja biar simpel.
const HARI_TRIAL = 3;

async function cekKelayakan(db, discordId, now) {
  const pernah = await db.execute({
    sql: 'SELECT plan_id FROM web_trials WHERE discord_id = ? LIMIT 1',
    args: [String(discordId)],
  });
  if (pernah.rows.length > 0) return { boleh: false, alasan: 'Trial sudah pernah dipakai di akun ini.' };

  const pernahBayar = await db.execute({
    sql: "SELECT id FROM transactions WHERE discord_id = ? AND status = 'paid' LIMIT 1",
    args: [String(discordId)],
  });
  if (pernahBayar.rows.length > 0) return { boleh: false, alasan: 'Kamu pernah berlangganan - benefit lama ikut kembali saat paket aktif.' };

  const aktif = await db.execute({
    sql: "SELECT plan_id, tier_name FROM premium_subscriptions WHERE discord_id = ? AND status = 'active' AND plan_id <> 'premium-ultimate' AND expires_at > ? LIMIT 1",
    args: [String(discordId), now],
  });
  if (aktif.rows.length > 0) return { boleh: false, alasan: `Langganan ${aktif.rows[0].tier_name} kamu masih aktif.` };

  return { boleh: true, alasan: null };
}

export async function GET() {
  const session = await getSession().catch(() => null);
  if (!session) return json({ boleh: false, alasan: 'login' });
  await ready();
  const db = getDb();
  const hasil = await cekKelayakan(db, session.discordId, Date.now());
  return json({ ok: true, ...hasil, hari: HARI_TRIAL });
}

export async function POST(request) {
  const session = await getSession().catch(() => null);
  if (!session) return json({ ok: false, error: 'Login dulu ya.' }, 401);

  let body = null;
  try { body = await request.json(); } catch { body = null; }
  // Checkbox persetujuan wajib (aturan login/aktivasi user): ToS + Privacy.
  if (!body || body.setuju !== true) {
    return json({ ok: false, error: 'Centang persetujuan Ketentuan Layanan & Privasi dulu.' }, 400);
  }

  try {
    await ready();
    const db = getDb();
    const now = Date.now();

    const kelayakan = await cekKelayakan(db, session.discordId, now);
    if (!kelayakan.boleh) return json({ ok: false, error: kelayakan.alasan }, 400);

    const expiresAt = now + HARI_TRIAL * 86400000;

    // INSERT web_trials dulu (unik per user) sebagai kunci anti-race:
    // dua klik bersamaan -> yang kedua kena UNIQUE constraint -> ditolak.
    try {
      await db.execute({
        sql: 'INSERT INTO web_trials (discord_id, plan_id, created_at) VALUES (?, ?, ?)',
        args: [String(session.discordId), 'premium', now],
      });
    } catch {
      return json({ ok: false, error: 'Trial sudah pernah dipakai di akun ini.' }, 400);
    }

    await db.execute({
      sql: `INSERT INTO premium_subscriptions (discord_id, guild_id, plan_id, tier_name, status, starts_at, expires_at, created_at, username)
            VALUES (?, NULL, 'premium', 'NOXA Premium (Trial)', 'active', ?, ?, ?, ?)`,
      args: [String(session.discordId), now, expiresAt, now, session.username || null],
    });

    // Sinkron benefit ke bot (lencana + limit) via pipeline aktivasi yang sama.
    await db.execute({
      sql: "INSERT INTO data_requests (discord_id, status, data, created_at) VALUES (?, 'pending', ?, ?)",
      args: [
        String(session.discordId),
        JSON.stringify({ action: 'activate_premium', planId: 'premium', guildId: null, durationMonths: 0, expiresAt }),
        now,
      ],
    });

    await kirimNotifUser({
      discordId: String(session.discordId),
      tipe: 'pembelian',
      judul: 'Trial NOXA Premium aktif',
      isi: `Benefit Premium aktif ${HARI_TRIAL} hari gratis sampai ${new Date(expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}. Suka? Lanjutkan kapan saja dari halaman NOXA Pass - durasi trial menyambung, tidak ada hari yang hilang.`,
      url: '/me',
    }).catch(() => {});
    await kirimNotifAdmin({
      tipe: 'pembelian',
      judul: `Trial 3 hari diklaim: ${session.username || session.discordId}`,
      isi: `Discord ID ${session.discordId} - konversi trial bisa dipantau dari daftar pelanggan.`,
      url: '/admin',
    }).catch(() => {});

    return json({
      ok: true,
      message: `Trial ${HARI_TRIAL} hari aktif! Benefit Premium langsung jalan di semua server - bot sinkron dalam ±20 detik.`,
      expiresAt,
    });
  } catch (e) {
    return json({ ok: false, error: 'Gagal mengaktifkan trial. Coba lagi sebentar ya.' }, 500);
  }
}
