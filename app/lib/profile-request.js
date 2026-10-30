// Helper data_requests untuk profil pendengar.
//
// Baris ack aksi premium/cabut/hapus dari bot ({premium:true}, {revoked:true},
// {deleted:true}) juga berstatus 'done' - tanpa penyaring, baris itu menimpa
// profil terbaru dan halaman /me jadi kosong. Helper ini hanya menerima baris
// yang datanya benar-benar profil lengkap (punya kunci user).

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
