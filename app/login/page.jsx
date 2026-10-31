import Link from 'next/link';
import { redirect } from 'next/navigation';
import Emoji from '../components/Emoji';
import LoginForm from '../components/LoginForm';
import { pageMeta } from '../lib/site';
import { getSession, isAdminDiscordId } from '../lib/session';

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

  const session = await getSession().catch(() => null);
  if (session) {
    if (adminMode && isAdminDiscordId(session.discordId)) {
      redirect('/admin');
    }
    if (!adminMode && !gagal) {
      redirect(returnTo);
    }
  }

  return (
    // Lapisan hexagon dipasang selebar halaman (bukan selebar kartu) supaya
    // polanya tidak terpotong di kiri-kanan seperti versi sebelumnya.
    <div className="relative">
      <div className="bg-grid absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 pb-12 pt-28">
      <div className="card relative overflow-hidden px-6 py-10 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
        <Emoji name="userprofile" size={44} className="mx-auto" />
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">
          {adminMode ? 'Masuk Panel Admin' : 'Masuk ke NOXA Sound'}
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted">
          {adminMode
            ? 'Panel admin hanya untuk pemilik dan staf terdaftar.'
            : 'Masuk dengan Discord untuk melihat statistik dengarmu.'}
        </p>

        {gagal && (
          <div className="mt-5 rounded-xl border border-crimson bg-surface2 px-4 py-3 text-left text-xs leading-relaxed text-ink">
            {pesan}
          </div>
        )}

        <LoginForm
          loginUrl={`/api/auth/login?returnTo=${encodeURIComponent(adminMode ? '@admin' : returnTo)}`}
        />

        <div className="mt-5 rounded-xl border border-line bg-surface p-3 text-[11px] leading-relaxed text-muted text-left">
          <div className="font-semibold text-ink flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="#22C55E">
              <path d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.464 9.99a11.7 11.7 0 0 0 4.02 3.167.75.75 0 0 0 .75 0c1.378-.71 2.8-1.782 4.02-3.167 1.677-2.195 3.06-5.513 2.464-9.99a1.54 1.54 0 0 0-1.044-1.263c-.659-.214-1.778-.569-2.887-.87C9.843.266 8.69 0 8 0zm2.146 5.854-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L6.75 7.793l2.646-2.647a.5.5 0 0 1 .708.708z"/>
            </svg>
            <span>Otentikasi Resmi Discord OAuth2</span>
          </div>
          <p className="mt-1 text-faint">
            Login diproses langsung di server resmi <strong className="text-muted">discord.com</strong>. Web ini hanya menerima ID publik, username, dan avatar tanpa pernah meminta atau menyimpan password/token Discord Anda.
          </p>
        </div>

        <p className="mt-3 text-[10px] leading-relaxed text-faint">
          NOXA Sound adalah layanan independen dan tidak terafiliasi dengan Discord Inc.
        </p>
      </div>
      </div>
    </div>
  );
}
