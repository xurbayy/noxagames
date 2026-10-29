import Link from 'next/link';
import { termsSections } from '../lib/legal-content';
import { pageMeta } from '../lib/site';

export const metadata = pageMeta({
  title: 'Ketentuan Layanan',
  description: 'Aturan pemakaian bot dan web NOXA Sound, sanksi pelanggaran, dan hak cipta konten yang diputar.',
  path: '/terms-of-service',
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Ketentuan Layanan</h1>
      <p className="mt-2 text-sm text-faint">Terakhir diperbarui 29 Oktober 2026</p>
      <div className="mt-8 space-y-8">
        {termsSections.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-lg font-bold">{s.title}</h2>
            {s.paras.map((p, i) => (
              <p key={i} className="mt-2.5 text-sm leading-relaxed text-muted">{p}</p>
            ))}
          </section>
        ))}
      </div>
      <div className="mt-10 border-t border-line pt-6 text-sm">
        <Link href="/privacy-policy" className="text-neon hover:underline">Baca juga Kebijakan Privasi</Link>
      </div>
    </div>
  );
}
