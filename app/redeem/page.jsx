import Link from 'next/link';
import Emoji from '../components/Emoji';
import { pageMeta, SUPPORT_INVITE } from '../lib/site';

export const metadata = pageMeta({
  title: 'Redeem Kode',
  description: 'Klaim kode promo NOXA Sound. Fitur redeem sedang disiapkan dan akan segera aktif.',
  path: '/redeem',
});

export default function RedeemPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="card relative overflow-hidden px-6 py-12 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-crimson/12 border border-crimson/25">
          <Emoji name="callme" size={28} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">Redeem Kode Promo</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          Fitur klaim kode promo sedang disiapkan. Kalau kamu punya kode dari event,
          simpan dulu baik-baik, jangan dibagikan ke siapa pun.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-linebright bg-surface2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-warn live-dot" />
          Segera Aktif
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href={SUPPORT_INVITE} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Server Dukungan
          </a>
          <Link href="/" className="btn-ghost">Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}
