'use client';

// Replika 1:1 panel pemutar NOXA yang dikirim bot ke Discord.
// Acuan: utils/player.js (musik + radio + standby), utils/podcastPlayer.js,
// utils/vinylCard.js (kartu canvas), utils/v2Otomatis.js (layout Components V2).
// Semua label, emoji, urutan tombol, opsi dropdown, dan isi kartu disamakan
// dengan bot supaya simulasi di web tidak menyesatkan.
import { useEffect, useState } from 'react';
import Emoji from '../Emoji';
import { emojiSrc } from '../../lib/noxa-emojis';
import { formatDiscordTime } from '../../lib/format';
import {
  DiscordButton,
  ActionRow,
  DiscordMessage,
  DiscordSelectMenu,
  MenuBox,
  MenuRow,
} from './discord-ui';

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
  { name: 'Rahasia Studio Broadcast', uploader: 'NOXA Podcast Demo', duration: 4112, theme: 'obrolansantai', lang: 'Bahasa Asli', provider: 'youtube' },
  { name: 'Malam Pemburu Bintang', uploader: 'NOXA Podcast Demo', duration: 2760, theme: 'fiksi', lang: 'Bahasa Asli', provider: 'youtube' },
];

const DEMO_RADIO = { name: 'Radio Populer NOXA 24/7', uploader: 'Radio Populer Nonstop', host: 'demo_host' };

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

// Sama dengan loopLabels/statusModes di utils/player.js
const LOOP = {
  0: { label: 'Ulangi', emoji: 'ulangi', status: 'Mati' },
  1: { label: 'Ulangi Lagu Ini', emoji: 'ulangilaguini', status: 'Lagu Ini' },
  2: { label: 'Ulangi Semua', emoji: 'ulangisemua', status: 'Semua Antrian' },
};

const QUALITY = 'Standard 96k';

// ---------- Helper ----------
function hexToRgb(hex) {
  const h = String(hex || '#FF101F').replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16);
  return Number.isFinite(n) ? { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 } : { r: 255, g: 16, b: 31 };
}

// buildStaticLayer(): warna dasar kartu = warna lagu * 0.08, di-clamp 6..22 / 6..26
function cardBg(color) {
  const { r, g, b } = hexToRgb(color);
  const clamp = (v, max) => Math.max(6, Math.min(max, Math.round(v * 0.08)));
  return `rgb(${clamp(r, 22)}, ${clamp(g, 22)}, ${clamp(b, 26)})`;
}

