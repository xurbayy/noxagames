import Link from 'next/link';
import Emoji from './components/Emoji';
import PlayerShowcase from './components/panel/PlayerPanels';
import Reveal from './components/Reveal';
import { getSession } from './lib/session';
import { getSnapshot, totals, botAlive, ageLabel, durasi } from './lib/snapshot';
import { faqList } from './lib/faq-content';
import { podcastTema, providers } from './lib/panduan-content';
import { PREMIUM_PLANS, labelHarga } from './lib/premiumPlan';
import { BOT_INVITE, SUPPORT_INVITE, SITE_URL, SITE_NAME, SITE_DESCRIPTION } from './lib/site';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession().catch(() => null);
  const snap = await getSnapshot();
  const t = totals(snap?.data);
  const hidup = botAlive(snap);

  // JSON-LD FAQPage: membuat pertanyaan di landing bisa tampil sebagai rich
  // result di Google (accordion "People also ask"). Sumbernya faqList yang
  // SAMA dengan yang dirender, jadi tidak mungkin beda isi.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  // JSON-LD WebSite + Organization: memberi Google nama situs, URL kanonik,
  // dan deskripsi resmi untuk knowledge panel.
  const siteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'id-ID',
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        {/* Pola hexagon padat + blur: terasa berpola tanpa garis yang bersaing
            dengan teks (versi garis sebelumnya dihapus atas permintaan). */}
        <div className="bg-hex absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 sm:gap-12 px-4 sm:px-5 pb-14 pt-24 sm:pb-16 sm:pt-28 md:grid-cols-2 md:pb-24 md:pt-36">
          {/* min-w-0: tanpa ini isi panel pemutar di kolom kanan memaksa kolom
              kiri lebih lebar dari layar, jadi teks hero terpotong di HP kecil. */}
          <div className="min-w-0 text-center lg:text-left">
            <h1 className="anim-in delay-1 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl break-words">
              {session ? (
                <>
                  Selamat
                  <br />
                  <span className="neon-text">Dengar Lagi.</span>
                </>
              ) : (
                <>
                  Lagu Nonstop.
                  <br />
                  <span className="neon-text">Satu Bot.</span>
                </>
              )}
            </h1>
            <div className="anim-in delay-1 accent-bar mt-5 mx-auto lg:mx-0" aria-hidden="true" />
            <p className="anim-in delay-2 mt-5 text-base md:text-lg leading-relaxed text-muted">
              {session ? (
                'Lagumu, statistikmu, sudah tertaut.'
              ) : (
                <>8 platform. 15 tema podcast. Radio 24 jam. Ketik <strong className="text-ink">.play</strong> dan jalan.</>
              )}
            </p>
            <div className="anim-in delay-3 mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              {session ? (
                <>
                  <Link href="/me" prefetch={false} className="btn-primary">Buka Profil</Link>
                  <Link href="/top" prefetch={false} className="btn-ghost">
                    Cek Top NOXA
                  </Link>
                </>
              ) : (
                <>
                  <a href={BOT_INVITE} target="_blank" rel="noopener noreferrer nofollow" className="btn-primary">
                    Tambahkan ke Discord
                  </a>
                  <Link href="/pemutar" prefetch={false} className="btn-ghost">
                    Lihat Panel Pemutar
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Kanan hero: sudah login = maskot melayang; belum login = panel pemutar compact */}
          <div className="anim-in delay-2 flex w-full min-w-0 justify-center lg:justify-end">
            {session ? (
              <MascotHero />
            ) : (
              <div className="w-full min-w-0 max-w-md">
                <PlayerShowcase singleMode="music" compact />
                <div className="mt-3 flex justify-end text-[13px] text-faint">
                  <Link href="/pemutar" prefetch={false} className="font-semibold text-neon hover:underline">Lihat semua mode</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= STATISTIK LIVE ================= */}
      <section className="bg-bg">
        <Reveal className="mx-auto max-w-6xl px-4 sm:px-5 py-8 sm:py-10">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
            <StatAngka label="Server Terpakai" angka={t.servers} emoji="musik" />
            <StatAngka label="Pendengar Tercatat" angka={t.listeners} emoji="userprofile" />
            <StatAngka label="Lagu Diputar" angka={t.plays} emoji="mulai" />
            <StatAngka label="Total Didengar" angka={durasi(t.durationSec)} emoji="jam" />
          </div>
          {!hidup && (
            <div className="mt-4 text-xs leading-relaxed text-faint">
              {snap ? `Data terakhir ${ageLabel(snap.ageSec)}.` : 'Belum ada data dari bot.'} Kalau bot tidak merespons di Discord, buka{' '}
              <a href={SUPPORT_INVITE} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-neon hover:underline">
                server dukungan
              </a>
              .
            </div>
          )}
        </Reveal>
      </section>

      {/* ================= FITUR ================= */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <Reveal>
          <SectionHead title="Bukan Sekadar Bot Musik." sub="Jalan sendiri di servermu." />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal delay={60}><FiturCard emoji="musik" title="Musik dari 8 Platform" desc="Ketik judul, pilih dari 10 hasil teratas." /></Reveal>
          <Reveal delay={120}><FiturCard emoji="NOXASmart" title="NOXA Smart" desc="Cover palsu disaring, lagu lintas platform dicocok otomatis." /></Reveal>
          <Reveal delay={180}><FiturCard emoji="radio" title="Radio 24 Jam" desc="Lagu populer nonstop 24 jam, tidak ada yang diulang." /></Reveal>
          <Reveal delay={240}><FiturCard emoji="podcast" title="Podcast 15 Tema" desc="Horror, kriminal, bisnis, dan 12 lainnya." /></Reveal>
          <Reveal delay={60}><FiturCard emoji="efek" title="Efek Audio DSP" desc="Bass, nightcore, 8D, dan lainnya. Pasang tanpa putus suara." /></Reveal>
          <Reveal delay={120}><FiturCard emoji="livelirik" title="Lirik Live" desc="Menyala per baris mengikuti lagu, lirik terverifikasi." /></Reveal>
          <Reveal delay={180}><FiturCard emoji="userprofile" title="Profil Pendengar" desc="Lagu favorit, dengar bareng siapa, dan server favoritmu." /></Reveal>
          <Reveal delay={240}><FiturCard emoji="chat" title="Live Chat di Panel" desc="Pesan dari voice langsung muncul di panel." /></Reveal>
        </div>

        {/* Provider strip */}
        <Reveal delay={300} className="mt-8 card p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-faint">Sumber musik</div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {providers.map((p) => (
              <span key={p.nama} className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-muted">
                <Emoji name={p.emoji} size={18} /> {p.nama}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ================= CARA PAKAI ================= */}
      <section id="cara-pakai" className="scroll-mt-24 bg-bg">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
          <Reveal>
            <SectionHead title="Cukup Ketik Titik." sub="Satu prefix untuk semuanya." />
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            <Reveal delay={60}><LangkahCard n={1} judul="Invite bot" desc="Tekan tombol invite, selesai. Tanpa setup." /></Reveal>
            <Reveal delay={140}><LangkahCard n={2} judul="Ketik perintahnya" desc="Masuk voice, ketik .play lathi. Podcast? .podcast horror." /></Reveal>
            <Reveal delay={220}><LangkahCard n={3} judul="Panelnya kerja" desc="Semua kontrol jadi tombol di channel, chat bersih otomatis." /></Reveal>
          </div>
        </div>
      </section>

      {/* ================= PODCAST TEMA ================= */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <Reveal>
          <SectionHead title="Mau Dengar Apa Malam Ini?" sub="15 tema. Yang nyamar sudah disaring." />
        </Reveal>
        <Reveal delay={80}>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 sm:grid-cols-3 md:grid-cols-5">
            {podcastTema.map((tema) => (
              <div
                key={tema.nama}
                className="card card-hover flex items-center gap-2.5 sm:gap-3 px-3 py-3 sm:px-4 sm:py-3.5"
              >
                <Emoji name={tema.emoji} size={22} className="shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-ink leading-snug break-words">{tema.nama}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ================= KONTAK ================= */}
      <section id="kontak" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 md:py-24">
        <Reveal>
          <SectionHead title="Butuh Bantuan?" sub="Satu pintu: server dukungan resmi." />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          <Reveal delay={60}>
            <div className="card card-hover flex h-full flex-col p-6">
              <Emoji name="callme" size={22} />
              <h3 className="mt-3 font-display text-base font-bold">Server Dukungan</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">
                Buka tiket, admin dan member lain siap bantu.
              </p>
              <a href={SUPPORT_INVITE} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost mt-4 self-start !px-4 !py-2 text-sm">
                Gabung Server
              </a>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="card card-hover flex h-full flex-col p-6">
              <Emoji name="warning" size={22} />
              <h3 className="mt-3 font-display text-base font-bold">Lapor Bug</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">
                Sebutkan perintah, server, dan waktunya - langsung kami telusuri.
              </p>
              <a href={SUPPORT_INVITE} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost mt-4 self-start !px-4 !py-2 text-sm">
                Kirim Laporan
              </a>
            </div>
          </Reveal>
          <Reveal delay={220}>
            <div className="card card-hover flex h-full flex-col p-6">
              <Emoji name="fitur" size={22} />
              <h3 className="mt-3 font-display text-base font-bold">Permintaan Fitur</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">
                Semua usulan dibaca sebelum masuk daftar kerja.
              </p>
              <a href={SUPPORT_INVITE} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost mt-4 self-start !px-4 !py-2 text-sm">
                Usulkan Fitur
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="bg-bg">
        <div className="mx-auto max-w-4xl px-5 py-20 md:py-24">
          <Reveal>
            <SectionHead title="Sering Ditanyakan" sub="" />
          </Reveal>
          <div className="space-y-2.5">
            {faqList.map((f, i) => (
              <Reveal key={f.q} delay={(i % 4) * 60}>
                <details className="card group px-5 py-4 open:border-linebright">
                  <summary className="cursor-pointer list-none text-[15px] font-semibold text-ink marker:hidden">
                    <span className="flex items-center justify-between gap-3">
                      {f.q}
                      <span className="text-lg text-faint transition-transform group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PREMIUM ================= */}
      <section id="premium" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-20 md:py-24">
        <Reveal>
          <SectionHead title="Mau Lebih Bebas Lagi?" sub="Tiga paket. Bayar QRIS, langsung aktif." />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {PREMIUM_PLANS.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 80}>
              <div className={`card card-hover flex h-full flex-col p-6 ${plan.populer ? 'ring-1 ring-slate-300/40' : ''}`}>
                <div className="flex items-center gap-3">
                  <img src={plan.badge} alt={plan.badgeAlt} width={44} height={44} className="h-11 w-11 object-contain" draggable={false} />
                  <div>
                    <h3 className="font-display text-base font-bold">{plan.nama}</h3>
                    <div className="text-xs text-faint">{plan.target}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-display text-2xl font-bold tabular-nums">{labelHarga(plan.hargaBulanan)}</span>
                  <span className="text-xs text-muted">/bulan</span>
                </div>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-muted">
                  {plan.fiturRingkas.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-neon">✓</span>
                      <span className="break-words">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/premium"
                  prefetch={false}
                  className={`mt-5 w-full justify-center ${plan.populer ? 'btn-primary' : 'btn-ghost'}`}
                >
                  Lihat Paket →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= CTA AKHIR ================= */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <Reveal>
          <div className="card relative overflow-hidden px-6 py-14 text-center">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
            <Emoji name="musik" size={44} className="mx-auto" />
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Percaya Sama Telinga Sendiri.</h2>
            <p className="mx-auto mt-3 max-w-lg text-base md:text-lg leading-relaxed text-muted">
              Mainkan satu lagu, lalu putuskan sendiri.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={BOT_INVITE} target="_blank" rel="noopener noreferrer nofollow" className="btn-primary">Tambahkan ke Discord</a>
              <a href={SUPPORT_INVITE} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost">Server Dukungan</a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

// ---------- Komponen kecil landing (server) ----------

function MascotHero() {
  return (
    <div className="relative mx-auto flex w-full max-w-md select-none flex-col items-center px-4 py-6">
      <div className="absolute inset-0 -z-10 rounded-full bg-crimson/10 blur-3xl" aria-hidden="true" />

      <img
        src="/mascot.png"
        alt="Maskot NOXA Sound"
        className="mascot-anim w-full max-w-sm"
        draggable={false}
      />

      <div
        className="mascot-shadow -mt-6 h-4 w-48 rounded-full bg-black/70 blur-md"
        aria-hidden="true"
      />

      <div className="bubble-a absolute left-0 top-6 rounded-full border border-linebright bg-surface2 px-3.5 py-1.5 text-[13px] font-semibold text-ink shadow-[var(--shadow-soft)]">
        .play? Gas!
      </div>
      <div className="bubble-b absolute bottom-10 right-0 rounded-full border border-linebright bg-surface2 px-3.5 py-1.5 text-[13px] font-semibold text-ink shadow-[var(--shadow-soft)]">
        Dengar bareng yuk!
      </div>
    </div>
  );
}

function StatAngka({ label, angka, emoji }) {
  return (
    <div className="card flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3.5 sm:p-4">
      <Emoji name={emoji} size={28} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="font-display text-xl sm:text-2xl font-bold leading-tight tabular-nums break-words">{angka ?? 0}</div>
        <div className="text-xs sm:text-sm text-faint leading-tight mt-0.5 break-words">{label}</div>
      </div>
    </div>
  );
}

// Judul seksi tanpa ikon: cukup teks + garis aksen, biar bersih dan tidak
// ramai (permintaan pemilik: heading tidak perlu emoji di sebelahnya).
function SectionHead({ title, sub }) {
  return (
    <div className="mb-10 sm:mb-14 text-center">
      <h2 className="font-display text-[26px] sm:text-3xl md:text-4xl font-bold tracking-tight break-words">{title}</h2>
      <div className="accent-bar mx-auto mt-4" aria-hidden="true" />
      {sub ? <p className="mx-auto mt-3.5 max-w-xl text-sm sm:text-base leading-relaxed text-muted break-words">{sub}</p> : null}
    </div>
  );
}

function FiturCard({ emoji, title, desc }) {
  return (
    <div className="card card-hover flex flex-col p-4 sm:p-6 h-full">
      <div className="flex items-center gap-3">
        <Emoji name={emoji} size={26} className="shrink-0" />
        <h3 className="font-display text-sm sm:text-base font-bold leading-snug break-words">{title}</h3>
      </div>
      <p className="mt-3 flex-1 text-sm md:text-[15px] leading-relaxed text-muted break-words">{desc}</p>
    </div>
  );
}

function LangkahCard({ n, judul, desc }) {
  return (
    <div className="card card-hover p-6 h-full">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-crimson font-display text-base font-bold text-white">
          {n}
        </span>
        <h3 className="font-display text-base font-bold">{judul}</h3>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{desc}</p>
    </div>
  );
}
