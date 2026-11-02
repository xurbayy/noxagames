// Aktivasi langganan dari satu baris transaksi (dipakai webhook QRIS dan
// panel admin saat admin membebaskan transaksi yang sudah kedaluwarsa).
//
// Aturan stacking: transaksi dengan plan yang SAMA dan masih aktif memperpanjang
// baris yang ada (expires_at ditambah), plan beda membuat baris baru. Jadi admin
// yang membebaskan invoice lama tidak pernah membuat pelanggan punya dua baris
// paket identik.

import { antrekanProfilUlang } from './profile-request';
import { kirimNotifAdmin, kirimNotifUser } from './notifikasi';

export function tierDariPlan(planId) {
  if (planId === 'premium-ultimate') return 'NOXA Premium Ultimate';
  if (planId === 'premium-plus') return 'NOXA Premium+';
  return 'NOXA Premium';
}

/** Format rupiah ringkas untuk judul notifikasi ("Rp 35.000"). */
function rupiah(n) {
  const v = Number(n) || 0;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

/**
 * Aktifkan / perpanjang langganan premium untuk transaksi `tx`.
 * @returns {Promise<number>} expires_at baru (epoch ms)
 */
export async function aktifkanLangganan(db, tx, now = Date.now()) {
  const durasiBulan = Number(tx.duration_months) || 1;
  const durasiMs = durasiBulan * 30 * 24 * 60 * 60 * 1000;
  const tierName = tierDariPlan(tx.plan_id);

  // Cek langganan aktif DENGAN PLAN YANG SAMA (stacking: plan beda = baris baru)
  const existRes = await db.execute({
    sql: "SELECT id, expires_at FROM premium_subscriptions WHERE discord_id = ? AND plan_id = ? AND status = 'active' AND expires_at > ? ORDER BY expires_at DESC LIMIT 1",
    args: [String(tx.discord_id), String(tx.plan_id), now],
  });

  let expiresAt = now + durasiMs;
  if (existRes.rows.length > 0) {
    const existing = existRes.rows[0];
    const baseTime = Number(existing.expires_at) > now ? Number(existing.expires_at) : now;
    expiresAt = baseTime + durasiMs;

    await db.execute({
      sql: "UPDATE premium_subscriptions SET expires_at = ?, plan_id = ?, tier_name = ?, guild_id = COALESCE(?, guild_id) WHERE id = ?",
      args: [expiresAt, tx.plan_id, tierName, tx.guild_id ? String(tx.guild_id) : null, existing.id],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO premium_subscriptions (discord_id, guild_id, plan_id, tier_name, status, starts_at, expires_at, created_at)
            VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`,
      args: [
        String(tx.discord_id),
        tx.guild_id ? String(tx.guild_id) : null,
        tx.plan_id,
        tierName,
        now,
        expiresAt,
        now,
      ],
    });
  }

  // Profil dibangun ulang agar lencana premium & riwayat lagu sesuai tier tampil
  await antrekanProfilUlang(db, String(tx.discord_id));

  // --- Notifikasi (dipanggil di SATU titik supaya semua jalur ikut) ---
  // Admin: alert pembelian masuk ke lonceng panel /admin.
  // User: konfirmasi bahwa paketnya aktif + tanggal berakhirnya.
  const tanggal = new Date(expiresAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  await kirimNotifAdmin({
    tipe: 'pembelian',
    judul: `Pembelian baru: ${tierName}`,
    isi: `${tx.username || tx.discord_id} - ${rupiah(tx.amount)} (${durasiBulan} bulan)${tx.guild_id ? ` untuk server ${tx.guild_id}` : ''}`,
    url: '/admin',
  }).catch(() => {});
  await kirimNotifUser({
    discordId: String(tx.discord_id),
    tipe: 'pembelian',
    judul: `${tierName} aktif`,
    isi: `Terima kasih! Paketmu berlaku sampai ${tanggal}. Lencana NOXA Pass sudah muncul di Discord dan profil web.`,
    url: '/me',
  }).catch(() => {});

  // Kirimkan notifikasi aktivasi ke antrean bot agar bot tahu akun/guild sudah premium
  try {
    await db.execute({
      sql: "INSERT INTO data_requests (discord_id, status, data, created_at) VALUES (?, 'pending', ?, ?)",
      args: [
        String(tx.discord_id),
        JSON.stringify({
          action: 'activate_premium',
          planId: tx.plan_id,
          guildId: tx.guild_id || null,
          durationMonths: durasiBulan,
          expiresAt,
        }),
        now,
      ],
    });
  } catch {}

  return expiresAt;
}
