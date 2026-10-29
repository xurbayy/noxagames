import Link from 'next/link';
import Emoji from './components/Emoji';
import PlayerShowcase from './components/panel/PlayerPanels';
import { getSnapshot, totals, botAlive, ageLabel, durasi } from './lib/snapshot';
import { faqList } from './lib/faq-content';
import { podcastTema, providers } from './lib/panduan-content';
import { BOT_INVITE, SUPPORT_INVITE } from './lib/site';

export const dynamic = 'force-dynamic';

export default async function Home() {
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
              <span className={`h-2 w-2 rounded-full ${hidup ? 'bg-ok live-dot' : 'bg-warn'}`} />
              <span className="text-xs font-semibold tracking-wide text-muted">
                {hidup ? 'Bot online dan siap dipakai' : 'Menyambung ke studio bot...'}
              </span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl">
              Lagu Nonstop.
              <br />
              <span className="neon-text">Satu Bot Discord.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
              <strong className="text-ink">NOXA Sound</strong> memutar musik dari 8 platform,
              podcast 15 tema, dan radio lagu populer 24 jam. Semua kontrol lewat tombol
              di panel, chat tetap bersih karena bot bersih-bersih sendiri. Gratis.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={BOT_INVITE} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Add to Discord
              </a>
              <Link href="/pemutar" className="btn-ghost">
                <Emoji name="suara" size={18} /> Lihat Panel Pemutar
              </Link>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-faint">
              <span className="rounded border border-linebright px-1.5 py-0.5 font-mono">.play</span>
              <span>mulai dari situ. sisanya tinggal klik tombol</span>
            </div>
          </div>

          {/* Replika 1:1 panel pemutar Discord NOXA (interaktif) */}
          <div>
            <PlayerShowcase singleMode="music" />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-faint">
              <span>Panel yang sama persis dengan di Discord. Tombolnya bisa dicoba di sini.</span>
              <Link href="/pemutar" className="font-semibold text-neon hover:underline">Lihat semua mode</Link>
            </div>
          </div>
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
          <FiturCard emoji="musik" title="Musik dari 8 Platform" desc="YouTube, Spotify, Apple Music, TIDAL, SoundCloud, Deezer, JioSaavn, YouTube Music. Ketik judulnya, pilih provider, bot nyariin 10 lagu teratas tinggal kamu pilih." wide />
          <FiturCard emoji="NOXASmart" title="NOXA Smart" desc="Otak di balik layar. Menyaring cover palsu dan video reaksi, mencocokkan lagu antar platform, dan memastikan like kamu nempel ke lagu yang benar." />
          <FiturCard emoji="radio" title="Radio 24 Jam" desc="Lagu populer nonstop dari pool yang terus tumbuh. Satu lagu tidak diulang sampai pool-nya habis diputar. Server yang 24 jam ada orangnya, ini jawabannya." />
          <FiturCard emoji="podcast" title="Podcast 15 Tema" desc="Horror, kriminal, bisnis, obrolan santai, dan 11 lagi. Bot menolak vlog dan video gaming yang menyamar jadi podcast, jadi yang tampil benar-benar obrolan." />
          <FiturCard emoji="efek" title="Efek Audio DSP" desc="Bass boost tiga tingkat, nightcore, slowed, 8D, surround, karaoke. Pasang dan lepas dari panel, kapan saja, tanpa putus-putus suara." />
          <FiturCard emoji="livelirik" title="Lirik Live" desc="Karaoke real-time yang menyala per baris mengikuti lagu. Liriknya diverifikasi dari beberapa sumber dulu, karena salah lirik itu memalukan." wide />
          <FiturCard emoji="userprofile" title="Profil Pendengar" desc="Lagu apa yang paling sering kamu dengar, dengar bareng siapa, di server mana. Kartu analitiknya bisa dilihat di Discord dan di web ini." />
          <FiturCard emoji="chat" title="Live Chat di Panel" desc="Semua yang ada di voice bisa kirim pesan lewat tombol Chat, langsung muncul di panel. Buat debat lagu berikutnya tanpa spam channel." />
        </div>

        {/* Provider strip */}
        <div className="mt-8 card p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-faint">Sumber Lagunya</div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {providers.map((p) => (
              <span key={p.nama} className="flex items-center gap-1.5 text-sm text-muted">
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
            <span key={tema.nama} className="flex items-center gap-2 rounded-full border border-line bg-surface2 px-3.5 py-1.5 text-sm text-muted">
              <Emoji name={tema.emoji} size={16} /> {tema.nama}
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
              <details key={f.q} className="card group px-4 py-3 open:border-linebright">
                <summary className="cursor-pointer list-none text-sm font-semibold text-ink marker:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {f.q}
                    <span className="text-faint transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA AKHIR ================= */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="card relative overflow-hidden px-6 py-12 text-center">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
          <Emoji name="musik" size={40} className="mx-auto" />
          <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">Percaya Sama Telinga Sendiri.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted">
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

function StatAngka({ label, angka, emoji }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-crimson/12 border border-crimson/25">
        <Emoji name={emoji} size={20} />
      </span>
      <div className="min-w-0">
        <div className="font-display text-xl font-bold leading-tight tabular-nums">{angka ?? 0}</div>
        <div className="truncate text-xs text-faint">{label}</div>
      </div>
    </div>
  );
}

function SectionHead({ emoji, title, sub }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5">
        <Emoji name={emoji} size={24} />
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {sub ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{sub}</p> : null}
    </div>
  );
}

function FiturCard({ emoji, title, desc, wide }) {
  return (
    <div className={`card card-hover p-5 ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-crimson/12 border border-crimson/25">
        <Emoji name={emoji} size={24} />
      </span>
      <h3 className="mt-3.5 font-display text-base font-bold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{desc}</p>
    </div>
  );
}

function LangkahCard({ n, judul, desc }) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-crimson font-display text-base font-bold text-white">
          {n}
        </span>
        <h3 className="font-display text-base font-bold">{judul}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{desc}</p>
    </div>
  );
}
