// Rate limit: in-memory untuk endpoint ringan + DB (tabel rate_limit) untuk
// endpoint sensitif supaya hitungannya dibagi semua instance Vercel.

const mem = new Map();

/** Rate limiter in-memory lintas request (per instance). Return true = lolos. */
export function rateLimitGlobal(bucket, max, windowMs) {
  const now = Date.now();
  const start = Math.floor(now / windowMs) * windowMs;
  const cur = mem.get(bucket);
  if (!cur || cur.start !== start) {
    mem.set(bucket, { start, hits: 1 });
    // Bersihkan bucket basi biar Map tidak bengkak.
    if (mem.size > 500) {
      for (const [k, v] of mem) if (v.start < start) mem.delete(k);
    }
    return true;
  }
  cur.hits += 1;
  return cur.hits <= max;
}

/**
 * Rate limit persisten via DB. Return true = lolos.
 * Dipakai endpoint yang bisa disalahgunakan lintas instance (me/refresh, dll).
 */
export async function dbRateLimit(db, bucket, max, windowMs) {
  const now = Date.now();
  const start = Math.floor(now / windowMs) * windowMs;
  try {
    const res = await db.execute({
      sql: `INSERT INTO rate_limit (bucket, window_start, hits) VALUES (?, ?, 1)
            ON CONFLICT(bucket, window_start) DO UPDATE SET hits = hits + 1
            RETURNING hits`,
      args: [bucket, start],
    });
    const hits = Number(res.rows?.[0]?.hits) || 1;
    return hits <= max;
  } catch {
    // DB gagal -> fallback in-memory supaya fitur tidak mati total.
    return rateLimitGlobal(bucket, max, windowMs);
  }
}
