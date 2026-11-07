'use client';

// Replika 1:1 panel pemutar Discord NOXA (musik, radio 24/7, podcast, standby)
// lengkap dengan SEMUA tombolnya. Tombol berfungsi sebagai pratinjau interaktif
// (state demo di browser) - kontrol asli tetap ada di Discord. Ini dicantumkan
// jujur di caption halaman.
//
// Bentuk embed, urutan baris tombol, label, emoji, gaya warna tombol, dan
// kondisi disabled disalin dari utils/player.js + utils/podcastPlayer.js bot.
import { useEffect, useRef, useState } from 'react';
import Emoji from '../Emoji';
import { formatDiscordTime } from '../../lib/format';
import { DiscordButton, ActionRow, PanelEmbed, CodeText, DiscordMessage, MenuBox, MenuRow } from './discord-ui';

// ---------- Data demo ----------
const DEMO_TRACKS = [
  { name: 'Senja di Kota Tua', uploader: 'Demo Studio - Topic', duration: 224, provider: 'ytm', autoplay: false },
  { name: 'Langit Ketujuh', uploader: 'Demo Band Official', duration: 198, provider: 'spotify', autoplay: false },
  { name: 'Hujan Bulan Juni', uploader: 'Demo Records', duration: 251, provider: 'Youtube', autoplay: false },
  { name: 'Pesisir Pulau', uploader: 'Demo Tunes - Topic', duration: 187, provider: 'soundcloud', autoplay: false },
  { name: 'Arah Rumah', uploader: 'Demo Collective', duration: 233, provider: 'tidal', autoplay: false },
  { name: 'Disko Terakhir', uploader: 'Rekomendasi NOXA Smart', duration: 209, provider: 'ytm', autoplay: true },
];

const DEMO_PODCASTS = [
  { name: 'Rahasia Studio Broadcast', uploader: 'NOXA Podcast Demo', duration: 4112, theme: 'obrolansantai', lang: 'Bahasa Asli' },
  { name: 'Malam Pemburu Bintang', uploader: 'NOXA Podcast Demo', duration: 2760, theme: 'fiksi', lang: 'Bahasa Asli' },
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

const PROVIDER_EMOJI = { ytm: 'ytm', spotify: 'spotify', Youtube: 'Youtube', soundcloud: 'soundcloud', tidal: 'tidal', deezer: 'deezer', jiosaavn: 'jiosaavn', applemusic: 'applemusic' };

// Sampul demo: SVG gradasi merah-hitam dengan bar equalizer (data URI, aman CSP).
function demoArt(seed = 0) {
  const hue = 350 + (seed % 4) * 6;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue},100%,12%)"/><stop offset="0.55" stop-color="#3B0004"/><stop offset="1" stop-color="#B80012"/>
    </linearGradient></defs>
    <rect width="320" height="180" fill="url(#g)"/>
    <g fill="#FF101F" opacity="0.85">
      <rect x="128" y="86" width="10" height="40" rx="3"/>
      <rect x="144" y="66" width="10" height="60" rx="3"/>
      <rect x="160" y="76" width="10" height="50" rx="3"/>
      <rect x="176" y="56" width="10" height="70" rx="3"/>
      <rect x="192" y="90" width="10" height="36" rx="3"/>
    </g>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const LOOP = {
  0: { label: 'Ulangi', emoji: 'ulangi', style: 'secondary', status: 'Mati' },
  1: { label: 'Ulangi: Lagu Ini', emoji: 'ulangilaguini', style: 'primary', status: 'Lagu Ini' },
  2: { label: 'Ulangi: Antrian', emoji: 'ulangi', style: 'success', status: 'Semua Antrian' },
};

function capFilter(f) {
  return f.charAt(0).toUpperCase() + f.slice(1);
}

