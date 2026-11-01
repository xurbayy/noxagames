// Helper data_requests untuk profil pendengar.
//
// Baris ack aksi premium/cabut/hapus dari bot ({premium:true}, {revoked:true},
// {deleted:true}) juga berstatus 'done' - tanpa penyaring, baris itu menimpa
// profil terbaru dan halaman /me jadi kosong. Helper ini hanya menerima baris
// yang datanya benar-benar profil lengkap (punya kunci user).

const FRESH_MS = 2 * 60 * 1000;        // profil <= 2 menit dianggap segar
const REFRESH_GAP_MS = 60 * 1000;      // jangan antre ulang lebih cepat dari ini

/** Ambil profil terakhir yang valid (punya kunci user) dari data_requests. */
export async function ambilProfilTerbaru(db, discordId) {
  const res = await db.execute({
    sql: "SELECT data FROM data_requests WHERE discord_id = ? AND status = 'done' AND data IS NOT NULL ORDER BY filled_at DESC LIMIT 5",
    args: [String(discordId)],
  });
  for (const row of res.rows) {
    try {
      const parsed = JSON.parse(row.data);
      if (parsed && typeof parsed === 'object' && 'user' in parsed) return parsed;
    } catch { /* data rusak - lewati */ }
  }
  return null;
}

/** Minta bot membangun ulang profil user (mis. setelah tier premium berubah). */
export async function antrekanProfilUlang(db, discordId) {
  await db.execute({
    sql: "INSERT INTO data_requests (discord_id, status, created_at) VALUES (?, 'pending', ?)",
    args: [String(discordId), Date.now()],
  }).catch(() => {});
}

/**
 * Stale-while-revalidate: kembalikan profil yang ada sekarang, TAPI kalau
 * umurnya sudah lewat FRESH_MS, antrekan permintaan baru di belakang layar.
 * Dengan begitu statistik/playlist di web tidak pernah "beku" di data lama.
 *
 * @returns {Promise<{profile: object|null, stale: boolean}>}
 */
export async function ambilProfilDenganRefresh(db, discordId) {
  const profile = await ambilProfilTerbaru(db, discordId);
  if (!profile) return { profile: null, stale: true };

  const updatedAt = Number(profile.updatedAt) || 0;
  const umur = updatedAt ? Date.now() - updatedAt : Infinity;
  if (umur <= FRESH_MS) return { profile, stale: false };

  // Sudah ada antrean berjalan? Jangan menumpuk.
  try {
    const cek = await db.execute({
      sql: "SELECT id, created_at FROM data_requests WHERE discord_id = ? AND status IN ('pending','processing') ORDER BY id DESC LIMIT 1",
      args: [String(discordId)],
    });
    const row = cek.rows[0];
    const baruSaja = row && Date.now() - Number(row.created_at) < REFRESH_GAP_MS;
    if (!baruSaja) await antrekanProfilUlang(db, discordId);
  } catch { /* kalau gagal, tetap sajikan profil lama */ }

  return { profile, stale: true };
}
