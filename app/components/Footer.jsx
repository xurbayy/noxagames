'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE_NAME, SUPPORT_INVITE } from '../lib/site';

export default function Footer() {
  // Halaman login dibuat berdiri sendiri: tanpa footer supaya fokus ke kartu
  // masuk dan halamannya tidak terasa "ikut halaman lain".
  const pathname = usePathname();
  if (pathname === '/login') return null;

  return (
    <footer className="mt-28 border-t border-line bg-bg md:mt-36">
      {/* 2 kolom mulai 380px; di HP sangat sempit (<= 360px) tetap 1 kolom
          supaya tautan tidak patah jadi 2-3 baris. */}
      <div className="mx-auto grid max-w-6xl gap-x-5 gap-y-8 px-4 py-12 min-[360px]:grid-cols-2 sm:px-5 lg:grid-cols-5">
        <div className="min-[360px]:col-span-2 lg:col-span-1">
          <Link href="/" prefetch={false} className="group inline-flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo NOXA Sound"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full border border-line object-cover transition duration-300 group-hover:border-neon group-hover:shadow-[0_0_12px_rgba(255,42,109,0.35)]"
              draggable={false}
            />
            <span className="font-display text-base font-bold text-ink">
              NOXA <span className="neon-text">Sound</span>
            </span>
          </Link>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Bot hiburan audio Discord: musik, podcast, dan radio. Gratis untuk semua server.
          </p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Jelajahi</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/panduan" className="text-muted hover:text-neon transition-colors">Panduan Perintah</Link></li>
            <li><Link href="/top" className="text-muted hover:text-neon transition-colors">Top Lagu & Listener</Link></li>
            <li><Link href="/komunitas" className="text-muted hover:text-neon transition-colors">Komunitas Server</Link></li>
            <li><Link href="/status" className="text-muted hover:text-neon transition-colors">Status Sistem</Link></li>
            <li><Link href="/tentang" className="text-muted hover:text-neon transition-colors">Tentang NOXA</Link></li>
            <li><Link href="/premium" className="text-muted hover:text-neon transition-colors">NOXA Pass</Link></li>
          </ul>
        </div>
        {/* Perintah cepat: pola footer NEXO, disesuaikan dengan perintah NOXA. */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Perintah Cepat</div>
          <ul className="mt-3 space-y-2 font-mono text-sm text-muted">
            <li><code className="text-ink">.play</code>: putar lagu</li>
            <li><code className="text-ink">.podcast</code>: 15 tema podcast</li>
            <li><code className="text-ink">.lirik</code>: lirik live</li>
            <li><code className="text-ink">.profile</code>: kartu statistikmu</li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Komunitas</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href={SUPPORT_INVITE} target="_blank" rel="noopener noreferrer nofollow" className="text-muted hover:text-neon transition-colors">Server Dukungan</a></li>
            <li><Link href="/premium" className="text-muted hover:text-neon transition-colors">Aktivasi NOXA Pass</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Legal</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/privacy-policy" className="text-muted hover:text-neon transition-colors">Kebijakan Privasi</Link></li>
            <li><Link href="/terms-of-service" className="text-muted hover:text-neon transition-colors">Ketentuan Layanan</Link></li>
          </ul>
        </div>
      </div>
      <div>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-4 py-4 text-xs text-faint sm:flex-row">
          <span>© {new Date().getFullYear()} {SITE_NAME}</span>
          <span>Dibangun oleh xurbaybase</span>
        </div>
      </div>
    </footer>
  );
}
