import Link from 'next/link';
import Emoji from '../components/Emoji';
import BackButton from '../components/BackButton';
import { panduanKategori } from '../lib/panduan-content';
import { pageMeta } from '../lib/site';

export const metadata = pageMeta({
  title: 'Panduan Perintah',
  description: 'Daftar lengkap perintah NOXA Sound: musik, playlist, podcast, radio 24 jam, efek audio, lirik, dan profil pendengar. Semua lewat prefix titik.',
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

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {panduanKategori.map((kat) => (
          <section key={kat.key} className="card p-5" id={kat.key}>
            <div className="flex items-center gap-2.5">
              <Emoji name={kat.emoji} size={24} className="shrink-0" />
              <h2 className="font-display text-base font-bold">{kat.label}</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">{kat.intro}</p>
            <ul className="mt-4 space-y-3">
              {kat.items.map((it) => (
                <li key={it.cmd} className="border-l-2 border-darkcrimson pl-3">
                  <div className="text-sm font-semibold">
                    {it.cmd.startsWith('.') ? <span className="cmd">{it.cmd}</span> : it.cmd}
                    {it.alias ? <span className="ml-2 text-xs font-normal text-faint">alias {it.alias}</span> : null}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{it.desc}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="card mt-6 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Butuh panduan langsung di Discord? Ketik <span className="cmd">.help</span> dan bot mengirim panel bantuan lengkap yang tidak pernah terhapus otomatis.
        </p>
        <Link href="/" className="btn-ghost shrink-0">Kembali ke Beranda</Link>
      </div>
    </div>
  );
}
