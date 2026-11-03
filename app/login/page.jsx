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
      <div className="card relative overflow-hidden px-6 py-9 text-center">
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

      </div>
      </div>
    </div>
  );
}
