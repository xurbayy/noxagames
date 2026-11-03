import Link from 'next/link';
import BackButton from '../components/BackButton';
import Emoji from '../components/Emoji';
import SafeImg from '../components/SafeImg';
import Reveal from '../components/Reveal';
import { getSnapshot, botAlive, topServers, durasi } from '../lib/snapshot';
import { premiumEmojiName } from '../lib/premiumPlan';
import { pageMeta, SUPPORT_INVITE, BOT_INVITE } from '../lib/site';

export const dynamic = 'force-dynamic';

export const metadata = pageMeta({
  title: 'Komunitas Server',
  description:
    'Daftar server Discord yang aktif memakai NOXA Sound - diurutkan dari total durasi dengar bareng. Gabung lewat tombol invite, atau pasang botnya di servermu sendiri.',
  path: '/komunitas',
});

// Halaman KOMUNITAS (pola NEXO /komunitas): papan server yang bisa dikunjungi.
// Aturan daftar sama dengan NEXO: hanya server dengan link invite yang tampil
// - tanpa tombol "Gabung" server itu cuma nama, bukan komunitas yang bisa
// dimasuki. Data diambil dari snapshot bot (topServers), sudah diurutkan bot
// berdasarkan durasi sehingga web tidak mengurutkan ulang.
function jumlahPendengar(g) {
  return Number(g.users) || 0;
}

export default async function KomunitasPage() {
  const snap = await getSnapshot();
  const hidup = botAlive(snap);
  const semua = topServers(snap?.data);
  // Hanya server yang bisa dikunjungi (punya invite) dan ada aktivitasnya.
  const gabung = semua
    .filter((g) => g && g.inviteUrl && (Number(g.duration) > 0 || jumlahPendengar(g) > 0))
    .slice(0, 30);

  const totalDurasi = gabung.reduce((a, g) => a + (Number(g.duration) || 0), 0);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-28 min-h-[calc(100vh-6rem)] sm:px-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Komunitas Server</h1>
          <div className="accent-bar mt-3" aria-hidden="true" />
        </div>
        <BackButton href="/" className="hidden sm:inline-flex" />
      </div>

      <p className="mt-5 text-[15px] leading-relaxed text-muted md:text-lg">
        {gabung.length > 0
          ? `${gabung.length} server aktif memakai NOXA Sound dengan total ${durasi(totalDurasi)} waktu dengar bareng. Pilih satu dan langsung gabung - atau bawa botnya ke servermu sendiri.`
          : 'Belum ada server dengan link invite yang tampil di sini. Botnya bisa kamu pasang sendiri di servermu - gratis.'}
      </p>

      {gabung.length > 0 ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {gabung.map((g, i) => (
            <Reveal key={g.id} delay={(i % 8) * 50}>
              <div className="card flex h-full items-center gap-3 p-4">
                <SafeImg
                  src={g.icon}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full border border-line object-cover"
                  fallback={
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface3 text-sm font-bold text-faint">
                      {String(g.name || 'S').slice(0, 1).toUpperCase()}
                    </span>
                  }
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold leading-snug break-words text-ink">{g.name}</span>
                    {premiumEmojiName(g.premiumTier) && (
                      <Emoji name={premiumEmojiName(g.premiumTier)} size={16} />
                    )}
                  </div>
                  <div className="mt-1 text-[11px] leading-snug break-words text-faint">
                    {durasi(g.duration)} didengar
                    {jumlahPendengar(g) > 0 ? ` · ${jumlahPendengar(g)} pendengar` : ''}
                  </div>
                </div>
                <a
                  href={g.inviteUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="btn-solid btn-solid-accent shrink-0 !px-3 !py-1.5 text-[11px]"
                >
                  Gabung
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="card mt-10 flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Emoji name="party" size={40} />
          <h2 className="font-display text-lg font-bold">
            {hidup ? 'Belum ada komunitas yang tampil' : 'Menunggu data dari bot'}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            {hidup
              ? 'Server akan muncul di sini begitu ada yang memakai NOXA Sound dan punya link invite.'
              : 'Bot sedang offline. Data komunitas akan terisi otomatis begitu bridge tersambung lagi.'}
          </p>
        </div>
      )}

      <div className="card mt-10 flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="font-display text-base font-bold">Punya server sendiri?</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Pasang NOXA Sound gratis dan servermu ikut muncul di daftar ini.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-center gap-2.5">
          <a href={BOT_INVITE} target="_blank" rel="noopener noreferrer nofollow" className="btn-primary !px-4 !py-2 text-sm">
            Tambahkan ke Discord
          </a>
          <Link href="/top" className="btn-ghost !px-4 !py-2 text-sm">
            Lihat Top Global
          </Link>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-faint">
        Server tidak dikenal? Laporkan lewat{' '}
        <a href={SUPPORT_INVITE} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-neon hover:underline">
          server dukungan
        </a>{' '}
        dan kami akan meninjaunya.
      </p>
    </div>
  );
}
