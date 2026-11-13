// Renderer kartu bagikan NOXA Sound (profil & leaderboard).
//
// Bahasa visual: mengikuti keanggunan kartu profil bot (panel solid gelap,
// potongan diagonal merah, judul panel beraksen, baris data berikon), TAPI
// dengan ciri khas web: latar obsidian hangat + hex NOXA, watermark logo besar
// di belakang identitas, pelat peringkat untuk mode leaderboard, dan garis
// aksen tier pemilik kartu.
//
// Prinsip supaya tidak blur (masalah kartu versi lama):
//   1. Avatar Discord diminta ulang pada ?size=256, bukan 64 bawaan.
//   2. Tanpa shadowBlur pada teks - kedalaman dari panel solid + garis aksen.
//   3. Semua koordinat bilangan bulat; canvas diekspor 1:1 (1080x1350).
//
// Semua permukaan SOLID (hex). Kartu semi transparan terbaca murah dan
// watermark latar bocor ke dalam panel.
import { SITE_URL } from './site';
import { emojiSrc } from './noxa-emojis';

const W = 1080;
const H = 1350;
const PAD = 56;
const LEBAR = W - PAD * 2; // 968

const WARNA = {
  bgTop: '#05040A',
  bgMid: '#110612',
  bgBottom: '#1D060B',
  crimson: '#B80012',
  neon: '#FF101F',
  violet: '#7B2CE0',
  magenta: '#E0238A',
  panel: '#120B13',
  panel2: '#1B0F1A',
  row: '#170D16',
  rowTop: '#21121F',
  line: '#3A2233',
  ink: '#F7F3F4',
  muted: '#ADA1A8',
  faint: '#7C7076',
  gold: '#F6C445',
  silver: '#CBD5E1',
  bronze: '#D08A4E',
  green: '#2FD15A',
};

// Aksen per tier NOXA Pass (cincin avatar, garis aksen, statistik).
const AKSEN_TIER = {
  free: '#FF101F',
  premium: '#F5A524',
  'premium-plus': '#D7DEE8',
  'premium-ultimate': '#A855F7',
};

// Palet pill tier. `chip` = kepingan gelap opak di belakang ikon emoji supaya
// logo tier yang warnanya nyaris sama dengan pill tetap terbaca.
const TIER_STYLE = {
  free: { label: 'NOXA USER', bg: '#1C080C', text: '#F6F2F1', border: '#B80012', chip: '#0B0406' },
  premium: { label: 'NOXA PREMIUM', bg: '#F0A63C', text: '#1A0F00', border: '#FFD08A', chip: '#1A0F00' },
  'premium-plus': { label: 'NOXA PREMIUM+', bg: '#CBD5E1', text: '#0B1016', border: '#F1F5F9', chip: '#0B1016' },
  'premium-ultimate': { label: 'NOXA PREMIUM ULTIMATE', bg: '#7C3AED', text: '#FFFFFF', border: '#C4B5FD', chip: '#1B0B33' },
};

const BADGE_SRC = {
  premium: '/badges/noxa-premium.png?v=2',
  'premium-plus': '/badges/noxa-premium-plus.png?v=2',
  'premium-ultimate': '/badges/noxa-premium-ultimate.png?v=2',
};

// Medali peringkat: emas, perak, perunggu, lalu merah NOXA.
const MEDALI = {
  1: { bg: WARNA.gold, text: '#1A1200', label: 'JUARA 1', emoji: 'number1' },
  2: { bg: WARNA.silver, text: '#0B1016', label: 'JUARA 2', emoji: 'number2' },
  3: { bg: WARNA.bronze, text: '#1A0D00', label: 'JUARA 3', emoji: 'number3' },
};
const medaliUntuk = (rank) => MEDALI[rank] || { bg: WARNA.crimson, text: '#FFFFFF', label: `TOP ${rank || ''}`.trim(), emoji: null };

const DOMAIN_MEREK = 'noxasound.site';

// ---------------------------------------------------------------------------
// Pemuat aset
// ---------------------------------------------------------------------------

function loadImg(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    let selesai = false;
    const beres = (hasil) => {
      if (selesai) return;
      selesai = true;
      clearTimeout(timer);
      resolve(hasil);
    };
    const timer = setTimeout(() => beres(null), 6000);
    img.crossOrigin = 'anonymous';
    img.onload = () => beres(img);
    img.onerror = () => beres(null);
    img.src = src;
  });
}

