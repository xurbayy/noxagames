'use client';

// Replika 1:1 panel pemutar Discord NOXA (musik, radio 24/7, podcast, standby)
// lengkap dengan SEMUA tombolnya. Tombol berfungsi sebagai pratinjau interaktif
// (state demo di browser) - kontrol asli tetap ada di Discord. Ini dicantumkan
// jujur di caption halaman.
//
// Bentuk embed, urutan baris tombol, label, emoji, gaya warna tombol, dan
// kondisi disabled disalin dari utils/player.js + utils/podcastPlayer.js bot.
import { useEffect, useMemo, useRef, useState } from 'react';
import Emoji from '../Emoji';
import { formatDiscordTime } from '../../lib/format';
import { DiscordButton, ActionRow, PanelEmbed, CodeText, DiscordMessage } from './discord-ui';

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
  ['Karaoke', 'karaoke'], ['8D Audio', '8d'], ['Vaporwave', 'vaporwave'], ['Flanger', 'flanger'],
  ['Surround', 'surraund'], ['Tremolo', 'tremelo'], ['Phaser', 'phaser'], ['Echo', 'echo'],
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

// ---------- Showcase ----------
export default function PlayerShowcase({ singleMode = null, botAvatar = null }) {
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
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                tab === key
                  ? 'border-crimson bg-crimson/15 text-ink'
                  : 'border-line bg-surface2 text-muted hover:border-linebright hover:text-ink'
              }`}
            >
              <Emoji name={emoji} size={16} /> {label}
            </button>
          ))}
        </div>
      )}

      {tab === 'music' && <MusicPanelDemo jam={jam} botAvatar={botAvatar} onSwitch={setTab} />}
      {tab === 'radio' && <RadioPanelDemo jam={jam} botAvatar={botAvatar} onSwitch={setTab} />}
      {tab === 'podcast' && <PodcastPanelDemo jam={jam} botAvatar={botAvatar} onSwitch={setTab} />}
      {tab === 'standby' && <StandbyPanelDemo jam={jam} botAvatar={botAvatar} onSwitch={setTab} />}
    </div>
  );
}

// ---------- Panel MUSIK (4 baris, 19 tombol, urutan sama dengan bot) ----------
function MusicPanelDemo({ jam, botAvatar, onSwitch }) {
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
      <MessageAndRows jam={jam} botAvatar={botAvatar}>
        <PanelEmbed
          color="#B80012"
          author="NOXA Music • Sedang Memutar"
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

        {/* Baris 1: mundur, jeda, maju, lewati, hentikan */}
        <ActionRow>
          <DiscordButton emoji="mundur" label="Mundur" disabled={isRewindDisabled}
            onClick={() => { setPos((p) => Math.max(0, p - 10)); setOpenPop(null); }} />
          <DiscordButton emoji={paused ? 'mulai' : 'jeda'} label={paused ? 'Lanjut' : 'Jeda'} style={paused ? 'primary' : 'secondary'}
            onClick={() => setPaused((p) => !p)} />
          <DiscordButton emoji="maju" label="Maju" disabled={isForwardDisabled}
            onClick={() => { setPos((p) => Math.min(song.duration - 1, p + 10)); setOpenPop(null); }} />
          <DiscordButton emoji="lewati" label="Lewati" disabled={idx >= DEMO_TRACKS.length - 1 && !autoplay && repeatMode === 0}
            onClick={nextTrack} />
          <DiscordButton emoji="berhenti" label="Hentikan"
            onClick={() => { onSwitch('standby'); setOpenPop(null); }} />
        </ActionRow>

        {/* Baris 2: like, ulangi, antrian, lirik, chat */}
        <ActionRow>
          <DiscordButton emoji={likeCount > 0 ? 'sukapenuh' : 'sukakosong'} label={`${likeCount}`}
            onClick={() => setLiked((l) => !l)} title="Suka lagu ini" />
          <DiscordButton emoji={loop.emoji} label={loop.label} style={loop.style}
            onClick={() => setRepeatMode((m) => (m + 1) % 3)} />
          <PopButton {...popProps} id="queue" emoji="antrian" label="Antrian" disabled={isQueueEmpty}
            title="Lihat antrian">
            <QueuePop tracks={DEMO_TRACKS} idx={idx} onJump={(i) => { setIdx(i); setPos(0); setOpenPop(null); }} />
          </PopButton>
          <PopButton {...popProps} id="lyrics" emoji="lirik" label="Lirik">
            <InfoPop judul="Lirik">
              Di Discord, tombol ini membuka pilihan <b>Live Lirik</b> real-time ala karaoke atau <b>Skrip Lirik</b> penuh,
              diverifikasi NOXA Smart dari beberapa provider.
            </InfoPop>
          </PopButton>
          <PopButton {...popProps} id="chat" emoji="chat" label="Chat">
            <ChatPop chat={chat} onSend={(t) => { setChat((c) => [...c, { user: 'kamu', text: t }]); }} />
          </PopButton>
        </ActionRow>

        {/* Baris 3: tambah, podcast, suara, autoplay, efek */}
        <ActionRow>
          <DiscordButton emoji="tambahmusik" label="Tambah"
            onClick={() => { setIdx(0); setPos(0); setPaused(false); setOpenPop(null); }} />
          <DiscordButton emoji="podcast" label="Podcast" onClick={() => onSwitch('podcast')} />
          <PopButton {...popProps} id="volume" emoji="suara" label="Suara">
            <VolumePop value={volume} input={volInput} setInput={setVolInput}
              onSet={(v) => { setVolume(v); setOpenPop(null); }} />
          </PopButton>
          <DiscordButton emoji="autoplay" label="Autoplay" style={autoplay ? 'primary' : 'secondary'}
            onClick={() => setAutoplay((a) => !a)} />
          <PopButton {...popProps} id="effects" emoji="efek" label="Efek" style={hasActiveEffects ? 'primary' : 'secondary'}>
            <EffectsPop filters={filters} onPick={setFilterValue} onReset={() => setFilters([])} />
          </PopButton>
        </ActionRow>

        {/* Baris 4: profile, playlist, acak, bantuan */}
        <ActionRow>
          <PopButton {...popProps} id="profile" emoji="userprofile" label="Profile">
            <InfoPop judul="Profile">
              Di Discord, tombol ini menampilkan kartu analitik mendengarkan yang sama dengan profil di halaman <b>/me</b> web ini.
            </InfoPop>
          </PopButton>
          <PopButton {...popProps} id="playlists" emoji="playlist" label="Playlist">
            <InfoPop judul="Playlist">
              Di Discord, tombol ini membuka dashboard playlist pribadi, playlist populer member, dan koleksi lagu yang kamu suka.
            </InfoPop>
          </PopButton>
          <DiscordButton emoji="Shuffle" label="Acak" style={shuffle ? 'primary' : 'secondary'} disabled={isShuffleDisabled}
            onClick={() => setShuffle((s) => !s)} title={isShuffleDisabled ? 'Acak butuh minimal 6 lagu di antrian' : undefined} />
          <PopButton {...popProps} id="help" emoji="bantuan" label="Bantuan">
            <InfoPop judul="Bantuan">
              Di Discord, tombol ini membuka panel panduan lengkap dengan menu kategori, sama seperti halaman <b>/panduan</b> web ini.
            </InfoPop>
          </PopButton>
        </ActionRow>

        {openPop === 'seek' && null}
      </MessageAndRows>
    </div>
  );
}

// ---------- Panel RADIO 24/7 (1 tombol) ----------
function RadioPanelDemo({ jam, botAvatar, onSwitch }) {
  const [openPop, setOpenPop] = useState(null);
  return (
    <div>
      <MessageAndRows jam={jam} botAvatar={botAvatar}>
        <PanelEmbed
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
          footer="NOXA MUSIC • 24/7 POPULAR RADIO"
          timestamp={jam}
        />
        <ActionRow>
          <DiscordButton emoji="berhenti" label="Hentikan Radio" onClick={() => onSwitch('standby')} />
        </ActionRow>
      </MessageAndRows>
    </div>
  );
}

// ---------- Panel PODCAST (3 baris, 13 tombol) ----------
function PodcastPanelDemo({ jam, botAvatar, onSwitch }) {
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
      <MessageAndRows jam={jam} botAvatar={botAvatar}>
        <PanelEmbed
          color="#3B0004"
          author="NOXA Music • Studio Podcast"
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
        <ActionRow>
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
        <ActionRow>
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
        <ActionRow>
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
function StandbyPanelDemo({ jam, botAvatar, onSwitch }) {
  const [openPop, setOpenPop] = useState(null);
  const popRef = useRef(null);
  return (
    <div>
      <MessageAndRows jam={jam} botAvatar={botAvatar}>
        <PanelEmbed
          color="#B80012"
          title="Sesi Selesai"
          titleEmoji="finish"
          description={
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              Antrian kosong. Pesan ini akan otomatis dibersihkan <Emoji name="bersih" size={16} />
            </span>
          }
          footer="NOXA Music • Auto-Clean"
          timestamp={jam}
        />
        <ActionRow>
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
function MessageAndRows({ jam, botAvatar, children }) {
  return (
    <DiscordMessage botAvatar={botAvatar}>
      <div className="space-y-3">
        {children}
      </div>
    </DiscordMessage>
  );
}

function PopButton({ openPop, setOpenPop, popRef, id, emoji, label, style = 'secondary', disabled = false, title, children }) {
  return (
    <div className="relative" ref={popRef}>
      <DiscordButton emoji={emoji} label={label} style={style} disabled={disabled} title={title}
        onClick={() => setOpenPop(openPop === id ? null : id)} />
      {openPop === id && (
        <div className="absolute left-0 top-11 z-30 w-72 rounded-xl border border-[#26272B] bg-[#111214] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
          {children}
        </div>
      )}
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
      <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
        {tracks.map((t, i) => (
          <button key={i} type="button"
            onClick={() => i !== idx && onJump(i)}
            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors cursor-pointer ${
              i === idx ? 'bg-[#5865F2]/20 text-[#DBDEE1]' : 'text-[#B5BAC1] hover:bg-[#2B2D31]'
            }`}
          >
            <span className="w-5 shrink-0 text-center text-[11px] text-[#949BA4]">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate">{t.name}</span>
          </button>
        ))}
      </div>
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
          className="w-24 rounded-lg border border-[#3F4147] bg-[#1E1F22] px-2.5 py-1.5 text-sm text-white outline-none focus:border-[#5865F2]"
        />
        <button type="button"
          onClick={() => onSet(Math.max(0, Math.min(150, Math.floor(Number(input) || 0))))}
          className="rounded-lg bg-[#5865F2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#4752C4] cursor-pointer"
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
          className="w-32 rounded-lg border border-[#3F4147] bg-[#1E1F22] px-2.5 py-1.5 text-sm text-white outline-none focus:border-[#5865F2]"
        />
        <button type="button" onClick={() => onSubmit(input)}
          className="rounded-lg bg-[#5865F2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#4752C4] cursor-pointer"
        >
          Lompat
        </button>
      </div>
    </div>
  );
}

