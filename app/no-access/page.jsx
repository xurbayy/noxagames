import Link from 'next/link';
import Emoji from '../components/Emoji';

export const metadata = { title: 'Akses Ditolak' };

export default function NoAccessPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-surface2">
        <Emoji name="crash" size={32} />
      </span>
      <h1 className="font-display text-2xl font-bold">Ini ruang produksi</h1>
      <p className="max-w-sm text-sm leading-relaxed text-muted">
        Panel admin cuma untuk pemilik dan staf yang terdaftar. Akunmu sudah berhasil
        login sebagai member, jadi kamu bisa langsung melihat profil dengarmu sendiri.
      </p>
      <div className="flex gap-3">
        <Link href="/me" className="btn-primary">Buka Profil Gw Aja</Link>
        <Link href="/" className="btn-ghost">Beranda</Link>
      </div>
    </div>
  );
}
