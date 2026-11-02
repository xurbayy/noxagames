import { getAdminActor } from '../../../lib/session';
import { json, ready } from '../../../lib/api-helpers';
import { getDb } from '../../../lib/db';
import { PREMIUM_PLANS } from '../../../lib/premiumPlan';
import { aktifkanLangganan } from '../../../lib/aktivasi';

export const dynamic = 'force-dynamic';

// GET /api/admin/subscriptions
// Menampilkan semua langganan aktif, kedaluwarsa, dan riwayat transaksi
export async function GET() {
  const admin = await getAdminActor();
  if (!admin) return json({ ok: false, error: 'Bukan admin' }, 403);

  await ready();
  const db = getDb();
  const now = Date.now();

  try {
    // 1. Ambil daftar langganan
    const subsRes = await db.execute({
      sql: 'SELECT * FROM premium_subscriptions ORDER BY id DESC LIMIT 50',
    });

    // 2. Ambil username & avatar dari transaksi terakhir atau data_requests
    const subs = [];
    for (const row of subsRes.rows) {
      const isExpired = row.expires_at <= now;
      let avatar = null;

      // Nama pelanggan: pakai kolom username kalau ada (aktivasi manual),
      // kalau tidak cari dari transaksi terakhir.
      let username = row.username || null;
      if (!username) {
        const txRes = await db.execute({
          sql: 'SELECT username FROM transactions WHERE discord_id = ? ORDER BY created_at DESC LIMIT 1',
          args: [String(row.discord_id)],
        });
        username = txRes.rows[0]?.username || 'Pengguna';
      }

      // Hitung sisa hari
      const diffMs = Number(row.expires_at) - now;
      const sisaHari = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      subs.push({
        id: Number(row.id),
        discordId: String(row.discord_id),
        username,
        avatar,
        guildId: row.guild_id ? String(row.guild_id) : null,
        planId: row.plan_id,
        tierName: row.tier_name,
        status: isExpired ? 'expired' : row.status || 'active',
        startsAt: Number(row.starts_at),
        expiresAt: Number(row.expires_at),
        createdAt: Number(row.created_at),
        sisaHari,
      });
    }

    // 3. Ambil riwayat transaksi QiosPay. Batasnya cukup panjang supaya admin
    //    masih bisa menemukan invoice lama yang kedaluwarsa lalu membebaskannya.
    const txRes = await db.execute({
      sql: 'SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100',
    });

    const transactions = txRes.rows.map((r) => ({
      id: r.id,
      discordId: r.discord_id,
      username: r.username,
      planId: r.plan_id,
      durationMonths: r.duration_months,
      amount: r.amount,
      status: r.status,
      qiospayInvoiceId: r.qiospay_invoice_id,
      createdAt: r.created_at,
      paidAt: r.paid_at,
    }));

    // 4. Omzet harian 30 hari terakhir untuk grafik (agregat SQL - tidak
    //    terbatas 100 baris riwayat di atas). Hari = pembulatan created_at
    //    ke UTC 00:00 lewat CAST supaya aman di semua engine libSQL.
    let omzetHarian = [];
    try {
      const sejak = Date.now() - 30 * 86400000;
      const omzetRes = await db.execute({
        sql: "SELECT CAST(created_at / 86400000 AS INTEGER) * 86400000 AS day, COUNT(*) AS jumlah, SUM(amount) AS total FROM transactions WHERE status = 'paid' AND created_at >= ? GROUP BY day ORDER BY day ASC",
        args: [sejak],
      });
      omzetHarian = omzetRes.rows.map((r) => ({
        day: Number(r.day),
        jumlah: Number(r.jumlah) || 0,
        total: Number(r.total) || 0,
      }));
    } catch { /* grafik boleh kosong, daftar transaksi tetap jalan */ }

    return json({
      ok: true,
      subscriptions: subs,
      transactions,
      omzetHarian,
    });
  } catch (err) {
    console.error('[ADMIN-SUBS] Error:', err);
    return json({ ok: false, error: 'Gagal memuat data langganan.' }, 500);
  }
}

