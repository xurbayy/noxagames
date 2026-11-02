// ==========================================
// Service Worker NOXA Sound
// ==========================================
// Fungsi: membuat web bisa DIINSTALL sebagai aplikasi (syarat Chrome: SW dengan
// fetch handler) + navigasi tetap bisa dibuka walau koneksi putus (shell offline).
//
// Strategi aman untuk situs dinamis:
//   - Aset statis /_next/static/*  -> cache-first (file ber-hash, tak pernah berubah)
//   - Navigasi HTML                -> network-first, fallback cache terakhir
//   - API / gambar                 -> network only (tidak pernah menyajikan basi)
// Tidak ada precache daftar URL: semuanya dipelajari saat jalan, DB/Turso tidak
// pernah ikut ter-cache.

const CACHE_STATIS = 'noxa-statis-v1';
const CACHE_HTML = 'noxa-html-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Bersihkan cache versi lama.
    const semua = await caches.keys();
    await Promise.all(
      semua.filter((k) => k !== CACHE_STATIS && k !== CACHE_HTML).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }

  // Hanya origin sendiri.
  if (url.origin !== self.location.origin) return;

  // API: selalu network (data harus segar; gagal = gagal, jangan basi).
  if (url.pathname.startsWith('/api/')) return;

  // Aset statis: stale-while-revalidate (BUKAN cache-first murni).
  // Produksi: file ber-hash tidak pernah berubah -> tetap cepat dari cache.
  // Dev: turbopack mengubah ISI dengan NAMA FILE SAMA -> cache-first murni
  // bikin versi basi menempel selamanya (kejadian 2 Nov 2026). SWR menulis
  // ulang cache senyap tiap fetch, jadi reload berikutnya sudah segar.
  if (url.pathname.startsWith('/_next/static/') || /\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_STATIS);
      const ada = await cache.match(req);
      const jaringan = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      return ada || (await jaringan) || Response.error();
    })());
    return;
  }

  // Halaman HTML: network-first, simpan versi terbaru, fallback cache saat offline.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_HTML);
      try {
        const res = await fetch(req);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        const lama = await cache.match(req);
        if (lama) return lama;
        const beranda = await cache.match('/');
        return beranda || Response.error();
      }
    })());
    return;
  }
});
