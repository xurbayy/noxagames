'use client';

// Banner persetujuan cookie - sesuai teks kebijakan privasi:
// NOXA Sound hanya memakai cookie fungsional (sesi login). Tidak ada
// analitik, iklan, atau pelacakan pihak ketiga.
// Keputusan disimpan di localStorage (bukan cookie) supaya tidak menambah
// cookie lagi - cukup sekali per perangkat.
import { useEffect, useState } from 'react';
import Link from 'next/link';

const KEY = 'noxa_cookie_choice';

export default function CookieConsent() {
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setTampil(true);
    } catch { /* storage diblokir: banner muncul tiap kunjung, tetap bisa ditutup */ }
  }, []);

  function putuskan(nilai) {
    try { localStorage.setItem(KEY, nilai); } catch {}
    setTampil(false);
  }

  if (!tampil) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-md">
      <div className="card border-linebright bg-surface2 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2B0003] border border-crimson">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 1 0 10 10 2 2 0 0 0-2.65-1.9 2.5 2.5 0 0 1-3.15-3.15A2 2 0 0 0 14.3 4.2 10 10 0 0 0 12 2Zm-4.5 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm2 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5-1a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
            </svg>
          </span>
          <h3 className="font-display text-sm font-bold">Cookie</h3>
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-muted">
          Web ini hanya memakai cookie fungsional untuk sesi login kamu. Tidak ada
          cookie analitik, iklan, atau pelacakan dari pihak ketiga.
        </p>
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => putuskan('ok')} className="btn-primary !px-3.5 !py-2 text-xs">
            Oke, Mengerti
          </button>
          <Link href="/privacy-policy" className="text-xs text-muted underline hover:text-ink transition-colors">
            Kebijakan Privasi
          </Link>
          <button type="button" onClick={() => putuskan('cukup')} className="ml-auto text-xs text-faint hover:text-muted transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