function truncate(text, max) {
  const s = String(text ?? '');
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

// Status efek di kartu: bot menampilkan nama filter dengan huruf awal kapital
function effectsLabel(filters) {
  if (!filters.length) return null;
  return filters.map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(', ');
}

function clock(secs, forceHours) {
  return formatDiscordTime(Math.max(0, Math.floor(secs || 0)), forceHours);
}

// ---------- Kartu canvas: MUSIK (680x220) ----------
function MusicCard({
  title,
  artist,
  pos,
  duration,
  paused,
  color,
  volume,
  quality,
  loopStatus,
  acakStatus,
  autoplayOn,
  effects,
}) {
  const { r, g, b } = hexToRgb(color);
  const total = duration || 0;
  const durStr = `${clock(total, total >= 3600)}${paused ? ' (Jeda)' : ''}`;
  const statusY = 106;
  const statusMid = statusY + 17;

  // Lebar badge didekati dari jumlah karakter (canvas mengukur teks asli).
  const durW = 8 + 11 + 6 + 52 + Math.round(durStr.length * 8.2) + 8;
  const qualW = 8 + 58 + Math.round(QUALITY.length * 8.2) + 8;
  const effList = effects ? effects.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const effVal = !effList.length ? null : effList.length > 2 ? `${effList[0]} +${effList.length - 1}` : effects;
  const effW = effVal ? 8 + 20 + Math.round(effVal.length * 8.2) + 8 : 0;

  const parts = [
    { label: 'Vol: ', value: `${volume}%`, color: '#FFFFFF' },
    { label: 'Loop: ', value: loopStatus, color: loopStatus !== 'Mati' ? '#30D158' : '#D1D1D6' },
    { label: 'Acak: ', value: acakStatus, color: acakStatus !== 'Mati' ? '#30D158' : '#D1D1D6' },
    { label: 'Autoplay: ', value: autoplayOn ? 'ON' : 'OFF', color: autoplayOn ? '#30D158' : '#FF453A' },
  ];
  let cursor = 237;
  const statusItems = parts.map((p) => {
    const x = cursor;
    cursor += Math.round((p.label.length + p.value.length) * 7.9) + 9;
    return { ...p, x, dividerAfter: cursor };
  });

  return (
    <svg viewBox="0 0 680 220" className="block w-full h-auto" role="img" aria-label={`Kartu pemutar: ${title}`}>
      <defs>
        <linearGradient id="noxa-music-border" x1="14" y1="12" x2="666" y2="208" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="0.7" stopColor={`rgb(${r}, ${g}, ${b})`} stopOpacity="0.22" />
          <stop offset="1" stopColor={`rgb(${Math.round(r * 0.7)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)})`} stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="noxa-music-sheen" x1="-64" y1="-64" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.10" />
          <stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FF1423" stopOpacity="0.14" />
          <stop offset="0.65" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.10" />
        </linearGradient>
        <clipPath id="noxa-music-art">
          <circle cx="0" cy="0" r="26" />
        </clipPath>
      </defs>

      {/* Panel obsidian bernuansa warna lagu */}
      <rect x="14" y="12" width="652" height="196" rx="18" fill={cardBg(color)} stroke="url(#noxa-music-border)" strokeWidth="1.3" />
      <rect x="16" y="13" width="648" height="1" rx="1" fill="#FFFFFF" fillOpacity="0.18" />

      {/* Ambient ring */}
      <circle cx="120" cy="110" r="90" fill="none" stroke={`rgb(${r}, ${g}, ${b})`} strokeOpacity="0.18" strokeWidth="4" />

      {/* Piringan hitam */}
      <g transform="translate(120 110)">
        <g className={paused ? '' : 'animate-spin'} style={{ animationDuration: '3.5s', animationTimingFunction: 'linear', transformOrigin: '0px 0px' }}>
          <circle r="64" fill="#0B0B0E" stroke="rgba(255,20,35,0.45)" strokeWidth="1.5" />
          {[32, 36, 40, 44, 48, 52, 56, 60].map((rr) => (
            <circle key={rr} r={rr} fill="none" stroke="#FFFFFF" strokeOpacity="0.045" strokeWidth="1" />
          ))}
          <circle r="64" fill="url(#noxa-music-sheen)" />
          <g clipPath="url(#noxa-music-art)">
            <image href="/logo.png" x="-26" y="-26" width="52" height="52" preserveAspectRatio="xMidYMid slice" />
          </g>
          <circle r="26" fill="none" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" />
          <circle r="4" fill="#050505" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1" />
        </g>
      </g>

      {/* Judul & artist */}
      <text x="225" y="36" fill="#FFFFFF" fontSize="17" fontWeight="700" fontFamily="inherit">
        {truncate(title, 42)}
      </text>
      <text x="225" y="60" fill="#B0AEB4" fontSize="12.5" fontFamily="inherit">
        {truncate(artist, 46)}
      </text>

      {/* Badge durasi */}
      <g>
        <rect x="225" y="71" width={durW} height="24" rx="5" fill="#FFFFFF" fillOpacity="0.06" stroke="#FFFFFF" strokeOpacity="0.12" />
        <circle cx="241" cy="83" r="4.8" fill="none" stroke={color} strokeWidth="1.2" />
        <path d="M241 83 L241 80 M241 83 L243.5 83" stroke={color} strokeWidth="1.2" />
        <text x="253" y="87.5" fill="#9E9E9E" fontSize="14" fontFamily="inherit">Durasi: </text>
        <text x={253 + 52} y="87.5" fill="#FFFFFF" fontSize="14" fontWeight="700" fontFamily="inherit">{durStr}</text>
      </g>

      {/* Badge kualitas */}
      <g>
        <rect x={225 + durW + 8} y="71" width={qualW} height="24" rx="6" fill="#FFFFFF" fillOpacity="0.06" stroke="#FFFFFF" strokeOpacity="0.12" />
        <text x={225 + durW + 16} y="87.5" fill="#9E9E9E" fontSize="14" fontFamily="inherit">Kualitas: </text>
        <text x={225 + durW + 16 + 58} y="87.5" fill="#FFFFFF" fontSize="14" fontWeight="700" fontFamily="inherit">{QUALITY}</text>
      </g>

      {/* Badge efek aktif */}
      {effVal ? (
        <g>
          <rect x={225 + durW + 8 + qualW + 8} y="71" width={effW} height="24" rx="6" fill="#FFFFFF" fillOpacity="0.08" stroke="#FFFFFF" strokeOpacity="0.14" />
          <text x={225 + durW + 8 + qualW + 16} y="87.5" fill="#9E9E9E" fontSize="14" fontFamily="inherit">⚡ </text>
          <text x={225 + durW + 8 + qualW + 16 + 20} y="87.5" fill="#30D158" fontSize="14" fontWeight="700" fontFamily="inherit">{effVal}</text>
        </g>
      ) : null}

      {/* Baris status bawah */}
      <rect x="225" y={statusY} width="455" height="34" rx="8" fill="#000000" fillOpacity="0.4" stroke="#FFFFFF" strokeOpacity="0.08" />
      {statusItems.map((s) => (
        <g key={s.label}>
          <text x={s.x} y={statusMid + 5} fill="#8E8E93" fontSize="14" fontFamily="inherit">{s.label}</text>
          <text x={s.x + Math.round(s.label.length * 7.9)} y={statusMid + 5} fill={s.color} fontSize="14" fontWeight="700" fontFamily="inherit">{s.value}</text>
          {s.dividerAfter < 670 ? (
            <path d={`M${s.dividerAfter + 4} ${statusY + 9} L${s.dividerAfter + 4} ${statusY + 25}`} stroke="#FFFFFF" strokeOpacity="0.12" />
          ) : null}
        </g>
      ))}

      {/* Logo NOXA */}
      <image href="/logo.png" x="618" y="26" width="34" height="34" />
    </svg>
  );
}

// ---------- Kartu canvas: PODCAST (600x600) ----------
function PodcastCard({ title, channel, theme, language, antrean, volume, paused, color }) {
  const { r, g, b } = hexToRgb(color);
  const cleanQual = QUALITY.replace(/^(Standard|Lossless)\s*/i, '').trim();
  const cleanLang = String(language || 'Bahasa Asli').replace(/^Bahasa\s+/i, '');
  const themeName = theme ? String(theme).replace(/<a?:[a-zA-Z0-9_]+:\d+>/g, '').trim() : null;

  const badges = [];
  if (themeName) badges.push({ label: 'Tema: ', value: themeName, color: '#FFFFFF', x: 44 });
  const push = (label, value, valueColor) => {
    const prev = badges[badges.length - 1];
    const prevW = prev ? Math.round((prev.label.length + prev.value.length) * 7) + 16 : 0;
    badges.push({ label, value, color: valueColor, x: prev ? prev.x + prevW + 6 : 44 });
  };
  if (cleanQual) push('Kualitas: ', cleanQual, '#FFFFFF');
  push('Antrean: ', String(antrean), '#FFFFFF');
  push('Bahasa: ', cleanLang, '#30D158');

  const badgeY = 414;
  const volY = badgeY + 26 + 24;
  const volW = 512;
  const filled = Math.max(4, (volW - 26) * Math.min(1, Math.max(0, volume / 100)));

  return (
    <svg viewBox="0 0 600 600" className="block w-full h-auto" role="img" aria-label={`Kartu podcast: ${title}`}>
      <defs>
        <linearGradient id="noxa-pod-border" x1="24" y1="20" x2="576" y2="580" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="0.7" stopColor={`rgb(${r}, ${g}, ${b})`} stopOpacity="0.22" />
          <stop offset="1" stopColor={`rgb(${Math.round(r * 0.7)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)})`} stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="noxa-pod-art" x1="40" y1="36" x2="560" y2="346" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2D0A10" />
          <stop offset="0.5" stopColor="#190609" />
          <stop offset="1" stopColor="#0C0204" />
        </linearGradient>
        <linearGradient id="noxa-pod-vignette" x1="40" y1="36" x2="40" y2="346" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0A0204" stopOpacity="0.10" />
          <stop offset="0.65" stopColor="#0A0204" stopOpacity="0.20" />
          <stop offset="1" stopColor="#130608" stopOpacity="0.88" />
        </linearGradient>
        <clipPath id="noxa-pod-art-clip">
          <rect x="40" y="36" width="520" height="310" rx="20" />
        </clipPath>
      </defs>

      <rect x="24" y="20" width="552" height="560" rx="24" fill={`rgba(${Math.max(6, Math.min(22, Math.round(r * 0.08)))}, ${Math.max(6, Math.min(22, Math.round(g * 0.08)))}, ${Math.max(10, Math.min(26, Math.round(b * 0.08)))}, 0.65)`} stroke="url(#noxa-pod-border)" strokeWidth="1.3" />
      <rect x="26" y="21" width="548" height="1" rx="1" fill="#FFFFFF" fillOpacity="0.18" />

      {/* Artwork */}
      <g clipPath="url(#noxa-pod-art-clip)">
        <rect x="40" y="36" width="520" height="310" fill="url(#noxa-pod-art)" />
        <image href={emojiSrc('podcast', 128)} x="236" y="127" width="128" height="128" opacity="0.9" />
        <rect x="40" y="36" width="520" height="310" fill="url(#noxa-pod-vignette)" />
      </g>

      {/* Speaker pill di pojok kanan artwork */}
      <circle cx="527" cy="69" r="19" fill="#000000" fillOpacity="0.45" stroke="#FFFFFF" strokeOpacity="0.14" />
      <path d="M521 66 L524 66 L528 62.5 L528 75.5 L524 72 L521 72 Z" fill="#FFFFFF" />
      <path d="M528 66 A7 7 0 0 1 528 72" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />

      {/* Judul + channel */}
      <text x="44" y="374" fill="#FFFFFF" fontSize="20" fontWeight="700" fontFamily="inherit">
        {truncate(title, 34)}
      </text>
      <text x="44" y="398" fill="#A8A0A2" fontSize="13.5" fontFamily="inherit">
        {truncate(channel, 40)}
      </text>

      <image href="/logo.png" x="522" y="370" width="34" height="34" />

      {/* Badge: Tema | Kualitas | Antrean | Bahasa */}
      {badges.map((bd) => {
        const w = Math.round((bd.label.length + bd.value.length) * 7) + 16;
        return (
          <g key={bd.label}>
            <rect x={bd.x} y={badgeY} width={w} height="26" rx="6" fill="#000000" fillOpacity={bd.label === 'Tema: ' ? 0.55 : 0.42} stroke={bd.label === 'Tema: ' ? 'rgba(255,30,45,0.35)' : 'rgba(255,255,255,0.12)'} />
            <text x={bd.x + 8} y={badgeY + 17.5} fill="#A09698" fontSize="13" fontFamily="inherit">{bd.label}</text>
            <text x={bd.x + 8 + Math.round(bd.label.length * 7)} y={badgeY + 17.5} fill={bd.color} fontSize="13" fontWeight="700" fontFamily="inherit">{bd.value}</text>
          </g>
        );
      })}

      {/* Volume slider */}
      <path d={`M44 ${volY - 2.5} L47 ${volY - 2.5} L51 ${volY - 5.5} L51 ${volY + 5.5} L47 ${volY + 2.5} L44 ${volY + 2.5} Z`} fill="#8E8588" />
      <rect x="60" y={volY - 2} width={volW - 26} height="4" rx="2" fill="#FFFFFF" fillOpacity="0.16" />
      <rect x="60" y={volY - 2} width={filled} height="4" rx="2" fill="#FFFFFF" />
      <circle cx={60 + filled} cy={volY} r="4.5" fill="#FFFFFF" />
      <path d={`M${44 + volW - 14} ${volY - 2.5} L${44 + volW - 11} ${volY - 2.5} L${44 + volW - 7} ${volY - 5.5} L${44 + volW - 7} ${volY + 5.5} L${44 + volW - 11} ${volY + 2.5} L${44 + volW - 14} ${volY + 2.5} Z`} fill="#8E8588" />
      <path d={`M${44 + volW - 7} ${volY} m-1 -5 a6 6 0 0 1 0 10`} fill="none" stroke="#8E8588" strokeWidth="1.2" />
    </svg>
  );
}

// ---------- Kartu canvas: RADIO 24/7 (680x220) ----------
function RadioCard({ title, artist, color, volume, quality }) {
  const { r, g, b } = hexToRgb(color);
  const badgeW = 8 + 6 + 6 + Math.round(20 * 7.9) + 8;
  const qualW = 8 + 58 + Math.round(String(quality).length * 7.9) + 8;

  return (
    <svg viewBox="0 0 680 220" className="block w-full h-auto" role="img" aria-label={`Kartu radio: ${title}`}>
      <defs>
        <linearGradient id="noxa-radio-border" x1="18" y1="14" x2="662" y2="206" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="0.7" stopColor={`rgb(${r}, ${g}, ${b})`} stopOpacity="0.22" />
          <stop offset="1" stopColor={`rgb(${Math.round(r * 0.7)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)})`} stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="noxa-radio-art" x1="34" y1="30" x2="194" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2D080D" />
          <stop offset="0.5" stopColor="#1A0609" />
          <stop offset="1" stopColor="#0C0204" />
        </linearGradient>
        <clipPath id="noxa-radio-art-clip">
          <rect x="34" y="30" width="160" height="160" rx="18" />
        </clipPath>
      </defs>

      <rect x="18" y="14" width="644" height="192" rx="20" fill={`rgba(${Math.max(6, Math.min(22, Math.round(r * 0.08)))}, ${Math.max(6, Math.min(22, Math.round(g * 0.08)))}, ${Math.max(10, Math.min(26, Math.round(b * 0.08)))}, 0.68)`} stroke="url(#noxa-radio-border)" strokeWidth="1.3" />
      <rect x="20" y="15" width="640" height="1" rx="1" fill="#FFFFFF" fillOpacity="0.18" />

      <g clipPath="url(#noxa-radio-art-clip)">
        <rect x="34" y="30" width="160" height="160" fill="url(#noxa-radio-art)" />
        <image href="/logo.png" x="74" y="70" width="80" height="80" opacity="0.92" />
      </g>
      <rect x="34" y="30" width="160" height="160" rx="18" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" />

      <image href="/logo.png" x="614" y="28" width="32" height="32" />

      <text x="214" y="38" fill="#FFFFFF" fontSize="18" fontWeight="700" fontFamily="inherit">
        {truncate(title, 40)}
      </text>
      <text x="214" y="66" fill="#A8A0A4" fontSize="13.5" fontFamily="inherit">
        {truncate(artist, 42)}
      </text>

      {/* Badge SIARAN LANGSUNG 24/7 + kualitas */}
      <g>
        <rect x="214" y="77" width={badgeW} height="24" rx="6" fill="#000000" fillOpacity="0.44" stroke="#FFFFFF" strokeOpacity="0.12" />
        <circle cx="225" cy="89" r="3" fill="#FF101F" />
        <text x="234" y="93.5" fill="#FFFFFF" fontSize="13" fontWeight="700" fontFamily="inherit">SIARAN LANGSUNG 24/7</text>
      </g>
      <g>
        <rect x={214 + badgeW + 8} y="77" width={qualW} height="24" rx="6" fill="#000000" fillOpacity="0.44" stroke="#FFFFFF" strokeOpacity="0.12" />
        <text x={214 + badgeW + 16} y="93.5" fill="#A09698" fontSize="13" fontFamily="inherit">Kualitas: </text>
        <text x={214 + badgeW + 16 + 58} y="93.5" fill="#FFFFFF" fontSize="13" fontWeight="700" fontFamily="inherit">{quality}</text>
      </g>

      {/* Level volume kecil di kanan bawah (representasi status volume radio) */}
      <text x="214" y="140" fill="#8E8E93" fontSize="12.5" fontFamily="inherit">Vol: <tspan fill="#FFFFFF" fontWeight="700">{volume}%</tspan></text>
    </svg>
  );
}

// ---------- Kapsul progress (canvas 680x42 / 620x42) ----------
function ProgressCapsule({ width = 680, pos, duration, paused, color }) {
  const ratio = duration > 0 ? Math.min(1, Math.max(0, pos / duration)) : 0;
  const useHours = duration >= 3600;
  const barX = 112;
  const barW = width - 40 - 36 - 36 - 36;

  return (
    <svg viewBox={`0 0 ${width} 42`} className="block w-full h-auto" role="img" aria-label="Progress bar">
      <defs>
        <filter id="noxa-prog-glow" x="-50%" y="-200%" width="200%" height="500%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={color} floodOpacity="0.85" />
        </filter>
      </defs>
      <rect x="20" y="4" width={width - 40} height="34" rx="14" fill={cardBg(color)} fillOpacity="0.75" stroke="#FFFFFF" strokeOpacity="0.12" />
      <text x="38" y="26" fill="#948B8D" fontSize="15" fontFamily="inherit">{clock(pos, useHours)}</text>
      <text x={width - 38} y="26" fill="#948B8D" fontSize="15" textAnchor="end" fontFamily="inherit">{clock(duration, useHours)}</text>
      <rect x={barX} y="19" width={barW} height="4" rx="2" fill="#FFFFFF" fillOpacity="0.16" />
      <rect x={barX} y="19" width={Math.max(6, barW * ratio)} height="4" rx="2" fill="#FFFFFF" />
      <circle cx={barX + Math.max(6, barW * ratio)} cy="21" r="4.5" fill="#FFFFFF" filter="url(#noxa-prog-glow)" />
    </svg>
  );
}

// ---------- Primitif visual Components V2 ----------
function V2Container({ color, children }) {
  return (
    <div
      className="overflow-hidden rounded-xl bg-[#232428]/95 border border-[#383A40]/80 shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
      style={color ? { borderLeft: `4px solid ${color}` } : undefined}
    >
      <div className="space-y-2.5 px-3.5 py-3 sm:px-4 sm:py-3.5">{children}</div>
    </div>
  );
}

function V2Section({ subtext, title, titleEmoji, titleUrl, lines = [], accessory }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-1">
        {subtext ? (
          <div className="text-[11.5px] font-semibold text-[#949BA4]">
            <span className="tracking-wide">{subtext}</span>
          </div>
        ) : null}
        {title ? (
          <div className="text-[15px] sm:text-[16px] font-bold leading-snug text-[#00A8FC]">
            {titleUrl ? (
              <a href={titleUrl} className="hover:underline" onClick={(e) => e.preventDefault()}>
                {title}
              </a>
            ) : (
              title
            )}
            {titleEmoji ? <Emoji name={titleEmoji} size={16} className="ml-2" /> : null}
          </div>
        ) : null}
        {lines.length ? <div className="space-y-0.5 text-[12.5px] leading-relaxed text-[#DBDEE1]">{lines}</div> : null}
      </div>
      {accessory ? <div className="shrink-0 self-start">{accessory}</div> : null}
    </div>
  );
}

