import { randomBytes } from 'node:crypto';
import { getSession } from '../../../lib/session';
import { json, ready } from '../../../lib/api-helpers';
import { getDb } from '../../../lib/db';
import { PREMIUM_PLANS } from '../../../lib/premiumPlan';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  // 1. Verifikasi wajib login Discord
  const session = await getSession();
  if (!session || !session.discordId) {
    return json({ ok: false, error: 'Silakan masuk dengan akun Discord terlebih dahulu.' }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Format data tidak valid.' }, 400);
  }

  const { planId, durationMonths = 1, guildId = null } = body || {};

  const plan = PREMIUM_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return json({ ok: false, error: 'Paket langganan tidak ditemukan.' }, 400);
  }

  await ready();
  const db = getDb();
  const now = Date.now();

  // Aturan Stacking:
  // - Paket INDIVIDU (Premium / Premium+) tidak bisa ditumpuk sesamanya -
  //   hanya boleh perpanjang paket individu yang sama.
  // - Paket Ultimate (server) BERBEDA cakupan, jadi BISA ditumpuk dengan
  //   paket individu yang aktif.
  const activeSubRes = await db.execute({
    sql: "SELECT plan_id, tier_name, expires_at FROM premium_subscriptions WHERE discord_id = ? AND status = 'active' AND expires_at > ? ORDER BY expires_at DESC",
    args: [String(session.discordId), now],
  });
  const aktifIndividu = activeSubRes.rows.find((r) => r.plan_id !== 'premium-ultimate');
  const aktifUltimate = activeSubRes.rows.find((r) => r.plan_id === 'premium-ultimate');

  if (plan.id !== 'premium-ultimate' && aktifIndividu && aktifIndividu.plan_id !== plan.id) {
    return json({
      ok: false,
      error: `Kamu sedang berlangganan ${aktifIndividu.tier_name}. Paket individu tidak bisa ditumpuk - perpanjang paket yang sama, atau beli Ultimate (paket server) yang cakupannya berbeda.`,
    }, 400);
  }
  if (plan.id === 'premium-ultimate' && aktifUltimate) {
    return json({
      ok: false,
      error: `Kamu sudah punya NOXA Pass Ultimate aktif. Gunakan tombol perpanjang atau ganti server lewat profil.`,
    }, 400);
  }

  const durasiData = plan.durasi.find((d) => d.bulan === Number(durationMonths)) || plan.durasi[0];
  const totalAmount = durasiData.harga || plan.hargaBulanan * durasiData.bulan;

  const txId = `TRX-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
  const expiresAt = now + 15 * 60 * 1000; // 15 menit

  const apiKey = process.env.QIOSPAY_API_KEY;
  const apiBase = (process.env.QIOSPAY_API_BASE || 'https://my.qiospay.com/v1').replace(/\/+$/, '');
  const merchantId = process.env.QIOSPAY_MERCHANT_ID || '873577065778';

  let qiospayInvoiceId = null;
  let qrisUrl = null;
  let qrisString = null;
  let invoiceUrl = null;

  // Jika env API Key QiosPay terpasang, panggil API resmi QiosPay /v1/invoices
  if (apiKey) {
    try {
      const qiosRes = await fetch(`${apiBase}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          order_id: txId,
          amount: Number(totalAmount),
          merchant_id: merchantId,
          customer_name: session.username || 'Discord User',
          description: `NOXA ${plan.nama} ${durasiData.bulan} Bulan (${session.discordId})`,
          expires_in: 1800, // 30 menit sesuai pengaturan toko
        }),
      });

      const qiosData = await qiosRes.json();
      if (qiosRes.ok && (qiosData.id || qiosData.data?.id || qiosData.order_id)) {
        const inv = qiosData.data || qiosData;
        qiospayInvoiceId = String(inv.id || inv.order_id);
        qrisUrl = inv.qris_url || inv.qr_url || inv.qr_image || null;
        qrisString = inv.qris_string || inv.qr_string || null;
        invoiceUrl = inv.invoice_url || inv.payment_url || inv.checkout_url || null;
      }
    } catch (e) {
      console.warn('[QIOSPAY] Gagal membuat invoice resmi, fallback mode standby:', e?.message || e);
    }
  }

  // Jika QRIS langsung belum didapat (mode setup awal / standby), arahkan ke portal langganan Qiospay
  if (!invoiceUrl && !qrisUrl && !qrisString) {
    invoiceUrl = 'https://my.qiospay.com/langganan';
  }

  try {
    await db.execute({
      sql: `INSERT INTO transactions 
            (id, discord_id, username, guild_id, plan_id, duration_months, amount, status, qiospay_invoice_id, qris_url, qris_string, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      args: [
        txId,
        String(session.discordId),
        session.username || 'User',
        guildId ? String(guildId) : null,
        plan.id,
        durasiData.bulan,
        totalAmount,
        qiospayInvoiceId,
        qrisUrl,
        qrisString,
        now,
      ],
    });

    return json({
      ok: true,
      transactionId: txId,
      amount: totalAmount,
      planName: plan.nama,
      durationLabel: durasiData.label,
      qiospayInvoiceId,
      qrisUrl,
      qrisString,
      invoiceUrl,
      expiresAt,
      discordId: session.discordId,
      username: session.username,
    });
  } catch (err) {
    console.error('[PAYMENT-CREATE] DB error:', err);
    return json({ ok: false, error: 'Gagal mencatat transaksi di server.' }, 500);
  }
}