// POST /api/admin/subscriptions
// Tambah pelanggan premium MANUAL dari panel admin (di luar QRIS).
// Sengaja TIDAK membuat baris di tabel transactions supaya riwayat omzet
// tetap murni dari gateway. Aktivasi dikirim ke bot lewat data_requests,
// jadi badge & benefit benar-benar aktif di Discord dan web.
export async function POST(request) {
  const admin = await getAdminActor();
  if (!admin) return json({ ok: false, error: 'Bukan admin' }, 403);

  let body;
  try { body = await request.json(); } catch {}

  const discordId = String(body?.discordId || '').replace(/\D/g, '');
  const username = String(body?.username || '').trim().slice(0, 64) || null;
  const planId = String(body?.planId || '');
  const durasiBulan = Math.max(1, Math.min(36, parseInt(body?.durationMonths, 10) || 1));
  const guildInput = String(body?.guildId || '').replace(/\D/g, '');

  if (!/^\d{15,20}$/.test(discordId)) {
    return json({ ok: false, error: 'ID Discord tidak valid (15-20 angka).' }, 400);
  }
  const plan = PREMIUM_PLANS.find((p) => p.id === planId);
  if (!plan) return json({ ok: false, error: 'Paket tidak dikenal.' }, 400);

  const paketServer = planId === 'premium-ultimate';
  if (paketServer && !guildInput) {
    return json({ ok: false, error: 'Paket Ultimate wajib diisi ID server tujuan.' }, 400);
  }
  if (guildInput && !/^\d{15,20}$/.test(guildInput)) {
    return json({ ok: false, error: 'ID server tidak valid (15-20 angka).' }, 400);
  }
  // Paket individu selalu personal: ID server diabaikan walau admin mengisinya.
  const targetGuild = paketServer ? guildInput : null;

  await ready();
  const db = getDb();
  const now = Date.now();
  const durasiMs = durasiBulan * 30 * 24 * 60 * 60 * 1000;
  const tierName = plan.nama;

  try {
    // Perpanjang cerdas: paket & server sama yang masih aktif ditambah durasinya,
    // bukan menumpuk baris baru.
    const exist = await db.execute({
      sql: `SELECT id, expires_at FROM premium_subscriptions
            WHERE discord_id = ? AND plan_id = ? AND status = 'active' AND expires_at > ?
              AND COALESCE(guild_id, '') = ?
            ORDER BY expires_at DESC LIMIT 1`,
      args: [discordId, planId, now, targetGuild || ''],
    });

    let subId;
    let expiresAt;
    const lama = exist.rows[0];

    if (lama) {
      expiresAt = Math.max(now, Number(lama.expires_at) || now) + durasiMs;
      subId = Number(lama.id);
      await db.execute({
        sql: `UPDATE premium_subscriptions
              SET expires_at = ?, tier_name = ?, status = 'active',
                  username = COALESCE(?, username)
              WHERE id = ?`,
        args: [expiresAt, tierName, username, subId],
      });
    } else {
      expiresAt = now + durasiMs;
      const ins = await db.execute({
        sql: `INSERT INTO premium_subscriptions
                (discord_id, guild_id, plan_id, tier_name, status, starts_at, expires_at, created_at, username)
              VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)`,
        args: [discordId, targetGuild, planId, tierName, now, expiresAt, now, username],
      });
      subId = Number(ins.lastInsertRowid);
    }

    // Kirim aktivasi ke bot. Bot membalas dengan profil terbaru, jadi lencana
    // di web ikut segar tanpa permintaan profil terpisah (yang bisa balapan).
    await db.execute({
      sql: "INSERT INTO data_requests (discord_id, status, data, created_at) VALUES (?, 'pending', ?, ?)",
      args: [
        discordId,
        JSON.stringify({
          action: 'activate_premium',
          planId,
          guildId: targetGuild,
          durationMonths: durasiBulan,
          expiresAt,
        }),
        now,
      ],
    });

    console.log(`[ADMIN-SUBS-MANUAL] ${tierName} ${durasiBulan} bln -> ${discordId}${targetGuild ? ` (guild ${targetGuild})` : ''}`);

    return json({
      ok: true,
      id: subId,
      discordId,
      planId,
      tierName,
      durationMonths: durasiBulan,
      expiresAt,
      guildId: targetGuild,
    });
  } catch (err) {
    console.error('[ADMIN-SUBS-MANUAL] Error:', err);
    return json({ ok: false, error: 'Gagal menambah pelanggan manual.' }, 500);
  }
}