function V2Separator() {
  return <div className="h-px w-full bg-[#3F4147]" aria-hidden="true" />;
}

function V2Media({ children }) {
  return <div className="w-full">{children}</div>;
}

function V2Footer({ text }) {
  return <div className="truncate text-[11.5px] text-[#949BA4]">{text}</div>;
}

function FieldLine({ label, children }) {
  return (
    <div className="break-words">
      <span className="font-bold text-[#F2F3F5]">{label}</span> {children}
    </div>
  );
}

function Mention({ name }) {
  return (
    <span className="rounded bg-[#5865F2]/30 px-1 py-px font-medium text-[#DBDEE1]">@{name}</span>
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
        <div className="mb-6 flex items-center justify-center sm:justify-start">
          <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/10 bg-[#141517]/90 p-1.5 shadow-lg shadow-black/40 backdrop-blur-md sm:gap-1.5 sm:justify-start">
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
                className={`flex cursor-pointer select-none items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 sm:gap-2 sm:px-4 sm:text-sm ${
                  tab === key
                    ? 'scale-[1.02] bg-gradient-to-r from-[#B80012] via-[#D60015] to-[#FF101F] text-white shadow-[0_2px_14px_rgba(255,16,31,0.4)]'
                    : 'text-[#949BA4] hover:bg-white/5 hover:text-[#F2F3F5]'
                }`}
              >
                <Emoji name={emoji} size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'music' && <MusicPanel jam={jam} botAvatar={botAvatar} onSwitch={setTab} compact={compact} />}
      {tab === 'radio' && <RadioPanel jam={jam} botAvatar={botAvatar} onSwitch={setTab} compact={compact} />}
      {tab === 'podcast' && <PodcastPanel jam={jam} botAvatar={botAvatar} onSwitch={setTab} compact={compact} />}
      {tab === 'standby' && <StandbyPanel jam={jam} botAvatar={botAvatar} onSwitch={setTab} compact={compact} />}
    </div>
  );
}

