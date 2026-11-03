'use client';

// Lonceng notifikasi user di navbar (pola NEXO): dropdown berisi pengumuman
// admin, konfirmasi pembelian, dan kabar lain. Dibaca dari /api/me/notifications.
//
// Detail penting:
//   - Tombol SELALU dirender saat loading (tidak kedip hilang) dan hanya
//     disembunyikan kalau API memastikan tamu.
//   - Poll 60 detik + refresh saat tab kembali aktif / jendela fokus.
//   - "Tandai dibaca" per item atau semua; status disimpan di DB (bukan
//     localStorage) jadi konsisten antar perangkat.
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const IKON = {
  pembelian: { label: 'PEMBELIAN', kelas: 'bg-[#14532D] text-[#86EFAC] border-[#22C55E]' },
  event: { label: 'EVENT', kelas: 'bg-[#3A2503] text-[#FBBF24] border-[#F59E0B]' },
  penting: { label: 'PENTING', kelas: 'bg-[#0C3A44] text-neon border-crimson' },
  info: null,
};

export default function NotifikasiUser() {
  const [items, setItems] = useState([]);
  const [tamu, setTamu] = useState(null); // null = belum tahu
  const [buka, setBuka] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const boxRef = useRef(null);
  // ID tertinggi yang sudah pernah dilihat: dipakai untuk mendeteksi notif
  // BARU (bukan saat muat pertama) sebelum menampilkan notifikasi perangkat.
  const idTerakhirRef = useRef(null);

  const muat = useCallback(async () => {
    if (typeof document !== 'undefined' && document.hidden) return;
    try {
      const res = await fetch('/api/me/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const d = await res.json().catch(() => ({}));
      setTamu(Boolean(d.tamu));
      if (Array.isArray(d.notifications)) {
        // Notifikasi perangkat HANYA setelah user menyetujui lewat
        // ConsentNotif (localStorage per perangkat). Muat pertama tidak
        // memicu apa pun - hanya daftar baru setelah itu.
        try {
          const setuju = localStorage.getItem('noxa_notif_consent') === 'ya';
          const idBaru = d.notifications.reduce((m, n) => Math.max(m, Number(n.id) || 0), 0);
          if (setuju && idTerakhirRef.current != null && idBaru > idTerakhirRef.current
            && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            const palingBaru = d.notifications.find((n) => Number(n.id) === idBaru);
            if (palingBaru) {
              new Notification(palingBaru.judul, {
                body: palingBaru.isi || 'Buka NOXA Sound untuk detailnya.',
                icon: '/android-chrome-192x192.png',
                tag: `noxa-${idBaru}`,
              });
            }
          }
          idTerakhirRef.current = idBaru;
        } catch { /* storage diblokir: cukup tampil di dropdown */ }
        setItems(d.notifications);
      }
    } catch { /* jaringan putus: biarkan daftar lama */ }
  }, []);

  useEffect(() => {
    const t = setTimeout(muat, 0);
    const iv = setInterval(muat, 60000);
    const onFocus = () => muat();
    const onVisible = () => { if (!document.hidden) muat(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(t); clearInterval(iv);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [muat]);

  useEffect(() => {
    if (!buka) return undefined;
    const onKlik = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setBuka(false); };
    const onEsc = (e) => { if (e.key === 'Escape') setBuka(false); };
    document.addEventListener('mousedown', onKlik);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onKlik);
      document.removeEventListener('keydown', onEsc);
    };
  }, [buka]);

  const jumlah = items.length;

  async function tandai(id) {
    setItems((arr) => arr.filter((n) => n.id !== id));
    try {
      await fetch('/api/me/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch { /* optimistic: kalau gagal, muncul lagi saat poll */ }
  }

  async function tandaiSemua() {
    setSibuk(true);
    const lama = items;
    setItems([]);
    try {
      await fetch('/api/me/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
    } catch { setItems(lama); }
    finally { setSibuk(false); }
  }

  // Hanya sembunyikan kalau sudah PASTI tamu.
  if (tamu === true) return null;

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-label={`Notifikasi${jumlah ? ` (${jumlah} baru)` : ''}`}
        aria-expanded={buka}
        title="Notifikasi"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface2 text-ink transition hover:border-linebright hover:bg-surface3 cursor-pointer"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {jumlah > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-crimson px-1 text-[0.6rem] font-bold text-white">
            {jumlah > 9 ? '9+' : jumlah}
          </span>
        )}
      </button>

      {/* Panel kecil. HP: FIXED di tengah bawah navbar (bukan anchored ke
          ikon) - di mobile lonceng bukan ikon paling kanan (masih ada NOXA
          Pass + hamburger di sebelahnya), jadi panel yang nempel ikon
          meluber ke kiri dan KE POTONG tepi layar (laporan pemilik).
          Desktop (sm+): baru nempel kanan bawah lonceng seperti NEXO. */}
      {buka && (
        <div className="fixed left-1/2 top-16 z-50 w-60 max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-surface2 shadow-[0_12px_32px_rgba(0,0,0,0.55)] sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-64 sm:max-w-none sm:translate-x-0">
          <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
            <div>
              <p className="text-sm font-bold text-ink">Notifikasi</p>
              <p className="mt-0.5 text-xs text-faint">{jumlah > 0 ? `${jumlah} belum dibaca` : 'Semua sudah dibaca'}</p>
            </div>
            {jumlah > 0 && (
              <button
                type="button"
                onClick={tandaiSemua}
                disabled={sibuk}
                className="text-xs font-semibold text-neon hover:underline cursor-pointer disabled:opacity-50"
              >
                Tandai dibaca
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="px-3.5 py-6 text-center text-xs leading-relaxed text-faint">
              Belum ada notifikasi. Kabar pembelian &amp; pengumuman admin muncul di sini.
            </p>
          ) : (
            <ul className="max-h-64 divide-y divide-line/70 overflow-y-auto sm:max-h-72">
              {items.map((n) => {
                const ikon = IKON[n.tipe] || null;
                return (
                  <li key={n.id} className="px-3.5 py-2.5">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold leading-snug text-ink break-words">
                          {ikon && (
                            <span className={`mr-1 inline-block align-middle rounded-full border px-1.5 py-px text-[8px] font-extrabold ${ikon.kelas}`}>
                              {ikon.label}
                            </span>
                          )}
                          {n.judul}
                        </p>
                        {n.isi && <p className="mt-0.5 text-[11px] leading-snug text-muted break-words line-clamp-2">{n.isi}</p>}
                        <p className="mt-0.5 text-[9px] text-faint">
                          {new Date(n.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => tandai(n.id)}
                        aria-label="Tandai dibaca"
                        title="Tandai dibaca"
                        className="shrink-0 rounded-full p-1 text-faint transition hover:bg-surface3 hover:text-ink cursor-pointer"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                    {n.url && (
                      <Link
                        href={n.url}
                        onClick={() => { setBuka(false); tandai(n.id); }}
                        className="mt-1 inline-block text-[11px] font-semibold text-neon hover:underline"
                      >
                        Buka
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