function emojiImg(nama, size = 128) {
  const src = emojiSrc(nama, size);
  return src ? loadImg(src) : null;
}

function avatarHiRes(url, size = 256) {
  if (!url) return null;
  if (!url.includes('cdn.discordapp.com')) return url;
  return url.replace(/size=\d+/, `size=${size}`);
}

// ---------------------------------------------------------------------------
// Helper gambar & teks
// ---------------------------------------------------------------------------

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function rgba(hex, alpha) {
  const h = String(hex || '#FF101F').replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16);
  if (!Number.isFinite(n)) return `rgba(255,16,31,${alpha})`;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const font = (ukuran, tebal = 700) => `${tebal} ${ukuran}px "Segoe UI", system-ui, sans-serif`;

/** Perkecil font sampai teks muat, bukan memotong. */
function tulisMuat(ctx, teks, x, y, maksLebar, ukuran, minimal, gaya = 'bold', align = 'left') {
  let uk = ukuran;
  ctx.textAlign = align;
  ctx.font = font(uk, gaya);
  const t = String(teks || '');
  while (ctx.measureText(t).width > maksLebar && uk > minimal) {
    uk -= 1;
    ctx.font = font(uk, gaya);
  }
  ctx.fillText(t, x, y);
  return uk;
}

/** Satu baris dengan ukuran tetap; kepanjangan dipotong rapi pakai "...". */
function tulisPotong(ctx, teks, x, y, maksLebar, ukuran, gaya = '700', align = 'left') {
  const t = String(teks || '');
  ctx.textAlign = align;
  ctx.font = font(ukuran, gaya);
  if (ctx.measureText(t).width <= maksLebar) {
    ctx.fillText(t, x, y);
    return;
  }
  const cp = Array.from(t);
  let potong = cp;
  while (potong.length > 1 && ctx.measureText(`${potong.join('')}...`).width > maksLebar) {
    potong = potong.slice(0, -1);
  }
  ctx.fillText(`${potong.join('').trimEnd()}...`, x, y);
}

/** Panel solid: isi + garis tepi, sudut membulat. */
function panel(ctx, x, y, w, h, r, { fill = WARNA.panel, stroke = WARNA.line, tebal = 2 } = {}) {
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = tebal;
    roundRect(ctx, x, y, w, h, r);
    ctx.stroke();
  }
}

/** Wedge diagonal: ciri khas kartu NOXA (potongan warna di sudut panel). */
function wedge(ctx, x, y, w, h, warna, alpha = 0.5, arah = 'kiri-atas') {
  ctx.save();
  ctx.beginPath();
  if (arah === 'kiri-atas') {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x, y + h);
  } else {
    ctx.moveTo(x + w, y + h);
    ctx.lineTo(x + w, y + h - h);
    ctx.lineTo(x, y + h);
  }
  ctx.closePath();
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, rgba(warna, alpha));
  grad.addColorStop(1, rgba(warna, 0));
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

