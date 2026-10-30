import { json, ready } from '../../../lib/api-helpers';
import { getDb } from '../../../lib/db';
import { antrekanProfilUlang } from '../../../lib/profile-request';

export const dynamic = 'force-dynamic';

// POST /api/payment/qiospay-callback
// Webhook resmi dari QiosPay ketika invoice telah dibayar lunas
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  // Format payload QiosPay: { type: 'invoice.paid', data: { id, status: 'paid', amount, ... } }
  // atau payload langsung: { id, status: 'paid', ... }
  const data = body.data || body;
  const invoiceId = String(data.id || data.invoice_id || '');
  const status = String(data.status || body.status || '').toLowerCase();

  if (!invoiceId) {
    return json({ ok: false, error: 'Invoice ID tidak ditemukan dalam webhook.' }, 400);
  }

  if (status !== 'paid' && body.type !== 'invoice.paid') {
    return json({ ok: true, message: `Diabaikan, status ${status}` });
  }

  await ready();
  const db = getDb();
  const now = Date.now();

  try {
    const res = await db.execute({
      sql: 'SELECT * FROM transactions WHERE qiospay_invoice_id = ? OR id = ? LIMIT 1',
      args: [invoiceId, invoiceId],
    });

    const tx = res.rows[0];
    if (!tx) {
      console.warn(`[QIOSPAY-WEBHOOK] Transaksi dengan invoice ${invoiceId} tidak ditemukan.`);
      return json({ ok: false, error: 'Transaksi tidak cocok' }, 404);
    }

    if (tx.status === 'paid') {
      return json({ ok: true, message: 'Sudah diproses sebelumnya' });
    }

    // 1. Update status transaksi
    await db.execute({
      sql: "UPDATE transactions SET status = 'paid', paid_at = ? WHERE id = ?",
      args: [now, tx.id],
    });

    // 2. Aktifkan langganan
    const durasiBulan = Number(tx.duration_months) || 1;
    const expiresAt = now + durasiBulan * 30 * 24 * 60 * 60 * 1000;

    await db.execute({
      sql: `INSERT INTO premium_subscriptions (discord_id, guild_id, plan_id, tier_name, status, starts_at, expires_at, created_at)
            VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`,
      args: [
        String(tx.discord_id),
        tx.guild_id ? String(tx.guild_id) : null,
        tx.plan_id,
        tx.plan_id === 'premium-ultimate' ? 'NOXA Premium Ultimate' : tx.plan_id === 'premium-plus' ? 'NOXA Premium+' : 'NOXA Premium',
        now,
        expiresAt,
        now,
      ],
    });

    // 3. Profil dibangun ulang + antrekan sinkronisasi ke bot
    await antrekanProfilUlang(db, String(tx.discord_id));
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

    console.log(`[QIOSPAY-WEBHOOK] Berhasil aktivasi paket ${tx.plan_id} untuk Discord ID ${tx.discord_id}`);
    return json({ ok: true, message: 'Aktivasi berhasil' });
  } catch (err) {
    console.error('[QIOSPAY-WEBHOOK] Error:', err);
    return json({ ok: false, error: 'Gagal memproses webhook' }, 500);
  }
}
