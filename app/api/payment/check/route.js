import { getSession } from '../../../lib/session';
import { json, ready } from '../../../lib/api-helpers';
import { getDb } from '../../../lib/db';
import { antrekanProfilUlang } from '../../../lib/profile-request';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const session = await getSession();
  if (!session || !session.discordId) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const txId = url.searchParams.get('txId');
  if (!txId) {
    return json({ ok: false, error: 'Parameter txId wajib diisi.' }, 400);
  }

  await ready();
  const db = getDb();

  try {
    const res = await db.execute({
      sql: 'SELECT * FROM transactions WHERE id = ? AND discord_id = ? LIMIT 1',
      args: [txId, String(session.discordId)],
    });

    const tx = res.rows[0];
    if (!tx) {
      return json({ ok: false, error: 'Transaksi tidak ditemukan.' }, 404);
    }

    if (tx.status === 'paid') {
      return json({
        ok: true,
        status: 'paid',
        paidAt: tx.paid_at,
        planId: tx.plan_id,
        amount: tx.amount,
      });
    }

    // Jika pending dan ada invoice QiosPay, periksa langsung ke QiosPay
    const apiKey = process.env.QIOSPAY_API_KEY;
    const apiBase = (process.env.QIOSPAY_API_BASE || 'https://my.qiospay.com/api').replace(/\/+$/, '');
    if (tx.qiospay_invoice_id && apiKey) {
      try {
        const qiosRes = await fetch(`${apiBase}/invoices/${tx.qiospay_invoice_id}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'x-api-key': apiKey,
          },
        });
        if (qiosRes.ok) {
          const qiosData = await qiosRes.json();
          const inv = qiosData.data || qiosData;
          if (inv.status === 'paid' || inv.is_paid) {
            const now = Date.now();
            await db.execute({
              sql: "UPDATE transactions SET status = 'paid', paid_at = ? WHERE id = ?",
              args: [now, txId],
            });
            // Aktifkan paket
            await aktifkanLangganan(db, tx, now);
            return json({ ok: true, status: 'paid', paidAt: now, planId: tx.plan_id });
          }
        }
      } catch (e) {
        console.warn('[QIOSPAY-CHECK] Error checking invoice status:', e?.message || e);
      }
    }

    return json({
      ok: true,
      status: tx.status || 'pending',
      amount: tx.amount,
      planId: tx.plan_id,
      createdAt: tx.created_at,
    });
  } catch (err) {
    console.error('[PAYMENT-CHECK] DB error:', err);
    return json({ ok: false, error: 'Gagal memeriksa status transaksi.' }, 500);
  }
}

// Handler POST untuk konfirmasi / simulasi aktivasi pembayaran
export async function POST(request) {
  const session = await getSession();
  if (!session || !session.discordId) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }

  let body;
  try { body = await request.json(); } catch {}
  const { txId, simulatePay } = body || {};

  if (!txId) return json({ ok: false, error: 'txId wajib diisi.' }, 400);

  // Simulasi pembayaran diizinkan untuk admin atau saat dev mode
  const bolehSimulasi = simulatePay && (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_LOGIN === 'true');
  if (!bolehSimulasi) {
    return json({ ok: false, error: 'Pembayaran harus diselesaikan melalui gateway QRIS resmi.' }, 403);
  }

  await ready();
  const db = getDb();
  const now = Date.now();

  try {
    const res = await db.execute({
      sql: 'SELECT * FROM transactions WHERE id = ? AND discord_id = ? LIMIT 1',
      args: [txId, String(session.discordId)],
    });
    const tx = res.rows[0];
    if (!tx) return json({ ok: false, error: 'Transaksi tidak ditemukan.' }, 404);

    await db.execute({
      sql: "UPDATE transactions SET status = 'paid', paid_at = ? WHERE id = ?",
      args: [now, txId],
    });

    await aktifkanLangganan(db, tx, now);

    return json({ ok: true, status: 'paid', simulated: true, paidAt: now });
  } catch (err) {
    return json({ ok: false, error: err.message || 'Gagal aktivasi.' }, 500);
  }
}

async function aktifkanLangganan(db, tx, now) {
  const durasiBulan = Number(tx.duration_months) || 1;
  const durasiMs = durasiBulan * 30 * 24 * 60 * 60 * 1000;
  const tierName = tx.plan_id === 'premium-ultimate' ? 'NOXA Premium Ultimate' : tx.plan_id === 'premium-plus' ? 'NOXA Premium+' : 'NOXA Premium';

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
}
