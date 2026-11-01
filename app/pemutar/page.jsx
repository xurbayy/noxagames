import Link from 'next/link';
import Emoji from '../components/Emoji';
import BackButton from '../components/BackButton';
import PlayerShowcase from '../components/panel/PlayerPanels';
import { pageMeta } from '../lib/site';

export const metadata = pageMeta({
  title: 'Tampilan Pemutar',
  description: 'Lihat panel pemutar NOXA Sound yang tampil di Discord: mode musik, radio 24/7, podcast, dan standby, lengkap dengan semua tombolnya.',
  path: '/pemutar',
});

export default function PemutarPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Tampilan Pemutar</h1>
        </div>
        <BackButton href="/" className="hidden sm:inline-flex" />
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
