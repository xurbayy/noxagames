import Link from 'next/link';
import Emoji from '../components/Emoji';
import PlayerShowcase from '../components/panel/PlayerPanels';
import { pageMeta } from '../lib/site';

export const metadata = pageMeta({
  title: 'Tampilan Pemutar',
  description: 'Lihat panel pemutar NOXA Sound yang tampil di Discord: mode musik, radio 24/7, podcast, dan standby, lengkap dengan semua tombolnya.',
  path: '/pemutar',
});

export default function PemutarPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Emoji name="suara" size={26} />
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Tampilan Pemutar</h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Empat keadaan panel yang bot kirim ke channel Discord: musik, radio 24/7,
            podcast, dan standby. Tombolnya lengkap dan bisa diklik di sini buat
            mencoba. Kalau mau mengontrol yang asli, lakukan dari Discord server kamu.
          </p>
        </div>
        <Link href="/" className="btn-ghost hidden sm:inline-flex">Kembali</Link>
      </div>

      <div className="mt-8">
        <PlayerShowcase />
      </div>

      <div className="card mt-12 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Mau panel seperti ini hidup di channel server kamu? Invite bot, masuk voice, ketik satu perintah.
        </p>
        <Link href="/panduan" className="btn-ghost shrink-0">Buka Panduan</Link>
      </div>
    </div>
  );
}
