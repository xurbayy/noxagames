import Link from 'next/link';
import PanduanCari from '../components/PanduanCari';
import BackButton from '../components/BackButton';
import { panduanKategori } from '../lib/panduan-content';
import { pageMeta } from '../lib/site';

export const metadata = pageMeta({
  title: 'Panduan Perintah',
  description: 'Daftar lengkap perintah NOXA Sound: musik, playlist, podcast, radio 24 jam, efek audio, lirik, dan profil pendengar. Bisa dicari langsung. Semua lewat prefix titik.',
  path: '/panduan',
});

export default function PanduanPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-28 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Panduan Perintah</h1>
        </div>
        <BackButton href="/" className="hidden sm:inline-flex" />
      </div>

      <PanduanCari kategori={panduanKategori} />

      <div className="card mt-6 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Butuh panduan langsung di Discord? Ketik <span className="cmd">.help</span> dan bot mengirim panel bantuan lengkap yang tidak pernah terhapus otomatis.
        </p>
        <Link href="/" className="btn-ghost shrink-0">Kembali ke Beranda</Link>
      </div>
    </div>
  );
}
