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

      {/* Panel kecil. HP: FIXED tengah bawah navbar (bukan nempel ikon - di
          mobile ikon bukan paling kanan, panel nempel ikon kepotong tepi
          layar). sm+ baru nempel kanan bawah ikon seperti NEXO.
          Textarea WAJIB text-base 16px: di bawah itu iOS auto-zoom saat fokus. */}
      {buka && (
        <div className="fixed left-1/2 top-16 z-50 w-60 max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-surface2 shadow-[0_12px_32px_rgba(0,0,0,0.55)] sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-64 sm:max-w-none sm:translate-x-0">
          <div className="border-b border-line px-3.5 py-2.5">
            <p className="text-[13px] font-bold text-ink">Feedback & Laporan</p>
            <p className="mt-0.5 text-[10px] text-faint">Langsung sampai ke admin lewat Discord.</p>
          </div>

          {/* Tombol hanya dirender saat login (lihat Navbar), jadi tidak ada
              cabang tamu di sini - form langsung tampil. */}
          <form onSubmit={kirim} className="px-3.5 py-3">
            <div className="grid grid-cols-3 gap-1" role="radiogroup" aria-label="Jenis laporan">
              {JENIS.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  role="radio"
                  aria-checked={jenis === j.id}
                  onClick={() => setJenis(j.id)}
                  className={`rounded-lg border px-1 py-1.5 text-[10px] font-bold transition cursor-pointer sm:text-[11px] ${
                    jenis === j.id
                      ? 'border-crimson bg-[#1F4E47] text-[#DCEFE6]'
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
              className="mt-2.5 w-full resize-y rounded-lg border border-line bg-bg px-2.5 py-2 text-base leading-relaxed text-ink outline-none focus:border-crimson"
            />

            {hasil && (
              <p className={`mt-2 rounded-lg border px-3 py-2 text-xs font-semibold leading-relaxed text-white ${
                hasil.ok
                  ? 'border-[#22C55E] bg-[#16A34A]'
                  : 'border-neon bg-crimson'
              }`}>
                {hasil.teks}
              </p>
            )}

            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] text-faint">{pesan.length}/1500</span>
              <button
                type="submit"
                disabled={sibuk || pesan.trim().length < 5}
                className="btn-primary !px-4 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
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
