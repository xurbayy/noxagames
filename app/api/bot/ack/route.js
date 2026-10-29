import { verifyBearer, json, ready } from '../../../lib/api-helpers';
import { getDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// POST /api/bot/ack - bot laporkan hasil eksekusi dataRequests (profil user).
export async function POST(request) {
  const denied = verifyBearer(request, 'read');
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid json' }, 400);
  }
  const results = Array.isArray(body?.results) ? body.results : [];

  await ready();
  const db = getDb();
  let updated = 0;

  for (const r of results) {
    const id = Number(r?.id);
    if (!Number.isFinite(id)) continue;

    if (r && r.data !== undefined) {
      // dataRequest terisi: simpan profil.
      try {
        await db.execute({
          sql: "UPDATE data_requests SET status = 'done', data = ?, filled_at = ? WHERE id = ?",
          args: [JSON.stringify(r.data), Date.now(), id],
        });
        updated++;
      } catch {}
    } else {
      // Gagal isi profil: tandai failed supaya /me tidak menunggu selamanya.
      const status = String(r?.status || 'failed');
      try {
        await db.execute({
          sql: "UPDATE data_requests SET status = 'failed', filled_at = ? WHERE id = ?",
          args: [Date.now(), id],
        });
        updated++;
      } catch {}
      void status;
    }
  }

  return json({ ok: true, updated });
}