// Perpanjang durasi atau ubah paket (Update)
export async function PUT(request) {
  const admin = await getAdminActor();
  if (!admin) return json({ ok: false, error: 'Bukan admin' }, 403);

  let body;
  try { body = await request.json(); } catch {}
  const { id, extendMonths = 1, newPlanId = null, guildId = null } = body || {};

  if (!id) return json({ ok: false, error: 'ID langganan wajib diisi.' }, 400);

  await ready();
  const db = getDb();
  const now = Date.now();

  try {
    const subRes = await db.execute({
      sql: 'SELECT * FROM premium_subscriptions WHERE id = ? LIMIT 1',
      args: [Number(id)],
    });

    const sub = subRes.rows[0];
    if (!sub) return json({ ok: false, error: 'Langganan tidak ditemukan.' }, 404);

    // Hitung perpanjangan: jika belum expired, tambah dari tanggal expired. Jika sudah expired, tambah dari sekarang.
    const baseTime = Number(sub.expires_at) > now ? Number(sub.expires_at) : now;
    const durasiTambah = Math.max(0, parseInt(extendMonths, 10) || 0);
    const newExpiresAt = baseTime + durasiTambah * 30 * 24 * 60 * 60 * 1000;

    let targetPlan = sub.plan_id;
    let targetTier = sub.tier_name;
    if (newPlanId) {
      const plan = PREMIUM_PLANS.find((p) => p.id === newPlanId);
      if (plan) {
        targetPlan = plan.id;
        targetTier = plan.nama;
      }
    }

    const targetGuild = guildId !== null ? (guildId ? String(guildId).trim() : null) : sub.guild_id;

    await db.execute({
      sql: `UPDATE premium_subscriptions 
            SET expires_at = ?, plan_id = ?, tier_name = ?, guild_id = ?, status = 'active'
            WHERE id = ?`,
      args: [newExpiresAt, targetPlan, targetTier, targetGuild, Number(id)],
    });

    // Antrekan sinkronisasi ke bot. Bot membalas dengan profil terbaru, jadi
    // lencana premium di web ikut diperbarui tanpa request profil terpisah.
    await db.execute({
      sql: "INSERT INTO data_requests (discord_id, status, data, created_at) VALUES (?, 'pending', ?, ?)",
      args: [
        String(sub.discord_id),
        JSON.stringify({
          action: 'activate_premium',
          planId: targetPlan,
          guildId: targetGuild,
          expiresAt: newExpiresAt,
        }),
        now,
      ],
    });

    return json({ ok: true, id: Number(id), expiresAt: newExpiresAt });
  } catch (err) {
    console.error('[ADMIN-SUBS-UPDATE] Error:', err);
    return json({ ok: false, error: 'Gagal memperbarui langganan.' }, 500);
  }
}

// PATCH /api/admin/subscriptions
// Bebaskan transaksi yang sudah kedaluwarsa/batal: tandai lunas lalu aktifkan
// paketnya untuk pembeli. Dipakai kalau pembayaran QRIS benar-benar masuk tapi
// invoice keburu lewat batas waktu (webhook tidak sempat memproses), sehingga
// pembeli tidak perlu membuat tagihan baru.
export async function PATCH(request) {
  const admin = await getAdminActor();
  if (!admin) return json({ ok: false, error: 'Bukan admin' }, 403);

  let body;
  try { body = await request.json(); } catch {}
  const txId = String(body?.txId || '').trim();
  if (!txId) return json({ ok: false, error: 'ID transaksi wajib diisi.' }, 400);

  await ready();
  const db = getDb();
  const now = Date.now();

  try {
    const res = await db.execute({
      sql: 'SELECT * FROM transactions WHERE id = ? LIMIT 1',
      args: [txId],
    });
    const tx = res.rows[0];
    if (!tx) return json({ ok: false, error: 'Transaksi tidak ditemukan.' }, 404);

    // Sudah lunas: jangan aktivasi dua kali (bisa menambah durasi ganda).
    if (tx.status === 'paid') {
      return json({ ok: true, sudahLunas: true, txId: tx.id, expiresAt: null });
    }

    await db.execute({
      sql: "UPDATE transactions SET status = 'paid', paid_at = ? WHERE id = ?",
      args: [now, tx.id],
    });

    const expiresAt = await aktifkanLangganan(db, tx, now);

    console.log(
      `[ADMIN-TX-BEBAS] ${tx.id} (${tx.plan_id}) dibebaskan untuk ${tx.discord_id}, aktif s/d ${new Date(expiresAt).toISOString()}`
    );

    return json({
      ok: true,
      txId: tx.id,
      discordId: String(tx.discord_id),
      planId: tx.plan_id,
      expiresAt,
    });
  } catch (err) {
    console.error('[ADMIN-TX-BEBAS] Error:', err);
    return json({ ok: false, error: 'Gagal membebaskan transaksi.' }, 500);
  }
}

