'use client';

// Navbar NOXA Sound: dark, sticky, blur halus. Pill premium disengaja hilang
// di fase 1 (monetisasi belum aktif) - slotnya disiapkan lewat komentar.
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/panduan', label: 'Panduan' },
  { href: '/top', label: 'Top' },
  { href: '/premium', label: 'Premium' },
];

export default function Navbar({ session }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Tutup drawer mobile saat pindah halaman.
  useEffect(() => { setOpen(false); }, [pathname]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  const isHome = pathname === '/';

  return (
    <header className={`sticky top-0 z-50 border-b border-line/70 backdrop-blur-md ${isHome ? 'bg-bg/70' : 'bg-bg/85'}`}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-crimson/15 border border-crimson/40">
            {/* Logo glyph: bar equalizer statis */}
            <span className="flex items-end gap-[2px] h-4">
              <span className="w-[3px] h-2 rounded-sm bg-neon" />
              <span className="w-[3px] h-4 rounded-sm bg-crimson" />
              <span className="w-[3px] h-2.5 rounded-sm bg-neon/70" />
            </span>
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            NOXA <span className="neon-text">Sound</span>
          </span>
        </Link>

        {/* Menu desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href} prefetch={false}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(l.href) ? 'bg-surface3 text-ink' : 'text-muted hover:bg-surface2 hover:text-ink'
              }`}
            >
              {l.label}
            </Link>
          ))}
          {session ? (
            <div className="ml-3 flex items-center gap-2">
              <Link
                href="/me" prefetch={false}
                className="flex items-center gap-2 rounded-full border border-linebright bg-surface2 py-1 pl-1 pr-3 text-sm hover:border-crimson transition-colors"
              >
                {session.avatar ? (
                  <img src={session.avatar} alt="" className="h-6 w-6 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-crimson/30 text-[10px] font-bold">
                    {String(session.username || 'U').slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="max-w-28 truncate text-ink">{session.username}</span>
              </Link>
              <button
                onClick={logout}
                className="rounded-lg px-2 py-2 text-xs font-medium text-faint hover:text-ink transition-colors"
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link
              href="/login" prefetch={false}
              className="ml-3 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-black hover:bg-ink transition-colors"
            >
              Masuk
            </Link>
          )}
        </div>

        {/* Tombol menu mobile */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
        >
          <span className="flex flex-col gap-1">
            <span className={`h-0.5 w-5 bg-ink transition-transform ${open ? 'translate-y-1.5 rotate-45' : ''}`} />
            <span className={`h-0.5 w-5 bg-ink transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-5 bg-ink transition-transform ${open ? '-translate-y-1.5 -rotate-45' : ''}`} />
          </span>
        </button>
      </nav>

      {/* Drawer mobile */}
      {open && (
        <div className="border-t border-line bg-bg/95 px-4 pb-4 pt-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href} prefetch={false}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface2 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link href="/me" prefetch={false} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface2 hover:text-ink">
                Profil Gw
              </Link>
              <button onClick={logout} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-faint hover:bg-surface2">
                Keluar
              </button>
            </>
          ) : (
            <Link href="/login" prefetch={false} className="mt-2 block rounded-xl bg-crimson px-3 py-2.5 text-center text-sm font-bold text-white">
              Masuk
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
