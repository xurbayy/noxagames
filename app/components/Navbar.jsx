'use client';

// Navbar NOXA Sound: arsitektur NEXO - dynamic scroll transition, dropdown Info,
// responsive drawer mobile, logo bulat bersih, dan link logout native.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/pemutar', label: 'Pemutar' },
  { href: '/panduan', label: 'Panduan' },
  { href: '/top', label: 'Top' },
  { href: '/premium', label: 'Premium' },
];

const LEGAL = [
  { href: '/privacy-policy', label: 'Kebijakan Privasi' },
  { href: '/terms-of-service', label: 'Ketentuan Layanan' },
];

export default function Navbar({ session }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Deteksi scroll halus seperti di web NEXO
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Tutup drawer mobile saat navigasi
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-line bg-bg/95 py-2.5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.55)]'
          : 'bg-transparent py-4'
      }`}
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-5"
        aria-label="Navigasi utama"
      >
        <Link href="/" prefetch={false} className="flex items-center gap-3 cursor-pointer">
          <img
            src="/logo.png"
            alt="Logo NOXA Sound"
            className="h-10 w-10 rounded-full"
            draggable={false}
          />
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            NOXA <span className="neon-text">Sound</span>
          </span>
        </Link>

        {/* Menu desktop */}
        <div className="hidden items-center gap-1.5 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              prefetch={false}
              className={`rounded-xl px-3.5 py-2 text-[15px] font-medium transition-colors ${
                pathname.startsWith(l.href) ? 'bg-surface3 text-ink' : 'text-muted hover:bg-surface2 hover:text-ink'
              }`}
            >
              {l.label}
            </Link>
          ))}

          {/* Dropdown Info (Legal) ala NEXO */}
          <div className="relative">
            <details className="group">
              <summary className="list-none cursor-pointer rounded-xl px-3.5 py-2 text-[15px] font-medium text-muted transition-colors hover:text-ink select-none">
                Info
              </summary>
              <div className="invisible absolute right-0 top-full z-50 w-48 rounded-xl border border-line bg-surface2 p-1.5 opacity-0 shadow-2xl transition-all duration-150 group-focus-within:visible group-hover:visible group-hover:opacity-100 group-focus-within:opacity-100">
                {LEGAL.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    prefetch={false}
                    className="block rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface3 hover:text-ink"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </details>
          </div>

          {/* User cluster */}
          {session ? (
            <div className="ml-3 flex items-center gap-2.5">
              <Link
                href="/me"
                prefetch={false}
                title={session.username}
                className="flex items-center gap-2.5 rounded-full border border-linebright bg-surface2 py-1 pl-1 pr-3.5 text-sm hover:border-crimson transition-colors"
              >
                {session.avatar ? (
                  <img src={session.avatar} alt="" className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-crimson/30 text-[11px] font-bold text-ink">
                    {String(session.username || 'U').slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="max-w-32 truncate text-ink font-semibold">{session.username}</span>
              </Link>
              <a
                href="/api/auth/logout"
                prefetch={false}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-faint hover:text-ink transition-colors cursor-pointer"
              >
                Keluar
              </a>
            </div>
          ) : (
            <Link
              href="/login"
              prefetch={false}
              className="ml-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black hover:bg-ink transition-colors"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Masuk
            </Link>
          )}
        </div>

        {/* Tombol menu mobile */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink md:hidden cursor-pointer"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
        >
          <span className="flex flex-col gap-1.5">
            <span className={`h-0.5 w-5 bg-ink transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`h-0.5 w-5 bg-ink transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-5 bg-ink transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </span>
        </button>
      </nav>

      {/* Drawer mobile */}
      {open && (
        <div className="border-t border-line bg-bg/95 px-5 pb-5 pt-3 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3.5 py-2.5 text-[15px] font-medium text-muted hover:bg-surface2 hover:text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3.5 py-2 text-sm text-faint hover:bg-surface2 hover:text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {session ? (
              <li className="mt-2 border-t border-line pt-2">
                <Link
                  href="/me"
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3.5 py-2.5 text-[15px] font-medium text-muted hover:bg-surface2 hover:text-ink"
                >
                  Profil Pendengar ({session.username})
                </Link>
                <a
                  href="/api/auth/logout"
                  prefetch={false}
                  className="block w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-crimson hover:bg-surface2"
                >
                  Keluar
                </a>
              </li>
            ) : (
              <li className="mt-3">
                <Link
                  href="/login"
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl bg-crimson px-4 py-2.5 text-center text-[15px] font-bold text-white shadow-lg"
                >
                  Masuk dengan Discord
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
