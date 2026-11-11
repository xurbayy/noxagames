import Link from 'next/link';
import { redirect } from 'next/navigation';
import BackButton from '../components/BackButton';
import TopTabsView from '../components/top/TopTabsView';
import { getSession } from '../lib/session';
import { getSnapshot, botAlive, ageLabel, topSongs, topListeners } from '../lib/snapshot';
import { pageMeta, SUPPORT_INVITE } from '../lib/site';

export const dynamic = 'force-dynamic';

export const metadata = pageMeta({
  title: 'Top Lagu & Listener',
  description: 'Lagu paling banyak didengar dan pendengar paling setia di seluruh server yang memakai NOXA Sound.',
  path: '/top',
});

export default async function TopPage() {
  const session = await getSession().catch(() => null);
  // Halaman Top hanya untuk member yang login.
  if (!session) redirect('/login');
  const snap = await getSnapshot();
  const lagu = topSongs(snap?.data).slice(0, 10);
  // Bot kadang masih menyertakan pendengar dengan 0 lagu selesai / 0 durasi
  // (baris statistik kosong). Entri seperti itu tidak layak masuk peringkat.
  const listener = topListeners(snap?.data)
    .filter((u) => Number(u.plays) > 0 && Number(u.duration) > 0)
    .slice(0, 10);
  const hidup = botAlive(snap);
  const adaData = lagu.length > 0 || listener.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-28 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Top NOXA Sound</h1>
        </div>
        <BackButton href="/" className="hidden sm:inline-flex" />
      </div>

      {!adaData && <MenungguState hidup={hidup} />}

      {adaData && (
        <TopTabsView
          lagu={lagu}
          listener={listener}
          session={session}
        />
      )}

      {snap && (
        <div className="mt-8 flex items-center justify-between text-xs text-faint">
          <span>Data {ageLabel(snap.ageSec)} dari bot</span>
          <Link href="/" className="hover:text-ink">Kembali ke Beranda</Link>
        </div>
      )}
    </div>
  );
}

function MenungguState({ hidup }) {
  return (
    <div className="card mt-10 flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex items-end gap-1 h-10">
        <span className="eq-bar w-2 h-10 rounded-sm bg-crimson" style={{ animationDelay: '0ms' }} />
        <span className="eq-bar w-2 h-10 rounded-sm bg-neon" style={{ animationDelay: '150ms' }} />
        <span className="eq-bar w-2 h-10 rounded-sm bg-glow/80" style={{ animationDelay: '300ms' }} />
      </span>
      <h2 className="font-display text-lg font-bold">Statistik belum tersedia</h2>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        {hidup ? (
          'Belum ada aktivitas dengar yang tercatat. Mainkan lagu pertama di server kamu dan peringkat ini akan terisi.'
        ) : (
          <>
            Bot belum mengirim data ke web. Kalau bot tidak merespons di Discord, buka{' '}
            <a href={SUPPORT_INVITE} target="_blank" rel="noopener noreferrer" className="font-semibold text-neon hover:underline">
              server dukungan
            </a>{' '}
            dulu.
          </>
        )}
      </p>
    </div>
  );
}
