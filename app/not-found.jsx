import Link from 'next/link';
import Emoji from './components/Emoji';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-5 px-4 text-center">
      <Emoji name="musik" size={56} />
      <h1 className="font-display text-3xl font-bold">404</h1>
      <p className="text-sm leading-relaxed text-muted">
        Halaman yang kamu cari tidak ada. Mungkin sudah dipindah, atau kamu salah ketik.
        Seperti lagu yang sudah lewat, ini bukan jalurnya.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary">Kembali ke Beranda</Link>
        <Link href="/panduan" className="btn-ghost">Buka Panduan</Link>
      </div>
    </div>
  );
}
