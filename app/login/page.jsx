import Link from 'next/link';
import Emoji from '../components/Emoji';
import { pageMeta } from '../lib/site';

export const metadata = pageMeta({
  title: 'Masuk',
  description: 'Masuk ke NOXA Sound dengan Discord untuk melihat profil pendengaranmu.',
  path: '/login',
});

const KODE_PESAN = {
  tanpa_code: 'Discord tidak mengirim kode otorisasi. Coba lagi dari tombol Masuk.',
  cookie_state_hilang: 'Sesi login kedaluwarsa sebelum selesai. Klik Masuk sekali lagi.',
  state_mismatch: 'Verifikasi keamanan login gagal. Klik Masuk dari halaman ini lagi.',
  env_kosong: 'Login belum dikonfigurasi di server. Hubungi admin.',
};

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  const gagal = sp?.auth === 'gagal';
  const kode = String(sp?.kode || '');
  const pesan = KODE_PESAN[kode] || (kode ? `Login gagal (${kode.slice(0, 80)}). Coba lagi.` : '');
  const returnTo = typeof sp?.returnTo === 'string' && sp.returnTo.startsWith('/') && !sp.returnTo.startsWith('//')
    ? sp.returnTo : '/me';
  const adminMode = sp?.admin === '1';

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="card relative overflow-hidden px-6 py-10 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-crimson/12 border border-crimson/25">
          <Emoji name="userprofile" size={28} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">
          {adminMode ? 'Masuk Panel Admin' : 'Masuk ke NOXA Sound'}
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted">
          {adminMode
            ? 'Panel admin hanya untuk pemilik dan staf yang terdaftar. Masuk pakai akun Discord yang sudah diizinkan.'
            : 'Masuk pakai Discord untuk melihat statistik mendengarkanmu: lagu favorit, durasi total, dan siapa yang sering dengar bareng.'}
        </p>

        {gagal && (
          <div className="mt-5 rounded-xl border border-crimson/50 bg-crimson/10 px-4 py-3 text-left text-xs leading-relaxed text-ink">
            {pesan}
          </div>
        )}

        <div className="mt-6">
          <a
            href={`/api/auth/login?returnTo=${encodeURIComponent(adminMode ? '@admin' : returnTo)}`}
            className="btn-primary w-full justify-center"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Lanjutkan dengan Discord
          </a>
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-faint">
          Dengan masuk kamu menyetujui{' '}
          <Link href="/terms-of-service" className="underline hover:text-muted">Ketentuan Layanan</Link> dan{' '}
          <Link href="/privacy-policy" className="underline hover:text-muted">Kebijakan Privasi</Link>.
          Web hanya menerima ID, username, dan avatar Discord-mu.
        </p>
      </div>
    </div>
  );
}