function EffectsPop({ filters, onPick, onReset }) {
  return (
    <div className="w-80 max-w-[80vw]">
      <PopTitle>Efek Audio (menu yang sama di Discord)</PopTitle>
      <div className="mb-1.5 text-[11px] font-semibold text-[#949BA4]">Bass Boost</div>
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {FILTER_BASS.map(([label, emoji, val]) => (
          <button key={val} type="button" onClick={() => onPick(val)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[12px] cursor-pointer transition-colors ${
              filters.includes(val) ? 'border-[#5865F2] bg-[#5865F2]/20 text-white' : 'border-[#3F4147] text-[#B5BAC1] hover:border-[#5865F2]'
            }`}
          >
            <Emoji name={emoji} size={13} /> {label}
          </button>
        ))}
      </div>
      <div className="mb-1.5 text-[11px] font-semibold text-[#949BA4]">Kecepatan</div>
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {FILTER_SPEED.map(([label, emoji, val]) => (
          <button key={val} type="button" onClick={() => onPick(val)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[12px] cursor-pointer transition-colors ${
              filters.includes(val) ? 'border-[#5865F2] bg-[#5865F2]/20 text-white' : 'border-[#3F4147] text-[#B5BAC1] hover:border-[#5865F2]'
            }`}
          >
            <Emoji name={emoji} size={13} /> {label}
          </button>
        ))}
      </div>
      <div className="mb-1.5 text-[11px] font-semibold text-[#949BA4]">Lainnya (maks 3)</div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTER_OTHER.map(([label, emoji]) => {
          const val = emoji === '8d' ? '8d' : label.toLowerCase().replace(/\s+/g, '');
          return (
            <button key={val} type="button" onClick={() => onPick(val)}
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[12px] cursor-pointer transition-colors ${
                filters.includes(val) ? 'border-[#5865F2] bg-[#5865F2]/20 text-white' : 'border-[#3F4147] text-[#B5BAC1] hover:border-[#5865F2]'
              }`}
            >
              <Emoji name={emoji} size={13} /> {label}
            </button>
          );
        })}
      </div>
      <button type="button" onClick={onReset}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#4E5058] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#6D6F78] cursor-pointer"
      >
        <Emoji name="reseteffect" size={13} /> Reset Semua Efek
      </button>
    </div>
  );
}

function ThemePop({ current, onPick }) {
  return (
    <div>
      <PopTitle>Pilih Tema Podcast</PopTitle>
      <div className="flex max-h-56 flex-wrap gap-1.5 overflow-y-auto pr-1">
        {PODCAST_TEMA.map(([nama, emoji]) => (
          <button key={emoji} type="button" onClick={() => onPick(emoji)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[12px] cursor-pointer transition-colors ${
              current === emoji ? 'border-[#5865F2] bg-[#5865F2]/20 text-white' : 'border-[#3F4147] text-[#B5BAC1] hover:border-[#5865F2]'
            }`}
          >
            <Emoji name={emoji} size={13} /> {nama}
          </button>
        ))}
      </div>
    </div>
  );
}

function LangPop({ current, onPick }) {
  const LANGS = ['Bahasa Asli', 'Inggris', 'Jepang', 'Korea', 'Spanyol', 'Hindi'];
  return (
    <div>
      <PopTitle>Bahasa Audio</PopTitle>
      <div className="flex flex-wrap gap-1.5">
        {LANGS.map((l) => (
          <button key={l} type="button" onClick={() => onPick(l)}
            className={`rounded-lg border px-2.5 py-1 text-[12px] cursor-pointer transition-colors ${
              current === l ? 'border-[#5865F2] bg-[#5865F2]/20 text-white' : 'border-[#3F4147] text-[#B5BAC1] hover:border-[#5865F2]'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-[#949BA4]">Bahasa mengikuti track multi-language yang tersedia di episode.</div>
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
          <div key={i} className="text-[12px] italic text-[#B5BAC1]">{c.user}: {c.text}</div>
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
          className="rounded-lg bg-[#5865F2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#4752C4] cursor-pointer"
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
