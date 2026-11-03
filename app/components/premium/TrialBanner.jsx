'use client';

// TrialBanner - menawarkan NOXA Premium 3 hari GRATIS, satu kali per akun
// (pola trial Soundly, versi tanpa kartu karena QRIS). Muncul hanya kalau
// server bilang user ini memenuhi syarat: belum pernah trial, belum pernah
// bayar, tidak ada langganan individu aktif.
//
// Persetujuan ToS + Privasi WAJIB diklik dulu (aturan pemilik web untuk
// aktivasi), lalu klaim memanggil POST /api/me/trial.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Emoji from '../Emoji';

export default function TrialBanner({ session = null }) {
  const [info, setInfo] = useState(null); // { boleh, alasan, hari }
  const [modal, setModal] = useState(false);
  const [setuju, setSetuju] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [hasil, setHasil] = useState(null); // { ok, text }

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const res = await fetch('/api/me/trial', { cache: 'no-store' });
        const d = await res.json().catch(() => ({}));
        if (!batal) setInfo(d);
      } catch { if (!batal) setInfo({ boleh: false, alasan: 'jaringan' }); }
    })();
    return () => { batal = true; };
  }, []);

  async function klaim() {
    if (sibuk || !setuju) return;
    setSibuk(true);
    setHasil(null);
    try {
      const res = await fetch('/api/me/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setuju: true }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) {
        setHasil({ ok: true, text: d.message });
        setInfo({ boleh: false, alasan: 'dipakai' });
        setTimeout(() => setModal(false), 2600);
      } else {
        setHasil({ ok: false, text: d.error || 'Gagal mengaktifkan trial. Coba lagi.' });
      }
    } catch {
      setHasil({ ok: false, text: 'Koneksi terputus. Coba lagi.' });
    } finally {
      setSibuk(false);
    }
  }

  // Tamu atau tidak memenuhi syarat -> jangan render apa pun.
  if (!session || !info || !info.boleh) return null;

  const hari = info.hari || 3;

  return (
    <>
      <div className="card p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-crimson bg-[#0A3238]">
            <Emoji name="cool" size={22} />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-bold text-ink">Coba dulu {hari} hari, gratis.</div>
            <div className="mt-0.5 text-xs leading-relaxed text-muted">
              Benefit NOXA Premium aktif di semua servermu. Tanpa kartu, tanpa bayar — sekali per akun.
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setSetuju(false); setHasil(null); setModal(true); }}
          className="btn-solid btn-solid-accent shrink-0 !px-5 !py-2.5 text-sm"
        >
          Aktifkan Trial
        </button>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="card relative w-full max-w-md p-6 text-center shadow-[var(--shadow-lift)]">
            <button
              type="button"
              onClick={() => setModal(false)}
              disabled={sibuk}
              aria-label="Tutup"
              className="absolute right-4 top-4 text-faint hover:text-ink cursor-pointer disabled:opacity-50"
            >
              ✕
            </button>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0A3238] border border-crimson">
              <Emoji name="cool" size={30} />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-ink">
              {hari} Hari NOXA Premium — Gratis
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Berlaku di semua server tempat kamu dengar. Setelah berakhir, lanjutkan berbayar kapan saja —
              durasi menyambung, tidak ada hari yang hilang.
            </p>

            {hasil ? (
              <p className={`mt-5 rounded-xl border px-4 py-3 text-[13px] font-semibold leading-relaxed text-white ${
                hasil.ok ? 'border-[#22C55E] bg-[#16A34A]' : 'border-neon bg-crimson'
              }`}>
                {hasil.text}
              </p>
            ) : (
              <label className="mt-5 flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-surface2 p-3 text-left">
                <input
                  type="checkbox"
                  checked={setuju}
                  disabled={sibuk}
                  onChange={(e) => setSetuju(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#397F80]"
                />
                <span className="text-[11px] leading-relaxed text-muted">
                  Saya menyetujui{' '}
                  <Link href="/terms-of-service" target="_blank" className="font-semibold text-neon hover:underline">Ketentuan Layanan</Link>{' '}
                  dan{' '}
                  <Link href="/privacy-policy" target="_blank" className="font-semibold text-neon hover:underline">Kebijakan Privasi</Link>{' '}
                  NOXA Sound.
                </span>
              </label>
            )}

            {!hasil && (
              <button
                type="button"
                onClick={klaim}
                disabled={sibuk || !setuju}
                className={`mt-4 w-full rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200 ${
                  setuju
                    ? 'bg-crimson text-white hover:bg-neon cursor-pointer'
                    : 'bg-surface3 text-faint cursor-not-allowed'
                } disabled:opacity-60`}
              >
                {sibuk ? 'Mengaktifkan...' : setuju ? 'Setuju, Aktifkan Trial' : 'Centang persetujuan dulu'}
              </button>
            )}
            {hasil?.ok && (
              <Link href="/me" onClick={() => setModal(false)} className="btn-primary mt-4 w-full justify-center !py-3 text-sm">
                Buka Profil Saya
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
