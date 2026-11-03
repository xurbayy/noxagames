// ==========================================
// Service Worker NOXA Sound - KILL SWITCH (3 Nov 2026)
// ==========================================
// PWA sengaja DIHENTIKAN: prompt "Pasang aplikasi" terdeteksi heuristik
// Safe Browsing sebagai pola instalasi agresif (konteks: flag "Halaman
// tidak jujur" di Search Console). Halaman tidak lagi menautkan manifest,
// tidak ada komponen yang me-registrasi file ini lagi.
//
// File ini TETAP ADA satu masa transisi supaya perangkat yang terlanjur
// memasang SW versi lama bisa membersihkan dirinya sendiri:
//   - saat install/activate -> unregister registration sendiri
//   - hapus semua Cache Storage
//   - tidak pernah menangani fetch apa pun (tidak ada cache konten lagi)
// Setelah diperkirakan semua klien ter-update (beberapa minggu), file ini
// boleh dihapus total dari public/.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch {}
    try {
      await self.registration.unregister();
    } catch {}
    // Arahan ulang tab terkontrol supaya registrasi bersih saat kunjungan
    // berikutnya (tanpa ini, SW lama bisa tetap menyajikan cache sampai
    // tab ditutup-buka ulang).
    try {
      const kliens = await self.clients.matchAll({ type: 'window' });
      for (const cl of kliens) { try { cl.navigate('/'); } catch {} }
    } catch {}
  })());
});

// Sengaja TIDAK ada handler 'fetch' - SW ini tidak boleh melayani/menyimpan
// apa pun. Tanpa fetch listener, syarat installability Chrome patah.