// DELETE /api/admin/subscriptions
// Hapus atau cabut paket premium, atau hapus riwayat transaksi (Delete)
export async function DELETE(request) {
  const admin = await getAdminActor();
  if (!admin) return json({ ok: false, error: 'Bukan admin' }, 403);

  let body;
  try { body = await request.json(); } catch {}
  const { id, txId, hapusKedaluwarsa, lebihTuaDariMenit } = body || {};

  await ready();
  const db = getDb();
  const now = Date.now();

  // Bersihkan transaksi yang TIDAK lunas (pending/expired/cancelled/failed).
  // Transaksi berstatus 'paid' tidak pernah ikut dihapus, seberapa tua pun.
  if (hapusKedaluwarsa) {
    const menit = Math.max(5, Math.min(24 * 60, parseInt(lebihTuaDariMenit, 10) || 60));
    const batas = now - menit * 60 * 1000;
    try {
      const res = await db.execute({
        sql: "DELETE FROM transactions WHERE COALESCE(status, 'pending') <> 'paid' AND created_at < ?",
        args: [batas],
      });
      return json({ ok: true, terhapus: Number(res.rowsAffected) || 0, batas });
    } catch (err) {
      console.error('[ADMIN-TX-BERSIH] Error:', err);
      return json({ ok: false, error: 'Gagal membersihkan transaksi kedaluwarsa.' }, 500);
    }
  }

  // Hapus riwayat transaksi jika txId diberikan
  if (txId) {
    try {
      await db.execute({
        sql: 'DELETE FROM transactions WHERE id = ?',
        args: [String(txId)],
      });
      return json({ ok: true, txId });
    } catch (err) {
      console.error('[ADMIN-TX-DELETE] Error:', err);
      return json({ ok: false, error: 'Gagal menghapus riwayat transaksi.' }, 500);
    }
  }

  if (!id) return json({ ok: false, error: 'ID langganan wajib diisi.' }, 400);

  try {
    const subRes = await db.execute({
      sql: 'SELECT * FROM premium_subscriptions WHERE id = ? LIMIT 1',
      args: [Number(id)],
    });

    const sub = subRes.rows[0];
    if (!sub) return json({ ok: false, error: 'Langganan tidak ditemukan.' }, 404);

    // Hapus dari database langganan
    await db.execute({
      sql: 'DELETE FROM premium_subscriptions WHERE id = ?',
      args: [Number(id)],
    });

    // Beritahu bot untuk mencabut status premium. Bot membalas dengan profil
    // terbaru sehingga lencana premium ikut hilang dari web.
    await db.execute({
      sql: "INSERT INTO data_requests (discord_id, status, data, created_at) VALUES (?, 'pending', ?, ?)",
      args: [
        String(sub.discord_id),
        JSON.stringify({
          action: 'revoke_premium',
          planId: sub.plan_id,
          guildId: sub.guild_id || null,
        }),
        now,
      ],
    });

    return json({ ok: true, id: Number(id), discordId: sub.discord_id });
  } catch (err) {
    console.error('[ADMIN-SUBS-DELETE] Error:', err);
    return json({ ok: false, error: 'Gagal mencabut langganan.' }, 500);
  }
}
