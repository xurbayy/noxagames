'use client';

// PwaPrompt - membuat NOXA Sound terasa seperti aplikasi di HP (pola NEXO):
//   1. Mendaftarkan service worker (syarat installability Chrome/Android).
//   2. Menawarkan "Pasang Aplikasi" lewat bottom-sheet sendiri (bukan dialog
//      browser) saat Chromium mengirim beforeinstallprompt.
//   3. iPhone/iPad (Safari tidak mendukung beforeinstallprompt): panduan singkat
//      "Add to Home Screen" lewat Share, ditampilkan sekali dan bisa ditutup.
//
// Aturan sopan: muncul max 1x per 14 hari per perangkat (localStorage), tidak
// menutupi konten (strip bawah gaya CookieConsent), dan selalu bisa ditutup.
import { useCallback, useEffect, useState } from 'react';

const KUNCI_NEXT = 'noxa_pwa_prompt_next';
const KUNCI_IOS = 'noxa_pwa_ios_seen';
const JEDA_HARI = 14;

export default function PwaPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [showIos, setShowIos] = useState(false);
  const [terpasang, setTerpasang] = useState(false);

  // 1. Registrasi service worker (perangkat apa pun, senyap).
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW gagal (mis. halaman http lokal) - tidak apa-apa, situs tetap jalan.
    });
  }, []);

  // Sudah berdiri sendiri (di-launch dari ikon) -> jangan tawarkan lagi.
  const standalone = typeof window !== 'undefined'
    && (window.matchMedia?.('(display-mode: standalone)').matches
      || window.navigator?.standalone === true);

  // Deteksi iPhone/iPad Safari (bukan desktop Mac yang sudah mendukung install).
  const isIosSafari = typeof navigator !== 'undefined'
    && /iphone|ipad|ipod/i.test(navigator.userAgent)
    && !/crios|fxios|edgios/i.test(navigator.userAgent)
    && typeof window !== 'undefined' && !!window.matchMedia;

  // 2. Tangkap beforeinstallprompt sebelum Chrome membuangnya.
  useEffect(() => {
    if (standalone) return;
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => {
      setTerpasang(true);
      setShow(false);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [standalone]);

  // Muncul setelah halaman tenang 6 detik; hormati jeda 14 hari.
  useEffect(() => {
    if (standalone || terpasang) return;
    const t = setTimeout(() => {
      try {
        const next = Number(localStorage.getItem(KUNCI_NEXT) || 0);
        if (next > Date.now()) return;
        if (deferred) { setShow(true); return; }
        // iOS: tawarkan panduan manual sekali.
        if (isIosSafari && !localStorage.getItem(KUNCI_IOS)) setShowIos(true);
      } catch { setShow(Boolean(deferred)); }
    }, 6000);
    return () => clearTimeout(t);
  }, [deferred, standalone, terpasang, isIosSafari]);

  const tutup = useCallback((pasangJeda = true) => {
    setShow(false);
    setShowIos(false);
    if (pasangJeda) {
      try {
        localStorage.setItem(KUNCI_NEXT, String(Date.now() + JEDA_HARI * 86400000));
        if (isIosSafari) localStorage.setItem(KUNCI_IOS, '1');
      } catch {}
    }
  }, [isIosSafari]);

  const pasang = useCallback(async () => {
    if (!deferred) return;
    try {
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === 'accepted') setTerpasang(true);
      else tutup();
    } catch {
      tutup();
    }
    setDeferred(null);
    setShow(false);
  }, [deferred, tutup]);

  if (standalone || terpasang) return null;
  const tampil = show && deferred;
  const tampilIos = showIos;
  if (!tampil && !tampilIos) return null;

  return (
    <div className="fixed inset-x-3.5 bottom-3.5 z-[70] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-80">
      <div className="card flex items-center gap-3 p-3.5 shadow-[var(--shadow-lift)] backdrop-blur-xl">
        <img src="/android-chrome-192x192.png" alt="" className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          {tampil ? (
            <>
              <div className="text-sm font-bold leading-tight text-ink">Pasang NOXA</div>
              <div className="mt-0.5 text-[11px] leading-snug text-muted break-words">
                Buka seperti aplikasi - dari ikon di layar HP-mu.
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={pasang}
                  className="btn-solid btn-solid-accent !px-3 !py-1.5 text-[11px]"
                >
                  Pasang
                </button>
                <button
                  type="button"
                  onClick={() => tutup()}
                  className="text-[11px] font-semibold text-faint transition-colors hover:text-ink cursor-pointer"
                >
                  Nanti
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-bold leading-tight text-ink">Tambah ke Layar Depan</div>
              <div className="mt-0.5 text-[11px] leading-snug text-muted break-words">
                Safari iOS: ketuk tombol <strong className="text-ink">Share</strong> lalu{' '}
                <strong className="text-ink">&quot;Add to Home Screen&quot;</strong> - NOXA
                terbuka seperti aplikasi.
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => tutup()}
                  className="btn-solid btn-solid-light !px-3 !py-1.5 text-[11px]"
                >
                  Mengerti
                </button>
              </div>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => tutup()}
          aria-label="Tutup"
          className="absolute right-2 top-2 text-faint transition-colors hover:text-ink cursor-pointer"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
