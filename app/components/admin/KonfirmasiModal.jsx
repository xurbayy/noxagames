'use client';

// KonfirmasiModal - popup konfirmasi BUATAN SENDIRI (pengganti confirm()
// browser yang tampilannya jelek dan tidak seragam dengan tema panel).
// Dipakai untuk aksi berbahaya di admin: hapus transaksi, bersihkan
// kedaluwarsa, bebaskan invoice, dan cabut langganan.
//
// Perilaku:
//   - Esc = batal; klik latar = batal (kecuali sedang proses).
//   - Tombol kiri selalu "Batal", kanan aksi berwarna (merah bahaya / hijau aman).
//   - Saat `busy`, tombol aksi spinner "Memproses..." dan tidak bisa ditutup.
import { useEffect } from 'react';

export default function KonfirmasiModal({
  open,
  judul,
  pesan,
  catatan,
  labelAksi = 'Hapus',
  varian = 'bahaya', // 'bahaya' (merah) | 'aman' (hijau)
  busy = false,
  onKonfirmasi,
  onBatal,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onBatal?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onBatal]);

  if (!open) return null;

  const warnaAksi = varian === 'aman'
    ? 'bg-[#14532D] border-[#22C55E] text-[#86EFAC] hover:bg-[#16A34A] hover:text-white'
    : 'bg-crimson border-crimson text-white hover:bg-neon hover:border-neon';

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={() => { if (!busy) onBatal?.(); }}
      role="dialog"
      aria-modal="true"
      aria-label={judul}
    >
      <div
        className="card relative w-full max-w-sm p-5 shadow-[var(--shadow-lift)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg font-bold ${
              varian === 'aman'
                ? 'border-[#22C55E] bg-[#14532D] text-[#86EFAC]'
                : 'border-crimson bg-[#0A3238] text-neon'
            }`}
            aria-hidden="true"
          >
            !
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-ink leading-snug break-words">{judul}</h3>
            {pesan && (
              <p className="mt-1.5 text-xs leading-relaxed text-muted break-words">{pesan}</p>
            )}
          </div>
        </div>

        {catatan && (
          <p className="mt-3.5 rounded-lg border border-line bg-surface2 px-3 py-2 text-[11px] leading-relaxed text-faint break-words">
            {catatan}
          </p>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onBatal}
            disabled={busy}
            className="btn-ghost flex-1 justify-center !py-2.5 text-xs disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onKonfirmasi}
            disabled={busy}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition disabled:opacity-50 cursor-pointer ${warnaAksi}`}
          >
            {busy && (
              <span className="nx-spin h-3 w-3 rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            )}
            {busy ? 'Memproses...' : labelAksi}
          </button>
        </div>
      </div>
    </div>
  );
}
