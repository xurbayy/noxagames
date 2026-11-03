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
    <footer className="mt-28 bg-crimson md:mt-36">
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
              className="h-10 w-10 shrink-0 rounded-full border border-white/20 object-cover transition duration-300 group-hover:border-[#8DBFB3]"
              draggable={false}
            />
            <span className="font-display text-base font-bold text-[#F4FAF7]">
              NOXA <span className="text-[#8DBFB3]">Sound</span>
            </span>
          </Link>
          <p className="mt-3 text-xs leading-relaxed text-[#B9D6CB]">
            Bot hiburan audio Discord: musik, podcast, dan radio. Gratis untuk semua server.
          </p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#8DBFB3]">Jelajahi</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/panduan" className="text-[#B9D6CB] hover:text-[#F4FAF7] transition-colors">Panduan Perintah</Link></li>
            <li><Link href="/top" className="text-[#B9D6CB] hover:text-[#F4FAF7] transition-colors">Top Lagu & Listener</Link></li>
            <li><Link href="/komunitas" className="text-[#B9D6CB] hover:text-[#F4FAF7] transition-colors">Komunitas Server</Link></li>
            <li><Link href="/tentang" className="text-[#B9D6CB] hover:text-[#F4FAF7] transition-colors">Tentang NOXA</Link></li>
            <li><Link href="/premium" className="text-[#B9D6CB] hover:text-[#F4FAF7] transition-colors">NOXA Pass</Link></li>
          </ul>
        </div>
        {/* Perintah cepat: pola footer NEXO, disesuaikan dengan perintah NOXA. */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#8DBFB3]">Perintah Cepat</div>
          <ul className="mt-3 space-y-2 font-mono text-sm text-[#B9D6CB]">
            <li><code className="text-[#F4FAF7]">.play</code>: putar lagu</li>
            <li><code className="text-[#F4FAF7]">.podcast</code>: 15 tema podcast</li>
            <li><code className="text-[#F4FAF7]">.lirik</code>: lirik live</li>
            <li><code className="text-[#F4FAF7]">.profile</code>: kartu statistikmu</li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#8DBFB3]">Komunitas</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href={SUPPORT_INVITE} target="_blank" rel="noopener noreferrer nofollow" className="text-[#B9D6CB] hover:text-[#F4FAF7] transition-colors">Server Dukungan</a></li>
            <li><Link href="/premium" className="text-[#B9D6CB] hover:text-[#F4FAF7] transition-colors">Aktivasi NOXA Pass</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#8DBFB3]">Legal</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/privacy-policy" className="text-[#B9D6CB] hover:text-[#F4FAF7] transition-colors">Kebijakan Privasi</Link></li>
            <li><Link href="/terms-of-service" className="text-[#B9D6CB] hover:text-[#F4FAF7] transition-colors">Ketentuan Layanan</Link></li>
          </ul>
        </div>
      </div>
      <div>
        <div className="border-t border-white/10 mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-4 py-4 text-xs text-[#A9CFC3] sm:flex-row">
          <span>© {new Date().getFullYear()} {SITE_NAME}</span>
          <span>Dibangun oleh xurbaybase</span>
        </div>
      </div>
    </footer>
  );
}
