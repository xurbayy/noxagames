import Link from 'next/link';
import Emoji from './components/Emoji';
import PlayerShowcase from './components/panel/PlayerPanels';
import { getSession } from './lib/session';
import { getSnapshot, totals, botAlive, ageLabel, durasi } from './lib/snapshot';
import { faqList } from './lib/faq-content';
import { podcastTema, providers } from './lib/panduan-content';
import { BOT_INVITE, SUPPORT_INVITE } from './lib/site';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession().catch(() => null);
  const snap = await getSnapshot();
  const t = totals(snap?.data);
  const hidup = botAlive(snap);

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 md:grid-cols-2 md:pt-20">
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${hidup ? 'bg-ok live-dot' : 'bg-warn'}`} />
              <span className="text-[13px] font-semibold tracking-wide text-muted">
                {hidup ? 'Sedang Online' : 'Bot Sedang Offline'}
              </span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl">
              {session ? (
                <>
                  Selamat Dengar Lagi.
                  <br />
                  <span className="neon-text">Statistikmu Menanti.</span>
                </>
              ) : (
                <>
                  Lagu Nonstop.
                  <br />
                  <span className="neon-text">Satu Bot Discord.</span>
                </>
              )}
            </h1>
            <p className="mt-5 max-w-xl text-base md:text-lg leading-relaxed text-muted">
              {session ? (
                <>
                  Akun kamu sudah tertaut. Cek <strong className="text-ink">lagu paling sering</strong>,{' '}
                  <strong className="text-ink">dengar bareng</strong>, dan <strong className="text-ink">server favoritmu</strong>{' '}
                  di halaman profil, atau kembali main di Discord dengan .play.
                </>
              ) : (
                <>
                  <strong className="text-ink">NOXA Sound</strong> memutar musik dari 8 platform,
                  podcast 15 tema, dan radio lagu populer 24 jam. Semua kontrol lewat tombol
                  di panel, chat tetap bersih karena bot bersih-bersih sendiri. Gratis.
                </>
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {session ? (
                <>
                  <Link href="/me" className="btn-primary">Buka Profil</Link>
                  <Link href="/top" className="btn-ghost">
                    <Emoji name="number1" size={18} /> Cek Top Lagu
                  </Link>
                </>
              ) : (
                <>
                  <a href={BOT_INVITE} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    Add to Discord
                  </a>
                  <Link href="/pemutar" className="btn-ghost">
                    <Emoji name="suara" size={18} /> Lihat Panel Pemutar
                  </Link>
                </>
              )}
            </div>
            <div className="mt-5 flex items-center gap-2 text-[13px] text-faint">
              <span className="rounded border border-linebright px-1.5 py-0.5 font-mono">.play</span>
              <span>mulai dari situ. sisanya tinggal klik tombol</span>
            </div>
          </div>

          {/* Kanan hero: sudah login = maskot melayang (pola NEXO); belum login =
              panel pemutar replika 1:1 yang bisa dicoba */}
          {session ? (
            <MascotHero />
          ) : (
            <div>
              <PlayerShowcase singleMode="music" />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px] text-faint">
                <span>Panel yang sama persis dengan di Discord. Tombolnya bisa dicoba di sini.</span>
                <Link href="/pemutar" className="font-semibold text-neon hover:underline">Lihat semua mode</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= STATISTIK LIVE ================= */}
      <section className="border-y border-line bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatAngka label="Server Terpakai" angka={t.servers} emoji="musik" />
            <StatAngka label="Pendengar Tercatat" angka={t.listeners} emoji="userprofile" />
            <StatAngka label="Lagu Diputar" angka={t.plays} emoji="mulai" />
            <StatAngka label="Total Didengar" angka={durasi(t.durationSec)} emoji="jam" />
          </div>
          {snap && !hidup && (
            <div className="mt-4 text-xs text-faint">Data terakhir {ageLabel(snap.ageSec)} (bot sedang offline)</div>
          )}
        </div>
      </section>

      {/* ================= FITUR ================= */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead emoji="fitur" title="Bukan Sekadar Bot Musik." sub="Dari cari lagu sampai bersih-bersih chat, semua jalan sendiri di server kamu." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FiturCard emoji="musik" title="Musik dari 8 Platform" desc="YouTube, Spotify, Apple Music, TIDAL, dan teman-temannya. Ketik judulnya, bot nyariin 10 lagu teratas, kamu tinggal pilih." />
          <FiturCard emoji="NOXASmart" title="NOXA Smart" desc="Otak di balik layar: menyaring cover palsu, mencocokkan lagu antar platform, dan memastikan like nempel ke lagu yang benar." />
          <FiturCard emoji="radio" title="Radio 24 Jam" desc="Lagu populer nonstop, tidak ada yang diulang sampai pool-nya habis diputar. Jawaban buat server yang 24 jam ada orangnya." />
          <FiturCard emoji="podcast" title="Podcast 15 Tema" desc="Horror, kriminal, bisnis, dan 12 tema lagi. Vlog dan gaming yang menyamar sudah disaring, yang tampil benar-benar obrolan." />
          <FiturCard emoji="efek" title="Efek Audio DSP" desc="Bass boost tiga tingkat, nightcore, slowed, 8D, surround, karaoke. Pasang dan lepas dari panel tanpa putus-putus suara." />
          <FiturCard emoji="livelirik" title="Lirik Live" desc="Karaoke real-time yang menyala per baris mengikuti lagu. Liriknya diverifikasi dulu, karena salah lirik itu memalukan." />
          <FiturCard emoji="userprofile" title="Profil Pendengar" desc="Lagu paling sering kamu dengar, dengar bareng siapa, dan server favoritmu. Kartu analitiknya ada di Discord dan di sini." />
          <FiturCard emoji="chat" title="Live Chat di Panel" desc="Semua yang ada di voice bisa kirim pesan lewat tombol Chat, langsung muncul di panel. Debat lagu berikutnya jadi rame." />
        </div>

        {/* Provider strip: grid rapi 4x2, bukan baris meliuk */}
        <div className="mt-6 card p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-faint">Sumber Lagunya</div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {providers.map((p) => (
              <span key={p.nama} className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-muted">
                <Emoji name={p.emoji} size={18} /> {p.nama}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CARA PAKAI ================= */}
      <section className="border-y border-line bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionHead emoji="stayready" title="Cukup Ketik Titik." sub="Tanpa dashboard, tanpa belasan slash command. Satu prefix titik untuk semuanya." />
          <div className="grid gap-4 md:grid-cols-3">
            <LangkahCard n={1} judul="Invite bot" desc="Tekan Add to Discord, selesai. Tidak ada setup, tidak ada konfigurasi yang harus dibaca dulu." />
            <LangkahCard n={2} judul="Ketik perintahnya" desc="Masuk voice channel, lalu ketik .play lathi. Mau podcast? .podcast horror. Admin yang mau nyalakan radio tinggal .radio on." />
            <LangkahCard n={3} judul="Panelnya kerja" desc="Jeda, skip, volume, efek, like, semuanya jadi tombol di channel. Pesan lain dari bot otomatis terhapus 45 detik, panelnya saja yang tinggal." />
          </div>
        </div>
      </section>

      {/* ================= PODCAST TEMA ================= */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead emoji="podcast" title="Mau Dengar Apa Malam Ini?" sub="Ketik .podcast tanpa isi, daftar temanya muncul. Episode gaming dan vlog yang menyamar sudah disaring lebih dulu." />
        <div className="flex flex-wrap gap-2.5">
          {podcastTema.map((tema) => (
            <span key={tema.nama} className="flex items-center gap-2 rounded-full border border-line bg-surface2 px-4 py-2 text-[15px] text-muted">
              <Emoji name={tema.emoji} size={18} /> {tema.nama}
            </span>
          ))}
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="border-t border-line bg-surface/60">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <SectionHead emoji="bantuan" title="Sering Ditanyakan" sub="" />
          <div className="space-y-2.5">
            {faqList.map((f) => (
              <details key={f.q} className="card group px-5 py-4 open:border-linebright">
                <summary className="cursor-pointer list-none text-[15px] font-semibold text-ink marker:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {f.q}
                    <span className="text-lg text-faint transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA AKHIR ================= */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="card relative overflow-hidden px-6 py-12 text-center">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
          <Emoji name="musik" size={44} className="mx-auto" />
          <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Percaya Sama Telinga Sendiri.</h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] md:text-base leading-relaxed text-muted">
            Invite botnya, mainkan satu lagu, lalu putuskan. Kalau ada yang bikin bingung,
            server dukungan dibuka setiap hari.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={BOT_INVITE} target="_blank" rel="noopener noreferrer" className="btn-primary">Add to Discord</a>
            <a href={SUPPORT_INVITE} target="_blank" rel="noopener noreferrer" className="btn-ghost">Server Dukungan</a>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------- Komponen kecil landing (server) ----------

// Maskot hero: muncul HANYA saat sudah login (pola NEXO). Bob desktop,
// wiggle mobile (lihat globals.css), bayangan oval menyusut, 2 bubble
// melayang bergantian, glow merah di belakang.
function MascotHero() {
  return (
    <div className="relative mx-auto flex w-full max-w-md select-none flex-col items-center px-4 py-6">
      {/* Glow siluet */}
      <div className="absolute inset-0 -z-10 rounded-full bg-crimson/10 blur-3xl" aria-hidden="true" />

      <img
        src="/mascot.png"
        alt="Maskot NOXA Sound"
        className="mascot-anim w-full max-w-sm"
        draggable={false}
      />

      {/* Bayangan oval menyusut */}
      <div
        className="mascot-shadow -mt-6 h-4 w-48 rounded-full bg-black/70 blur-md"
        aria-hidden="true"
      />

      {/* Bubble ucapan */}
      <div className="bubble-a absolute left-0 top-6 rounded-full border border-linebright bg-surface2 px-3.5 py-1.5 text-[13px] font-semibold text-ink shadow-lg">
        np? Gas!
      </div>
      <div className="bubble-b absolute bottom-10 right-0 rounded-full border border-linebright bg-surface2 px-3.5 py-1.5 text-[13px] font-semibold text-ink shadow-lg">
        Dengar bareng yuk!
      </div>
    </div>
  );
}

function StatAngka({ label, angka, emoji }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-crimson/12 border border-crimson/25">
        <Emoji name={emoji} size={22} />
      </span>
      <div className="min-w-0">
        <div className="font-display text-2xl font-bold leading-tight tabular-nums">{angka ?? 0}</div>
        <div className="truncate text-[13px] text-faint">{label}</div>
      </div>
    </div>
  );
}

function SectionHead({ emoji, title, sub }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5">
        <Emoji name={emoji} size={26} />
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      </div>
      {sub ? <p className="mt-2.5 max-w-2xl text-[15px] md:text-base leading-relaxed text-muted">{sub}</p> : null}
    </div>
  );
}

function FiturCard({ emoji, title, desc }) {
  return (
    <div className="card card-hover flex flex-col p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-crimson/12 border border-crimson/25">
          <Emoji name={emoji} size={24} />
        </span>
        <h3 className="font-display text-base font-bold leading-snug">{title}</h3>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{desc}</p>
    </div>
  );
}

function LangkahCard({ n, judul, desc }) {
  return (
    <div className="card card-hover p-5">
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
