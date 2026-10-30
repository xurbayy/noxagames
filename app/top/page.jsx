import Link from 'next/link';
import Emoji from '../components/Emoji';
import BackButton from '../components/BackButton';
import TopTabsView from '../components/top/TopTabsView';
import { getSession } from '../lib/session';
import { getSnapshot, botAlive, ageLabel, topSongs, topServers, topListeners } from '../lib/snapshot';
import { pageMeta } from '../lib/site';

export const dynamic = 'force-dynamic';

export const metadata = pageMeta({
  title: 'Top Lagu, Server & Listener',
  description: 'Lagu paling banyak didengar, server paling aktif, dan pendengar paling setia di seluruh server yang memakai NOXA Sound.',
  path: '/top',
});

export default async function TopPage() {
  const session = await getSession().catch(() => null);
  const snap = await getSnapshot();
  const lagu = topSongs(snap?.data).slice(0, 10);
  // Server yang bisa dikunjungi (punya inviteUrl atau vanity)
  const server = topServers(snap?.data).filter((g) => g.inviteUrl).slice(0, 10);
  const listener = topListeners(snap?.data).slice(0, 10);
  const hidup = botAlive(snap);
  const adaData = lagu.length > 0 || server.length > 0 || listener.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Emoji name="number1" size={26} />
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Top NOXA Sound</h1>
          </div>
          <p className="mt-2 text-sm text-muted">
            Peringkat dari seluruh aktivitas dengar di semua server Discord. Data dihitung dari durasi nyata yang didengarkan, bukan sekali request.
          </p>
        </div>
        <BackButton href="/" className="hidden sm:inline-flex" />
      </div>

      {!adaData && <MenungguState hidup={hidup} />}

      {adaData && (
        <TopTabsView
          lagu={lagu}
          listener={listener}
          server={server}
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
        {hidup
          ? 'Bot sudah terhubung, tapi belum ada aktivitas dengar yang tercatat. Mainkan lagu pertama di server kamu dan peringkat ini akan terisi.'
          : 'Bot belum mengirim data ke web. Peringkat akan muncul otomatis begitu bot online dan ada aktivitas dengar.'}
      </p>
    </div>
  );
}