// ---------- MUSIK ----------
function MusicPanel({ jam, botAvatar, onSwitch, compact }) {
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

  const song = DEMO_TRACKS[idx];
  const nextSong = DEMO_TRACKS[idx + 1] || null;
  const likeCount = song.autoplay ? 12 : liked ? 7 : 6;
  const loop = LOOP[repeatMode];
  const isForwardDisabled = song.duration - pos < 10;
  const isQueueEmpty = !nextSong;
  const providerEmoji = PROVIDER_EMOJI[song.provider];
  const color = '#FF101F';

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setPos((p) => (p + 1 < song.duration ? p + 1 : p)), 1000);
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
      if (v === 'clear_bass') return cur.filter((f) => !BASS_SET.has(f));
      if (v === 'clear_speed') return cur.filter((f) => !SPEED_SET.has(f));
      if (SPEED_SET.has(v) || BASS_SET.has(v)) return [...cur.filter((f) => !SPEED_SET.has(f) && !BASS_SET.has(f)), v];
      return cur.includes(v) ? cur.filter((f) => f !== v) : cur.length >= 3 ? cur : [...cur, v];
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
    <DiscordMessage botAvatar={botAvatar} jam={jam} compact={compact}>
      <V2Container color={color}>
        <V2Section
          subtext="NOXA Sound • Musik"
          title={song.name}
          titleEmoji={providerEmoji}
          titleUrl="#"
          lines={[
            <FieldLine key="owner" label="Pemilik:">
              {song.autoplay ? <span className="italic">Rekomendasi Otomatis (Autoplay)</span> : <Mention name="demo_tester" />}
            </FieldLine>,
            chat.length ? (
              <div key="chat" className="space-y-0.5">
                <div className="font-bold text-[#F2F3F5]">Live Chat</div>
                {chat.map((c, i) => (
                  <div key={i} className="italic text-[#B5BAC1]">{`> ${c.user}: ${c.text}`}</div>
                ))}
              </div>
            ) : null,
          ].filter(Boolean)}
          accessory={(
            <DiscordButton
              emoji="podcast"
              label="Podcast"
              onClick={() => onSwitch('podcast')}
              title="Alihkan ke Mode Podcast"
              compact={compact}
            />
          )}
        />

        <V2Separator />

        <V2Media>
          <MusicCard
            title={song.name}
            artist={song.uploader}
            pos={pos}
            duration={song.duration}
            paused={paused}
            color={color}
            volume={volume}
            quality={QUALITY}
            loopStatus={loop.status}
            acakStatus={shuffle ? 'Aktif' : 'Mati'}
            autoplayOn={autoplay}
            effects={effectsLabel(filters)}
          />
        </V2Media>

        <V2Media>
          <ProgressCapsule width={680} pos={pos} duration={song.duration} paused={paused} color={color} />
        </V2Media>

        <V2Separator />

        {/* Row 1: Suka, Loop, Tambah Lagu */}
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

        {/* Row 2: Mundur, Jeda/Lanjut, Maju, Berhenti, Lewati */}
        <ActionRow compact={compact}>
          <DiscordButton emoji="mundur" label="Mundur" onClick={() => { setPos((p) => Math.max(0, p - 10)); setOpenPop(null); }} compact={compact} />
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
          <DiscordButton emoji="berhenti" label="Berhenti" onClick={() => { onSwitch('standby'); setOpenPop(null); }} compact={compact} />
          <DiscordButton emoji="lewati" label="Lewati" disabled={isQueueEmpty} onClick={nextTrack} compact={compact} />
        </ActionRow>

        {/* Row 3: dropdown Fitur Lainnya — 9 opsi persis bot */}
        <div className="relative">
          <DiscordSelectMenu
            placeholder="Fitur Lainnya"
            isOpen={openPop === 'dropdown'}
            onToggle={() => setOpenPop(openPop === 'dropdown' ? null : 'dropdown')}
            compact={compact}
          >
            <div className="absolute inset-x-0 bottom-full z-30 mb-2 shadow-2xl">
              <MenuBox maxHeight="max-h-64">
                <MenuRow emoji="antrian" label="Antrian Lagu" onClick={() => setOpenPop('queue')} />
                <MenuRow emoji="lirik" label="Lirik Lagu" onClick={() => setOpenPop('lyrics')} />
                <MenuRow emoji="chat" label="Live Chat" onClick={() => setOpenPop('chat')} />
                <MenuRow emoji="suara" label="Atur Volume" onClick={() => setOpenPop('volume')} />
                <MenuRow emoji="autoplay" label="Autoplay" onClick={() => { setAutoplay((a) => !a); setOpenPop(null); }} />
                <MenuRow emoji="efek" label="Efek Suara & EQ" onClick={() => setOpenPop('effects')} />
                <MenuRow emoji="userprofile" label="Profil Pendengar" onClick={() => setOpenPop('profile')} />
                <MenuRow emoji="playlist" label="Koleksi Playlist" onClick={() => setOpenPop('playlists')} />
                <MenuRow emoji="Shuffle" label="Acak Antrian" onClick={() => { setShuffle((s) => !s); setOpenPop(null); }} />
              </MenuBox>
            </div>
          </DiscordSelectMenu>

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
              <ChatPop chat={chat} onSend={(t) => setChat((c) => [...c, { user: 'kamu', text: t }])} />
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

        <V2Separator />
        <V2Footer text={footerText} />
      </V2Container>
    </DiscordMessage>
  );
}

