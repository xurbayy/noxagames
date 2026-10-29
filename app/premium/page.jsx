import Link from 'next/link';
import Emoji from '../components/Emoji';
import { pageMeta, SUPPORT_INVITE } from '../lib/site';

export const metadata = pageMeta({
  title: 'NOXA Sound Premium',
  description: 'Fitur premium NOXA Sound sedang disiapkan. Ikuti kabarnya di server dukungan resmi.',
  path: '/premium',
});

export default function PremiumPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="card relative overflow-hidden px-6 py-12 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-crimson/12 border border-crimson/25">
          <Emoji name="party" size={30} />
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">
          NOXA Sound <span className="neon-text">Premium</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          Masih di studio. Fitur premium sedang disiapkan supaya pas rilis semuanya
          sudah teruji dan tidak mengganggu fitur gratis yang sekarang.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-linebright bg-surface2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-warn live-dot" />
          Segera Hadir
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href={SUPPORT_INVITE} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Ikuti Kabarnya
          </a>
          <Link href="/" className="btn-ghost">Kembali ke Beranda</Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <RencanaCard emoji="sukapenuh" judul="Kenapa ditunda" desc="Semua fitur inti musik, podcast, dan radio sekarang gratis. Premium hanya akan berisi kenyamanan tambahan, bukan paywall untuk kontrol dasar." />
        <RencanaCard emoji="jam" judul="Kapan rilis" desc="Rilis menyusul setelah statistik web dan panel admin stabil dipakai sehari-hari. Pengumuman pertama lewat server dukungan." />
        <RencanaCard emoji="warning" judul="Prinsipnya" desc="Tidak ada pay-to-win. Audio tetap jernih untuk semua orang, premium hanya menyenangkan, bukan membuka pintu yang dikunci." />
      </div>
    </div>
  );
}

function RencanaCard({ emoji, judul, desc }) {
  return (
    <div className="card card-hover p-5">
      <Emoji name={emoji} size={22} />
      <h2 className="mt-3 font-display text-sm font-bold">{judul}</h2>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">{desc}</p>
    </div>
  );
}
