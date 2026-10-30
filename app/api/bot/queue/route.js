import { verifyBearer, json, ready } from '../../../lib/api-helpers';
import { getDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// GET /api/bot/queue - bot tarik antrean data_requests tiap ~20 detik.
// Claim atomik dengan lease 2 menit (pola web NEXO): kalau bot mati di tengah,
// request kembali 'pending' sehingga tidak ada profil yang nyangkut selamanya.
const LEASE_MS = 2 * 60 * 1000;

export async function GET(request) {
  const denied = verifyBearer(request, 'read');
  if (denied) return denied;

  await ready();
  const db = getDb();
  const now = Date.now();

  // 1) Lepas claim yang lease-nya kedaluwarsa.
  try {
    await db.execute({
      sql: "UPDATE data_requests SET status = 'pending', claimed_at = NULL WHERE status = 'processing' AND (claimed_at IS NULL OR claimed_at < ?)",
      args: [now - LEASE_MS],
    });
  } catch {}

  // 2) Ambil kandidat + claim atomik satu per satu.
  let candidates = [];
  try {
    const res = await db.execute(
      "SELECT id, discord_id, data FROM data_requests WHERE status = 'pending' ORDER BY created_at ASC LIMIT 20"
    );
    candidates = res.rows;
  } catch {}

  const claimed = [];
  for (const r of candidates) {
    try {
      const res = await db.execute({
        sql: "UPDATE data_requests SET status = 'processing', claimed_at = ? WHERE id = ? AND status = 'pending'",
        args: [now, r.id],
      });
      if (res.rowsAffected > 0) claimed.push(r);
    } catch {}
  }

  return json({
    nextPollMs: claimed.length ? 1000 : undefined, // profil ditunggu user, percepat
    commands: [],
    dataRequests: claimed.map((r) => {
      let action = 'profile';
      let payload = null;
      try {
        const parsed = JSON.parse(r.data);
        if (parsed && typeof parsed === 'object') {
          payload = parsed;
          if (parsed.action) action = parsed.action;
        }
      } catch {}
      return { id: Number(r.id), discordId: String(r.discord_id), action, payload };
    }),
  });
}
