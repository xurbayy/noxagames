import Link from 'next/link';
import Emoji from './components/Emoji';
import { getSnapshot, totals, livePlayers, liveSummary, botAlive, ageLabel, durasi, formatDuration } from './lib/snapshot';
import { faqList } from './lib/faq-content';
import { podcastTema, providers } from './lib/panduan-content';
import { BOT_INVITE, SUPPORT_INVITE } from './lib/site';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const snap = await getSnapshot();
  const t = totals(snap?.data);
  const live = liveSummary(snap?.data);
  const players = livePlayers(snap?.data);
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
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              NOXA <span className="neon-text">Sound</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
              Bot hiburan audio Discord untuk musik, podcast, dan radio. Putar lagu dari
              delapan platform, dengarkan podcast 15 tema, dan biarkan radio memutar
              lagu populer nonstop. Semuanya gratis.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={BOT_INVITE} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Add to Discord
              </a>
              <Link href="/panduan" className="btn-ghost">
                <Emoji name="panduan" size={18} /> Lihat Panduan
              </Link>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-faint">
              <span className="rounded border border-linebright px-1.5 py-0.5 font-mono">.play</span>
              <span>itu satu-satunya yang perlu kamu ingat</span>
            </div>
          </div>

          {/* Mock panel pemutar ala Discord */}
          <HeroPlayerMock hidup={hidup} />
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
          {players.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-ok live-dot" />
                Sedang Mengudara
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {players.slice(0, 8).map((p, i) => (
                  <div key={`${p.guildId}-${i}`} className="card flex min-w-56 max-w-56 items-center gap-3 p-3">
                    <Emoji name={p.mode === 'radio' ? 'radio' : p.mode === 'podcast' ? 'podcast' : 'musik'} size={22} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{p.title}</div>
                      <div className="truncate text-xs text-faint">
                        {p.guildName} {p.listeners > 0 ? `${p.listeners} pendengar` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {snap && !hidup && (
            <div className="mt-4 text-xs text-faint">Data terakhir {ageLabel(snap.ageSec)} (bot sedang offline)</div>
          )}
        </div>
      </section>

      {/* ================= FITUR ================= */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead emoji="fitur" title="Semua yang kamu butuh untuk dengar bareng" sub="Satu bot, tiga mode, dan kontrol yang lengkap tanpa harus keluar dari Discord." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FiturCard emoji="musik" title="Musik 8 Platform" desc="Cari lagu dari YouTube, Spotify, Apple Music, TIDAL, SoundCloud, Deezer, JioSaavn, dan YouTube Music. Pilih provider, pilih lagu, langsung jalan." wide />
          <FiturCard emoji="podcast" title="Podcast 15 Tema" desc="Kurasi cerdas dari horror sampai bisnis. Bot menyaring vlog dan gaming agar yang tampil benar-benar podcast." />
          <FiturCard emoji="radio" title="Radio 24 Jam" desc="Lagu populer nonstop tanpa pengulangan sampai pool habis. Untuk server yang selalu ada orangnya." />
          <FiturCard emoji="NOXASmart" title="NOXA Smart" desc="Audio balanced, rekomendasi yang mengikuti alur musikmu, dan verifikasi lirik multi-provider. Bekerja diam-diam." />
          <FiturCard emoji="efek" title="Efek Audio DSP" desc="Bass boost 3 level, nightcore, slowed, 8D, surround, karaoke, dan lainnya. Satu klik dari panel pemutar." />
          <FiturCard emoji="livelirik" title="Live Lirik" desc="Karaoke real-time yang menyala mengikuti lagu, plus skrip lirik penuh yang bisa di-scroll." />
          <FiturCard emoji="userprofile" title="Profil Pendengar" desc="Kartu analitik mendengarkanmu: lagu paling sering, dengar bareng siapa, dan server favorit. Ada di web juga." wide />
          <FiturCard emoji="chat" title="Live Chat di Pemutar" desc="Kirim pesan singkat yang muncul langsung di panel pemutar untuk semua yang dengar bareng." />
        </div>

        {/* Provider strip */}
        <div className="mt-8 card p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-faint">Didukung 8 Provider Resmi</div>
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
          <SectionHead emoji="stayready" title="Mulai dalam tiga langkah" sub="Tidak ada dashboard yang harus dipelajari. Semuanya di channel Discord kamu." />
          <div className="grid gap-4 md:grid-cols-3">
            <LangkahCard n={1} judul="Invite bot" desc="Masukkan NOXA Sound ke server kamu lewat tombol Add to Discord. Bot hanya butuh izin voice dan kirim pesan." />
            <LangkahCard n={2} judul="Ketik .play" desc="Masuk voice channel, lalu ketik .play diikuti judul lagu atau link. Bot tampilkan hasil pencarian di dropdown." />
            <LangkahCard n={3} judul="Dengar bareng" desc="Panel pemutar muncul di channel dengan semua kontrol. Klik like untuk simpan, ketik .profile untuk statistikmu." />
          </div>
        </div>
      </section>

      {/* ================= PODCAST TEMA ================= */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead emoji="podcast" title="15 tema podcast kurasi" sub="Ketik .podcast lalu pilih mood kamu. NOXA Smart memastikan episode yang muncul benar-benar relevan." />
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
          <SectionHead emoji="bantuan" title="Pertanyaan yang sering muncul" sub="" />
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
          <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">Server kamu masih sepi suaranya?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted">
            Tambahkan NOXA Sound, mainkan lagu pertama, dan biarkan panel pemutarnya bekerja.
            Kalau butuh bantuan, server dukungan selalu terbuka.
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

function HeroPlayerMock({ hidup }) {
  return (
    <div className="card relative overflow-hidden p-5 shadow-[0_0_80px_rgba(184,0,18,0.12)]">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-faint">
        <span className={`h-1.5 w-1.5 rounded-full ${hidup ? 'bg-ok live-dot' : 'bg-warn'}`} />
        Panel Pemutar NOXA
      </div>
      <div className="mt-4 flex gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-linebright bg-gradient-to-br from-maroon via-darkcrimson to-surface2">
          <span className="flex items-end gap-1 h-10">
            <span className="eq-bar w-2 h-10 rounded-sm bg-neon" style={{ animationDelay: '0ms' }} />
            <span className="eq-bar w-2 h-10 rounded-sm bg-crimson" style={{ animationDelay: '160ms' }} />
            <span className="eq-bar w-2 h-10 rounded-sm bg-neon/80" style={{ animationDelay: '320ms' }} />
            <span className="eq-bar w-2 h-10 rounded-sm bg-glow/80" style={{ animationDelay: '480ms' }} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-lg font-bold">Midnight City Drive</div>
          <div className="truncate text-sm text-muted">Diputar untuk server kamu</div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface3">
            <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-crimson to-neon" />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-faint">
            <span>1:58</span>
            <span>4:52</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {[['mundur', 22], ['jeda', 26], ['lewati', 22]].map(([nama, s]) => (
          <span key={nama} className="flex h-10 w-10 items-center justify-center rounded-full border border-linebright bg-surface3">
            <Emoji name={nama} size={s} />
          </span>
        ))}
        <span className="ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-linebright bg-surface3">
          <Emoji name="autoplay" size={20} />
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-linebright bg-surface3">
          <Emoji name="sukapenuh" size={18} />
        </span>
      </div>
      <div className="mt-4 rounded-xl border border-line bg-bg/50 px-3 py-2 text-xs text-faint">
        Mode musik, podcast, dan radio berbagi panel yang sama dengan identitas berbeda.
      </div>
    </div>
  );
}

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
