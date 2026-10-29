'use client';

// Navbar NOXA Sound: gaya NEXO - tinggi lega, teks nyaman dibaca, logo bulet.
// Prefetch dimatikan per-Link (Next 16) supaya tidak menggandakan RSC request.
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/pemutar', label: 'Pemutar' },
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
      <nav className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
        <Link href="/" prefetch={false} className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo NOXA Sound"
            className="h-11 w-11 rounded-full ring-1 ring-crimson/40"
            style={{ filter: 'drop-shadow(0 0 12px rgba(255, 16, 31, 0.35))' }}
            draggable={false}
          />
          <span className="font-display text-xl font-bold tracking-tight">
            NOXA <span className="neon-text">Sound</span>
          </span>
        </Link>

        {/* Menu desktop */}
        <div className="hidden items-center gap-2 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              prefetch={false}
              className={`rounded-xl px-4 py-2.5 text-[15px] font-medium transition-colors ${
                pathname.startsWith(l.href) ? 'bg-surface3 text-ink' : 'text-muted hover:bg-surface2 hover:text-ink'
              }`}
            >
              {l.label}
            </Link>
          ))}
          {session ? (
            <div className="ml-3 flex items-center gap-2.5">
              <Link
                href="/me"
                prefetch={false}
                className="flex items-center gap-2.5 rounded-full border border-linebright bg-surface2 py-1.5 pl-1.5 pr-4 text-[15px] hover:border-crimson transition-colors"
              >
                {session.avatar ? (
                  <img src={session.avatar} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-crimson/30 text-xs font-bold">
                    {String(session.username || 'U').slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="max-w-32 truncate text-ink">{session.username}</span>
              </Link>
              <button
                onClick={logout}
                className="rounded-xl px-3 py-2.5 text-[13px] font-medium text-faint hover:text-ink transition-colors"
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              prefetch={false}
              className="ml-3 rounded-xl bg-white px-5 py-2.5 text-[15px] font-bold text-black hover:bg-ink transition-colors"
            >
              Masuk
            </Link>
          )}
        </div>

        {/* Tombol menu mobile */}
        <button
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-ink md:hidden"
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
        <div className="border-t border-line bg-bg/95 px-5 pb-5 pt-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              prefetch={false}
              className="block rounded-xl px-3 py-3 text-[15px] font-medium text-muted hover:bg-surface2 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link href="/me" prefetch={false} className="block rounded-xl px-3 py-3 text-[15px] font-medium text-muted hover:bg-surface2 hover:text-ink">
                Profil Gw
              </Link>
              <button onClick={logout} className="block w-full rounded-xl px-3 py-3 text-left text-[15px] font-medium text-faint hover:bg-surface2">
                Keluar
              </button>
            </>
          ) : (
            <Link href="/login" prefetch={false} className="mt-2 block rounded-xl bg-crimson px-4 py-3 text-center text-[15px] font-bold text-white">
              Masuk
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