/** Pola heksagon tipis khas NOXA. */
function hexGrid(ctx, alpha = 0.045, warnaGaris = 'rgba(255,43,58,1)') {
  const r = 36;
  const h = Math.sqrt(3) * r;
  const stepX = r * 1.5;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = warnaGaris;
  ctx.lineWidth = 1.3;
  for (let col = -1; col * stepX < W + r * 2; col += 1) {
    for (let row = -1; row * h < H + h; row += 1) {
      const cx = col * stepX;
      const cy = row * h + (col % 2 ? h / 2 : 0);
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** Teks berjarak huruf (label seksi) - elegan, ala tipografi sampul album. */
function jarak(ctx, px) {
  try {
    ctx.letterSpacing = px;
  } catch {
    /* browser lama: abaikan */
  }
}

/**
 * Aurora mesh: 4 bloom radial dicampur 'screen' di atas obsidian. Ciri khas
 * platform musik (blood-crimson + violet + magenta), bukan blob acak.
 */
function aurora(ctx, aksen) {
  const blooms = [
    { x: 150, y: 40, r: 940, c: WARNA.neon, a: 0.20 },
    { x: W + 60, y: 300, r: 860, c: aksen, a: 0.18 },
    { x: 660, y: H + 80, r: 960, c: WARNA.violet, a: 0.15 },
    { x: 30, y: 780, r: 640, c: WARNA.magenta, a: 0.09 },
  ];
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const b of blooms) {
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    g.addColorStop(0, rgba(b.c, b.a));
    g.addColorStop(0.5, rgba(b.c, b.a * 0.34));
    g.addColorStop(1, rgba(b.c, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/** Vignette: meredam tepi supaya fokus ke identitas - kesan cetak premium. */
function vignette(ctx) {
  const g = ctx.createRadialGradient(W / 2, H * 0.42, 260, W / 2, H * 0.5, 1000);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/**
 * Equalizer spektrum cermin: inti ciri musik. Batang naik dari tengah dengan
 * bayangan redup di bawah - terbaca sebagai "sedang memutar", bukan ornamen.
 */
function equalizer(ctx, x, y, w, h, warna, n = 42) {
  const gap = 7;
  const bw = Math.max(3, Math.floor((w - gap * (n - 1)) / n));
  const cy = y + h / 2;
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, rgba(warna, 0.95));
  grad.addColorStop(1, rgba(warna, 0.3));
  ctx.fillStyle = grad;
  for (let i = 0; i < n; i += 1) {
    const t = i / (n - 1);
    const amp = Math.pow(Math.sin(t * Math.PI), 0.75);
    const gel = 0.42 + 0.58 * Math.abs(Math.sin(i * 0.71 + 0.3));
    const half = Math.max(3, Math.round((h / 2) * amp * gel));
    const bx = x + i * (bw + gap);
    roundRect(ctx, bx, cy - half, bw, half * 2, Math.max(2, Math.floor(bw / 2)));
    ctx.fill();
    ctx.fillStyle = rgba(warna, 0.12);
    roundRect(ctx, bx, cy + half + 5, bw, half, Math.max(2, Math.floor(bw / 2)));
    ctx.fill();
    ctx.fillStyle = grad;
  }
}

function watermark(ctx, logoImg, cx, cy, size, alpha = 0.12) {
  if (!logoImg) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(logoImg, cx - size / 2, cy - size / 2, size, size);
  ctx.restore();
}

function hostTampil() {
  try {
    const host = new URL(SITE_URL).host;
    if (!host || host.includes('localhost') || host.startsWith('127.') || host.includes('vercel.app')) {
      return DOMAIN_MEREK;
    }
    return host;
  } catch {
    return DOMAIN_MEREK;
  }
}

/** Judul panel: ikon + teks uppercase + garis pemisah tipis (gaya bot). */
function judulPanel(ctx, x, y, w, teks, emoji, aksen) {
  const tinggiHeader = 62;
  ctx.fillStyle = WARNA.panel2;
  roundRect(ctx, x, y, w, tinggiHeader, 20);
  ctx.fill();
  ctx.save();
  roundRect(ctx, x, y, w, tinggiHeader, 20);
  ctx.clip();
  wedge(ctx, x + w - 210, y, 210, tinggiHeader, aksen, 0.42, 'kanan-atas');
  ctx.restore();
  ctx.strokeStyle = rgba(aksen, 0.55);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 20, y + tinggiHeader);
  ctx.lineTo(x + w - 20, y + tinggiHeader);
  ctx.stroke();

  if (emoji) ctx.drawImage(emoji, x + 22, y + tinggiHeader / 2 - 16, 32, 32);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = aksen;
  ctx.font = font(22, '800');
  jarak(ctx, '1.5px');
  ctx.fillText(teks, x + (emoji ? 66 : 24), y + tinggiHeader / 2 + 9);
  jarak(ctx, '0px');
  return y + tinggiHeader;
}

/** Kotak statistik gaya bot: ikon kiri, label kecil, nilai besar kanan. */
function barisStat(ctx, x, y, w, h, { label, nilai, emoji, aksen }) {
  panel(ctx, x, y, w, h, 20, { fill: WARNA.row, stroke: WARNA.line });
  ctx.fillStyle = aksen;
  roundRect(ctx, x + 18, y + 22, 5, h - 44, 2.5);
  ctx.fill();

  const cx = x + 62;
  const cy = y + h / 2;
  if (emoji) ctx.drawImage(emoji, cx - 19, cy - 19, 38, 38);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = WARNA.muted;
  ctx.font = font(19, '700');
  ctx.fillText(label, x + 112, cy + 8);

  ctx.textAlign = 'right';
  ctx.fillStyle = WARNA.ink;
  tulisMuat(ctx, nilai, x + w - 26, cy + 12, w - 320, 38, 22, 'bold', 'right');
  ctx.textAlign = 'left';
}

/** Pill tier NOXA Pass (solid, ikon pada kepingan gelap). */
function pillTier(ctx, tier, centerX, y, icon) {
  const st = TIER_STYLE[tier] || TIER_STYLE.free;
  const iconSize = 34;
  const padX = 24;
  const gap = icon ? 12 : 0;
  const maksLabel = LEBAR - 40 - padX * 2 - (icon ? iconSize + gap : 0);

  let uk = 22;
  ctx.font = font(uk, 'bold');
  while (ctx.measureText(st.label).width > maksLabel && uk > 13) {
    uk -= 1;
    ctx.font = font(uk, 'bold');
  }
  const labelW = ctx.measureText(st.label).width;
  const lebar = padX * 2 + (icon ? iconSize + gap : 0) + labelW;
  const h = 54;
  const x = centerX - lebar / 2;

  ctx.fillStyle = st.bg;
  roundRect(ctx, x, y - h / 2, lebar, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = st.border;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y - h / 2, lebar, h, h / 2);
  ctx.stroke();

  let tx = x + padX;
  if (icon) {
    const chipR = iconSize / 2 + 5;
    ctx.fillStyle = st.chip || '#0B1016';
    ctx.beginPath();
    ctx.arc(tx + iconSize / 2, y, chipR, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(icon, tx, y - iconSize / 2, iconSize, iconSize);
    tx += iconSize + gap;
  }
  ctx.fillStyle = st.text;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(st.label, tx, y + 1);
  ctx.textBaseline = 'alphabetic';
}

/** Pelat peringkat besar (identitas mode leaderboard). */
function pelatPeringkat(ctx, cx, cy, size, medali, rank) {
  const x = cx - size / 2;
  const y = cy - size / 2;
  panel(ctx, x, y, size, size, 26, { fill: WARNA.panel2, stroke: medali.bg, tebal: 3 });
  ctx.save();
  roundRect(ctx, x, y, size, size, 26);
  ctx.clip();
  wedge(ctx, x + size - size * 0.55, y, size * 0.55, size, medali.bg, 0.35, 'kanan-atas');
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = medali.bg;
  const label = rank ? `#${rank}` : 'TOP';
  let uk = 64;
  ctx.font = font(uk, '900');
  while (ctx.measureText(label).width > size - 48 && uk > 26) {
    uk -= 4;
    ctx.font = font(uk, '900');
  }
  ctx.fillText(label, cx, cy + 2);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillStyle = medali.bg;
  roundRect(ctx, x + 20, y + size - 24, size - 40, 4, 2);
  ctx.fill();
}

/** Satu baris lagu: nomor, cover, judul, sub, durasi. */
async function barisLagu(ctx, x, y, w, h, i, lagu, emoji, aksen) {
  panel(ctx, x, y, w, h, 18, { fill: i === 0 ? WARNA.rowTop : WARNA.row, stroke: i === 0 ? rgba(aksen, 0.5) : WARNA.line });

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = i === 0 ? aksen : WARNA.faint;
  ctx.font = font(26, '900');
  ctx.fillText(String(i + 1), x + 24, y + h / 2 + 9);

  const ts = 54;
  const tx = x + 60;
  const ty = y + (h - ts) / 2;
  const thumb = lagu.thumb ? await loadImg(lagu.thumb) : null;
  if (thumb) {
    ctx.save();
    roundRect(ctx, tx, ty, ts, ts, 12);
    ctx.clip();
    ctx.drawImage(thumb, tx, ty, ts, ts);
    ctx.restore();
    ctx.strokeStyle = WARNA.line;
    ctx.lineWidth = 1.5;
    roundRect(ctx, tx, ty, ts, ts, 12);
    ctx.stroke();
  } else {
    panel(ctx, tx, ty, ts, ts, 12, { fill: WARNA.panel2, stroke: null });
    if (emoji) ctx.drawImage(emoji, tx + 13, ty + 13, 28, 28);
  }

  const infoX = tx + ts + 18;
  const lebarTeks = w - (infoX - x) - 130;
  ctx.fillStyle = WARNA.ink;
  tulisPotong(ctx, lagu.name || 'Lagu', infoX, y + h / 2 + 2, lebarTeks, 24);
  ctx.fillStyle = WARNA.faint;
  ctx.font = font(18, '500');
  ctx.fillText(lagu.count ? `${lagu.count} kali diputar` : 'lagu favorit', infoX, y + h / 2 + 28);

  if (lagu.durationLabel) {
    ctx.textAlign = 'right';
    ctx.fillStyle = aksen;
    ctx.font = font(23, '800');
    ctx.fillText(lagu.durationLabel, x + w - 24, y + h / 2 + 9);
    ctx.textAlign = 'left';
  }
}

/** Avatar bulat dengan cincin aksen ganda + pedagang cahaya lembut. */
async function avatar(ctx, cx, cy, r, url, username, aksen) {
  const glow = ctx.createRadialGradient(cx, cy, r - 12, cx, cy, r + 62);
  glow.addColorStop(0, rgba(aksen, 0.30));
  glow.addColorStop(1, rgba(aksen, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 62, 0, Math.PI * 2);
  ctx.fill();

  const av = await loadImg(avatarHiRes(url));
  if (av) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(av, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  } else {
    const fallback = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    fallback.addColorStop(0, rgba(aksen, 0.5));
    fallback.addColorStop(1, rgba(aksen, 0.95));
    ctx.fillStyle = fallback;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = font(Math.round(r * 0.9), 'bold');
    ctx.textAlign = 'center';
    ctx.fillText(String(username || 'A').slice(0, 1).toUpperCase(), cx, cy + r * 0.32);
  }

  ctx.strokeStyle = aksen;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = rgba(aksen, 0.4);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 18, 0, Math.PI * 2);
  ctx.stroke();

  // Alur piringan hitam (groove) - jejak busur tipis di luar cincin.
  ctx.strokeStyle = rgba(aksen, 0.22);
  ctx.lineWidth = 1.5;
  for (const rr of [r + 28, r + 37]) {
    ctx.beginPath();
    ctx.arc(cx, cy, rr, Math.PI * 0.16, Math.PI * 0.84);
    ctx.stroke();
  }
}

/** Nama pendengar; panjang dipecah dua baris, bukan dikecilkan habis. */
function tulisNama(ctx, teks, cx, y, maksLebar, ukuran) {
  const t = String(teks || 'Pendengar');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let uk = ukuran;
  const setFont = () => { ctx.font = font(uk, 'bold'); };
  setFont();

  if (ctx.measureText(t).width <= maksLebar) {
    ctx.fillText(t, cx, y);
    return y;
  }
  while (uk > 42 && ctx.measureText(t).width > maksLebar) {
    uk -= 2;
    setFont();
  }
  if (ctx.measureText(t).width <= maksLebar) {
    ctx.fillText(t, cx, y);
    return y;
  }
  const cp = Array.from(t);
  let tengah = Math.ceil(cp.length / 2);
  for (let d = 0; d < 12; d += 1) {
    if (cp[tengah - d] === ' ') { tengah -= d; break; }
    if (cp[tengah + d] === ' ') { tengah += d; break; }
  }
  const baris1 = cp.slice(0, tengah).join('').trim();
  const baris2 = cp.slice(tengah).join('').trim();
  const muat = () => Math.max(ctx.measureText(baris1).width, ctx.measureText(baris2).width) <= maksLebar;
  while (!muat() && uk > 28) {
    uk -= 2;
    setFont();
  }
  const jarak = Math.round(uk * 0.52);
  ctx.fillText(baris1, cx, y - jarak + 6);
  ctx.fillText(baris2, cx, y + jarak + 6);
  return y + jarak + 6;
}

// ---------------------------------------------------------------------------
// Render utama
// ---------------------------------------------------------------------------

export async function renderShareCard({
  mode = 'profil',
  username,
  avatar: avatarUrl,
  durationLabel = '0m',
  plays = 0,
  rank = null,
  songs = [],
  premiumTier = null,
  serverName = null,
  serverDuration = null,
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  const rankMode = mode === 'rank';
  const tier = TIER_STYLE[premiumTier] ? premiumTier : 'free';
  const medali = medaliUntuk(rank);
  const aksenTier = AKSEN_TIER[tier];
  const aksen = rankMode ? medali.bg : aksenTier;

  const tierEmojiName = tier === 'premium'
    ? 'noxapremium'
    : tier === 'premium-plus'
      ? 'noxapremiumplus'
      : tier === 'premium-ultimate'
        ? 'noxapremiumultimate'
        : 'userprofile';

  const [logoImg, badgeImg, tierIcon, eJam, eMusik, eRadio, eParty, rankIcon] = await Promise.all([
    loadImg('/logo.png?v=4'),
    BADGE_SRC[premiumTier] ? loadImg(BADGE_SRC[premiumTier]) : null,
    emojiImg(tierEmojiName),
    emojiImg('jam'),
    emojiImg('musik'),
    emojiImg('radio'),
    emojiImg('party'),
    rankMode && medali.emoji ? emojiImg(medali.emoji) : null,
  ]);

  // ---------- Latar ----------
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, WARNA.bgTop);
  grad.addColorStop(0.5, WARNA.bgMid);
  grad.addColorStop(1, WARNA.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Aurora mesh: cahaya berlapis (crimson/violet/magenta) di atas obsidian.
  aurora(ctx, aksen);

  hexGrid(ctx, 0.038, 'rgba(255,43,58,1)');

  // Slash diagonal khas kartu NOXA (kiri atas & kanan bawah).
  ctx.save();
  const slash1 = ctx.createLinearGradient(0, 0, 340, 340);
  slash1.addColorStop(0, rgba(WARNA.neon, 0.45));
  slash1.addColorStop(1, rgba(WARNA.neon, 0));
  ctx.fillStyle = slash1;
  ctx.beginPath();
  ctx.moveTo(0, 310);
  ctx.lineTo(232, 0);
  ctx.lineTo(150, 0);
  ctx.lineTo(0, 220);
  ctx.closePath();
  ctx.fill();
  const slash2 = ctx.createLinearGradient(W, H, W - 340, H - 340);
  slash2.addColorStop(0, rgba(aksen, 0.4));
  slash2.addColorStop(1, rgba(aksen, 0));
  ctx.fillStyle = slash2;
  ctx.beginPath();
  ctx.moveTo(W, H - 300);
  ctx.lineTo(W - 240, H);
  ctx.lineTo(W - 150, H);
  ctx.lineTo(W, H - 210);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Glow lembut warna tier/medali di area identitas.
  const glow = ctx.createRadialGradient(540, 380, 60, 540, 380, 660);
  glow.addColorStop(0, rgba(aksen, 0.22));
  glow.addColorStop(1, rgba(aksen, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 900);

  // Watermark logo besar; inti logo tertutup avatar (pola NEXO/NOXA).
  watermark(ctx, logoImg, 540, 330, 820, 0.08);

  // Vignette sebelum panel: panel tetap solid & kontras, latar kedalaman.
  vignette(ctx);

  // ---------- Header band ----------
  const BAND_Y = 44;
  const BAND_H = 124;
  panel(ctx, PAD, BAND_Y, LEBAR, BAND_H, 24, { fill: WARNA.panel, stroke: WARNA.line });
  ctx.save();
  roundRect(ctx, PAD, BAND_Y, LEBAR, BAND_H, 24);
  ctx.clip();
  wedge(ctx, PAD + LEBAR - 300, BAND_Y, 300, BAND_H, aksen, 0.4, 'kanan-atas');
  ctx.restore();
  ctx.fillStyle = aksen;
  roundRect(ctx, PAD, BAND_Y, 8, BAND_H, 4);
  ctx.fill();

  if (logoImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(PAD + 74, BAND_Y + BAND_H / 2, 36, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, PAD + 38, BAND_Y + BAND_H / 2 - 36, 72, 72);
    ctx.restore();
    ctx.strokeStyle = rgba(aksen, 0.7);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(PAD + 74, BAND_Y + BAND_H / 2, 37, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = WARNA.ink;
  ctx.font = font(36, '800');
  ctx.fillText('NOXA Sound', PAD + 132, BAND_Y + 56);
  ctx.fillStyle = WARNA.faint;
  ctx.font = font(18, '700');
  jarak(ctx, '2px');
  ctx.fillText(
    rankMode ? 'LEADERBOARD  ·  TOP LISTENER' : 'KARTU PROFIL  ·  PENDENGAR NOXA',
    PAD + 132,
    BAND_Y + 88,
  );
  jarak(ctx, '0px');

  if (badgeImg) {
    // Lencana tier di kanan band (tameng NOXA), dengan dasar panel agar
    // logo terang tetap kontras di latar gelap.
    panel(ctx, W - PAD - 118, BAND_Y + BAND_H / 2 - 44, 88, 88, 20, { fill: WARNA.panel2, stroke: rgba(aksen, 0.5) });
    ctx.drawImage(badgeImg, W - PAD - 114, BAND_Y + BAND_H / 2 - 40, 80, 80);
  } else {
    ctx.textAlign = 'right';
    ctx.fillStyle = WARNA.faint;
    ctx.font = font(18, '700');
    ctx.fillText(hostTampil(), W - PAD - 30, BAND_Y + BAND_H / 2 + 7);
    ctx.textAlign = 'left';
  }

  // ---------- Identitas ----------
  const avY = 330;
  const avR = 112;
  await avatar(ctx, 540, avY, avR, avatarUrl, username, aksen);

  if (rankMode && rank === 1 && eParty) ctx.drawImage(eParty, 540 - 33, avY - avR - 86, 66, 66);
  if (rankMode) {
    // Pelat peringkat menempel di kanan avatar (ciri khas kartu leaderboard).
    pelatPeringkat(ctx, 540 + avR + 92, avY + 24, 132, medali, rank);
  }

  ctx.fillStyle = WARNA.ink;
  const namaBawah = tulisNama(ctx, username, 540, avY + avR + 66, 860, 56);

  let cursorY = namaBawah + 44;
  if (rankMode) {
    // Pill medali + emoji nomor (number1/2/3).
    const label = medali.label;
    ctx.font = font(22, 'bold');
    const pillW = ctx.measureText(label).width + 56;
    const totalW = pillW + (rankIcon ? 52 : 0);
    let px = 540 - totalW / 2;
    if (rankIcon) {
      ctx.drawImage(rankIcon, px, cursorY - 22, 44, 44);
      px += 52;
    }
    ctx.fillStyle = medali.bg;
    roundRect(ctx, px, cursorY - 24, pillW, 48, 24);
    ctx.fill();
    ctx.fillStyle = medali.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, px + pillW / 2, cursorY + 1);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    cursorY += 68;
  }
  if (!rankMode || tier !== 'free') {
    pillTier(ctx, tier, 540, cursorY, tierIcon);
    cursorY += 74;
  } else {
    cursorY += 12;
  }

  // ---------- Panel data ----------
  const FOOT_Y = H - PAD - 84;
  const GAP = 16;
  const daftar = Array.isArray(songs) ? songs.slice(0, 3) : [];

  // 1) Statistik (2 kotak sejajar, gaya baris bot).
  const statH = 100;
  const tileW = Math.round((LEBAR - GAP) / 2);
  barisStat(ctx, PAD, cursorY, tileW, statH, { label: 'TOTAL DIDENGAR', nilai: durationLabel, emoji: eJam, aksen });
  barisStat(ctx, PAD + tileW + GAP, cursorY, tileW, statH, { label: 'LAGU SELESAI', nilai: String(plays || 0), emoji: eMusik, aksen });
  let y = cursorY + statH + GAP;

  // 2) Top 3 lagu (kalau ada aktivitas).
  if (daftar.length > 0) {
    const headerH = 62;
    const sisaRuang = FOOT_Y - y - (serverName ? 116 + GAP : 0);
    // Tinggi baris memuai mengisi ruang sisa (maks 96) supaya tidak nganga.
    const rowH = Math.max(76, Math.min(96, Math.floor((sisaRuang - headerH - GAP - 8 * (daftar.length - 1)) / daftar.length)));
    panel(ctx, PAD, y, LEBAR, headerH + 8 + daftar.length * rowH + (daftar.length - 1) * 8 + 8, 24, { fill: WARNA.panel, stroke: WARNA.line });
    judulPanel(ctx, PAD, y, LEBAR, 'TOP 3 SONGS', eMusik, aksen);
    let ry = y + headerH + 8;
    for (let i = 0; i < daftar.length; i += 1) {
      await barisLagu(ctx, PAD + 14, ry, LEBAR - 28, rowH, i, daftar[i], eMusik, aksen);
      ry += rowH + 8;
    }
    y = ry + 8;
  }

  // 3) Server favorit.
  if (serverName) {
    const h = 100;
    panel(ctx, PAD, y, LEBAR, h, 24, { fill: WARNA.panel, stroke: WARNA.line });
    ctx.save();
    roundRect(ctx, PAD, y, LEBAR, h, 24);
    ctx.clip();
    wedge(ctx, PAD + LEBAR - 240, y, 240, h, aksen, 0.35, 'kanan-atas');
    ctx.restore();
    if (eRadio) ctx.drawImage(eRadio, PAD + 26, y + h / 2 - 21, 42, 42);
    ctx.fillStyle = WARNA.muted;
    ctx.font = font(17, '700');
    ctx.fillText('SERVER FAVORIT', PAD + 84, y + 42);
    ctx.fillStyle = WARNA.ink;
    tulisPotong(ctx, serverName, PAD + 84, y + 76, LEBAR - 320, 28, '800');
    if (serverDuration) {
      ctx.textAlign = 'right';
      ctx.fillStyle = aksen;
      ctx.font = font(28, '800');
      ctx.fillText(serverDuration, PAD + LEBAR - 28, y + h / 2 + 10);
      ctx.textAlign = 'left';
    }
    y += h + GAP;
  }

  // 4) Sisa ruang: strip ajakan beraksen + waveform penanda (kartu selalu penuh).
  const sisa = FOOT_Y - y;
  if (sisa > 70) {
    const h = Math.max(90, Math.min(220, sisa - 24));
    panel(ctx, PAD, y, LEBAR, h, 22, { fill: rgba(aksen, 0.12), stroke: rgba(aksen, 0.5) });
    const midY = y + h / 2;
    const teks = rankMode
      ? (rank >= 1 && rank <= 3 ? 'Masuk podium! Terus dengar, terus naik.' : 'Terus dengar, terus naik.')
      : 'Masuk NOXA Sound, kumpulkan statistikmu juga.';
    if (eParty) ctx.drawImage(eParty, PAD + 30, midY - 21, 42, 42);
    else if (eMusik) ctx.drawImage(eMusik, PAD + 30, midY - 21, 42, 42);
    ctx.fillStyle = WARNA.ink;
    ctx.font = font(25, '600');
    tulisPotong(ctx, teks, PAD + 92, midY + 9, LEBAR - 130, 25, '600');
    y += h;

    const sisaBawah = FOOT_Y - y - 20;
    if (sisaBawah > 70) equalizer(ctx, PAD + 20, y + Math.round((sisaBawah - 76) / 2), LEBAR - 40, 76, aksen);
  }

  // ---------- Footer ----------
  const footH = 84;
  panel(ctx, PAD, FOOT_Y, LEBAR, footH, 22, { fill: WARNA.panel2, stroke: WARNA.line });
  ctx.fillStyle = aksen;
  roundRect(ctx, PAD + 18, FOOT_Y + 20, 5, footH - 40, 2.5);
  ctx.fill();

  if (logoImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(PAD + 50, FOOT_Y + footH / 2, 21, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, PAD + 29, FOOT_Y + footH / 2 - 21, 42, 42);
    ctx.restore();
    ctx.strokeStyle = rgba(aksen, 0.65);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(PAD + 50, FOOT_Y + footH / 2, 22, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.textBaseline = 'middle';
  ctx.fillStyle = WARNA.ink;
  ctx.font = font(23, '800');
  ctx.fillText('NOXA Sound', PAD + 88, FOOT_Y + footH / 2 - 11);
  ctx.fillStyle = WARNA.faint;
  ctx.font = font(15, '500');
  ctx.fillText('Musik, Podcast, Radio 24 Jam', PAD + 88, FOOT_Y + footH / 2 + 14);

  ctx.textAlign = 'right';
  ctx.fillStyle = aksen;
  ctx.font = font(20, '700');
  ctx.fillText(hostTampil(), PAD + LEBAR - 26, FOOT_Y + footH / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  return canvas;
}

/** Ubah canvas jadi file PNG siap dibagikan. */
export function canvasToFile(canvas, namaFile) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('render gagal'));
        return;
      }
      resolve(new File([blob], namaFile, { type: 'image/png' }));
    }, 'image/png');
  });
}
