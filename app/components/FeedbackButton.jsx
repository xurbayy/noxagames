'use client';

// Tombol feedback di navbar (sebelah lonceng). Modal kecil berisi pilihan
// jenis (Saran / Bug / Laporan) + textarea. Masuk ke web (tabel web_feedback),
// lonceng admin, dan di-forward bot ke channel laporan Discord.
//
// Pola NEXO: tombol ini HANYA dirender saat user login (lihat Navbar) -
// tamu tidak melihatnya sama sekali.
import { useEffect, useRef, useState } from 'react';

const JENIS = [
  { id: 'Saran', label: 'Saran' },
  { id: 'Bug', label: 'Lapor Bug' },
  { id: 'Laporan', label: 'Laporan' },
];

export default function FeedbackButton() {
  const [buka, setBuka] = useState(false);
  const [jenis, setJenis] = useState('Saran');
  const [pesan, setPesan] = useState('');
  const [sibuk, setSibuk] = useState(false);
  const [hasil, setHasil] = useState(null);
  const boxRef = useRef(null);

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

  async function kirim(e) {
    e.preventDefault();
    if (sibuk || pesan.trim().length < 5) return;
    setSibuk(true);
    setHasil(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jenis, pesan: pesan.trim(), halaman: window.location.pathname }),
      });
      const d = await res.json().catch(() => ({}));
      if (d.ok) {
        setHasil({ ok: true, teks: d.message });
        setPesan('');
        setTimeout(() => { setHasil(null); setBuka(false); }, 2400);
      } else {
        setHasil({ ok: false, teks: d.reason || 'Gagal mengirim.' });
      }
    } catch {
      setHasil({ ok: false, teks: 'Gagal menghubungi server.' });
    } finally {
      setSibuk(false);
    }
  }

  const placeholder = jenis === 'Bug'
    ? 'Ceritain bugnya + langkah mengulanginya...'
    : jenis === 'Laporan'
      ? 'Siapa, di server mana, kejadiannya apa...'
      : 'Ide fitur, kritik, atau pujian juga boleh...';

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-label="Kirim feedback atau laporan"
        aria-expanded={buka}
        title="Feedback & Laporan"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface2 text-ink transition hover:border-linebright hover:bg-surface3 cursor-pointer"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Mobile = sheet tengah + backdrop; desktop = dropdown anchored.
          Sama seperti lonceng notifikasi (permintaan pemilik 2 Nov 2026). */}
      {buka && (
        <div className="fixed inset-0 z-[88] bg-black/80 md:hidden" aria-hidden="true" onClick={() => setBuka(false)} />
      )}

      {buka && (
        <div className="fixed left-1/2 top-1/2 z-[90] w-[calc(100vw-2rem)] max-w-96 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-line bg-surface2 shadow-[0_16px_50px_rgba(0,0,0,0.65)] md:absolute md:inset-auto md:right-0 md:top-11 md:z-50 md:w-72 md:max-w-[18rem] md:translate-x-0 md:translate-y-0">
          <div className="flex items-start justify-between gap-2 border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-bold text-ink">Feedback & Laporan</p>
              <p className="mt-0.5 text-[11px] text-faint">Langsung sampai ke admin lewat Discord.</p>
            </div>
            <button
              type="button"
              onClick={() => setBuka(false)}
              aria-label="Tutup"
              className="mt-0.5 shrink-0 text-faint transition hover:text-ink cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tombol hanya dirender saat login (lihat Navbar), jadi tidak ada
              cabang tamu di sini - form langsung tampil. */}
          <form onSubmit={kirim} className="px-4 py-3">
            <div className="flex gap-1.5" role="radiogroup" aria-label="Jenis laporan">
              {JENIS.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  role="radio"
                  aria-checked={jenis === j.id}
                  onClick={() => setJenis(j.id)}
                  className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition cursor-pointer ${
                    jenis === j.id
                      ? 'border-crimson bg-[#3B0004] text-neon'
                      : 'border-line bg-surface3 text-muted hover:text-ink'
                  }`}
                >
                  {j.label}
                </button>
              ))}
            </div>

            <textarea
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              rows={3}
              maxLength={1500}
              placeholder={placeholder}
              className="mt-3 w-full resize-y rounded-xl border border-line bg-bg px-3 py-2 text-xs text-ink outline-none focus:border-crimson sm:text-sm"
            />

            {hasil && (
              <p className={`mt-2 rounded-lg border px-3 py-2 text-[11px] font-semibold leading-relaxed text-white ${
                hasil.ok
                  ? 'border-[#22C55E] bg-[#16A34A]'
                  : 'border-neon bg-crimson'
              }`}>
                {hasil.teks}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-faint">{pesan.length}/1500</span>
              <button
                type="submit"
                disabled={sibuk || pesan.trim().length < 5}
                className="btn-primary !px-4 !py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sibuk ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
