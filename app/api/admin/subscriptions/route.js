import { randomBytes } from 'node:crypto';
import { getAdminActor } from '../../../lib/session';
import { json, ready } from '../../../lib/api-helpers';
import { getDb } from '../../../lib/db';
import { PREMIUM_PLANS } from '../../../lib/premiumPlan';
import { antrekanProfilUlang } from '../../../lib/profile-request';

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
      let username = 'Pengguna';
      let avatar = null;

      // Cari username dari transactions
      const txRes = await db.execute({
        sql: 'SELECT username FROM transactions WHERE discord_id = ? ORDER BY created_at DESC LIMIT 1',
        args: [String(row.discord_id)],
      });
      if (txRes.rows[0]?.username) {
        username = txRes.rows[0].username;
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

    // 3. Ambil riwayat transaksi QiosPay
    const txRes = await db.execute({
      sql: 'SELECT * FROM transactions ORDER BY created_at DESC LIMIT 30',
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

    return json({
      ok: true,
      subscriptions: subs,
      transactions,
    });
  } catch (err) {
    console.error('[ADMIN-SUBS] Error:', err);
    return json({ ok: false, error: 'Gagal memuat data langganan.' }, 500);
  }
}

// POST /api/admin/subscriptions
// Tambah langganan manual oleh admin (Create)
export async function POST(request) {
  const admin = await getAdminActor();
  if (!admin) return json({ ok: false, error: 'Bukan admin' }, 403);

  let body;
  try { body = await request.json(); } catch {}
  const { discordId, username = 'Manual Grant', planId = 'premium-plus', durationMonths = 1, guildId = null } = body || {};

  const cleanId = String(discordId || '').replace(/\D/g, '');
  if (!/^\d{17,20}$/.test(cleanId)) {
    return json({ ok: false, error: 'Discord ID harus 17 sampai 20 digit angka.' }, 400);
  }

  const plan = PREMIUM_PLANS.find((p) => p.id === planId) || PREMIUM_PLANS[1];
  const durasiBulan = Math.max(1, parseInt(durationMonths, 10) || 1);

  await ready();
  const db = getDb();
  const now = Date.now();
  const expiresAt = now + durasiBulan * 30 * 24 * 60 * 60 * 1000;

  try {
    // DEDUPE: tidak boleh ada 2 langganan aktif yang tumpang tindih.
    // - Paket sama sudah aktif  -> perpanjang baris lama (bukan buat baru)
    // - Paket lain sudah aktif  -> tolak (aturan perpanjang cerdas)
    const adaRes = await db.execute({
      sql: "SELECT id, plan_id, expires_at, guild_id, last_switch_at FROM premium_subscriptions WHERE discord_id = ? AND status = 'active' AND expires_at > ? ORDER BY expires_at DESC LIMIT 1",
      args: [cleanId, now],
    });
    const aktif = adaRes.rows[0];
    if (aktif) {
      if (aktif.plan_id !== plan.id) {
        return json({ ok: false, error: `User ini sedang aktif ${aktif.plan_id}. Cabut dulu atau tunggu kedaluwarsa sebelum memberi paket berbeda.` }, 400);
      }
      const baseTime = Number(aktif.expires_at) > now ? Number(aktif.expires_at) : now;
      const newExpires = baseTime + durasiBulan * 30 * 24 * 60 * 60 * 1000;
      await db.execute({
        sql: "UPDATE premium_subscriptions SET expires_at = ?, tier_name = ?, guild_id = COALESCE(?, guild_id) WHERE id = ?",
        args: [newExpires, plan.nama, guildId ? String(guildId).trim() : null, Number(aktif.id)],
      });

      const txId = `MANUAL-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
      await db.execute({
        sql: `INSERT INTO transactions
              (id, discord_id, username, guild_id, plan_id, duration_months, amount, status, qiospay_invoice_id, created_at, paid_at)
              VALUES (?, ?, ?, ?, ?, ?, 0, 'paid', 'ADMIN_EXTEND', ?, ?)`,
        args: [txId, cleanId, username, guildId ? String(guildId).trim() : null, plan.id, durasiBulan, now, now],
      });

      await antrekanProfilUlang(db, cleanId);
      await db.execute({
        sql: "INSERT INTO data_requests (discord_id, status, data, created_at) VALUES (?, 'pending', ?, ?)",
        args: [
          cleanId,
          JSON.stringify({
            action: 'activate_premium',
            planId: plan.id,
            guildId: guildId ? String(guildId).trim() : null,
            expiresAt: newExpires,
          }),
          now,
        ],
      });

      return json({ ok: true, id: Number(aktif.id), extended: true, expiresAt: newExpires, discordId: cleanId });
    }

    // Masukkan ke premium_subscriptions
    const res = await db.execute({
      sql: `INSERT INTO premium_subscriptions (discord_id, guild_id, plan_id, tier_name, status, starts_at, expires_at, created_at)
            VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`,
      args: [
        cleanId,
        guildId ? String(guildId).trim() : null,
        plan.id,
        plan.nama,
        now,
        expiresAt,
        now,
      ],
    });

    // Catat riwayat manual di transactions
    const txId = `MANUAL-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
    await db.execute({
      sql: `INSERT INTO transactions 
            (id, discord_id, username, guild_id, plan_id, duration_months, amount, status, qiospay_invoice_id, created_at, paid_at)
            VALUES (?, ?, ?, ?, ?, ?, 0, 'paid', 'ADMIN_GRANT', ?, ?)`,
      args: [
        txId,
        cleanId,
        username,
        guildId ? String(guildId).trim() : null,
        plan.id,
        durasiBulan,
        now,
        now,
      ],
    });

    // Profil dibangun ulang agar lencana premium tampil
    await antrekanProfilUlang(db, cleanId);

    // Antrekan ke bot
    await db.execute({
      sql: "INSERT INTO data_requests (discord_id, status, data, created_at) VALUES (?, 'pending', ?, ?)",
      args: [
        cleanId,
        JSON.stringify({
          action: 'activate_premium',
          planId: plan.id,
          guildId: guildId || null,
          durationMonths: durasiBulan,
          expiresAt,
        }),
        now,
      ],
    });

    return json({ ok: true, id: Number(res.lastInsertRowid), discordId: cleanId });
  } catch (err) {
    console.error('[ADMIN-SUBS-CREATE] Error:', err);
    return json({ ok: false, error: 'Gagal menambahkan langganan.' }, 500);
  }
}

// PUT /api/admin/subscriptions
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

    // Profil dibangun ulang agar tier/riwayat terbaru tampil
    await antrekanProfilUlang(db, String(sub.discord_id));

    // Antrekan sinkronisasi ke bot
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

// DELETE /api/admin/subscriptions
// Hapus atau cabut paket premium (Delete)
export async function DELETE(request) {
  const admin = await getAdminActor();
  if (!admin) return json({ ok: false, error: 'Bukan admin' }, 403);

  let body;
  try { body = await request.json(); } catch {}
  const { id } = body || {};

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

    // Hapus dari database langganan
    await db.execute({
      sql: 'DELETE FROM premium_subscriptions WHERE id = ?',
      args: [Number(id)],
    });

    // Profil dibangun ulang agar lencana premium hilang dari web
    await antrekanProfilUlang(db, String(sub.discord_id));

    // Beritahu bot untuk mencabut status premium
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
