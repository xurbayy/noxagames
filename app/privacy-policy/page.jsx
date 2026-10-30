import Link from 'next/link';
import BackButton from '../components/BackButton';
import Emoji from '../components/Emoji';
import { privacySections } from '../lib/legal-content';
import { pageMeta, SUPPORT_INVITE } from '../lib/site';

export const metadata = pageMeta({
  title: 'Kebijakan Privasi',
  description:
    'Kebijakan privasi resmi NOXA Sound: kepatuhan Discord Developer Policy, data apa yang dikumpulkan, larangan perekaman suara, dan prosedur penghapusan data.',
  path: '/privacy-policy',
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Kebijakan Privasi</h1>
          <p className="mt-1 text-xs sm:text-sm text-faint">Terakhir diperbarui: 30 Oktober 2026</p>
        </div>
        <BackButton href="/" className="hidden sm:inline-flex" />
      </div>

      {/* Ringkasan Cepat */}
      <div className="mt-8 rounded-2xl border border-line bg-surface2 p-5 shadow-[var(--shadow-hair)]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neon">
          <Emoji name="centang" size={14} /> Poin Penting Perlindungan Privasi
        </div>
        <ul className="mt-3 space-y-2 text-xs sm:text-sm text-muted">
          <li className="flex items-start gap-2">
            <span className="text-neon mt-0.5">•</span>
            <span><strong>Tanpa Rekaman Suara:</strong> Bot tidak pernah merekam atau menyimpan percakapan suara pengguna di voice channel.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neon mt-0.5">•</span>
            <span><strong>Tanpa Penyimpanan Chat:</strong> Pesan teks umum tidak pernah dibaca atau diarsipkan; hanya perintah bot yang diproses lalu dibersihkan.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neon mt-0.5">•</span>
            <span><strong>Hak Hapus Data:</strong> Anda dapat meminta penghapusan seluruh data profil dan riwayat musik Anda kapan saja.</span>
          </li>
        </ul>
      </div>

      <div className="mt-10 space-y-8">
        {privacySections.map((s) => (
          <section key={s.title} className="rounded-xl border border-line/60 bg-surface3 p-5 sm:p-6">
            <h2 className="font-display text-base sm:text-lg font-bold text-ink">{s.title}</h2>
            <div className="mt-3 space-y-3">
              {s.paras.map((p, i) => (
                <p key={i} className="text-xs sm:text-sm leading-relaxed text-muted">{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Kontak Permintaan Hapus Data */}
      <div className="card mt-10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-bold text-ink">Ingin Menghapus Data Statistikmu?</h3>
          <p className="mt-1 text-xs text-muted">
            Buka tiket di server dukungan resmi, sebutkan ID Discord-mu, dan data akan dibersihkan.
          </p>
        </div>
        <a
          href={SUPPORT_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary shrink-0 !py-2 !px-4 text-xs font-semibold"
        >
          Server Dukungan Resmi
        </a>
      </div>

      <div className="mt-8 border-t border-line pt-6 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <Link href="/terms-of-service" className="text-neon hover:underline font-semibold">
          ← Baca juga Ketentuan Layanan
        </Link>
        <Link href="/" className="text-muted hover:text-ink">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