// ---------- PODCAST ----------
function PodcastPanel({ jam, botAvatar, onSwitch, compact }) {
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

  const ep = DEMO_PODCASTS[idx];
  const providerEmoji = PROVIDER_EMOJI[ep.provider];
  const likeCount = liked ? 5 : 4;
  const themeLabel = PODCAST_TEMA.find(([, e]) => e === theme)?.[0] || 'Obrolan Santai';
  const hasUpcoming = idx < DEMO_PODCASTS.length - 1;
  const color = '#B80012';
  const antrean = Math.max(0, DEMO_PODCASTS.length - 1 - idx);

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

  const podFooter = hasUpcoming
    ? `Berikutnya: ${DEMO_PODCASTS[idx + 1].name.substring(0, 45)}... • ${antrean} di antrean`
    : 'Berikutnya: Tidak ada (Episode terakhir di antrean)';

  return (
    <DiscordMessage botAvatar={botAvatar} jam={jam} compact={compact}>
      <V2Container color={color}>
        <V2Section
          subtext="NOXA Sound • Podcast"
          title={ep.name}
          titleEmoji={providerEmoji}
          titleUrl="#"
          lines={[
            <FieldLine key="owner" label="Pemilik Podcast:"><Mention name="demo_tester" /></FieldLine>,
          ]}
          accessory={(
            <DiscordButton
              emoji="musik"
              label="Musik"
              onClick={() => onSwitch('music')}
              title="Alihkan ke Mode Musik"
              compact={compact}
            />
          )}
        />

        <V2Separator />

        <V2Media>
          <PodcastCard
            title={ep.name}
            channel={ep.uploader}
            theme={themeLabel}
            language={lang}
            antrean={antrean}
            volume={volume}
            paused={paused}
            color={color}
          />
        </V2Media>

        <V2Media>
          <ProgressCapsule width={620} pos={pos} duration={ep.duration} paused={paused} color={color} />
        </V2Media>

        <V2Separator />

        <ActionRow compact={compact}>
          <DiscordButton emoji="mundurpodcast" label="Mundur" onClick={() => setPos((p) => Math.max(0, p - 30))} compact={compact} />
          <DiscordButton
            emoji={paused ? 'mulai' : 'jeda'}
            label={paused ? 'Lanjut' : 'Jeda'}
            style={paused ? 'primary' : 'secondary'}
            onClick={() => setPaused((p) => !p)}
            compact={compact}
          />
          <DiscordButton emoji="majuupodcast" label="Maju" onClick={() => setPos((p) => Math.min(ep.duration, p + 30))} compact={compact} />
          <DiscordButton emoji="berhenti" label="Berhenti" onClick={() => onSwitch('standby')} compact={compact} />
          <DiscordButton
            emoji="lewati"
            label="Lewati"
            disabled={!hasUpcoming}
            onClick={() => { setIdx((i) => Math.min(DEMO_PODCASTS.length - 1, i + 1)); setPos(0); }}
            compact={compact}
          />
        </ActionRow>

        <ActionRow compact={compact}>
          <DiscordButton
            emoji={likeCount > 0 ? 'sukapenuh' : 'sukakosong'}
            label={`${likeCount}`}
            onClick={() => setLiked((l) => !l)}
            title="Suka episode ini"
            compact={compact}
          />
        </ActionRow>

        <div className="relative">
          <DiscordSelectMenu
            placeholder="Fitur Lainnya"
            isOpen={openPop === 'dropdown'}
            onToggle={() => setOpenPop(openPop === 'dropdown' ? null : 'dropdown')}
            compact={compact}
          >
            <div className="absolute inset-x-0 bottom-full z-30 mb-2 shadow-2xl">
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

        <V2Separator />
        <V2Footer text={podFooter} />
      </V2Container>
    </DiscordMessage>
  );
}