// Komponen kartu Vinyl berputar dengan progress ring dinamis (referensi desain)
function VinylPlayerCard({ song, pos, paused, accentColor = '#B80012', idx = 0 }) {
  const progressRatio = song.duration > 0 ? Math.min(1, pos / song.duration) : 0;
  const radius = 50;
  const circ = 2 * Math.PI * radius;
  const strokeDashoffset = circ - progressRatio * circ;

  return (
    <div className="relative my-3 flex items-center gap-3.5 sm:gap-5 rounded-3xl border border-white/10 bg-gradient-to-r from-[#211013] via-[#160D10] to-[#0C090B] p-3 sm:p-4 shadow-xl overflow-hidden">
      {/* Vinyl dengan cincin progress ring */}
      <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center">
        {/* SVG Progress Ring */}
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="6" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
          />
        </svg>

        {/* Piringan Vinyl berputar */}
        <div
          className={`relative flex h-20 w-20 sm:h-22 sm:w-22 items-center justify-center rounded-full bg-[#121214] shadow-inner border border-[#252528] ${
            paused ? '' : 'animate-spin'
          }`}
          style={{ animationDuration: '3.5s', animationTimingFunction: 'linear' }}
        >
          {/* Alur vinyl (grooves) */}
          <div className="absolute inset-1.5 rounded-full border border-white/5" />
          <div className="absolute inset-3 rounded-full border border-white/5" />
          <div className="absolute inset-4.5 rounded-full border border-white/5" />
          {/* Label tengah (artwork album) */}
          <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-full border border-white/20 shadow-md">
            <img src={demoArt(idx)} alt="" className="h-full w-full object-cover" />
          </div>
          {/* Lubang poros tengah */}
          <div className="absolute h-2 w-2 rounded-full bg-[#0B0B0E] border border-white/60" />
        </div>
      </div>

      {/* Info Lagu */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-display text-base sm:text-lg font-bold text-white">
          {song.name}
        </h4>
        <p className="truncate text-xs sm:text-sm font-medium text-[#A4A4AC]">
          {song.uploader}
        </p>
        <p className="mt-1 font-mono text-xs sm:text-sm font-semibold text-[#D4D4DC]">
          {formatDiscordTime(pos)} / {formatDiscordTime(song.duration)}
        </p>
      </div>

      {/* Gelombang suara di kanan */}
      <div className="mr-2 hidden items-end gap-1 sm:flex h-8 shrink-0">
        <span className={`w-1 rounded-full ${paused ? 'h-3' : 'h-4 animate-pulse'}`} style={{ backgroundColor: accentColor }} />
        <span className={`w-1 rounded-full ${paused ? 'h-5' : 'h-7 animate-pulse delay-75'}`} style={{ backgroundColor: accentColor }} />
        <span className={`w-1 rounded-full ${paused ? 'h-7' : 'h-5 animate-pulse delay-150'}`} style={{ backgroundColor: accentColor }} />
        <span className={`w-1 rounded-full ${paused ? 'h-4' : 'h-8 animate-pulse delay-100'}`} style={{ backgroundColor: accentColor }} />
        <span className={`w-1 rounded-full ${paused ? 'h-6' : 'h-3 animate-pulse delay-200'}`} style={{ backgroundColor: accentColor }} />
      </div>
    </div>
  );
}

// ---------- Showcase ----------
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
        <div className="mb-5 flex flex-wrap gap-2">
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
              className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                tab === key
                  ? 'border-crimson bg-[#3B0004] text-ink'
                  : 'border-line bg-surface2 text-muted hover:border-linebright hover:text-ink'
              }`}
            >
              <Emoji name={emoji} size={16} /> {label}
            </button>
          ))}
        </div>
      )}

      {tab === 'music' && <MusicPanelDemo jam={jam} botAvatar={botAvatar} onSwitch={setTab} compact={compact} />}
      {tab === 'radio' && <RadioPanelDemo jam={jam} botAvatar={botAvatar} onSwitch={setTab} compact={compact} />}
      {tab === 'podcast' && <PodcastPanelDemo jam={jam} botAvatar={botAvatar} onSwitch={setTab} compact={compact} />}
      {tab === 'standby' && <StandbyPanelDemo jam={jam} botAvatar={botAvatar} onSwitch={setTab} compact={compact} />}
    </div>
  );
}

// ---------- Panel MUSIK (4 baris, 19 tombol, urutan sama dengan bot) ----------
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
  const isQueueEmpty = idx >= DEMO_TRACKS.length - 1 && !autoplay && repeatMode === 0;
  const isShuffleDisabled = DEMO_TRACKS.length <= 5;
  const isRewindDisabled = pos < 10;
  const isForwardDisabled = song.duration - pos < 10;
  const hasActiveEffects = filters.length > 0;
  const statusText = `Vol: ${volume}% | Standard 96k | Loop: ${loop.status} | Acak: ${shuffle ? 'Aktif' : 'Mati'} | Autoplay: ${autoplay ? 'ON' : 'OFF'}`;
  const providerEmoji = PROVIDER_EMOJI[song.provider];

  // Waktu berjalan saat tidak dijeda; pindah lagu saat habis (logika loop/autoplay demo).
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setPos((p) => {
        if (p + 1 < song.duration) return p + 1;
        return p; // pindah lagu ditangani efek terpisah
      });
    }, 1000);
    return () => clearInterval(t);
  }, [paused, song.duration, idx]);

  useEffect(() => {
    if (!paused || pos < song.duration) return;
    // Lagu habis: terapkan logika loop/autoplay yang sama dengan bot.
    if (repeatMode === 1) { setPos(0); return; }
    if (idx + 1 < DEMO_TRACKS.length) { setIdx(idx + 1); setPos(0); return; }
    if (repeatMode === 2) { setIdx(0); setPos(0); return; }
    if (autoplay) { setIdx(DEMO_TRACKS.length - 1); setPos(0); return; }
    setPaused(true);
  }, [pos, paused, idx, repeatMode, autoplay, song.duration]);

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

  const popProps = { openPop, setOpenPop, popRef };

  return (
    <div>
      <MessageAndRows jam={jam} botAvatar={botAvatar} compact={compact}>
        <PanelEmbed
          compact={compact}
          color="#B80012"
          author="NOXA Sound • Sedang Memutar"
          title={`${song.name}`}
          titleUrl="#"
          description={
            <>
              <span className="inline-flex items-center gap-1.5">
                <Emoji name="musik" size={16} /> <b>MODE MUSIK</b> • <Emoji name="NOXASmart" size={16} />
              </span>
              <br />
              <span className="inline-flex items-center gap-1.5 flex-wrap">
                <Emoji name="pemiliklagu" size={16} /> <b>Pemilik Lagu:</b> <CodeText text={song.autoplay ? 'NOXA Smart' : 'demo_tester'} />
              </span>
            </>
          }
          image={demoArt(idx)}
          fields={[
            { name: 'Artis / Uploader', value: <CodeText text={song.uploader} />, inline: true },
            { name: 'Durasi', value: <CodeText text={`${formatDiscordTime(pos)} / ${formatDiscordTime(song.duration)}`} />, inline: true },
            { name: 'Disukai oleh', value: <CodeText text={`${likeCount} orang`} />, inline: true },
            {
              name: 'Live Chat',
              value: chat.length
                ? chat.map((c, i) => <span key={i} className="block italic text-[#B5BAC1]">{`> ${c.user}: ${c.text}`}</span>)
                : <i className="text-[#B5BAC1]">Kosong. Klik tombol Chat.</i>,
            },
            { name: 'Status', value: <CodeText text={statusText} /> },
            ...(hasActiveEffects
              ? [{ name: 'Efek Aktif', value: <CodeText text={filters.map(capFilter).join(', ')} />, inline: true }]
              : []),
          ]}
          footer={
            nextSong
              ? nextSong.autoplay
                ? `Berikutnya (Autoplay): ${nextSong.name.substring(0, 35)}...`
                : `Berikutnya: ${nextSong.name.substring(0, 35)}...`
              : 'Lagu terakhir di antrean.'
          }
          timestamp={jam}
        />

        {/* Piringan Vinyl Berputar dengan Cincin Progress */}
        <VinylPlayerCard song={song} pos={pos} paused={paused} accentColor="#B80012" idx={idx} />

        {/* Baris 1: mundur, jeda, maju, hentikan, lewati */}
        <ActionRow compact={compact}>
          <DiscordButton emoji="mundur" label="Mundur" disabled={isRewindDisabled}
            onClick={() => { setPos((p) => Math.max(0, p - 10)); setOpenPop(null); }} />
          <DiscordButton emoji={paused ? 'mulai' : 'jeda'} label={paused ? 'Lanjut' : 'Jeda'} style={paused ? 'primary' : 'secondary'}
            onClick={() => setPaused((p) => !p)} />
          <DiscordButton emoji="maju" label="Maju" disabled={isForwardDisabled}
            onClick={() => { setPos((p) => Math.min(song.duration - 1, p + 10)); setOpenPop(null); }} />
          <DiscordButton emoji="berhenti" label="Hentikan"
            onClick={() => { onSwitch('standby'); setOpenPop(null); }} />
          <DiscordButton emoji="lewati" label="Lewati" disabled={idx >= DEMO_TRACKS.length - 1 && !autoplay && repeatMode === 0}
            onClick={nextTrack} />
        </ActionRow>

        {/* Baris 2: Tombol Like & Ulangi */}
        <ActionRow compact={compact}>
          <DiscordButton
            emoji={likeCount > 0 ? "sukapenuh" : "sukakosong"}
            label={`Suka (${likeCount})`}
            style={likeCount > 0 ? "success" : "secondary"}
            onClick={() => setLiked((l) => !l)}
            title="Suka lagu ini"
          />
          <DiscordButton
            emoji={loop.emoji}
            label={loop.label}
            style={loop.style}
            onClick={() => setRepeatMode((m) => (m + 1) % 3)}
          />
        </ActionRow>

        {/* Baris 3: Dropdown Fitur Lainnya */}
        <div className="relative mt-2" ref={popRef}>
          <button
            type="button"
            onClick={() => setOpenPop(openPop === 'dropdown' ? null : 'dropdown')}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-[13px] text-[#DBDEE1] hover:border-[#4E5058] hover:bg-[#2B2D31] transition cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <Emoji name="fitur" size={16} />
              <span>⚡ Fitur Lainnya (Antrian, Lirik, Efek, Volume, dll...)</span>
            </span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className={`transition-transform shrink-0 ${openPop === 'dropdown' ? 'rotate-180' : ''}`}>
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          {openPop === 'dropdown' && (
            <div className="absolute inset-x-0 bottom-full mb-1.5 z-30 shadow-2xl">
              <MenuBox maxHeight="max-h-64">
                <MenuRow emoji="antrian" label={`Antrian Lagu (${DEMO_TRACKS.length} lagu)`} onClick={() => { setOpenPop('queue'); }} />
                <MenuRow emoji="lirik" label="Lirik Lagu" onClick={() => { setOpenPop('lyrics'); }} />
                <MenuRow emoji="chat" label="Live Chat" onClick={() => { setOpenPop('chat'); }} />
                <MenuRow emoji="tambahmusik" label="Tambah Lagu" onClick={() => { setIdx(0); setPos(0); setPaused(false); setOpenPop(null); }} />
                <MenuRow emoji="podcast" label="Studio Podcast" onClick={() => { onSwitch('podcast'); setOpenPop(null); }} />
                <MenuRow emoji="suara" label={`Atur Volume (${volume}%)`} onClick={() => { setOpenPop('volume'); }} />
                <MenuRow emoji="autoplay" label={autoplay ? "Matikan Autoplay" : "Aktifkan Autoplay"} onClick={() => { setAutoplay(a => !a); setOpenPop(null); }} />
                <MenuRow emoji="efek" label="Efek Suara & EQ" onClick={() => { setOpenPop('effects'); }} />
                <MenuRow emoji="userprofile" label="Profil Pendengar" onClick={() => { setOpenPop('profile'); }} />
                <MenuRow emoji="playlist" label="Koleksi Playlist" onClick={() => { setOpenPop('playlists'); }} />
                <MenuRow emoji="Shuffle" label={`Acak Antrian (${shuffle ? "Aktif" : "Mati"})`} onClick={() => { setShuffle(s => !s); setOpenPop(null); }} />
                <MenuRow emoji="bantuan" label="Panduan & Bantuan" onClick={() => { setOpenPop('help'); }} />
              </MenuBox>
            </div>
          )}

          {/* Popups yang dibuka lewat dropdown */}
          {openPop === 'queue' && (
            <div className="absolute inset-x-0 bottom-full mb-1.5 z-30">
              <QueuePop tracks={DEMO_TRACKS} idx={idx} onJump={(i) => { setIdx(i); setPos(0); setOpenPop(null); }} />
            </div>
          )}
          {openPop === 'lyrics' && (
            <div className="absolute inset-x-0 bottom-full mb-1.5 z-30">
              <LyricsPop song={song} />
            </div>
          )}
          {openPop === 'volume' && (
            <div className="absolute inset-x-0 bottom-full mb-1.5 z-30">
              <VolumePop value={volume} input={volInput} setInput={setVolInput} onSet={(v) => { setVolume(v); setOpenPop(null); }} />
            </div>
          )}
          {openPop === 'effects' && (
            <div className="absolute inset-x-0 bottom-full mb-1.5 z-30">
              <EffectsPop filters={filters} onPick={setFilterValue} onReset={() => setFilters([])} />
            </div>
          )}
          {openPop === 'chat' && (
            <div className="absolute inset-x-0 bottom-full mb-1.5 z-30">
              <ChatPop chat={chat} onSend={(t) => { setChat((c) => [...c, { user: 'kamu', text: t }]); }} />
            </div>
          )}
          {openPop === 'profile' && (
            <div className="absolute inset-x-0 bottom-full mb-1.5 z-30">
              <InfoPop judul="Profile">
                Di Discord, opsi ini menampilkan kartu analitik mendengarkan yang sama dengan profil di halaman <b>/me</b> web ini.
              </InfoPop>
            </div>
          )}
          {openPop === 'playlists' && (
            <div className="absolute inset-x-0 bottom-full mb-1.5 z-30">
              <InfoPop judul="Playlist">
                Di Discord, opsi ini membuka dashboard playlist pribadi, playlist populer member, dan koleksi lagu yang kamu suka.
              </InfoPop>
            </div>
          )}
          {openPop === 'help' && (
            <div className="absolute inset-x-0 bottom-full mb-1.5 z-30">
              <InfoPop judul="Bantuan">
                Di Discord, opsi ini membuka panel panduan lengkap dengan menu kategori, sama seperti halaman <b>/panduan</b> web ini.
              </InfoPop>
            </div>
          )}
        </div>

        {openPop === 'seek' && null}
      </MessageAndRows>
    </div>
  );
}

// ---------- Panel RADIO 24/7 (1 tombol) ----------
function RadioPanelDemo({ jam, botAvatar, onSwitch, compact = false }) {
  const [openPop, setOpenPop] = useState(null);
  return (
    <div>
      <MessageAndRows jam={jam} botAvatar={botAvatar} compact={compact}>
        <PanelEmbed
          compact={compact}
          color="#5C0008"
          title={DEMO_RADIO.name}
          titleUrl="#"
          description={
            <>
              <span className="inline-flex items-center gap-1.5 flex-wrap">
                <Emoji name="radio" size={16} /> <b>MODE RADIO 24/7</b> • <Emoji name="NOXASmart" size={16} /> <b>Lagu Populer Nonstop</b>
              </span>
              <br />
              <span>Siaran lagu populer 24 jam nonstop tanpa pengulangan.</span>
              <br />
              <span className="inline-flex items-center gap-1.5">
                <Emoji name="pemiliklagu" size={16} /> <b>Penyiar:</b> <CodeText text={DEMO_RADIO.owner} />
              </span>
            </>
          }
          image={demoArt(2)}
          fields={[
            { name: 'Status', value: <CodeText text="Siaran Langsung 24/7" />, inline: true },
            { name: 'Penghentian & Alih Mode', value: 'Admin langsung stop/alihkan. Member lain via voting mayoritas.', inline: false },
          ]}
          footer="NOXA SOUND • 24/7 POPULAR RADIO"
          timestamp={jam}
        />
        <ActionRow compact={compact}>
          <DiscordButton emoji="berhenti" label="Hentikan Radio" onClick={() => onSwitch('standby')} />
        </ActionRow>
      </MessageAndRows>
    </div>
  );
}

// ---------- Panel PODCAST (3 baris, 13 tombol) ----------
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
  const likeCount = liked ? 5 : 4;
  const themeLabel = PODCAST_TEMA.find(([n, e]) => e === theme)?.[0] || '';
  const statusText = `Vol: ${volume}% | Standard 96k | Antrean: ${DEMO_PODCASTS.length - 1} | Pemilik: demo_tester`;
  const pakaiJam = ep.duration >= 3600;

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
  const popProps = { openPop, setOpenPop, popRef };

  return (
    <div>
      <MessageAndRows jam={jam} botAvatar={botAvatar} compact={compact}>
        <PanelEmbed
          compact={compact}
          color="#3B0004"
          author="NOXA Sound • Studio Podcast"
          title={ep.name}
          titleUrl="#"
          description={
            <>
              <span className="inline-flex items-center gap-1.5 flex-wrap">
                <Emoji name="podcast" size={16} /> <b>MODE PODCAST</b> • <b>Tema: {themeLabel}</b> • <Emoji name="NOXASmart" size={16} />
              </span>
              <br />
              <span className="inline-flex items-center gap-1.5">
                <Emoji name="pemiliklagu" size={16} /> <b>Pemilik Podcast:</b> <CodeText text="demo_tester" />
              </span>
            </>
          }
          thumbnail={demoArt(idx + 1)}
          fields={[
            { name: 'Channel', value: <CodeText text={ep.uploader} />, inline: true },
            { name: 'Durasi', value: <CodeText text={`${formatDiscordTime(pos, pakaiJam)} / ${formatDiscordTime(ep.duration, pakaiJam)}`} />, inline: true },
            { name: 'Bahasa', value: <CodeText text={lang} />, inline: true },
            { name: 'Disukai oleh', value: <CodeText text={`${likeCount} orang`} />, inline: true },
            { name: 'Status', value: <CodeText text={statusText} />, inline: false },
          ]}
          timestamp={jam}
        />

        {/* Baris 1 */}
        <ActionRow compact={compact}>
          <DiscordButton emoji="mundurpodcast" label="Mundur 30d"
            onClick={() => setPos((p) => Math.max(0, p - 30))} />
          <DiscordButton emoji={paused ? 'mulai' : 'jeda'} label={paused ? 'Lanjut' : 'Jeda'} style={paused ? 'primary' : 'secondary'}
            onClick={() => setPaused((p) => !p)} />
          <DiscordButton emoji="majuupodcast" label="Maju 30d"
            onClick={() => setPos((p) => Math.min(ep.duration, p + 30))} />
          <DiscordButton emoji="lewati" label="Lewati"
            disabled={idx >= DEMO_PODCASTS.length - 1}
            onClick={() => { setIdx((i) => Math.min(DEMO_PODCASTS.length - 1, i + 1)); setPos(0); }} />
          <DiscordButton emoji="berhenti" label="Hentikan" onClick={() => onSwitch('standby')} />
        </ActionRow>

        {/* Baris 2 */}
        <ActionRow compact={compact}>
          <DiscordButton emoji={likeCount > 0 ? 'sukapenuh' : 'sukakosong'} label={`${likeCount}`} onClick={() => setLiked((l) => !l)} />
          <PopButton {...popProps} id="seek" emoji="waktu" label="Lompat Waktu">
            <SeekPop input={seekInput} setInput={setSeekInput}
              onSubmit={(raw) => {
                const s = parseSeek(raw);
                if (s != null) { setPos(Math.max(0, Math.min(ep.duration, s))); setOpenPop(null); setSeekInput(''); }
              }} />
          </PopButton>
          <PopButton {...popProps} id="volume" emoji="suara" label="Suara">
            <VolumePop value={volume} input={volInput} setInput={setVolInput}
              onSet={(v) => { setVolume(v); setOpenPop(null); }} />
          </PopButton>
          <PopButton {...popProps} id="queue" emoji="antrian" label="Antrian">
            <QueuePop tracks={DEMO_PODCASTS.map((p) => ({ name: p.name, uploader: p.uploader }))} idx={idx}
              onJump={(i) => { setIdx(i); setPos(0); setOpenPop(null); }} podcast />
          </PopButton>
          <PopButton {...popProps} id="theme" emoji="podcast" label="Tema">
            <ThemePop current={theme} onPick={(t) => { setTheme(t); setOpenPop(null); }} />
          </PopButton>
        </ActionRow>

        {/* Baris 3 */}
        <ActionRow compact={compact}>
          <PopButton {...popProps} id="lang" emoji="bahasa" label="Bahasa">
            <LangPop current={lang} onPick={(l) => { setLang(l); setOpenPop(null); }} />
          </PopButton>
          <PopButton {...popProps} id="help" emoji="bantuan" label="Bantuan">
            <InfoPop judul="Bantuan">
              Di Discord, tombol ini membuka panel panduan lengkap, sama seperti halaman <b>/panduan</b> web ini.
            </InfoPop>
          </PopButton>
          <DiscordButton emoji="musik" label="Mode Musik" onClick={() => onSwitch('music')} />
        </ActionRow>
      </MessageAndRows>
    </div>
  );
}

// ---------- Panel STANDBY (1 baris, 3 tombol) ----------
function StandbyPanelDemo({ jam, botAvatar, onSwitch, compact = false }) {
  const [openPop, setOpenPop] = useState(null);
  const popRef = useRef(null);
  return (
    <div>
      <MessageAndRows jam={jam} botAvatar={botAvatar} compact={compact}>
        <PanelEmbed
          compact={compact}
          color="#B80012"
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
          <DiscordButton emoji="tambahmusik" label="Tambah Lagu" onClick={() => onSwitch('music')} />
          <DiscordButton emoji="podcast" label="Podcast" onClick={() => onSwitch('podcast')} />
          <PopButton openPop={openPop} setOpenPop={setOpenPop} popRef={popRef} id="help" emoji="bantuan" label="Bantuan">
            <InfoPop judul="Bantuan">
              Di Discord, tombol ini membuka panel panduan lengkap dengan menu kategori.
            </InfoPop>
          </PopButton>
        </ActionRow>
      </MessageAndRows>
    </div>
  );
}

// ---------- Bagian bersama ----------
function MessageAndRows({ jam, botAvatar, compact = false, children }) {
  return (
    <DiscordMessage botAvatar={botAvatar} jam={jam} compact={compact}>
      <div className="space-y-3">
        {children}
      </div>
    </DiscordMessage>
  );
}

function PopButton({ openPop, setOpenPop, popRef, id, emoji, label, style = 'secondary', disabled = false, title, children }) {
  const isOpen = openPop === id;
  const isRightAligned = ['lyrics', 'chat', 'effects', 'theme', 'help', 'lang'].includes(id);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpenPop(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, setOpenPop]);

  return (
    <div className="relative" ref={popRef}>
      <DiscordButton emoji={emoji} label={label} style={style} disabled={disabled} title={title}
        onClick={() => setOpenPop(isOpen ? null : id)} />
      {isOpen && (
        <>
          {/* Dismiss overlay outside on desktop */}
          <div
            className="hidden sm:block fixed inset-0 z-20 cursor-default"
            onClick={() => setOpenPop(null)}
            aria-hidden="true"
          />
          {/* Backdrop gelap di mobile */}
          <div
            className="block sm:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-xs"
            onClick={() => setOpenPop(null)}
            aria-hidden="true"
          />
          {/* Wadah popup: di HP centered modal terjamin aman di viewport, di desktop dropdown di bawah tombol */}
          <div
            className={`rounded-xl border border-[#26272B] bg-[#111214] p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)]
              fixed inset-x-3.5 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto max-h-[82vh] overflow-y-auto
              sm:absolute sm:inset-auto sm:top-11 sm:translate-y-0 sm:z-30 sm:w-80 sm:max-w-[85vw] sm:max-h-[72vh] sm:mx-0
              ${isRightAligned ? 'sm:right-0 sm:left-auto' : 'sm:left-0 sm:right-auto'}
            `}
          >
            {/* Header mobile dengan tombol tutup */}
            <div className="flex sm:hidden items-center justify-between pb-2 mb-2.5 border-b border-[#26272B]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F2F3F5] flex items-center gap-1.5">
                {emoji && <Emoji name={emoji} size={15} />}
                <span>{label}</span>
              </span>
              <button
                type="button"
                onClick={() => setOpenPop(null)}
                className="text-[#949BA4] hover:text-white px-2 py-0.5 text-xs font-bold rounded cursor-pointer bg-[#1E1F22] border border-[#2B2D31]"
              >
                ✕ Tutup
              </button>
            </div>
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function LyricsPop({ song }) {
  const [mode, setMode] = useState('live');
  const title = song?.name || 'Senja di Kota Tua';
  const uploader = song?.uploader || 'NOXA Sound';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <PopTitle>NOXA Smart • Lirik</PopTitle>
        <span className="text-[10px] text-[#949BA4] font-mono">Spotify • Musixmatch</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-[#1E1F22] border border-[#2B2D31]">
        <button
          type="button"
          onClick={() => setMode('live')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-[11.5px] font-semibold transition cursor-pointer ${
            mode === 'live' ? 'bg-[#4E5058] text-white shadow-xs' : 'text-[#949BA4] hover:text-white'
          }`}
        >
          <Emoji name="livelirik" size={13} />
          <span>Live Karaoke</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('script')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-[11.5px] font-semibold transition cursor-pointer ${
            mode === 'script' ? 'bg-[#4E5058] text-white shadow-xs' : 'text-[#949BA4] hover:text-white'
          }`}
        >
          <Emoji name="songlyrics" size={13} />
          <span>Skrip Penuh</span>
        </button>
      </div>

      <div className="rounded-md bg-[#1E1F22] px-2.5 py-1.5 border border-[#2B2D31] flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-bold text-white truncate">{title}</div>
          <div className="text-[10.5px] text-[#949BA4] truncate">{uploader}</div>
        </div>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#248046] text-white">
          Terverifikasi
        </span>
      </div>

      {mode === 'live' ? (
        <div className="rounded-lg bg-[#1E1F22] border border-[#2B2D31] p-3 text-[12px] leading-relaxed space-y-2 select-none">
          <div className="text-[#80848E] text-[11px]">[00:18] Di antara deru kota yang terlelap...</div>
          <div className="text-[#949BA4] text-[11.5px]">[00:26] Ku melangkah mencari arti senyumanmu...</div>
          <div className="rounded bg-[#FF4B2B]/20 border border-[#FF4B2B]/50 px-2 py-1.5 text-white font-semibold flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4B2B] animate-pulse shrink-0" />
            <span className="min-w-0 flex-1 text-[12px] break-words">▶ [00:38] Senja datang membawa semua bayanganmu</span>
          </div>
          <div className="text-[#949BA4] text-[11.5px]">[00:47] Menemani sepi malam yang sunyi...</div>
          <div className="text-[#80848E] text-[11px]">[00:58] Dan ku tahu waktu kan menjawabnya...</div>
        </div>
      ) : (
        <div className="rounded-lg bg-[#1E1F22] border border-[#2B2D31] p-3 text-[11.5px] leading-relaxed text-[#DBDEE1] max-h-48 overflow-y-auto space-y-2.5 font-sans">
          <p>
            Di antara deru kota yang terlelap<br />
            Ku melangkah mencari arti senyumanmu<br />
            Malam berlari mengejar bayang rindu
          </p>
          <p className="text-white font-medium border-l-2 border-[#FF4B2B] pl-2">
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
        Di Discord, klik tombol <b className="text-white">Lirik</b> di player untuk sinkronisasi otomatis karaoke atau skrip penuh.
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
      <MenuBox maxHeight="max-h-56">
        {tracks.map((t, i) => (
          <MenuRow key={i}
            emoji={i === idx ? (podcast ? 'podcast' : 'musik') : null}
            label={`${i + 1}. ${t.name}`}
            selected={i === idx}
            onClick={() => i !== idx && onJump(i)} />
        ))}
      </MenuBox>
    </div>
  );
}

function VolumePop({ value, input, setInput, onSet }) {
  return (
    <div>
      <PopTitle>Atur Volume (0-150)</PopTitle>
      <div className="mb-2 text-[13px] text-[#B5BAC1]">Volume sekarang: <b className="text-white">{value}%</b></div>
      <div className="flex gap-2">
        <input
          type="number" min={0} max={150} value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-[#3F4147] bg-[#1E1F22] px-2.5 py-1.5 text-sm text-white outline-none focus:border-[#5865F2]"
        />
        <button type="button"
          onClick={() => onSet(Math.max(0, Math.min(150, Math.floor(Number(input) || 0))))}
          className="rounded-lg bg-[#5865F2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#4752C4] cursor-pointer shrink-0"
        >
          Set
        </button>
      </div>
    </div>
  );
}

function SeekPop({ input, setInput, onSubmit }) {
  return (
    <div>
      <PopTitle>Lompat ke Posisi</PopTitle>
      <div className="mb-2 text-[12px] leading-relaxed text-[#B5BAC1]">
        Format sama seperti Discord: <code className="rounded bg-[#1E1F22] px-1 font-mono">45</code> detik,{' '}
        <code className="rounded bg-[#1E1F22] px-1 font-mono">m:ss</code>, atau{' '}
        <code className="rounded bg-[#1E1F22] px-1 font-mono">h:mm:ss</code>
      </div>
      <div className="flex gap-2">
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="cth: 1:15:00"
          className="min-w-0 flex-1 rounded-lg border border-[#3F4147] bg-[#1E1F22] px-2.5 py-1.5 text-sm text-white outline-none focus:border-[#5865F2]"
        />
        <button type="button" onClick={() => onSubmit(input)}
          className="rounded-lg bg-[#5865F2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#4752C4] cursor-pointer shrink-0"
        >
          Lompat
        </button>
      </div>
    </div>
  );
}

function EffectsPop({ filters, onPick, onReset }) {
  // Struktur sama persis dengan menu Efek di bot: 3 dropdown (Bass, Kecepatan,
  // Lainnya multi maks 3) + tombol Reset Semua Efek.
  return (
    <div className="space-y-3">
      <div>
        <PopTitle>Bass Boost</PopTitle>
        <MenuBox maxHeight="max-h-48">
          {FILTER_BASS.map(([label, emoji, val]) => (
            <MenuRow key={val} emoji={emoji} label={label}
              selected={BASS_SET.has(val) && filters.includes(val)}
              onClick={() => onPick(val)} />
          ))}
        </MenuBox>
      </div>
      <div>
        <PopTitle>Kecepatan</PopTitle>
        <MenuBox maxHeight="max-h-40">
          {FILTER_SPEED.map(([label, emoji, val]) => (
            <MenuRow key={val} emoji={emoji} label={label}
              selected={SPEED_SET.has(val) && filters.includes(val)}
              onClick={() => onPick(val)} />
          ))}
        </MenuBox>
      </div>
      <div>
        <PopTitle>Efek Lainnya (maks 3)</PopTitle>
        <MenuBox maxHeight="max-h-56">
          {FILTER_OTHER.map(([label, emoji, val]) => (
            <MenuRow key={val} emoji={emoji} label={label}
              selected={filters.includes(val)}
              onClick={() => onPick(val)} />
          ))}
        </MenuBox>
      </div>
      <button type="button" onClick={onReset}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#4E5058] px-3 py-2 text-[13px] font-medium text-white hover:bg-[#6D6F78] cursor-pointer"
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
      <MenuBox maxHeight="max-h-64">
        {PODCAST_TEMA.map(([nama, emoji]) => (
          <MenuRow key={emoji} emoji={emoji} label={nama}
            selected={current === emoji}
            onClick={() => onPick(emoji)} />
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
          <MenuRow key={l} label={l}
            selected={current === l}
            onClick={() => onPick(l)} />
        ))}
      </MenuBox>
      <div className="mt-2 text-[11px] leading-relaxed text-[#949BA4]">
        Bahasa mengikuti track multi-language yang tersedia di episode.
      </div>
    </div>
  );
}

function ChatPop({ chat, onSend }) {
  const [t, setT] = useState('');
  return (
    <div>
      <PopTitle>Live Chat Pemutar</PopTitle>
      <div className="mb-2 space-y-1">
        {chat.slice(-3).map((c, i) => (
          <div key={i} className="text-[12px] italic text-[#B5BAC1] break-words">{c.user}: {c.text}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={t} onChange={(e) => setT(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && t.trim()) { onSend(t.trim()); setT(''); } }}
          placeholder="Tulis pesan singkat"
          className="min-w-0 flex-1 rounded-lg border border-[#3F4147] bg-[#1E1F22] px-2.5 py-1.5 text-sm text-white outline-none focus:border-[#5865F2]"
        />
        <button type="button"
          onClick={() => { if (t.trim()) { onSend(t.trim()); setT(''); } }}
          className="rounded-lg bg-[#5865F2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#4752C4] cursor-pointer shrink-0"
        >
          Kirim
        </button>
      </div>
    </div>
  );
}

function InfoPop({ judul, children }) {
  return (
    <div>
      <PopTitle>{judul}</PopTitle>
      <div className="text-[12.5px] leading-relaxed text-[#B5BAC1]">{children}</div>
    </div>
  );
}
