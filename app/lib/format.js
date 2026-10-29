// Fungsi format murni (tanpa import DB) - aman dipakai di server DAN client.
// Dipisah dari snapshot.js karena snapshot butuh libsql yang tidak boleh
// terbawa ke bundle browser.

/** Detik -> "12j 34m" / "34m" / "45 dtk". */
export function durasi(secs) {
  const s = Math.max(0, Math.floor(Number(secs) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}j ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s} dtk`;
}

/** Durasi mm:ss / h:mm:ss untuk bar lagu. */
export function formatDuration(secs) {
  const s = Math.max(0, Math.floor(Number(secs) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const d = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(d).padStart(2, '0')}`;
  return `${m}:${String(d).padStart(2, '0')}`;
}

/** Usia snapshot jadi teks ramah. */
export function ageLabel(ageSec) {
  if (ageSec == null) return 'menunggu data';
  if (ageSec < 90) return 'baru saja';
  const m = Math.floor(ageSec / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}
