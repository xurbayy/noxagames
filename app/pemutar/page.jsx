import Link from 'next/link';
import Emoji from '../components/Emoji';
import PlayerShowcase from '../components/panel/PlayerPanels';
import LivePlayerPanel from '../components/panel/LivePlayerPanel';
import { getSnapshot, botAlive, livePlayers } from '../lib/snapshot';
import { pageMeta } from '../lib/site';

export const dynamic = 'force-dynamic';

export const metadata = pageMeta({
  title: 'Tampilan Pemutar',
  description: 'Lihat panel pemutar NOXA Sound yang tampil di Discord: mode musik, radio 24/7, podcast, dan standby, lengkap dengan semua tombolnya.',
  path: '/pemutar',
});

export default async function PemutarPage() {
  const snap = await getSnapshot();
  const hidup = botAlive(snap);
  const players = hidup ? livePlayers(snap?.data) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Emoji name="suara" size={26} />
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Tampilan Pemutar</h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Ini replika persis panel pemutar yang dikirim bot ke channel Discord kamu:
            mode musik, radio 24/7, podcast, dan standby. Semua tombolnya ada, dan di
            pratinjau ini tombol-tombolnya bisa diklik untuk mencoba. Kontrol aslinya
            tetap berjalan di Discord server kamu.
          </p>
        </div>
        <Link href="/" className="btn-ghost hidden sm:inline-flex">Kembali</Link>
      </div>

      <div className="mt-8">
        <PlayerShowcase />
      </div>

      {/* Live: panel asli yang sedang berjalan di server pengguna */}
      {players.length > 0 && (
        <section className="mt-14">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-ok live-dot" />
            <h2 className="font-display text-xl font-bold">Sedang Mengudara Sekarang</h2>
          </div>
          <p className="mb-5 text-sm text-muted">
            Data langsung dari bot. Tombol tampil apa adanya tapi nonaktif di sini,
            karena pemutarannya dikontrol dari channel Discord masing-masing server.
          </p>
          <div className="space-y-8">
            {players.slice(0, 4).map((p, i) => (
              <LivePlayerPanel key={`${p.guildId}-${i}`} p={p} />
            ))}
          </div>
        </section>
      )}

      <div className="card mt-12 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Mau panel seperti ini hidup di channel server kamu? Invite bot, masuk voice channel, dan ketik perintah pertamamu.
        </p>
        <Link href="/panduan" className="btn-ghost shrink-0">Buka Panduan</Link>
      </div>
    </div>
  );
}
