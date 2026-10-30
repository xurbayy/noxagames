import Link from 'next/link';
import BackButton from '../components/BackButton';
import { privacySections } from '../lib/legal-content';
import { pageMeta } from '../lib/site';

export const metadata = pageMeta({
  title: 'Kebijakan Privasi',
  description: 'Data apa yang disimpan NOXA Sound, kenapa disimpan, dan bagaimana kamu bisa meminta penghapusannya.',
  path: '/privacy-policy',
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Kebijakan Privasi</h1>
          <p className="mt-2 text-sm text-faint">Terakhir diperbarui 30 Oktober 2026</p>
        </div>
        <BackButton href="/" className="hidden sm:inline-flex" />
      </div>
      <div className="mt-8 space-y-8">
        {privacySections.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-lg font-bold">{s.title}</h2>
            {s.paras.map((p, i) => (
              <p key={i} className="mt-2.5 text-sm leading-relaxed text-muted">{p}</p>
            ))}
          </section>
        ))}
      </div>
      <div className="mt-10 border-t border-line pt-6 text-sm">
        <Link href="/terms-of-service" className="text-neon hover:underline">Baca juga Ketentuan Layanan</Link>
      </div>
    </div>
  );
}
