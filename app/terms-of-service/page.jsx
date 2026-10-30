import Link from 'next/link';
import BackButton from '../components/BackButton';
import Emoji from '../components/Emoji';
import { termsSections } from '../lib/legal-content';
import { pageMeta, SUPPORT_INVITE } from '../lib/site';

export const metadata = pageMeta({
  title: 'Ketentuan Layanan',
  description:
    'Ketentuan Layanan NOXA Sound: aturan penggunaan bot Discord, perlindungan hak cipta (DMCA safe harbor), penafian hosting, dan batasan tanggung jawab.',
  path: '/terms-of-service',
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Ketentuan Layanan</h1>
          <p className="mt-1 text-xs sm:text-sm text-faint">Terakhir diperbarui: 30 Oktober 2026</p>
        </div>
        <BackButton href="/" className="hidden sm:inline-flex" />
      </div>

      {/* Ringkasan Hak Cipta & Disclaimer */}
      <div className="mt-8 rounded-2xl border border-line bg-surface2/60 p-5 shadow-[var(--shadow-hair)]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neon">
          <Emoji name="warning" size={14} /> Poin Penting Perlindungan Hak Cipta & Layanan
        </div>
        <ul className="mt-3 space-y-2 text-xs sm:text-sm text-muted">
          <li className="flex items-start gap-2">
            <span className="text-neon mt-0.5">•</span>
            <span><strong>Tanpa Hosting Audio:</strong> NOXA Sound tidak menyimpan, meng-upload, atau menduplikasi file musik di server sendiri. Aliran audio disalurkan secara langsung dari sumber web publik pihak ketiga.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neon mt-0.5">•</span>
            <span><strong>Hak Cipta Tetap Milik Pencipta:</strong> Seluruh karya musik, podcast, dan lirik adalah hak eksklusif musisi, label, dan penyedia platform terkait.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neon mt-0.5">•</span>
            <span><strong>Prosedur DMCA Takedown:</strong> Pemilik hak cipta yang sah dapat mengajukan permohonan pemblokiran tautan/konten yang akan segera diproses oleh tim kami.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neon mt-0.5">•</span>
            <span><strong>Bukan Milik Discord Inc:</strong> NOXA Sound adalah bot independen dan tidak terafiliasi resmi dengan Discord Inc.</span>
          </li>
        </ul>
      </div>

      <div className="mt-10 space-y-8">
        {termsSections.map((s) => (
          <section key={s.title} className="rounded-xl border border-line/60 bg-surface2/30 p-5 sm:p-6">
            <h2 className="font-display text-base sm:text-lg font-bold text-ink">{s.title}</h2>
            <div className="mt-3 space-y-3">
              {s.paras.map((p, i) => (
                <p key={i} className="text-xs sm:text-sm leading-relaxed text-muted">{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Prosedur Pelaporan DMCA */}
      <div className="card mt-10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-bold text-ink">Pelaporan Pelanggaran Hak Cipta (DMCA Notice)</h3>
          <p className="mt-1 text-xs text-muted">
            Kirimkan pemberitahuan resmi atau permintaan blokir domain/lagu melalui tiket di server dukungan kami.
          </p>
        </div>
        <a
          href={SUPPORT_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary shrink-0 !py-2 !px-4 text-xs font-semibold"
        >
          Kirim Laporan DMCA
        </a>
      </div>

      <div className="mt-8 border-t border-line pt-6 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <Link href="/privacy-policy" className="text-neon hover:underline font-semibold">
          ← Baca juga Kebijakan Privasi
        </Link>
        <Link href="/" className="text-muted hover:text-ink">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