// ---------- RADIO 24/7 ----------
function RadioPanel({ jam, botAvatar, onSwitch, compact }) {
  const [openPop, setOpenPop] = useState(null);
  const color = '#FF101F';

  return (
    <DiscordMessage botAvatar={botAvatar} jam={jam} compact={compact}>
      <V2Container color={color}>
        <V2Section
          subtext="NOXA Sound • Radio 24/7"
          title={DEMO_RADIO.name}
          titleEmoji="Youtube"
          titleUrl="#"
          lines={[
            <FieldLine key="host" label="Penyiar:"><Mention name={DEMO_RADIO.host} /></FieldLine>,
          ]}
        />

        <V2Separator />

        <V2Media>
          <RadioCard
            title={DEMO_RADIO.name}
            artist={DEMO_RADIO.uploader}
            color={color}
            volume={100}
            quality={QUALITY}
          />
        </V2Media>

        <V2Separator />

        <ActionRow compact={compact}>
          <DiscordButton emoji="lirik" label="Lirik Lagu" onClick={() => setOpenPop('lyrics')} compact={compact} />
          <DiscordButton emoji="berhenti" label="Hentikan Radio" onClick={() => onSwitch('standby')} compact={compact} />
        </ActionRow>

        <V2Separator />
        <V2Footer text="NOXA Sound • Radio 24/7" />

        {openPop === 'lyrics' && (
          <PopupModal title="Lirik Lagu Radio" onClose={() => setOpenPop(null)}>
            <LyricsPop song={{ name: DEMO_RADIO.name, uploader: DEMO_RADIO.uploader }} />
          </PopupModal>
        )}
      </V2Container>
    </DiscordMessage>
  );
}

