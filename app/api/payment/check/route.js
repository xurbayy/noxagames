import { getSession } from '../../../lib/session';
import { json, ready } from '../../../lib/api-helpers';
import { getDb } from '../../../lib/db';
import { aktifkanLangganan } from '../../../lib/aktivasi';

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
          if (String(inv.status || '').toLowerCase() === 'paid' || inv.is_paid) {
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
