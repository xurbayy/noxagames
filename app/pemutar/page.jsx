import Link from 'next/link';
import Emoji from '../components/Emoji';
import BackButton from '../components/BackButton';
import PlayerShowcase from '../components/panel/PlayerPanels';
import { pageMeta } from '../lib/site';
import { BOT_INVITE } from '../lib/site';

export const metadata = pageMeta({
  title: 'Tampilan Pemutar',
  description: 'Lihat panel pemutar NOXA Sound yang tampil di Discord: mode musik, radio 24/7, podcast, dan standby, lengkap dengan semua tombolnya.',
  path: '/pemutar',
});

export default function PemutarPage() {
  return (
    <div className="relative min-h-[calc(100vh-6rem)] overflow-hidden pb-24 pt-28">
      {/* Ambient background glow merah khas NOXA */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[450px] w-[650px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,16,31,0.14)_0%,transparent_70%)] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header navigasi atas */}
        <div className="flex items-center justify-end gap-4 mb-6">
          <BackButton href="/" className="inline-flex" />
        </div>

        {/* Judul & Deskripsi Page */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Tampilan Pemutar Musik
          </h1>
        </div>

        {/* Showcase Utama Player */}
        <div className="relative">
          <PlayerShowcase />
        </div>

        {/* Fitur Utama Pemutar Highlight Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="card p-4 sm:p-5">
            <div className="flex items-center gap-2 text-ink font-bold text-sm mb-1">
              <Emoji name="musik" size={16} /> Multi-Mode
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Beralih instan antara Musik, Studio Podcast 15 tema, Radio 24/7 nonstop, dan Standby auto-clean.
            </p>
          </div>

          <div className="card p-4 sm:p-5">
            <div className="flex items-center gap-2 text-ink font-bold text-sm mb-1">
              <Emoji name="suara" size={16} /> Capsule Seek
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Progress bar kapsul melayang yang responsif. Klik di mana saja pada progress bar untuk lompat durasi.
            </p>
          </div>

          <div className="card p-4 sm:p-5">
            <div className="flex items-center gap-2 text-ink font-bold text-sm mb-1">
              <Emoji name="lirik" size={16} /> Live Karaoke
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Lirik terverifikasi Spotify & Musixmatch yang sinkron langsung baris demi baris saat lagu diputar.
            </p>
          </div>

          <div className="card p-4 sm:p-5">
            <div className="flex items-center gap-2 text-ink font-bold text-sm mb-1">
              <Emoji name="efek" size={16} /> Studio EQ
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Tuning Bass Boost (Low ke Extreme), Nightcore, Slowed, 8D Audio, dan profil suara jernih podcast.
            </p>
          </div>
        </div>

        {/* Kartu Ajakan Masuk Voice */}
        <div className="card mt-8 flex flex-col items-start gap-4 p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between border border-white/10 bg-gradient-to-r from-[#101114] via-[#141517] to-[#141517]">
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg">
              Ingin panel pemutar ini ada di server kamu?
            </h3>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              Invite bot NOXA Sound, bergabung ke voice channel, lalu ketik <code className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">.play judul lagu</code>.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <a
              href={BOT_INVITE}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="btn-primary flex-1 sm:flex-initial text-center text-xs sm:text-sm"
            >
              Undang Bot
            </a>
            <Link href="/panduan" className="btn-ghost flex-1 sm:flex-initial text-center text-xs sm:text-sm">
              Panduan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
