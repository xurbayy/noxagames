'use client';

// Consent notifikasi perangkat - gaya CookieConsent: muncul SEKALI per
// perangkat, user harus memilih dulu sebelum notifikasi apa pun dikirim.
//
// Kenapa terpisah dari CookieConsent: cookie consent menutup banner begitu
// dijawab, sedangkan izin notifikasi butuh keputusan eksplisit (dan browser
// punya prompt sendiri). Alur:
//   1. User login + browser mendukung notifikasi + belum pernah memutuskan
//      -> tampil strip kecil "Aktifkan notifikasi?" (Bukan/Tutup).
//   2. "Aktifkan" -> Notification.requestPermission() -> kalau granted,
//      daftarkan service worker. Kalau ditolak browser, tampilkan catatan
//      cara membukanya lewat ikon gembok.
//   3. Keputusan disimpan di localStorage per perangkat (`noxa_notif_consent`),
//      jadi tidak ditanya ulang. "Nanti" ditanya lagi setelah 7 hari.
//
// Catatan: TIDAK memakai Web Push (butuh VAPID + tabel langganan). Notifikasi
// di sini = notifikasi lokal saat tab dibuka, cukup untuk kabar pembelian dan
// pengumuman tanpa menambah dependensi server.
import { useEffect, useState } from 'react';

const KUNCI = 'noxa_notif_consent';      // 'ya' | 'tidak'
const KUNCI_NANTI = 'noxa_notif_nanti';  // timestamp kapan boleh tanya lagi
const JEDA_HARI = 7;

export default function ConsentNotif() {
  const [tampil, setTampil] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | minta | ditolak | siap
  const [catatan, setCatatan] = useState(null);

  useEffect(() => {
    let batal = false;
    const cek = async () => {
      if (typeof window === 'undefined') return;
      if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

      try {
        const sudah = localStorage.getItem(KUNCI);
        if (sudah) return; // sudah memutuskan
        const nanti = Number(localStorage.getItem(KUNCI_NANTI) || 0);
        if (nanti > Date.now()) return;

        // Hanya untuk user yang login (notifikasi personal tidak berguna untuk tamu).
        const res = await fetch('/api/me/notifications', { cache: 'no-store' });
        const d = await res.json().catch(() => ({}));
        if (d.tamu) return; // tamu: jangan tampilkan

        // Izin sudah granted sebelumnya (mis. diatur manual) -> simpan & jangan tanya.
        if (Notification.permission === 'granted') {
          try { localStorage.setItem(KUNCI, 'ya'); } catch {}
          return;
        }
        if (Notification.permission === 'denied') {
          try { localStorage.setItem(KUNCI, 'tidak'); } catch {}
          return;
        }

        if (!batal) setTimeout(() => setTampil(true), 3500);
      } catch { /* storage/fetch gagal: jangan ganggu halaman */ }
    };
    cek();
    return () => { batal = true; };
  }, []);

  async function aktifkan() {
    setStatus('minta');
    setCatatan(null);
    try {
      const izin = await Notification.requestPermission();
      if (izin === 'granted') {
        try { localStorage.setItem(KUNCI, 'ya'); } catch {}
        await navigator.serviceWorker.register('/sw.js').catch(() => {});
        setStatus('siap');
        setTimeout(() => setTampil(false), 1800);
      } else if (izin === 'denied') {
        try { localStorage.setItem(KUNCI, 'tidak'); } catch {}
        setStatus('ditolak');
        setCatatan('Izin diblokir browser. Buka ikon gembok di address bar, izinkan Notifikasi, lalu muat ulang halaman.');
      } else {
        // Prompt ditutup tanpa jawaban.
        setStatus('idle');
        setCatatan('Izin belum diberikan. Coba lagi kapan saja dari lonceng notifikasi.');
      }
    } catch {
      setStatus('idle');
      setCatatan('Browser tidak bisa meminta izin sekarang.');
    }
  }

  function nanti() {
    try { localStorage.setItem(KUNCI_NANTI, String(Date.now() + JEDA_HARI * 86400000)); } catch {}
    setTampil(false);
  }

  function tolak() {
    try { localStorage.setItem(KUNCI, 'tidak'); } catch {}
    setTampil(false);
  }

  if (!tampil) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[72] mx-auto max-w-md">
      <div className="card border-linebright bg-surface2 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="shrink-0 text-neon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
          </span>
          <h3 className="font-display text-sm font-bold">Notifikasi</h3>
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-muted">
          Izinkan NOXA mengirim kabar pembelian, event, dan pengumuman admin
          ke perangkat ini? Bisa dimatikan kapan saja dari lonceng notifikasi.
        </p>

        {catatan && (
          <p className="mt-2.5 rounded-lg border border-line bg-surface3 px-3 py-2 text-[11px] leading-relaxed text-faint">
            {catatan}
          </p>
        )}

        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={aktifkan}
            disabled={status === 'minta' || status === 'siap'}
            className="btn-primary !px-3.5 !py-2 text-xs disabled:opacity-60"
          >
            {status === 'siap' ? 'Aktif!' : status === 'minta' ? 'Meminta izin...' : 'Aktifkan'}
          </button>
          <button type="button" onClick={nanti} className="text-xs text-muted underline hover:text-ink transition-colors">
            Nanti
          </button>
          <button type="button" onClick={tolak} className="ml-auto text-xs text-faint hover:text-muted transition-colors">
            Jangan tampilkan
          </button>
        </div>
      </div>
    </div>
  );
}
