'use client';

// Replika 1:1 panel pemutar Discord NOXA (musik, radio 24/7, podcast, standby)
// Desain UI/UX baru: Lebih Clean, Modern, dan Aesthetic khas web bot Discord musik premium
// dengan tetap mempertahankan 100% semua emoji, tombol, info, dan fitur interaktifnya.
import { useEffect, useRef, useState } from 'react';
import Emoji from '../Emoji';
import { formatDiscordTime } from '../../lib/format';
import {
  DiscordButton,
  ActionRow,
  PanelEmbed,
  CodeText,
  DiscordMessage,
  DiscordSelectMenu,
  MenuBox,
  MenuRow,
} from './discord-ui';

// ---------- Data demo lengkap ----------
const DEMO_TRACKS = [
  { name: 'Senja di Kota Tua', uploader: 'Demo Studio - Topic', duration: 224, provider: 'ytm', autoplay: false },
  { name: 'Langit Ketujuh', uploader: 'Demo Band Official', duration: 198, provider: 'spotify', autoplay: false },
  { name: 'Hujan Bulan Juni', uploader: 'Demo Records', duration: 251, provider: 'Youtube', autoplay: false },
  { name: 'Pesisir Pulau', uploader: 'Demo Tunes - Topic', duration: 187, provider: 'soundcloud', autoplay: false },
  { name: 'Arah Rumah', uploader: 'Demo Collective', duration: 233, provider: 'tidal', autoplay: false },
  { name: 'Disko Terakhir', uploader: 'Rekomendasi NOXA Smart', duration: 209, provider: 'ytm', autoplay: true },
];

const DEMO_PODCASTS = [
  { name: 'Rahasia Studio Broadcast', uploader: 'NOXA Podcast Demo', duration: 4112, theme: 'obrolansantai', lang: 'Bahasa Asli', provider: 'youtube' },
  { name: 'Malam Pemburu Bintang', uploader: 'NOXA Podcast Demo', duration: 2760, theme: 'fiksi', lang: 'Bahasa Asli', provider: 'youtube' },
];

const DEMO_RADIO = { name: 'Radio Populer NOXA 24/7', uploader: 'Siaran NOXA Sound', owner: 'demo_host' };

const PODCAST_TEMA = [
  ['Horror', 'horror'], ['Komedi', 'komedi'], ['Inspiratif', 'inspiratif'], ['Kriminal', 'kriminal'],
  ['Edukasi', 'edukasi'], ['Bisnis', 'bisnis'], ['Teknologi', 'teknologi'], ['Gaya Hidup', 'gayahidup'],
  ['Olahraga', 'olahraga'], ['Fiksi', 'fiksi'], ['Kuliner', 'kuliner'], ['Traveling', 'traveling'],
  ['Obrolan Santai', 'obrolansantai'], ['Kreatifitas', 'kreatifitas'], ['Romantis', 'romantis'],
];

const FILTER_BASS = [
  ['Matikan Bass (Reset)', 'batal', 'clear_bass'],
  ['Low Bass', 'lowbass', 'lowbass'],
  ['Medium Bass', 'mediumbass', 'mediumbass'],
  ['Extreme Bass', 'ekstimebass', 'extremebass'],
  ['Earrape', 'earrape', 'earrape'],
];
const FILTER_SPEED = [
  ['Normal (Reset)', 'batal', 'clear_speed'],
  ['Slowed', 'slowed', 'slowed'],
  ['Nightcore', 'nightcore', 'nightcore'],
  ['Double Speed', 'doublespeed', 'double'],
];
const FILTER_OTHER = [
  ['Karaoke', 'karaoke', 'karaoke'],
  ['8D Audio', '8d', '8d'],
  ['Vaporwave', 'vaporwave', 'vaporwave'],
  ['Flanger', 'flanger', 'flanger'],
  ['Surround', 'surraund', 'surround'],
  ['Tremolo', 'tremelo', 'tremolo'],
  ['Phaser', 'phaser', 'phaser'],
  ['Echo', 'echo', 'echo'],
];
const BASS_SET = new Set(['lowbass', 'mediumbass', 'extremebass', 'earrape']);
const SPEED_SET = new Set(['slowed', 'nightcore', 'double']);

const PROVIDER_EMOJI = {
  ytm: 'ytm',
  spotify: 'spotify',
  Youtube: 'Youtube',
  soundcloud: 'soundcloud',
  tidal: 'tidal',
  deezer: 'deezer',
  jiosaavn: 'jiosaavn',
  applemusic: 'applemusic',
};

const LOOP = {
  0: { label: 'Ulangi', emoji: 'ulangi', style: 'secondary', status: 'Mati' },
  1: { label: 'Ulangi Lagu Ini', emoji: 'ulangilaguini', style: 'secondary', status: 'Lagu Ini' },
  2: { label: 'Ulangi Semua', emoji: 'ulangisemua', style: 'secondary', status: 'Semua Antrian' },
};

// Banner equalizer animasi di dalam embed (replika persis bot)
function EqualizerBanner({ paused = false, color = '#FF101F' }) {
  return (
    <div className="relative mt-3 h-36 sm:h-44 w-full overflow-hidden rounded-xl border border-[#383A40]/70 bg-gradient-to-b from-[#1E1F22] via-[#17181A] to-[#101114] flex items-center justify-center select-none shadow-inner">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,16,31,0.25)_0%,transparent_75%)] pointer-events-none" />
      <div className="relative z-10 flex items-center gap-2 sm:gap-3">
        <span className={`w-2.5 sm:w-3 rounded-full bg-[#FF101F] shadow-[0_0_14px_rgba(255,16,31,0.8)] transition-all duration-300 ${paused ? 'h-10' : 'h-12 animate-pulse'}`} />
        <span className={`w-2.5 sm:w-3 rounded-full bg-[#FF101F] shadow-[0_0_14px_rgba(255,16,31,0.8)] transition-all duration-300 ${paused ? 'h-16' : 'h-20 animate-pulse delay-75'}`} />
        <span className={`w-2.5 sm:w-3 rounded-full bg-[#FF101F] shadow-[0_0_16px_rgba(255,16,31,0.95)] transition-all duration-300 ${paused ? 'h-24' : 'h-28 animate-pulse delay-150'}`} />
        <span className={`w-2.5 sm:w-3 rounded-full bg-[#FF101F] shadow-[0_0_14px_rgba(255,16,31,0.8)] transition-all duration-300 ${paused ? 'h-18' : 'h-22 animate-pulse delay-100'}`} />
        <span className={`w-2.5 sm:w-3 rounded-full bg-[#FF101F] shadow-[0_0_14px_rgba(255,16,31,0.8)] transition-all duration-300 ${paused ? 'h-11' : 'h-14 animate-pulse delay-200'}`} />
      </div>
    </div>
  );
}

