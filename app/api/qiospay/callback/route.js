import { json, ready } from '../../../lib/api-helpers';
import { getDb } from '../../../lib/db';
import { antrekanProfilUlang } from '../../../lib/profile-request';

export const dynamic = 'force-dynamic';

// POST /api/qiospay/callback
// Endpoint webhook resmi sesuai pengaturan di dashboard QiosPay
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  // 1. Respon terhadap uji callback (event ping dari dashboard QiosPay)
  if (body?.type === 'ping' || body?.event === 'ping') {
    return json({ ok: true, message: 'pong', timestamp: Date.now() });
  }

  // 2. Pemrosesan pembayaran lunas
  const data = body.data || body;
  const invoiceId = String(data.id || data.invoice_id || '');
  const orderId = String(data.order_id || body.order_id || '');
  const status = String(data.status || body.status || '').toLowerCase();

  if (!invoiceId && !orderId) {
    return json({ ok: false, error: 'Identifier transaksi tidak ditemukan.' }, 400);
  }

  if (status !== 'paid' && body.type !== 'invoice.paid' && !data.is_paid) {
    return json({ ok: true, message: `Diabaikan, status ${status}` });
  }

  await ready();
  const db = getDb();
  const now = Date.now();

  try {
    // Cari transaksi berdasarkan invoice ID atau order ID (txId)
    const res = await db.execute({
      sql: 'SELECT * FROM transactions WHERE qiospay_invoice_id = ? OR id = ? OR id = ? LIMIT 1',
      args: [invoiceId, orderId, invoiceId],
    });

    const tx = res.rows[0];
    if (!tx) {
      console.warn(`[QIOSPAY-CALLBACK] Transaksi ${orderId || invoiceId} tidak ditemukan.`);
      return json({ ok: false, error: 'Transaksi tidak cocok' }, 404);
    }

    if (tx.status === 'paid') {
      return json({ ok: true, message: 'Sudah diproses sebelumnya' });
    }

    // Update status transaksi menjadi paid
    await db.execute({
      sql: "UPDATE transactions SET status = 'paid', paid_at = ? WHERE id = ?",
      args: [now, tx.id],
    });

    // Aktifkan paket langganan (Perpanjang Cerdas)
    const durasiBulan = Number(tx.duration_months) || 1;
    const durasiMs = durasiBulan * 30 * 24 * 60 * 60 * 1000;
    const tierName = tx.plan_id === 'premium-ultimate' ? 'NOXA Premium Ultimate' : tx.plan_id === 'premium-plus' ? 'NOXA Premium+' : 'NOXA Premium';

    const existRes = await db.execute({
      sql: "SELECT id, expires_at FROM premium_subscriptions WHERE discord_id = ? AND status = 'active' AND expires_at > ? ORDER BY expires_at DESC LIMIT 1",
      args: [String(tx.discord_id), now],
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

    // Profil dibangun ulang agar lencana premium tampil di web
    await antrekanProfilUlang(db, String(tx.discord_id));

    // Antrekan sinkronisasi ke bot VPS
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

    console.log(`[QIOSPAY-CALLBACK] Berhasil aktivasi paket ${tx.plan_id} untuk Discord ID ${tx.discord_id}`);
    return json({ ok: true, message: 'Aktivasi berhasil', transactionId: tx.id });
  } catch (err) {
    console.error('[QIOSPAY-CALLBACK] Error:', err);
    return json({ ok: false, error: 'Gagal memproses callback' }, 500);
  }
}

// GET handler opsional jika sistem webhook melakukan pengecekan health check
export async function GET() {
  return json({ ok: true, service: 'NOXA QiosPay Webhook Ready' });
}
