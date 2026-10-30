import { getSession } from '../../../lib/session';
import { json, ready } from '../../../lib/api-helpers';
import { getDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';

const HARI = 24 * 60 * 60 * 1000;
const COOLDOWN_GANTI_SERVER = 7 * HARI;

// POST /api/me/switch-server { guildId }
// Ganti server tujuan paket NOXA Pass Ultimate (server package).
// Cooldown 7 hari sejak pergantian terakhir supaya anti abuse.
export async function POST(request) {
  const session = await getSession();
  if (!session || !session.discordId) {
    return json({ ok: false, error: 'Silakan masuk dengan akun Discord terlebih dahulu.' }, 401);
  }

  let body;
  try { body = await request.json(); } catch {}
  const guildId = String(body?.guildId || '').replace(/\D/g, '');
  if (!/^\d{17,20}$/.test(guildId)) {
    return json({ ok: false, error: 'ID Server Discord tidak valid (harus 17-20 digit angka).' }, 400);
  }

  await ready();
  const db = getDb();
  const now = Date.now();

  // 1. Cari langganan server-package aktif milik user
  const res = await db.execute({
    sql: "SELECT id, plan_id, guild_id, last_switch_at, expires_at FROM premium_subscriptions WHERE discord_id = ? AND status = 'active' AND expires_at > ? AND plan_id = 'premium-ultimate' ORDER BY expires_at DESC LIMIT 1",
    args: [String(session.discordId), now],
  });
  const sub = res.rows[0];
  if (!sub) {
    return json({ ok: false, error: 'Kamu tidak punya paket NOXA Pass Ultimate (paket server) yang aktif.' }, 400);
  }

  if (String(sub.guild_id) === guildId) {
    return json({ ok: false, error: 'Server tersebut sudah menjadi target paketmu saat ini.' }, 400);
  }

  // 2. Cooldown 7 hari
  const lastSwitch = Number(sub.last_switch_at) || 0;
  const sisaCooldown = lastSwitch + COOLDOWN_GANTI_SERVER - now;
  if (sisaCooldown > 0) {
    const jam = Math.ceil(sisaCooldown / (60 * 60 * 1000));
    return json({ ok: false, error: `Ganti server masih cooldown. Coba lagi dalam sekitar ${jam} jam.` }, 429);
  }

  // 3. Update target server + catat waktu ganti
  await db.execute({
    sql: 'UPDATE premium_subscriptions SET guild_id = ?, last_switch_at = ? WHERE id = ?',
    args: [guildId, now, Number(sub.id)],
  });

  // 4. Sinkronkan bot: cabut premium guild lama, aktifkan di guild baru
  if (sub.guild_id) {
    await db.execute({
      sql: "INSERT INTO data_requests (discord_id, status, data, created_at) VALUES (?, 'pending', ?, ?)",
      args: [String(session.discordId), JSON.stringify({ action: 'revoke_premium', guildId: String(sub.guild_id) }), now],
    });
  }
  await db.execute({
    sql: "INSERT INTO data_requests (discord_id, status, data, created_at) VALUES (?, 'pending', ?, ?)",
    args: [String(session.discordId), JSON.stringify({
      action: 'activate_premium',
      planId: sub.plan_id,
      guildId,
      expiresAt: Number(sub.expires_at),
    }), now],
  });

  return json({
    ok: true,
    guildId,
    nextSwitchAt: now + COOLDOWN_GANTI_SERVER,
    message: 'Server tujuan berhasil diganti. Bot akan memindahkan benefit dalam maksimal 30 detik.',
  });
}