// Komponen kartu Vinyl berputar dengan progress ring dinamis (Aesthetic Card)
function VinylPlayerCard({ song, pos, paused, accentColor = '#FF101F', volume = 100, loopLabel = 'Mati', autoplay = false }) {
  const progressRatio = song.duration > 0 ? Math.min(1, pos / song.duration) : 0;
  const radius = 46;
  const circ = 2 * Math.PI * radius;
  const strokeDashoffset = circ - progressRatio * circ;

  return (
    <div className="relative my-3 flex items-center gap-3.5 sm:gap-5 rounded-2xl border border-white/10 bg-gradient-to-r from-[#141517] via-[#1A1C1F] to-[#121315] p-3.5 sm:p-4.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Vinyl dengan cincin progress ring */}
      <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="5" />
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
          />
        </svg>

        {/* Piringan Vinyl berputar */}
        <div
          className={`relative flex h-17 w-17 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#0E0F12] shadow-2xl border border-white/10 ${
            paused ? '' : 'animate-spin'
          }`}
          style={{ animationDuration: '3.5s', animationTimingFunction: 'linear' }}
        >
          {/* Alur vinyl (grooves) */}
          <div className="absolute inset-1.5 rounded-full border border-white/5" />
          <div className="absolute inset-3 rounded-full border border-white/5" />
          <div className="absolute inset-4.5 rounded-full border border-white/5" />
          
          {/* Label tengah (Logo NOXA) */}
          <div className="relative h-7 w-7 sm:h-8 sm:w-8 overflow-hidden rounded-full border border-white/20 bg-black shadow-md flex items-center justify-center">
            <img src="/logo.png" alt="NOXA" className="h-full w-full object-cover" />
          </div>
          {/* Lubang poros */}
          <div className="absolute h-1.5 w-1.5 rounded-full bg-[#0B0B0E] border border-white/60" />
        </div>
      </div>

      {/* Info Lagu */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-bold text-white text-base sm:text-lg tracking-tight">
          {song.name}
        </h4>
        <p className="truncate text-xs sm:text-sm font-medium text-[#949BA4] mt-0.5">
          {song.uploader}
        </p>
      </div>

      {/* Baris status — sama seperti baris status di canvas bot (Vol/Loop/Acak/Autoplay) */}
      <div className="mr-1 hidden shrink-0 sm:block text-right text-[10.5px] font-medium leading-relaxed text-[#949BA4] tabular-nums">
        <div>Vol: {volume ?? 100}%</div>
        <div>Loop: {loopLabel ?? 'Mati'}</div>
        <div>Autoplay: {autoplay ? 'ON' : 'OFF'}</div>
      </div>
    </div>
  );
}

// Komponen kartu Banner Podcast khusus (Aesthetic Card)
function PodcastPlayerCard({ ep, themeLabel, pos, paused, accentColor = '#B80012' }) {
  const pakaiJam = ep.duration >= 3600;
  return (
    <div className="relative my-3 flex items-center gap-3.5 sm:gap-5 rounded-2xl border border-white/10 bg-gradient-to-r from-[#141517] via-[#1A1C1F] to-[#121315] p-3.5 sm:p-4.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Artwork Studio */}
      <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#26282D] via-[#1E1F22] to-black border border-white/10 overflow-hidden shadow-inner">
        <div className="flex flex-col items-center justify-center text-center p-1">
          <Emoji name="podcast" size={34} />
        </div>
      </div>

      {/* Info Episode */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-bold text-white text-base sm:text-lg tracking-tight">
          {ep.name}
        </h4>
        <p className="truncate text-xs sm:text-sm font-medium text-[#949BA4] mt-0.5">
          {ep.uploader}
        </p>
      </div>

      {/* Vocal Audio Visualizer */}
      <div className="mr-1 flex items-end gap-1 h-7 shrink-0 select-none">
        <span className={`w-1 rounded-full ${paused ? 'h-3' : 'h-4 animate-pulse'}`} style={{ backgroundColor: accentColor }} />
        <span className={`w-1 rounded-full ${paused ? 'h-5' : 'h-7 animate-pulse delay-75'}`} style={{ backgroundColor: accentColor }} />
        <span className={`w-1 rounded-full ${paused ? 'h-4' : 'h-5 animate-pulse delay-150'}`} style={{ backgroundColor: accentColor }} />
        <span className={`w-1 rounded-full ${paused ? 'h-6' : 'h-8 animate-pulse delay-100'}`} style={{ backgroundColor: accentColor }} />
        <span className={`w-1 rounded-full ${paused ? 'h-3' : 'h-4 animate-pulse delay-200'}`} style={{ backgroundColor: accentColor }} />
      </div>
    </div>
  );
}

// Komponen Standalone Progress Bar Capsule (Aesthetic Glassmorphic Capsule)
function CapsuleProgressBar({ pos, duration, paused = false, color = '#FF101F', onSeek, compact = false }) {
  const barRef = useRef(null);
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, pos / duration)) : 0;
  const pakaiJam = duration >= 3600;

  const handleClick = (e) => {
    if (!onSeek || !barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(Math.floor(ratio * duration));
  };

  return (
    <div
      className="relative my-2 sm:my-2.5 flex items-center gap-3 sm:gap-4 rounded-full border border-white/10 bg-[#141517]/90 backdrop-blur-md px-3.5 sm:px-4 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.45)] select-none"
    >
      <span className="font-mono text-[11px] sm:text-[12px] font-semibold text-[#948B8D] shrink-0 min-w-[36px] sm:min-w-[42px]">
        {formatDiscordTime(pos, pakaiJam)}
      </span>

      <div
        ref={barRef}
        onClick={handleClick}
        className="relative flex-1 h-1.5 sm:h-2 bg-white/15 rounded-full cursor-pointer group flex items-center"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-white via-white to-white transition-all duration-150"
          style={{ width: `${progressRatio * 100}%` }}
        />
        <div
          className="absolute -ml-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-white transition-all duration-150 pointer-events-none"
          style={{
            left: `${progressRatio * 100}%`,
            boxShadow: `0 0 12px ${color}, 0 0 4px #FFFFFF`,
          }}
        />
      </div>

      <span className="font-mono text-[11px] sm:text-[12px] font-semibold text-[#948B8D] shrink-0 min-w-[36px] sm:min-w-[42px] text-right">
        {formatDiscordTime(duration, pakaiJam)}
      </span>
    </div>
  );
}

// ---------- Showcase Utama ----------
export default function PlayerShowcase({ singleMode = null, botAvatar = null, compact = false }) {
  const [tab, setTab] = useState(singleMode || 'music');
  const [jam, setJam] = useState('Hari ini');

  useEffect(() => {
    const d = new Date();
    setJam(`Hari ini pukul ${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`);
  }, []);

  return (
    <div>
      {!singleMode && (
        <div className="mb-6 flex items-center justify-center sm:justify-start">
          <div className="inline-flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-2xl bg-[#141517]/90 border border-white/10 backdrop-blur-md shadow-lg shadow-black/40 overflow-x-auto max-w-full">
            {[
              ['music', 'Musik', 'musik'],
              ['radio', 'Radio 24/7', 'radio'],
              ['podcast', 'Podcast', 'podcast'],
              ['standby', 'Standby', 'finish'],
            ].map(([key, label, emoji]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 select-none cursor-pointer whitespace-nowrap ${
                  tab === key
                    ? 'bg-gradient-to-r from-[#B80012] via-[#D60015] to-[#FF101F] text-white shadow-[0_2px_14px_rgba(255,16,31,0.4)] scale-[1.02]'
                    : 'text-[#949BA4] hover:text-[#F2F3F5] hover:bg-white/5'
                }`}
              >
                <Emoji name={emoji} size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'music' && <MusicPanelDemo jam={jam} botAvatar={botAvatar} onSwitch={setTab} compact={compact} />}
      {tab === 'radio' && <RadioPanelDemo jam={jam} botAvatar={botAvatar} onSwitch={setTab} compact={compact} />}
      {tab === 'podcast' && <PodcastPanelDemo jam={jam} botAvatar={botAvatar} onSwitch={setTab} compact={compact} />}
      {tab === 'standby' && <StandbyPanelDemo jam={jam} botAvatar={botAvatar} onSwitch={setTab} compact={compact} />}
    </div>
  );
}

// ---------- Panel MUSIK (Persis Bot NOXA V2 Container) ----------
function MusicPanelDemo({ jam, botAvatar, onSwitch, compact = false }) {
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState(38);
  const [paused, setPaused] = useState(false);
  const [volume, setVolume] = useState(100);
  const [repeatMode, setRepeatMode] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [filters, setFilters] = useState([]);
  const [liked, setLiked] = useState(false);
  const [chat, setChat] = useState([
    { user: 'aurora', text: 'lagunya enak banget' },
    { user: 'bayu', text: 'naikin dong volumenya' },
  ]);
  const [openPop, setOpenPop] = useState(null);
  const [volInput, setVolInput] = useState(100);
  const popRef = useRef(null);

  const song = DEMO_TRACKS[idx];
  const nextSong = DEMO_TRACKS[idx + 1] || null;
  const likeCount = song.autoplay ? 12 : liked ? 7 : 6;
  const loop = LOOP[repeatMode];
  const isRewindDisabled = pos < 10;
  const isForwardDisabled = song.duration - pos < 10;
  const isQueueEmpty = idx >= DEMO_TRACKS.length - 1 && !autoplay && repeatMode === 0;
  const providerEmoji = PROVIDER_EMOJI[song.provider];

  // Waktu berjalan saat tidak dijeda
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setPos((p) => {
        if (p + 1 < song.duration) return p + 1;
        return p;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [paused, song.duration, idx]);

  useEffect(() => {
    if (pos < song.duration) return;
    if (repeatMode === 1) { setPos(0); return; }
    if (idx + 1 < DEMO_TRACKS.length) { setIdx(idx + 1); setPos(0); return; }
    if (repeatMode === 2) { setIdx(0); setPos(0); return; }
    if (autoplay) { setIdx(DEMO_TRACKS.length - 1); setPos(0); return; }
    setPaused(true);
  }, [pos, idx, repeatMode, autoplay, song.duration]);

  function nextTrack() {
    if (idx + 1 < DEMO_TRACKS.length) setIdx(idx + 1);
    else if (repeatMode === 2 || autoplay) setIdx(0);
    setPos(0);
    setOpenPop(null);
  }

  function setFilterValue(v) {
    setFilters((cur) => {
      let next = cur;
      if (v === 'clear_bass') next = cur.filter((f) => !BASS_SET.has(f));
      else if (v === 'clear_speed') next = cur.filter((f) => !SPEED_SET.has(f));
      else if (SPEED_SET.has(v)) next = [...cur.filter((f) => !SPEED_SET.has(f)), v];
      else if (BASS_SET.has(v)) next = [...cur.filter((f) => !BASS_SET.has(f)), v];
      else next = cur.includes(v) ? cur.filter((f) => f !== v) : cur.length >= 3 ? cur : [...cur, v];
      return next;
    });
  }

  const upcomingCount = Math.max(0, DEMO_TRACKS.length - 1 - idx);
  const footerText = nextSong
    ? nextSong.autoplay
      ? `Berikutnya (Autoplay): ${nextSong.name.substring(0, 45)}...`
      : `Berikutnya: ${nextSong.name.substring(0, 45)}... • ${upcomingCount} di antrean`
    : autoplay && song.duration - pos <= 30
      ? 'Lagu hampir habis'
      : 'Berikutnya: Tidak ada (Musik terakhir di antrean)';

  return (
    <div>
      <MessageAndRows jam={jam} botAvatar={botAvatar} compact={compact}>
        {/* Container Utama dengan Section Accessory di Pojok Kanan Atas */}
        <PanelEmbed
          compact={compact}
          color="#B80012"
          author="NOXA Sound • Sedang Memutar"
          title={providerEmoji ? `${song.name} ` : song.name}
          titleEmoji={providerEmoji}
          titleUrl="#"
          description={
            <div className="flex items-center gap-1.5 font-bold text-[#F2F3F5]">
              <Emoji name="musik" size={16} /> <b>MODE MUSIK</b> <span>•</span> <Emoji name="NOXASmart" size={16} />
            </div>
          }
          accessory={
            <DiscordButton
              emoji="podcast"
              label="Podcast"
              onClick={() => onSwitch('podcast')}
              title="Alihkan ke Mode Podcast"
              compact={compact}
            />
          }
          fields={[
            {
              name: 'Pemilik',
              value: song.autoplay ? (
                <span className="italic text-[#949BA4]">Rekomendasi Otomatis (Autoplay)</span>
              ) : (
                <span className="text-[#DBDEE1]">@demo_tester</span>
              ),
              inline: true,
            },
            ...(chat.length
              ? [
                  {
                    name: 'Live Chat',
                    value: (
                      <div className="space-y-0.5 italic text-[#B5BAC1]">
                        {chat.map((c, i) => (
                          <div key={i}>{`> ${c.user}: ${c.text}`}</div>
                        ))}
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
          footer={footerText}
          timestamp={jam}
        />

        {/* 1. Vinyl Card Berputar */}
        <VinylPlayerCard
          song={song}
          pos={pos}
          paused={paused}
          accentColor="#FF101F"
          volume={volume}
          loopLabel={LOOP[repeatMode]?.status || 'Mati'}
          autoplay={autoplay}
        />

        {/* 2. Floating Capsule Progress Bar */}
        <CapsuleProgressBar
          pos={pos}
          duration={song.duration}
          paused={paused}
          color="#FF101F"
          onSeek={(newPos) => setPos(newPos)}
          compact={compact}
        />

        {/* Baris 1: Suka, Loop, Tambah Lagu */}
        <ActionRow compact={compact}>
          <DiscordButton
            emoji={likeCount > 0 ? 'sukapenuh' : 'sukakosong'}
            label={`${likeCount}`}
            onClick={() => setLiked((l) => !l)}
            title="Suka lagu ini"
            compact={compact}
          />
          <DiscordButton
            emoji={loop.emoji}
            label={loop.label}
            onClick={() => setRepeatMode((m) => (m + 1) % 3)}
            title={`Loop: ${loop.status}`}
            compact={compact}
          />
          <DiscordButton
            emoji="tambahmusik"
            label="Tambah Lagu"
            onClick={() => { setIdx(0); setPos(0); setPaused(false); setOpenPop(null); }}
            title="Tambah Lagu ke Antrian"
            compact={compact}
          />
        </ActionRow>

        {/* Baris 2: Mundur, Jeda/Lanjut, Maju, Berhenti, Lewati */}
        <ActionRow compact={compact}>
          <DiscordButton
            emoji="mundur"
            label="Mundur"
            disabled={isRewindDisabled}
            onClick={() => { setPos((p) => Math.max(0, p - 10)); setOpenPop(null); }}
            compact={compact}
          />
          <DiscordButton
            emoji={paused ? 'mulai' : 'jeda'}
            label={paused ? 'Lanjut' : 'Jeda'}
            style={paused ? 'primary' : 'secondary'}
            onClick={() => setPaused((p) => !p)}
            compact={compact}
          />
          <DiscordButton
            emoji="maju"
            label="Maju"
            disabled={isForwardDisabled}
            onClick={() => { setPos((p) => Math.min(song.duration - 1, p + 10)); setOpenPop(null); }}
            compact={compact}
          />
          <DiscordButton
            emoji="berhenti"
            label="Berhenti"
            onClick={() => { onSwitch('standby'); setOpenPop(null); }}
            compact={compact}
          />
          <DiscordButton
            emoji="lewati"
            label="Lewati"
            disabled={isQueueEmpty}
            onClick={nextTrack}
            compact={compact}
          />
        </ActionRow>

        {/* Baris 3: Dropdown Fitur Lainnya (9 Pilihan Menu Persis Bot) */}
        <div className="relative" ref={popRef}>
          <DiscordSelectMenu
            placeholder="Fitur Lainnya"
            isOpen={openPop === 'dropdown'}
            onToggle={() => setOpenPop(openPop === 'dropdown' ? null : 'dropdown')}
            compact={compact}
          >
            <div className="absolute inset-x-0 bottom-full mb-2 z-30 shadow-2xl">
              <MenuBox maxHeight="max-h-64">
                <MenuRow emoji="antrian" label="Antrian Lagu" onClick={() => setOpenPop('queue')} />
                <MenuRow emoji="lirik" label="Lirik Lagu" onClick={() => setOpenPop('lyrics')} />
                <MenuRow emoji="chat" label="Live Chat" onClick={() => setOpenPop('chat')} />
                <MenuRow emoji="suara" label="Atur Volume" onClick={() => setOpenPop('volume')} />
                <MenuRow emoji="autoplay" label={`Autoplay (${autoplay ? 'ON' : 'OFF'})`} onClick={() => { setAutoplay(a => !a); setOpenPop(null); }} />
                <MenuRow emoji="efek" label="Efek Suara & EQ" onClick={() => setOpenPop('effects')} />
                <MenuRow emoji="userprofile" label="Profil Pendengar" onClick={() => setOpenPop('profile')} />
                <MenuRow emoji="playlist" label="Koleksi Playlist" onClick={() => setOpenPop('playlists')} />
                <MenuRow emoji="Shuffle" label={`Acak Antrian (${shuffle ? 'Aktif' : 'Mati'})`} onClick={() => { setShuffle(s => !s); setOpenPop(null); }} />
              </MenuBox>
            </div>
          </DiscordSelectMenu>

          {/* Popups yang dibuka lewat menu dropdown */}
          {openPop === 'queue' && (
            <PopupModal title="Antrian Lagu" onClose={() => setOpenPop(null)}>
              <QueuePop tracks={DEMO_TRACKS} idx={idx} onJump={(i) => { setIdx(i); setPos(0); setOpenPop(null); }} />
            </PopupModal>
          )}
          {openPop === 'lyrics' && (
            <PopupModal title="Lirik Lagu" onClose={() => setOpenPop(null)}>
              <LyricsPop song={song} />
            </PopupModal>
          )}
          {openPop === 'chat' && (
            <PopupModal title="Live Chat Pemutar" onClose={() => setOpenPop(null)}>
              <ChatPop chat={chat} onSend={(t) => { setChat((c) => [...c, { user: 'kamu', text: t }]); }} />
            </PopupModal>
          )}
          {openPop === 'volume' && (
            <PopupModal title="Atur Volume" onClose={() => setOpenPop(null)}>
              <VolumePop value={volume} input={volInput} setInput={setVolInput} onSet={(v) => { setVolume(v); setOpenPop(null); }} />
            </PopupModal>
          )}
          {openPop === 'effects' && (
            <PopupModal title="Efek Suara & Equalizer" onClose={() => setOpenPop(null)}>
              <EffectsPop filters={filters} onPick={setFilterValue} onReset={() => setFilters([])} />
            </PopupModal>
          )}
          {openPop === 'profile' && (
            <PopupModal title="Profil Pendengar" onClose={() => setOpenPop(null)}>
              <InfoPop judul="Kartu Analitik Profil">
                Di Discord, opsi ini menampilkan kartu analitik mendengarkan yang sama dengan profil di halaman <b>/me</b> web ini.
              </InfoPop>
            </PopupModal>
          )}
          {openPop === 'playlists' && (
            <PopupModal title="Koleksi Playlist" onClose={() => setOpenPop(null)}>
              <InfoPop judul="Dashboard Playlist">
                Di Discord, opsi ini membuka dashboard playlist pribadi, playlist populer server, dan lagu favorit kamu.
              </InfoPop>
            </PopupModal>
          )}
        </div>
      </MessageAndRows>
    </div>
  );
}

// ---------- Panel PODCAST (Persis Bot NOXA Podcast Container) ----------
function PodcastPanelDemo({ jam, botAvatar, onSwitch, compact = false }) {
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState(935);
  const [paused, setPaused] = useState(false);
  const [volume, setVolume] = useState(100);
  const [liked, setLiked] = useState(false);
  const [theme, setTheme] = useState('obrolansantai');
  const [lang, setLang] = useState('Bahasa Asli');
  const [openPop, setOpenPop] = useState(null);
  const [volInput, setVolInput] = useState(100);
  const [seekInput, setSeekInput] = useState('');
  const popRef = useRef(null);

  const ep = DEMO_PODCASTS[idx];
  const providerEmoji = PROVIDER_EMOJI[ep.provider];
  const likeCount = liked ? 5 : 4;
  const themeLabel = PODCAST_TEMA.find(([_, e]) => e === theme)?.[0] || 'Obrolan Santai';
  const hasUpcoming = idx < DEMO_PODCASTS.length - 1;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setPos((p) => Math.min(ep.duration, p + 1)), 1000);
    return () => clearInterval(t);
  }, [paused, ep.duration]);

  function parseSeek(raw) {
    const parts = String(raw).trim().split(':').map((x) => parseInt(x, 10));
    if (parts.some((n) => !Number.isFinite(n))) return null;
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return null;
  }

  const upcomingPodCount = Math.max(0, DEMO_PODCASTS.length - 1 - idx);
  const podFooter = hasUpcoming
    ? `Berikutnya: ${DEMO_PODCASTS[idx + 1].name.substring(0, 45)}... • ${upcomingPodCount} di antrean`
    : 'Berikutnya: Tidak ada (Episode terakhir di antrean)';

  return (
    <div>
      <MessageAndRows jam={jam} botAvatar={botAvatar} compact={compact}>
        {/* Section Header dengan Accessory Musik di Pojok Kanan Atas */}
        <PanelEmbed
          compact={compact}
          color="#B80012"
          author="NOXA Sound • Sedang Memutar"
          title={providerEmoji ? `${ep.name} ` : ep.name}
          titleEmoji={providerEmoji}
          titleUrl="#"
          description={
            <div className="flex items-center gap-1.5 font-bold text-[#F2F3F5] flex-wrap">
              <Emoji name="podcast" size={16} /> <b>MODE PODCAST</b> • <b>Tema: {themeLabel}</b> • <Emoji name="NOXASmart" size={16} />
            </div>
          }
          accessory={
            <DiscordButton
              emoji="musik"
              label="Musik"
              onClick={() => onSwitch('music')}
              title="Alihkan ke Mode Musik"
              compact={compact}
            />
          }
          fields={[
            { name: 'Pemilik Podcast', value: <span className="text-[#DBDEE1]">@demo_tester</span>, inline: true },
          ]}
          footer={podFooter}
          timestamp={jam}
        />

        {/* 1. Main Podcast Card Banner */}
        <PodcastPlayerCard
          ep={ep}
          themeLabel={themeLabel}
          pos={pos}
          paused={paused}
          accentColor="#B80012"
        />

        {/* 2. Floating Capsule Progress Bar */}
        <CapsuleProgressBar
          pos={pos}
          duration={ep.duration}
          paused={paused}
          color="#B80012"
          onSeek={(newPos) => setPos(newPos)}
          compact={compact}
        />

        {/* Baris 1: Mundur 30d, Jeda/Lanjut, Maju 30d, Berhenti, Lewati */}
        <ActionRow compact={compact}>
          <DiscordButton
            emoji="mundurpodcast"
            label="Mundur"
            onClick={() => setPos((p) => Math.max(0, p - 30))}
            compact={compact}
          />
          <DiscordButton
            emoji={paused ? 'mulai' : 'jeda'}
            label={paused ? 'Lanjut' : 'Jeda'}
            style={paused ? 'primary' : 'secondary'}
            onClick={() => setPaused((p) => !p)}
            compact={compact}
          />
          <DiscordButton
            emoji="majuupodcast"
            label="Maju"
            onClick={() => setPos((p) => Math.min(ep.duration, p + 30))}
            compact={compact}
          />
          <DiscordButton
            emoji="berhenti"
            label="Berhenti"
            onClick={() => onSwitch('standby')}
            compact={compact}
          />
          <DiscordButton
            emoji="lewati"
            label="Lewati"
            disabled={!hasUpcoming}
            onClick={() => { setIdx((i) => Math.min(DEMO_PODCASTS.length - 1, i + 1)); setPos(0); }}
            compact={compact}
          />
        </ActionRow>

        {/* Baris 2: Tombol Suka */}
        <ActionRow compact={compact}>
          <DiscordButton
            emoji={likeCount > 0 ? 'sukapenuh' : 'sukakosong'}
            label={`${likeCount}`}
            onClick={() => setLiked((l) => !l)}
            title="Suka episode ini"
            compact={compact}
          />
        </ActionRow>

        {/* Baris 3: Dropdown Fitur Podcast (5 Menu Persis Bot) */}
        <div className="relative" ref={popRef}>
          <DiscordSelectMenu
            placeholder="Fitur Lainnya"
            isOpen={openPop === 'dropdown'}
            onToggle={() => setOpenPop(openPop === 'dropdown' ? null : 'dropdown')}
            compact={compact}
          >
            <div className="absolute inset-x-0 bottom-full mb-2 z-30 shadow-2xl">
              <MenuBox maxHeight="max-h-56">
                <MenuRow emoji="waktu" label="Lompat Waktu" onClick={() => setOpenPop('seek')} />
                <MenuRow emoji="suara" label="Atur Volume" onClick={() => setOpenPop('volume')} />
                <MenuRow emoji="antrian" label="Antrian Podcast" onClick={() => setOpenPop('queue')} />
                <MenuRow emoji="podcast" label="Tema Podcast" onClick={() => setOpenPop('theme')} />
                <MenuRow emoji="bahasa" label="Pilih Bahasa" onClick={() => setOpenPop('lang')} />
              </MenuBox>
            </div>
          </DiscordSelectMenu>

          {openPop === 'seek' && (
            <PopupModal title="Lompat Waktu" onClose={() => setOpenPop(null)}>
              <SeekPop
                input={seekInput}
                setInput={setSeekInput}
                onSubmit={(raw) => {
                  const s = parseSeek(raw);
                  if (s != null) { setPos(Math.max(0, Math.min(ep.duration, s))); setOpenPop(null); setSeekInput(''); }
                }}
              />
            </PopupModal>
          )}
          {openPop === 'volume' && (
            <PopupModal title="Atur Volume" onClose={() => setOpenPop(null)}>
              <VolumePop value={volume} input={volInput} setInput={setVolInput} onSet={(v) => { setVolume(v); setOpenPop(null); }} />
            </PopupModal>
          )}
          {openPop === 'queue' && (
            <PopupModal title="Antrian Podcast" onClose={() => setOpenPop(null)}>
              <QueuePop
                tracks={DEMO_PODCASTS.map((p) => ({ name: p.name, uploader: p.uploader }))}
                idx={idx}
                onJump={(i) => { setIdx(i); setPos(0); setOpenPop(null); }}
                podcast
              />
            </PopupModal>
          )}
          {openPop === 'theme' && (
            <PopupModal title="Pilih Tema Podcast" onClose={() => setOpenPop(null)}>
              <ThemePop current={theme} onPick={(t) => { setTheme(t); setOpenPop(null); }} />
            </PopupModal>
          )}
          {openPop === 'lang' && (
            <PopupModal title="Bahasa Audio" onClose={() => setOpenPop(null)}>
              <LangPop current={lang} onPick={(l) => { setLang(l); setOpenPop(null); }} />
            </PopupModal>
          )}
        </div>
      </MessageAndRows>
    </div>
  );
}

// ---------- Panel RADIO 24/7 (Persis Bot NOXA createRadioPlayer) ----------
function RadioPanelDemo({ jam, botAvatar, onSwitch, compact = false }) {
  const [openPop, setOpenPop] = useState(null);
  return (
    <div>
      <MessageAndRows jam={jam} botAvatar={botAvatar} compact={compact}>
        <PanelEmbed
          compact={compact}
          color="#B80012"
          author="NOXA Sound • Radio 24/7"
          title={DEMO_RADIO.name}
          titleUrl="#"
          description={
            <>
              <div className="flex items-center gap-1.5 font-bold text-[#F2F3F5]">
                <Emoji name="radio" size={16} /> <b>MODE RADIO 24/7</b> • <Emoji name="NOXASmart" size={16} /> <b>Lagu Populer Nonstop</b>
              </div>
              <div className="mt-1 text-sm text-[#DBDEE1]">
                Siaran lagu populer 24 jam nonstop tanpa jeda.
              </div>
            </>
          }
          image={<EqualizerBanner paused={false} color="#B80012" />}
          fields={[
            { name: 'Penyiar', value: <span className="text-[#DBDEE1]">@{DEMO_RADIO.owner}</span>, inline: true },
          ]}
          footer="NOXA Sound • Radio 24/7"
          timestamp={jam}
        />
        <ActionRow compact={compact}>
          <DiscordButton emoji="lirik" label="Lirik Lagu" onClick={() => setOpenPop('lyrics')} compact={compact} />
          <DiscordButton emoji="berhenti" label="Hentikan Radio" onClick={() => onSwitch('standby')} compact={compact} />
        </ActionRow>

        {openPop === 'lyrics' && (
          <PopupModal title="Lirik Lagu Radio" onClose={() => setOpenPop(null)}>
            <LyricsPop song={{ name: 'Radio Populer Nonstop', uploader: 'Siaran NOXA Sound' }} />
          </PopupModal>
        )}
      </MessageAndRows>
    </div>
  );
}

// ---------- Panel STANDBY (Persis Bot NOXA createStandbyPayload: 2 tombol) ----------
function StandbyPanelDemo({ jam, botAvatar, onSwitch, compact = false }) {
  return (
    <div>
      <MessageAndRows jam={jam} botAvatar={botAvatar} compact={compact}>
        <PanelEmbed
          compact={compact}
          color="#2B2D31"
          title="Sesi Selesai"
          titleEmoji="finish"
          description={
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              Antrian kosong. Pesan ini akan otomatis dibersihkan <Emoji name="bersih" size={16} />
            </span>
          }
          footer="NOXA Sound • Auto-Clean"
          timestamp={jam}
        />
        <ActionRow compact={compact}>
          <DiscordButton emoji="tambahmusik" label="Tambah Lagu" onClick={() => onSwitch('music')} compact={compact} />
          <DiscordButton emoji="podcast" label="Podcast" onClick={() => onSwitch('podcast')} compact={compact} />
        </ActionRow>
      </MessageAndRows>
    </div>
  );
}

// ---------- Pembungkus Pesan & Modal Responsif ----------
function MessageAndRows({ jam, botAvatar, compact = false, children }) {
  return (
    <DiscordMessage botAvatar={botAvatar} jam={jam} compact={compact}>
      <div className="space-y-3">
        {children}
      </div>
    </DiscordMessage>
  );
}

function PopupModal({ title, onClose, children }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop Frosted Glass */}
      <div
        className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm cursor-default transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal Dialog Card */}
      <div
        className="rounded-2xl border border-white/10 bg-[#16171A] p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)]
          fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm sm:max-w-md mx-auto max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#FF101F] shadow-[0_0_8px_#FF101F]" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              {title || 'Menu NOXA'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#949BA4] hover:text-white px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer bg-[#232428] border border-white/10 transition-colors"
          >
            ✕ Tutup
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

// ---------- Isi Dialog & Menu Tambahan ----------
function LyricsPop({ song }) {
  const [mode, setMode] = useState('live');
  const title = song?.name || 'Senja di Kota Tua';
  const uploader = song?.uploader || 'NOXA Sound';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] text-[#949BA4]">
        <span className="font-semibold text-white/90">NOXA Smart Lyrics</span>
        <span className="font-mono">Spotify • Musixmatch</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#1E1F22] border border-white/5">
        <button
          type="button"
          onClick={() => setMode('live')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
            mode === 'live' ? 'bg-[#5865F2] text-white shadow-xs' : 'text-[#949BA4] hover:text-white'
          }`}
        >
          <Emoji name="livelirik" size={14} />
          <span>Live Karaoke</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('script')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
            mode === 'script' ? 'bg-[#5865F2] text-white shadow-xs' : 'text-[#949BA4] hover:text-white'
          }`}
        >
          <Emoji name="songlyrics" size={14} />
          <span>Skrip Penuh</span>
        </button>
      </div>

      <div className="rounded-xl bg-[#1E1F22] p-2.5 border border-white/5 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-bold text-white truncate">{title}</div>
          <div className="text-[11px] text-[#949BA4] truncate">{uploader}</div>
        </div>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Terverifikasi
        </span>
      </div>

      {mode === 'live' ? (
        <div className="rounded-xl bg-[#1E1F22] border border-white/5 p-3.5 text-[12px] leading-relaxed space-y-2 select-none">
          <div className="text-[#80848E] text-[11px]">[00:18] Di antara deru kota yang terlelap...</div>
          <div className="text-[#949BA4] text-[11.5px]">[00:26] Ku melangkah mencari arti senyumanmu...</div>
          <div className="rounded-lg bg-[#FF101F]/15 border border-[#FF101F]/50 px-3 py-2 text-white font-semibold flex items-center gap-2.5 shadow-[0_0_15px_rgba(255,16,31,0.2)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF101F] animate-pulse shrink-0" />
            <span className="min-w-0 flex-1 text-[12.5px] break-words">▶ [00:38] Senja datang membawa semua bayanganmu</span>
          </div>
          <div className="text-[#949BA4] text-[11.5px]">[00:47] Menemani sepi malam yang sunyi...</div>
          <div className="text-[#80848E] text-[11px]">[00:58] Dan ku tahu waktu kan menjawabnya...</div>
        </div>
      ) : (
        <div className="rounded-xl bg-[#1E1F22] border border-white/5 p-3.5 text-[12px] leading-relaxed text-[#DBDEE1] max-h-48 overflow-y-auto space-y-2.5 font-sans">
          <p>
            Di antara deru kota yang terlelap<br />
            Ku melangkah mencari arti senyumanmu<br />
            Malam berlari mengejar bayang rindu
          </p>
          <p className="text-white font-medium border-l-2 border-[#FF101F] pl-2.5">
            Senja datang membawa semua bayanganmu<br />
            Menemani sepi malam yang sunyi<br />
            Dan ku tahu waktu kan menjawabnya
          </p>
          <p>
            Biarkan alunan nada menyatukan rasa<br />
            Hingga fajar menyapa kembali dunia<br />
            Kita kan tetap melangkah bersama
          </p>
        </div>
      )}

      <div className="text-[11px] leading-relaxed text-[#949BA4]">
        Di Discord, klik menu <b className="text-white">Lirik Lagu</b> di player untuk sinkronisasi otomatis karaoke atau skrip penuh.
      </div>
    </div>
  );
}

function PopTitle({ children }) {
  return <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#949BA4]">{children}</div>;
}

function QueuePop({ tracks, idx, onJump, podcast = false }) {
  return (
    <div>
      <PopTitle>{podcast ? 'Episode dalam antrean' : 'Lagu dalam antrean'}</PopTitle>
      <MenuBox maxHeight="max-h-60">
        {tracks.map((t, i) => (
          <MenuRow
            key={i}
            emoji={i === idx ? (podcast ? 'podcast' : 'musik') : null}
            label={`${i + 1}. ${t.name}`}
            selected={i === idx}
            onClick={() => i !== idx && onJump(i)}
          />
        ))}
      </MenuBox>
    </div>
  );
}

function VolumePop({ value, input, setInput, onSet }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-[#949BA4]">
        <span>Volume Sekarang</span>
        <b className="text-white text-sm font-mono">{value}%</b>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={150}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full accent-[#FF101F] cursor-pointer"
        />

        {/* Preset volume pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[25, 50, 80, 100, 125, 150].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => { setInput(v); onSet(v); }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition ${
                Number(input) === v
                  ? 'bg-[#FF101F] text-white'
                  : 'bg-[#232428] text-[#949BA4] hover:text-white hover:bg-[#2B2D31]'
              }`}
            >
              {v}%
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <input
          type="number"
          min={0}
          max={150}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-[#383A40] bg-[#1E1F22] px-3 py-2 text-sm text-white outline-none focus:border-[#5865F2]"
        />
        <button
          type="button"
          onClick={() => onSet(Math.max(0, Math.min(150, Math.floor(Number(input) || 0))))}
          className="rounded-xl bg-[#5865F2] hover:bg-[#4752C4] px-4 py-2 text-sm font-semibold text-white cursor-pointer shrink-0 transition"
        >
          Terapkan
        </button>
      </div>
    </div>
  );
}

function SeekPop({ input, setInput, onSubmit }) {
  return (
    <div className="space-y-3">
      <div className="text-[12px] leading-relaxed text-[#B5BAC1]">
        Lompat ke detik atau menit: <code className="rounded bg-[#1E1F22] px-1.5 py-0.5 font-mono text-white">45</code> detik,{' '}
        <code className="rounded bg-[#1E1F22] px-1.5 py-0.5 font-mono text-white">1:30</code>, atau{' '}
        <code className="rounded bg-[#1E1F22] px-1.5 py-0.5 font-mono text-white">1:15:00</code>
      </div>

      {/* Quick Jump Shortcuts */}
      <div className="flex flex-wrap gap-1.5">
        {['30', '1:00', '2:30', '5:00', '10:00'].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => { setInput(val); onSubmit(val); }}
            className="px-2.5 py-1 rounded-md bg-[#232428] hover:bg-[#2B2D31] text-xs font-semibold text-[#949BA4] hover:text-white cursor-pointer transition border border-white/5"
          >
            {val}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="cth: 1:15:00"
          className="min-w-0 flex-1 rounded-xl border border-[#383A40] bg-[#1E1F22] px-3 py-2 text-sm text-white outline-none focus:border-[#5865F2]"
        />
        <button
          type="button"
          onClick={() => onSubmit(input)}
          className="rounded-xl bg-[#5865F2] hover:bg-[#4752C4] px-4 py-2 text-sm font-semibold text-white cursor-pointer shrink-0 transition"
        >
          Lompat
        </button>
      </div>
    </div>
  );
}

function EffectsPop({ filters, onPick, onReset }) {
  return (
    <div className="space-y-3">
      <div>
        <PopTitle>Bass Boost</PopTitle>
        <MenuBox maxHeight="max-h-40">
          {FILTER_BASS.map(([label, emoji, val]) => (
            <MenuRow
              key={val}
              emoji={emoji}
              label={label}
              selected={BASS_SET.has(val) && filters.includes(val)}
              onClick={() => onPick(val)}
            />
          ))}
        </MenuBox>
      </div>
      <div>
        <PopTitle>Kecepatan</PopTitle>
        <MenuBox maxHeight="max-h-36">
          {FILTER_SPEED.map(([label, emoji, val]) => (
            <MenuRow
              key={val}
              emoji={emoji}
              label={label}
              selected={SPEED_SET.has(val) && filters.includes(val)}
              onClick={() => onPick(val)}
            />
          ))}
        </MenuBox>
      </div>
      <div>
        <PopTitle>Efek Lainnya (Maks 3)</PopTitle>
        <MenuBox maxHeight="max-h-44">
          {FILTER_OTHER.map(([label, emoji, val]) => (
            <MenuRow
              key={val}
              emoji={emoji}
              label={label}
              selected={filters.includes(val)}
              onClick={() => onPick(val)}
            />
          ))}
        </MenuBox>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B3E45] hover:bg-[#4E5058] px-3 py-2.5 text-[13px] font-semibold text-white cursor-pointer transition shadow-xs"
      >
        <Emoji name="reseteffect" size={14} /> Reset Semua Efek
      </button>
    </div>
  );
}

function ThemePop({ current, onPick }) {
  return (
    <div>
      <PopTitle>Pilih Tema Podcast</PopTitle>
      <MenuBox maxHeight="max-h-60">
        {PODCAST_TEMA.map(([nama, emoji]) => (
          <MenuRow
            key={emoji}
            emoji={emoji}
            label={nama}
            selected={current === emoji}
            onClick={() => onPick(emoji)}
          />
        ))}
      </MenuBox>
    </div>
  );
}

function LangPop({ current, onPick }) {
  const LANGS = ['Bahasa Asli', 'Inggris', 'Jepang', 'Korea', 'Spanyol', 'Hindi'];
  return (
    <div>
      <PopTitle>Bahasa Audio</PopTitle>
      <MenuBox maxHeight="max-h-56">
        {LANGS.map((l) => (
          <MenuRow
            key={l}
            label={l}
            selected={current === l}
            onClick={() => onPick(l)}
          />
        ))}
      </MenuBox>
      <div className="mt-2.5 text-[11px] leading-relaxed text-[#949BA4]">
        Bahasa mengikuti track multi-language yang tersedia di episode.
      </div>
    </div>
  );
}

function ChatPop({ chat, onSend }) {
  const [t, setT] = useState('');
  return (
    <div className="space-y-3">
      <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 rounded-xl bg-[#1E1F22] border border-white/5">
        {chat.slice(-4).map((c, i) => (
          <div key={i} className="text-[12px] text-[#DBDEE1] break-words flex items-start gap-1.5">
            <span className="font-semibold text-emerald-400 shrink-0">{c.user}:</span>
            <span className="italic text-[#B5BAC1]">{c.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={t}
          onChange={(e) => setT(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && t.trim()) { onSend(t.trim()); setT(''); } }}
          placeholder="Tulis pesan live chat..."
          className="min-w-0 flex-1 rounded-xl border border-[#383A40] bg-[#1E1F22] px-3 py-2 text-sm text-white outline-none focus:border-[#5865F2]"
        />
        <button
          type="button"
          onClick={() => { if (t.trim()) { onSend(t.trim()); setT(''); } }}
          className="rounded-xl bg-[#5865F2] hover:bg-[#4752C4] px-4 py-2 text-sm font-semibold text-white cursor-pointer shrink-0 transition"
        >
          Kirim
        </button>
      </div>
    </div>
  );
}

function InfoPop({ judul, children }) {
  return (
    <div className="space-y-2">
      <PopTitle>{judul}</PopTitle>
      <div className="text-[12.5px] leading-relaxed text-[#B5BAC1]">{children}</div>
    </div>
  );
}
