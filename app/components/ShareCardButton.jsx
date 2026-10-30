'use client';

// Tombol bagikan kartu. Memakai renderer canvas dari lib/shareCard (kartu
// 1080x1350, tajam). Di HP memakai Web Share API dengan file PNG; di desktop
// kartu diunduh dan tautan halaman disalin.
import { useState } from 'react';
import { renderShareCard, canvasToFile } from '../lib/shareCard';

export default function ShareCardButton({
  mode = 'profil',
  data = {},
  variant = 'label',
  label = 'Bagikan',
  linkPath = '/',
  title = 'NOXA Sound',
  className = '',
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);

  async function bagikan(e) {
    e?.stopPropagation?.();
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      const canvas = await renderShareCard({ mode, ...data });
      const namaFile = mode === 'rank' ? `noxa-rank-${data.rank || 1}.png` : 'noxa-profil.png';
      const file = await canvasToFile(canvas, namaFile);
      const teks =
        mode === 'rank'
          ? `Aku peringkat #${data.rank || 1} Top Listener NOXA Sound!`
          : `${data.username || 'Aku'} sudah mendengarkan ${data.durationLabel || '0m'} di NOXA Sound.`;

      if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title, text: teks });
        return;
      }

      const url = typeof window !== 'undefined' ? `${window.location.origin}${linkPath}` : linkPath;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(file);
      a.download = namaFile;
      a.click();
      URL.revokeObjectURL(a.href);
      try {
        await navigator.clipboard.writeText(url);
        setNote('Kartu diunduh & tautan disalin');
      } catch {
        setNote('Kartu diunduh');
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setNote('Gagal membuat kartu');
    } finally {
      setBusy(false);
      setTimeout(() => setNote(null), 3200);
    }
  }

  const ikon = busy ? (
    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
  ) : (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
    </svg>
  );

  const isi =
    variant === 'icon' ? (
      <button
        type="button"
        onClick={bagikan}
        disabled={busy}
        aria-label="Bagikan kartu"
        title="Bagikan kartu"
        className={`flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface2 text-muted transition hover:-translate-y-px hover:border-crimson hover:text-ink disabled:opacity-50 ${className}`}
      >
        {ikon}
      </button>
    ) : (
      <button
        type="button"
        onClick={bagikan}
        disabled={busy}
        aria-label="Bagikan kartu"
        className={`inline-flex items-center gap-1.5 rounded-full border border-linebright bg-surface2 px-3.5 py-2 text-xs font-semibold text-ink transition hover:-translate-y-px hover:border-crimson hover:bg-surface3 disabled:opacity-50 ${className}`}
      >
        {ikon}
        {label}
      </button>
    );

  return (
    <span className="relative inline-flex items-center">
      {isi}
      {note && (
        <span className="absolute right-0 top-full z-20 mt-1 w-max max-w-[220px] rounded-lg border border-line bg-surface3 px-3 py-1.5 text-[11px] font-semibold text-ink shadow-[var(--shadow-soft)]">
          {note}
        </span>
      )}
    </span>
  );
}
