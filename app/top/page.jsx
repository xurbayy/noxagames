import Link from 'next/link';
import Emoji from '../components/Emoji';
import Thumb from '../components/Thumb';
import TopListenerList from '../components/top/TopListenerList';
import { getSession } from '../lib/session';
import { getSnapshot, botAlive, ageLabel, totals, topSongs, topServers, topListeners, durasi } from '../lib/snapshot';
import { pageMeta } from '../lib/site';

export const dynamic = 'force-dynamic';

export const metadata = pageMeta({
  title: 'Top Lagu, Server & Listener',
  description: 'Lagu paling banyak didengar, server paling aktif, dan pendengar paling setia di seluruh server yang memakai NOXA Sound.',
  path: '/top',
});

const RANK_EMOJI = ['number1', 'number2', 'number3'];

export default async function TopPage() {
  const session = await getSession().catch(() => null);
  const snap = await getSnapshot();
  const lagu = topSongs(snap?.data).slice(0, 10);
  const server = topServers(snap?.data).slice(0, 10);
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
            Peringkat dari seluruh aktivitas dengar di semua server. Data dihitung dari durasi nyata yang didengarkan, bukan sekali request.
          </p>
        </div>
        <Link href="/" className="btn-ghost hidden sm:inline-flex">Kembali</Link>
      </div>

      {!adaData && <MenungguState hidup={hidup} />}

      {adaData && (
        <div className="mt-8 space-y-10">
          {lagu.length > 0 && (
            <section>
              <JudulSeksi emoji="musik" judul="Top Lagu" ket={`Top ${lagu.length} lagu paling lama didengar`} />
              <div className="card divide-y divide-line overflow-hidden">
                {lagu.map((s, i) => (
                  <div key={`${s.name}-${i}`} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-8 shrink-0 text-center">
                      {RANK_EMOJI[i] ? <Emoji name={RANK_EMOJI[i]} size={22} /> : <span className="text-sm font-bold tabular-nums text-faint">{i + 1}</span>}
                    </span>
                    <Thumb src={s.thumb} alt="" size="h-10 w-10" rounded="rounded-lg" emoji="musik" emojiSize={18} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{s.name}</div>
                      <div className="text-xs text-faint">{durasi(s.duration)} didengar {s.count > 1 ? `${s.count} putaran` : ''}</div>
                    </div>
                    <div className="hidden w-32 shrink-0 sm:block">
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface3">
                        <div className="h-full rounded-full bg-gradient-to-r from-crimson to-neon" style={{ width: `${barPercent(s.duration, lagu[0].duration)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {listener.length > 0 && (
            <section>
              <JudulSeksi emoji="userprofile" judul="Top Listener" ket="Pendengar dengan total durasi terlama" />
              <TopListenerList items={listener} login={Boolean(session)} />
            </section>
          )}

          {server.length > 0 && (
            <section>
              <JudulSeksi emoji="party" judul="Server Teraktif" ket="Server dengan total dengar bareng terlama" />
              <div className="card divide-y divide-line overflow-hidden">
                {server.map((g, i) => (
                  <div key={g.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-8 shrink-0 text-center">
                      {RANK_EMOJI[i] ? <Emoji name={RANK_EMOJI[i]} size={22} /> : <span className="text-sm font-bold tabular-nums text-faint">{i + 1}</span>}
                    </span>
                    {g.icon ? (
                      <img src={g.icon} alt="" className="h-10 w-10 shrink-0 rounded-full border border-line object-cover" loading="lazy" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface3 text-sm font-bold text-faint">
                        {String(g.name || 'S').slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{g.name}</div>
                      <div className="text-xs text-faint">{g.users} pendengar tercatat</div>
                    </div>
                    {g.inviteUrl ? (
                      <a
                        href={g.inviteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost shrink-0 !rounded-lg !px-2.5 !py-1.5 text-xs"
                      >
                        <Emoji name="callme" size={13} /> Kunjungi
                      </a>
                    ) : null}
                    <span className="shrink-0 text-sm font-bold tabular-nums text-neon">{durasi(g.duration)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
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

function barPercent(nilai, max) {
  if (!max) return 0;
  return Math.max(6, Math.round((Number(nilai) / Number(max)) * 100));
}

function JudulSeksi({ emoji, judul, ket }) {
  return (
    <div className="mb-3 flex items-baseline gap-2.5">
      <Emoji name={emoji} size={20} />
      <h2 className="font-display text-lg font-bold">{judul}</h2>
      <span className="hidden text-xs text-faint sm:inline">{ket}</span>
    </div>
  );
}

function MenungguState({ hidup }) {
  return (
    <div className="card mt-10 flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex items-end gap-1 h-10">
        <span className={`eq-bar w-2 h-10 rounded-sm bg-crimson`} style={{ animationDelay: '0ms' }} />
        <span className={`eq-bar w-2 h-10 rounded-sm bg-neon`} style={{ animationDelay: '150ms' }} />
        <span className={`eq-bar w-2 h-10 rounded-sm bg-glow/80`} style={{ animationDelay: '300ms' }} />
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
