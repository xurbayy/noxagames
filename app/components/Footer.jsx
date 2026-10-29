import Link from 'next/link';
import { SITE_NAME, SUPPORT_INVITE } from '../lib/site';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface mt-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="font-display text-base font-bold">
            NOXA <span className="neon-text">Sound</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Bot hiburan audio Discord: musik, podcast, dan radio. Gratis untuk semua server.
          </p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Jelajahi</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/panduan" className="text-muted hover:text-neon transition-colors">Panduan Perintah</Link></li>
            <li><Link href="/top" className="text-muted hover:text-neon transition-colors">Top Lagu & Listener</Link></li>
            <li><Link href="/premium" className="text-muted hover:text-neon transition-colors">Premium</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Komunitas</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href={SUPPORT_INVITE} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-neon transition-colors">Server Dukungan</a></li>
            <li><Link href="/redeem" className="text-muted hover:text-neon transition-colors">Redeem Kode</Link></li>
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
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-4 py-4 text-xs text-faint sm:flex-row">
          <span>© {new Date().getFullYear()} {SITE_NAME}</span>
          <span>Dibangun oleh xurbaybase</span>
        </div>
      </div>
    </footer>
  );
}