// ---------- STANDBY ----------
function StandbyPanel({ jam, botAvatar, onSwitch, compact }) {
  return (
    <DiscordMessage botAvatar={botAvatar} jam={jam} compact={compact}>
      <V2Container>
        <V2Section
          title={<span><Emoji name="finish" size={16} className="mr-1.5" />Sesi Selesai</span>}
          lines={[
            <span key="desc" className="inline-flex flex-wrap items-center gap-1.5">
              Antrian kosong. Pesan ini akan otomatis dibersihkan <Emoji name="bersih" size={16} />
            </span>,
          ]}
        />

        <V2Separator />

        <ActionRow compact={compact}>
          <DiscordButton emoji="tambahmusik" label="Tambah Lagu" onClick={() => onSwitch('music')} compact={compact} />
          <DiscordButton emoji="podcast" label="Podcast" onClick={() => onSwitch('podcast')} compact={compact} />
        </ActionRow>

        <V2Separator />
        <V2Footer text="NOXA Sound • Auto-Clean" />
      </V2Container>
    </DiscordMessage>
  );
}

// ---------- Modal & isi menu ----------
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
      <div className="fixed inset-0 z-40 cursor-default bg-black/75 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[85vh] max-w-sm -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-[#16171A] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] sm:max-w-md sm:p-5">
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#FF101F] shadow-[0_0_8px_#FF101F]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white sm:text-sm">{title || 'Menu NOXA'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-white/10 bg-[#232428] px-2.5 py-1 text-xs font-bold text-[#949BA4] transition-colors hover:text-white"
          >
            ✕ Tutup
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

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

      <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-white/5 bg-[#1E1F22] p-1">
        <button
          type="button"
          onClick={() => setMode('live')}
          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-semibold transition-all ${
            mode === 'live' ? 'bg-[#5865F2] text-white' : 'text-[#949BA4] hover:text-white'
          }`}
        >
          <Emoji name="livelirik" size={14} />
          <span>Live Karaoke</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('script')}
          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-semibold transition-all ${
            mode === 'script' ? 'bg-[#5865F2] text-white' : 'text-[#949BA4] hover:text-white'
          }`}
        >
          <Emoji name="songlyrics" size={14} />
          <span>Skrip Penuh</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-[#1E1F22] p-2.5">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-bold text-white">{title}</div>
          <div className="truncate text-[11px] text-[#949BA4]">{uploader}</div>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          Terverifikasi
        </span>
      </div>

      {mode === 'live' ? (
        <div className="select-none space-y-2 rounded-xl border border-white/5 bg-[#1E1F22] p-3.5 text-[12px] leading-relaxed">
          <div className="text-[11px] text-[#80848E]">[00:18] Di antara deru kota yang terlelap...</div>
          <div className="text-[11.5px] text-[#949BA4]">[00:26] Ku melangkah mencari arti senyumanmu...</div>
          <div className="flex items-center gap-2.5 rounded-lg border border-[#FF101F]/50 bg-[#FF101F]/15 px-3 py-2 font-semibold text-white shadow-[0_0_15px_rgba(255,16,31,0.2)]">
            <span className="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#FF101F]" />
            <span className="min-w-0 flex-1 break-words text-[12.5px]">▶ [00:38] Senja datang membawa semua bayanganmu</span>
          </div>
          <div className="text-[11.5px] text-[#949BA4]">[00:47] Menemani sepi malam yang sunyi...</div>
          <div className="text-[11px] text-[#80848E]">[00:58] Dan ku tahu waktu kan menjawabnya...</div>
        </div>
      ) : (
        <div className="max-h-48 space-y-2.5 overflow-y-auto rounded-xl border border-white/5 bg-[#1E1F22] p-3.5 text-[12px] leading-relaxed text-[#DBDEE1]">
          <p>
            Di antara deru kota yang terlelap<br />
            Ku melangkah mencari arti senyumanmu<br />
            Malam berlari mengejar bayang rindu
          </p>
          <p className="border-l-2 border-[#FF101F] pl-2.5 font-medium text-white">
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
        <b className="font-mono text-sm text-white">{value}%</b>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={150}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full cursor-pointer accent-[#FF101F]"
        />

        <div className="flex flex-wrap gap-1.5 pt-1">
          {[25, 50, 80, 100, 125, 150].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => { setInput(v); onSet(v); }}
              className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                Number(input) === v ? 'bg-[#FF101F] text-white' : 'bg-[#232428] text-[#949BA4] hover:bg-[#2B2D31] hover:text-white'
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
          className="shrink-0 cursor-pointer rounded-xl bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4752C4]"
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

      <div className="flex flex-wrap gap-1.5">
        {['30', '1:00', '2:30', '5:00', '10:00'].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => { setInput(val); onSubmit(val); }}
            className="cursor-pointer rounded-md border border-white/5 bg-[#232428] px-2.5 py-1 text-xs font-semibold text-[#949BA4] transition hover:bg-[#2B2D31] hover:text-white"
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
          className="shrink-0 cursor-pointer rounded-xl bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4752C4]"
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
            <MenuRow key={val} emoji={emoji} label={label} selected={BASS_SET.has(val) && filters.includes(val)} onClick={() => onPick(val)} />
          ))}
        </MenuBox>
      </div>
      <div>
        <PopTitle>Kecepatan</PopTitle>
        <MenuBox maxHeight="max-h-36">
          {FILTER_SPEED.map(([label, emoji, val]) => (
            <MenuRow key={val} emoji={emoji} label={label} selected={SPEED_SET.has(val) && filters.includes(val)} onClick={() => onPick(val)} />
          ))}
        </MenuBox>
      </div>
      <div>
        <PopTitle>Efek Lainnya (Maks 3)</PopTitle>
        <MenuBox maxHeight="max-h-44">
          {FILTER_OTHER.map(([label, emoji, val]) => (
            <MenuRow key={val} emoji={emoji} label={label} selected={filters.includes(val)} onClick={() => onPick(val)} />
          ))}
        </MenuBox>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3B3E45] px-3 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#4E5058]"
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
          <MenuRow key={emoji} emoji={emoji} label={nama} selected={current === emoji} onClick={() => onPick(emoji)} />
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
          <MenuRow key={l} label={l} selected={current === l} onClick={() => onPick(l)} />
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
      <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-white/5 bg-[#1E1F22] p-2">
        {chat.slice(-4).map((c, i) => (
          <div key={i} className="flex items-start gap-1.5 break-words text-[12px] text-[#DBDEE1]">
            <span className="shrink-0 font-semibold text-emerald-400">{c.user}:</span>
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
          className="shrink-0 cursor-pointer rounded-xl bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4752C4]"
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