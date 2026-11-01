'use client';

// Navbar NOXA Sound - disamakan dengan pola navbar web NEXO:
// link teks rapi (bukan deretan pill), logo 36px, cluster kanan avatar+username,
// drawer mobile, dan bayangan yang bersih (tanpa shadow tebal/glow).
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Emoji from './Emoji';

const LINKS = [
  { href: '/pemutar', label: 'Pemutar' },
  { href: '/panduan', label: 'Panduan' },
  { href: '/top', label: 'Top' },
  { href: '/#cara-pakai', label: 'Cara Pakai' },
  { href: '/#kontak', label: 'Kontak' },
];

const LEGAL = [
  { href: '/privacy-policy', label: 'Kebijakan Privasi' },
  { href: '/terms-of-service', label: 'Ketentuan Layanan' },
];

// Ikon Discord dipakai di beberapa tempat (tombol login desktop + mobile).
function DiscordIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" className="shrink-0">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export default function Navbar({ session, isAdmin = false }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  // Tautan anchor (/#...) tidak pernah ditandai aktif - halaman tetap di "/"
  // sehingga tanpa pengecualian ini dua menu akan terlihat aktif bersamaan.
  const aktif = (href) =>
    !href.includes('#') && (pathname === href || pathname.startsWith(`${href}/`));
  const kelasTautan = (href, extra = '') =>
    `text-sm font-medium transition-colors duration-200 hover:text-ink ${
      aktif(href) ? 'text-ink' : 'text-muted'
    } ${extra}`;

  // Tautan ke seksi (/#...) memakai <a> biasa: browser langsung menggulir ke
  // anchor-nya, tanpa perlu state router Next.
  const tautan = (l, extra = '') =>
    l.href.includes('#') ? (
      <a key={l.href} href={l.href} className={kelasTautan(l.href, extra)}>
        {l.label}
      </a>
    ) : (
      <Link key={l.href} href={l.href} prefetch={false} className={kelasTautan(l.href, extra)}>
        {l.label}
      </Link>
    );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-line bg-bg py-2.5 backdrop-blur-xl' : 'bg-transparent py-4'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-3.5 sm:px-5" aria-label="Navigasi utama">
        <Link href="/" prefetch={false} className="flex items-center gap-2 sm:gap-2.5 leading-none" aria-label="NOXA Sound - Beranda">
          <img
            src="/logo.png"
            alt="Logo NOXA Sound"
            width={36}
            height={36}
            className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full border border-line object-cover"
            draggable={false}
          />
          <span className="hidden font-display text-base font-bold tracking-tight text-ink sm:inline md:text-lg">
            NOXA <span className="neon-text">Sound</span>
          </span>
        </Link>

        {/* Menu desktop */}
        <ul className="hidden items-center gap-6 md:flex lg:gap-7">
          {LINKS.map((l) => (
            <li key={l.href}>{tautan(l)}</li>
          ))}
          <li className="relative">
            <details className="group">
              <summary className="list-none cursor-pointer rounded-md px-1 py-1 text-sm font-medium text-muted transition-colors duration-200 hover:text-ink">
                Info
              </summary>
              <div className="invisible absolute right-0 top-full z-50 w-48 rounded-xl border border-line bg-surface2 p-1.5 opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.45)] transition-all duration-150 group-focus-within:visible group-hover:visible group-hover:opacity-100 group-focus-within:opacity-100">
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
          </li>
          {isAdmin && (
            <li>
              <Link
                href="/admin"
                prefetch={false}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                  aktif('/admin')
                    ? 'border-crimson bg-[#3B0004] text-white shadow-[0_0_12px_rgba(255,42,109,0.35)]'
                    : 'border-crimson bg-[#220002] text-neon hover:border-neon hover:bg-[#3B0004] hover:text-white'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
                Admin
              </Link>
            </li>
          )}
        </ul>

        {/* Cluster kanan */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          <Link
            href="/premium"
            prefetch={false}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-purple-500 bg-transparent px-2.5 py-1 text-xs font-bold text-purple-300 shadow-sm transition hover:-translate-y-px hover:border-purple-400 hover:bg-[#1A0B2E] hover:text-white sm:px-3.5 sm:py-1.5 sm:text-sm active:translate-y-0"
          >
            <img
              src="/badges/noxa-premium-ultimate.png"
              alt=""
              width={18}
              height={18}
              className="h-4 w-4 sm:h-4.5 sm:w-4.5 object-contain filter drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]"
              draggable={false}
            />
            <span className="whitespace-nowrap">NOXA Pass</span>
          </Link>

          {/* Mobile: tombol login tepat di samping NOXA Pass (sebelum hamburger).
              Hanya tampil saat belum login. Warna merah NOXA solid (bg-crimson),
              sama seperti tombol Login utama di desktop. Di layar sangat sempit (<= 379px)
              teks disembunyikan supaya navbar tidak pernah meluber. */}
          {!session && (
            <Link
              href="/login"
              prefetch={false}
              aria-label="Login dengan Discord"
              title="Login dengan Discord"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-crimson px-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-neon active:scale-95 min-[380px]:px-3 md:hidden"
            >
              <DiscordIcon size={15} />
              <span className="hidden min-[380px]:inline">Login</span>
            </Link>
          )}

          {/* Mobile saat sudah login: avatar ringkas sebagai pengganti tombol login. */}
          {session && (
            <Link
              href="/me"
              prefetch={false}
              aria-label={`Profil ${session.username}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface2 transition hover:border-linebright md:hidden"
            >
              {session.avatar ? (
                <img
                  src={session.avatar}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-crimson text-[10px] font-bold text-white">
                  {String(session.username || '?').slice(0, 2).toUpperCase()}
                </span>
              )}
            </Link>
          )}

          {session ? (
            <Link
              href="/me"
              prefetch={false}
              className="hidden items-center gap-2 rounded-full border border-line bg-surface2 py-1 pl-1 pr-3 transition hover:border-linebright hover:bg-surface3 md:flex"
              title={`Profil ${session.username}`}
            >
              {session.avatar ? (
                <img
                  src={session.avatar}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full border border-line object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-crimson text-xs font-bold text-white">
                  {String(session.username || '?').slice(0, 2).toUpperCase()}
                </span>
              )}
              <span className="max-w-[120px] truncate text-xs font-semibold text-ink">
                {session.username}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              prefetch={false}
              className="btn-primary hidden !px-5 !py-2 text-sm md:inline-flex"
            >
              <DiscordIcon size={16} />
              Login
            </Link>
          )}

          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-ink sm:h-10 sm:w-10 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* Drawer mobile */}
      {open && (
        <div className="border-t border-line bg-bg backdrop-blur-xl md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 sm:px-5 py-4">
            {LINKS.map((l) => (
              <li key={l.href}>
                {l.href.includes('#') ? (
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface2 hover:text-ink"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    href={l.href}
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface2 hover:text-ink"
                  >
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <Link
                href="/premium"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-purple-300 hover:bg-surface2"
              >
                <span className="flex items-center gap-2">
                  <img
                    src="/badges/noxa-premium-ultimate.png"
                    alt=""
                    width={18}
                    height={18}
                    className="h-4.5 w-4.5 object-contain filter drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]"
                    draggable={false}
                  />
                  NOXA Pass
                </span>
                <span className="rounded border border-purple-500 bg-transparent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  Premium
                </span>
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-neon hover:bg-surface2"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-neon animate-pulse" />
                    Panel Admin
                  </span>
                  <span className="rounded border border-crimson bg-[#3B0004] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon">
                    Owner
                  </span>
                </Link>
              </li>
            )}
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface2 hover:text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-line pt-2">
              {session ? (
                <>
                  <Link
                    href="/me"
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5"
                  >
                    {session.avatar ? (
                      <img
                        src={session.avatar}
                        alt=""
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full border border-line"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-crimson text-xs font-bold text-white">
                        {String(session.username || '?').slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span className="truncate text-sm font-semibold text-ink">{session.username}</span>
                  </Link>
                  <a
                    href="/api/auth/logout"
                    className="mt-1 block w-full rounded-lg border border-line px-3 py-2.5 text-left text-sm font-semibold text-muted hover:text-ink"
                  >
                    Logout
                  </a>
                </>
              ) : (
                <Link
                  href="/login"
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full text-sm"
                >
                  Login dengan Discord
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
