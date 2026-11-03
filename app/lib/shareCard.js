// Renderer kartu bagikan NOXA Sound (profil & leaderboard).
//
// Prinsip supaya TIDAK blur (masalah kartu versi lama):
//   1. Avatar Discord diminta ulang pada ?size=256, bukan ukuran 64 bawaan.
//   2. Tidak ada shadowBlur / filter teks - hanya glow radial di belakang avatar.
//   3. Semua koordinat bilangan bulat, imageSmoothingQuality = 'high', dan
//      canvas diekspor 1:1 (1080x1350) tanpa diperkecil.
//
// Desain 2026-11: kartu gelap NOXA dengan pola hex halus + WATERMARK LOGO
// besar di latar (pola yang sama dengan kartu NEXO Games), tipografi tegas,
// dan emoji resmi NOXA (number1/2/3, jam, musik, radio) supaya kartu terasa
// satu merek dengan bot dan web.
import { SITE_URL } from './site';
import { emojiSrc } from './noxa-emojis';

const WARNA = {
  bgTop: '#04171A',
  bgMid: '#082126',
  bgBottom: '#123F45',
  crimson: '#397F80',
  neon: '#A2C9C4',
  amber: '#F0A63C',
  ink: '#E2F1EC',
  muted: '#9DB8B6',
  faint: '#6E8B8B',
  line: '#1F4A51',
  surface: '#140609',
  surface2: '#1C080C',
  green: '#22C55E',
  gold: '#F6C445',
  silver: '#CBD5E1',
  bronze: '#D08A4E',
};

const W = 1080;
const H = 1350;
const PAD = 96;
const LEBAR = W - PAD * 2; // 888

// Palet badge per tier (solid, sama seperti di web).
const TIER_STYLE = {
  free: { label: 'NOXA USER', bg: '#1C080C', text: '#E2F1EC', border: 'rgba(162,201,196,0.55)' },
  premium: { label: 'NOXA PREMIUM', bg: '#F0A63C', text: '#1A0F00', border: '#FFD08A' },
  'premium-plus': { label: 'NOXA PREMIUM+', bg: '#CBD5E1', text: '#0B1016', border: '#F1F5F9' },
  'premium-ultimate': { label: 'NOXA PREMIUM ULTIMATE', bg: '#7C3AED', text: '#FFFFFF', border: '#C4B5FD' },
};

const BADGE_SRC = {
  premium: '/badges/noxa-premium.png',
  'premium-plus': '/badges/noxa-premium-plus.png',
  'premium-ultimate': '/badges/noxa-premium-ultimate.png',
};

// Warna medali peringkat: emas, perak, perunggu, lalu merah NOXA.
const MEDALI = {
  1: { bg: WARNA.gold, text: '#1A1200', label: 'JUARA 1', emoji: 'number1' },
  2: { bg: WARNA.silver, text: '#0B1016', label: 'JUARA 2', emoji: 'number2' },
  3: { bg: WARNA.bronze, text: '#1A0D00', label: 'JUARA 3', emoji: 'number3' },
};
const medaliUntuk = (rank) => MEDALI[rank] || { bg: WARNA.crimson, text: '#FFFFFF', label: `TOP ${rank || ''}`.trim(), emoji: null };

// ---------------------------------------------------------------------------
// Pemuat aset
// ---------------------------------------------------------------------------

/** Muat gambar; gagal/timeout = null (elemen dilewati, bukan merusak kartu). */
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
    // Batas 6 detik: CDN lambat tidak boleh membuat tombol Share menggantung.
    const timer = setTimeout(() => beres(null), 6000);
    img.crossOrigin = 'anonymous';
    img.onload = () => beres(img);
    img.onerror = () => beres(null);
    img.src = src;
  });
}

/** Emoji resmi NOXA sebagai gambar PNG (canvas tidak bisa menggambar GIF). */
function emojiImg(nama, size = 128) {
  const src = emojiSrc(nama, size);
  return src ? loadImg(src) : null;
}

/** Avatar Discord diminta ulang pada 256px supaya tidak di-upscale. */
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

/** Perkecil font sampai teks muat, bukan memotong nama. */
function tulisMuat(ctx, teks, x, y, maksLebar, ukuran, minimal, gaya = 'bold', align = 'center') {
  let uk = ukuran;
  ctx.textAlign = align;
  ctx.font = `${gaya} ${uk}px "Segoe UI", system-ui, sans-serif`;
  const t = String(teks || '');
  while (ctx.measureText(t).width > maksLebar && uk > minimal) {
    uk -= 2;
    ctx.font = `${gaya} ${uk}px "Segoe UI", system-ui, sans-serif`;
  }
  ctx.fillText(t, x, y);
  return uk;
}

/**
 * Tulis satu baris dengan ukuran TETAP; kalau kepanjangan dipotong rapi
 * pakai "…" (lebih terbaca daripada dikecilkan sampai 15px).
 */
function tulisPotong(ctx, teks, x, y, maksLebar, ukuran, gaya = 'bold', align = 'left') {
  const t = String(teks || '');
  ctx.textAlign = align;
  ctx.font = `${gaya} ${ukuran}px "Segoe UI", system-ui, sans-serif`;
  if (ctx.measureText(t).width <= maksLebar) {
    ctx.fillText(t, x, y);
    return;
  }
  const cp = Array.from(t);
  let potong = cp;
  while (potong.length > 1 && ctx.measureText(`${potong.join('')}…`).width > maksLebar) {
    potong = potong.slice(0, -1);
  }
  ctx.fillText(`${potong.join('').trimEnd()}…`, x, y);
}

/** Teks dengan jarak antar huruf manual (canvas tidak punya letterSpacing). */
function tulisSpasi(ctx, teks, x, y, spasi) {
  const chars = String(teks || '').split('');
  let total = 0;
  for (const c of chars) total += ctx.measureText(c).width + spasi;
  total -= spasi;
  let cx = x - total / 2;
  for (const c of chars) {
    ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + spasi;
  }
}

// Domain merek untuk kartu. Saat dev (localhost) JANGAN tampilkan localhost -
// kartu yang dibagikan harus selalu membawa domain resmi.
const DOMAIN_MEREK = 'noxasound.site';

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

// ---------------------------------------------------------------------------
// Ikon vektor cadangan (dipakai kalau emoji gagal dimuat)
// ---------------------------------------------------------------------------

function ikonJam(ctx, x, y, s, warna) {
  ctx.save();
  ctx.strokeStyle = warna;
  ctx.lineWidth = Math.max(2, s / 8);
  ctx.beginPath();
  ctx.arc(x, y, s / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.26);
  ctx.lineTo(x, y);
  ctx.lineTo(x + s * 0.2, y + s * 0.12);
  ctx.stroke();
  ctx.restore();
}

function ikonMusik(ctx, x, y, s, warna) {
  ctx.save();
  ctx.strokeStyle = warna;
  ctx.fillStyle = warna;
  ctx.lineWidth = Math.max(2, s / 9);
  ctx.beginPath();
  ctx.moveTo(x - s * 0.18, y + s * 0.3);
  ctx.lineTo(x - s * 0.18, y - s * 0.32);
  ctx.lineTo(x + s * 0.34, y - s * 0.42);
  ctx.lineTo(x + s * 0.34, y + s * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - s * 0.3, y + s * 0.32, s * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.22, y + s * 0.22, s * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function ikonServer(ctx, x, y, s, warna) {
  ctx.save();
  ctx.strokeStyle = warna;
  ctx.lineWidth = Math.max(2, s / 10);
  const w = s * 0.78;
  const h = s * 0.26;
  for (let i = 0; i < 2; i += 1) {
    roundRect(ctx, x - w / 2, y - h + i * (h + s * 0.12), w, h, s * 0.06);
    ctx.stroke();
  }
  ctx.fillStyle = warna;
  ctx.beginPath();
  ctx.arc(x - w / 2 + s * 0.16, y - h + s * 0.13, s * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - w / 2 + s * 0.16, y - h + s * 0.13 + h + s * 0.12, s * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function ikonMahkota(ctx, x, y, s, warna) {
  ctx.save();
  ctx.fillStyle = warna;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.44, y + s * 0.3);
  ctx.lineTo(x - s * 0.5, y - s * 0.22);
  ctx.lineTo(x - s * 0.18, y + s * 0.02);
  ctx.lineTo(x, y - s * 0.4);
  ctx.lineTo(x + s * 0.18, y + s * 0.02);
  ctx.lineTo(x + s * 0.5, y - s * 0.22);
  ctx.lineTo(x + s * 0.44, y + s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Komponen kartu
// ---------------------------------------------------------------------------

/** Panel solid: isi + garis tepi, sudut membulat. */
function panel(ctx, x, y, w, h, r, { fill = WARNA.surface, stroke = WARNA.line, tebal = 2 } = {}) {
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

/** Pola sarang lebah tipis khas NOXA (pengganti titik-titik generik). */
function hexGrid(ctx, alpha = 0.05) {
  const r = 34;
  const h = Math.sqrt(3) * r;
  const stepX = r * 1.5;
  ctx.save();
  ctx.strokeStyle = `rgba(127,198,190,${alpha})`;
  ctx.lineWidth = 1.4;
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

/**
 * Watermark logo besar ala kartu NEXO Games. Logo NOXA berwarna merah di atas
 * latar gelap, jadi alpha harus lebih tinggi dari watermark NEXO (yang memakai
 * logo gelap di atas latar terang) supaya benar-benar terbaca sebagai tekstur
 * merek, bukan noda samar.
 */
function watermark(ctx, logoImg, cx, cy, size, alpha = 0.14) {
  if (!logoImg) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(logoImg, cx - size / 2, cy - size / 2, size, size);
  ctx.restore();
}

/** Kotak statistik: emoji/ikon + label kecil + nilai besar, aksen kiri. */
function kotakStat(ctx, x, y, w, h, { label, nilai, emoji, ikon, aksen = WARNA.neon }) {
  panel(ctx, x, y, w, h, 22);
  ctx.fillStyle = aksen;
  roundRect(ctx, x + 18, y + 24, 5, h - 48, 3);
  ctx.fill();

  const cx = x + 58;
  const cy = y + h / 2;
  if (emoji) {
    ctx.drawImage(emoji, cx - 18, cy - 18, 36, 36);
  } else if (ikon) {
    ikon(ctx, cx, cy, 30, aksen);
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = WARNA.faint;
  ctx.font = '700 17px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(label, x + 102, y + 42);

  ctx.fillStyle = WARNA.ink;
  ctx.font = 'bold 44px "Segoe UI", system-ui, sans-serif';
  tulisMuat(ctx, nilai, x + 102, y + 94, w - 126, 44, 24, 'bold', 'left');
}

/** Pill tier NOXA Pass (solid, teks kontras, ikon emoji resmi). */
function pillTier(ctx, tier, centerX, y, icon) {
  const st = TIER_STYLE[tier] || TIER_STYLE.free;
  const iconSize = 34;
  const padX = 24;
  const gap = icon ? 12 : 0;
  const maksLabel = LEBAR - 40 - padX * 2 - (icon ? iconSize + gap : 0);

  // Perkecil font label kalau pill terpanjang (Ultimate) tidak muat.
  let uk = 22;
  ctx.font = `bold ${uk}px "Segoe UI", system-ui, sans-serif`;
  while (ctx.measureText(st.label).width > maksLabel && uk > 13) {
    uk -= 1;
    ctx.font = `bold ${uk}px "Segoe UI", system-ui, sans-serif`;
  }
  const labelW = ctx.measureText(st.label).width;
  const lebar = padX * 2 + (icon ? iconSize + gap : 0) + labelW;
  const h = 52;
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
    ctx.drawImage(icon, tx, y - iconSize / 2, iconSize, iconSize);
    tx += iconSize + gap;
  }
  ctx.fillStyle = st.text;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(st.label, tx, y + 1);
  ctx.textBaseline = 'alphabetic';
}

/** Pill peringkat + emoji medali (number1/2/3) di sisi kiri. */
function pillRank(ctx, medali, centerX, y, icon) {
  ctx.font = 'bold 22px "Segoe UI", system-ui, sans-serif';
  const labelW = ctx.measureText(medali.label).width;
  const pillW = labelW + 56;
  const h = 48;
  const totalW = pillW + (icon ? 52 : 0);
  let x = centerX - totalW / 2;

  if (icon) {
    ctx.drawImage(icon, x, y - 22, 44, 44);
    x += 52;
  }

  ctx.fillStyle = medali.bg;
  roundRect(ctx, x, y - h / 2, pillW, h, h / 2);
  ctx.fill();
  ctx.fillStyle = medali.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(medali.label, x + pillW / 2, y + 1);
  ctx.textBaseline = 'alphabetic';
}

/** Baris server favorit: emoji radio, nama, durasi, aksen kiri. */
function barisServer(ctx, y, nama, durasi, emoji) {
  if (!nama) return;
  const h = 104;
  panel(ctx, PAD, y, LEBAR, h, 22, { fill: WARNA.surface2, stroke: 'rgba(57,127,128,0.55)' });

  ctx.fillStyle = WARNA.neon;
  roundRect(ctx, PAD + 18, y + 22, 5, h - 44, 3);
  ctx.fill();

  if (emoji) ctx.drawImage(emoji, PAD + 48, y + 34, 36, 36);
  else ikonServer(ctx, PAD + 66, y + h / 2, 34, WARNA.neon);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = WARNA.faint;
  ctx.font = '700 17px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('TOP SERVER FAVORIT', PAD + 104, y + 40);
  ctx.fillStyle = WARNA.ink;
  tulisMuat(ctx, nama, PAD + 104, y + 78, LEBAR - 330, 30, 18, 'bold', 'left');

  if (durasi) {
    ctx.textAlign = 'right';
    ctx.fillStyle = WARNA.neon;
    ctx.font = 'bold 30px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(durasi, PAD + LEBAR - 28, y + 64);
  }
  ctx.textAlign = 'center';
}

/** Satu baris lagu favorit + bar panjang dengar proporsional. */
async function barisLagu(ctx, y, i, lagu, maksDurasi, emoji) {
  const h = 76;
  panel(ctx, PAD, y, LEBAR, h, 18, { fill: i === 0 ? WARNA.surface2 : WARNA.surface });

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = i === 0 ? WARNA.neon : WARNA.faint;
  ctx.font = 'bold 26px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(`#${i + 1}`, PAD + 22, y + 44);

  // Cover
  const ts = 52;
  const tx = PAD + 70;
  const ty = y + (h - ts) / 2;
  const thumb = lagu.thumb ? await loadImg(lagu.thumb) : null;
  if (thumb) {
    ctx.save();
    roundRect(ctx, tx, ty, ts, ts, 12);
    ctx.clip();
    ctx.drawImage(thumb, tx, ty, ts, ts);
    ctx.restore();
  } else {
    panel(ctx, tx, ty, ts, ts, 12, { fill: WARNA.surface2, stroke: null });
    if (emoji) ctx.drawImage(emoji, tx + 12, ty + 12, 28, 28);
    else ikonMusik(ctx, tx + ts / 2, ty + ts / 2, 26, WARNA.faint);
  }

  // Judul + detail
  const infoX = tx + ts + 18;
  ctx.fillStyle = WARNA.ink;
  tulisPotong(ctx, lagu.name || 'Lagu', infoX, y + 34, LEBAR - 390, 24, '600', 'left');
  ctx.fillStyle = WARNA.faint;
  ctx.font = '500 18px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(lagu.count ? `${lagu.count} kali diputar` : 'lagu favorit', infoX, y + 58);

  // Durasi
  if (lagu.durationLabel) {
    ctx.textAlign = 'right';
    ctx.fillStyle = WARNA.neon;
    ctx.font = 'bold 21px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(lagu.durationLabel, PAD + LEBAR - 24, y + 44);
  }

  // Bar proporsi (tipis di bawah)
  const rasio = maksDurasi > 0 ? Math.max(0.06, Math.min(1, (Number(lagu.duration) || 0) / maksDurasi)) : 0.06;
  const barL = LEBAR - 48;
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  roundRect(ctx, PAD + 24, y + h - 13, barL, 4, 2);
  ctx.fill();
  ctx.fillStyle = i === 0 ? WARNA.neon : WARNA.crimson;
  roundRect(ctx, PAD + 24, y + h - 13, Math.max(10, Math.round(barL * rasio)), 4, 2);
  ctx.fill();
  ctx.textAlign = 'center';
}

/** Label kecil bertracking lebar di atas sebuah blok. */
function labelBlok(ctx, teks, x, y, align = 'left') {
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = WARNA.faint;
  ctx.font = '700 19px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(teks, x, y);
}

/**
 * Tulis nama pendengar. Nama panjang dipecah jadi dua baris lebih dulu,
 * bukan dikecilkan sampai tidak terbaca. Return baseline paling bawah.
 */
function tulisNama(ctx, teks, cx, y, maksLebar, ukuran) {
  const t = String(teks || 'Pendengar');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let uk = ukuran;
  const setFont = () => { ctx.font = `bold ${uk}px "Segoe UI", system-ui, sans-serif`; };
  setFont();

  if (ctx.measureText(t).width <= maksLebar) {
    ctx.fillText(t, cx, y);
    return y;
  }

  // Coba kecilkan dulu sampai 40px.
  while (uk > 40 && ctx.measureText(t).width > maksLebar) {
    uk -= 2;
    setFont();
  }
  if (ctx.measureText(t).width <= maksLebar) {
    ctx.fillText(t, cx, y);
    return y;
  }

  // Masih tidak muat: pecah dua baris.
  // Pakai Array.from supaya karakter di luar BMP (nama gaya 𝒜𝒶𝓁, emoji)
  // tidak terbelah jadi dua bagian setengah karakter.
  const cp = Array.from(t);
  let tengah = Math.ceil(cp.length / 2);
  for (let d = 0; d < 12; d += 1) {
    if (cp[tengah - d] === ' ') { tengah -= d; break; }
    if (cp[tengah + d] === ' ') { tengah += d; break; }
  }
  const baris1 = cp.slice(0, tengah).join('').trim();
  const baris2 = cp.slice(tengah).join('').trim();
  const muat = () => Math.max(ctx.measureText(baris1).width, ctx.measureText(baris2).width) <= maksLebar;
  while (!muat() && uk > 26) {
    uk -= 2;
    setFont();
  }
  const jarak = Math.round(uk * 0.52);
  ctx.fillText(baris1, cx, y - jarak + 6);
  ctx.fillText(baris2, cx, y + jarak + 6);
  return y + jarak + 6;
}

/**
 * Strip waveform dekoratif: mengisi ruang kosong di bawah tanpa teks
 * tambahan. Tinggi bar deterministik (bukan acak) supaya hasil selalu sama.
 */
function waveform(ctx, y, tinggi = 70) {
  const jumlah = 54;
  const gap = 8;
  const lebarBar = Math.floor((LEBAR - gap * (jumlah - 1)) / jumlah);
  for (let i = 0; i < jumlah; i += 1) {
    const t = i / (jumlah - 1);
    const gelombang = Math.abs(Math.sin(i * 0.9)) * 0.55 + Math.abs(Math.sin(i * 0.23 + 1.4)) * 0.45;
    const h = Math.max(6, Math.round(tinggi * gelombang));
    const x = PAD + i * (lebarBar + gap);
    ctx.fillStyle = t > 0.5 ? 'rgba(162,201,196,0.45)' : 'rgba(57,127,128,0.55)';
    roundRect(ctx, x, y + Math.round((tinggi - h) / 2), lebarBar, h, Math.max(2, Math.floor(lebarBar / 2)));
    ctx.fill();
  }
}

/** Lingkaran avatar dengan cincin aksen + glow tipis (tanpa blur teks). */
async function avatar(ctx, cx, cy, r, url, username, aksen) {
  const ringGlow = ctx.createRadialGradient(cx, cy, r - 12, cx, cy, r + 52);
  ringGlow.addColorStop(0, 'rgba(162,201,196,0.36)');
  ringGlow.addColorStop(1, 'rgba(162,201,196,0)');
  ctx.fillStyle = ringGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 52, 0, Math.PI * 2);
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
    fallback.addColorStop(0, '#123F45');
    fallback.addColorStop(1, WARNA.crimson);
    ctx.fillStyle = fallback;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(r * 0.9)}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(String(username || 'A').slice(0, 1).toUpperCase(), cx, cy + r * 0.32);
  }

  ctx.strokeStyle = aksen || WARNA.crimson;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(162,201,196,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 18, 0, Math.PI * 2);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Render utama
// ---------------------------------------------------------------------------

/**
 * Gambar kartu. Mode 'profil' menampilkan lagu favorit, mode 'rank'
 * menampilkan posisi di leaderboard beserta medali untuk 3 teratas.
 */
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
  ctx.textAlign = 'center';

  const rankMode = mode === 'rank';
  const tier = TIER_STYLE[premiumTier] ? premiumTier : 'free';
  const medali = medaliUntuk(rank);
  const aksen = rankMode ? medali.bg : WARNA.crimson;

  // Nama emoji lencana tier (sama dengan registry web & bot).
  const tierEmojiName = tier === 'premium'
    ? 'noxapremium'
    : tier === 'premium-plus'
      ? 'noxapremiumplus'
      : tier === 'premium-ultimate'
        ? 'noxapremiumultimate'
        : 'userprofile';

  // Semua aset dimuat paralel: logo, badge besar, emoji medali & statistik.
  const [logoImg, badgeImg, tierIcon, eJam, eMusik, eRadio, eParty, rankIcon] = await Promise.all([
    loadImg('/logo.png'),
    BADGE_SRC[premiumTier] ? loadImg(BADGE_SRC[premiumTier]) : null,
    emojiImg(tierEmojiName),
    emojiImg('jam'),
    emojiImg('musik'),
    emojiImg('radio'),
    emojiImg('party'),
    rankMode && medali.emoji ? emojiImg(medali.emoji) : null,
  ]);

  // ---------- Latar ----------
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, WARNA.bgTop);
  grad.addColorStop(0.55, WARNA.bgMid);
  grad.addColorStop(1, WARNA.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  hexGrid(ctx, 0.05);

  // Glow radial lembut di area identitas.
  const glow = ctx.createRadialGradient(540, 430, 60, 540, 430, 700);
  glow.addColorStop(0, 'rgba(57, 127, 128, 0.32)');
  glow.addColorStop(1, 'rgba(57, 127, 128, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 1200);

  // Watermark logo besar: pusatnya tepat di belakang avatar, jadi lingkaran
  // inti logo tertutup avatar dan yang terlihat hanya "sayap" heksagon -
  // terasa seperti avatar menyatu dengan lambang NOXA (pola NEXO Games).
  watermark(ctx, logoImg, 540, 360, 900, 0.10);

  // Bar aksen atas.
  ctx.fillStyle = WARNA.neon;
  ctx.fillRect(0, 0, W, 10);

  // ---------- Header band (pola kartu NEXO: blok gelap + avatar menumpuk) ----------
  const BAND_Y = 36;
  const BAND_H = 200;
  panel(ctx, PAD, BAND_Y, LEBAR, BAND_H, 28, { fill: WARNA.surface2, stroke: 'rgba(57,127,128,0.5)' });
  ctx.fillStyle = WARNA.neon;
  roundRect(ctx, PAD + 20, BAND_Y + 40, 6, BAND_H - 80, 3);
  ctx.fill();

  if (logoImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(PAD + 92, BAND_Y + 88, 36, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, PAD + 56, BAND_Y + 52, 72, 72);
    ctx.restore();
    ctx.strokeStyle = 'rgba(162,201,196,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(PAD + 92, BAND_Y + 88, 37, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = WARNA.ink;
  ctx.font = '800 36px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('NOXA Sound', PAD + 150, BAND_Y + 82);
  ctx.fillStyle = WARNA.faint;
  ctx.font = '700 17px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(
    rankMode ? 'LEADERBOARD  \u00b7  TOP LISTENER' : 'KARTU PROFIL  \u00b7  PENDENGAR NOXA',
    PAD + 150,
    BAND_Y + 114,
  );

  // Lencana NOXA Pass (kanan dalam band) atau domain.
  if (badgeImg) {
    ctx.drawImage(badgeImg, W - PAD - 148, BAND_Y + 36, 128, 128);
  } else {
    ctx.textAlign = 'right';
    ctx.fillStyle = WARNA.faint;
    ctx.font = '700 17px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(hostTampil(), W - PAD - 36, BAND_Y + 92);
    ctx.textAlign = 'center';
  }

  // ---------- Identitas ----------
  // Pusat avatar sengaja duduk di garis batas bawah band (236) - avatar
  // MENUMPUK header, persis kartu leaderboard NEXO.
  const avY = 300;
  const avR = 100;

  await avatar(ctx, 540, avY, avR, avatarUrl, username, aksen);

  // Ornamen podium (pola NEXO): emoji di atas avatar, khusus juara 1.
  // (Juara 2/3 tidak - NOXA tidak punya emoji medali, dan pill "JUARA 2/3"
  // tetap terbaca jelas di bawah nama.)
  if (rankMode && rank === 1 && eParty) {
    ctx.drawImage(eParty, 540 - 31, avY - avR - 80, 62, 62);
  }

  // Nama (dua baris kalau kepanjangan).
  ctx.fillStyle = WARNA.ink;
  const nameY = avY + avR + 60;
  const namaBawah = tulisNama(ctx, username, 540, nameY, 880, 54);

  // Baris lencana: medali (mode rank) dan/atau pill tier.
  // Di kartu leaderboard, pill tier HANYA muncul untuk pemegang NOXA Pass -
  // menampilkan "NOXA USER" di papan peringkat hanya menambah baris kosong.
  let pillCenter = namaBawah + 42;
  if (rankMode) {
    pillRank(ctx, medali, 540, pillCenter, rankIcon);
    pillCenter += 66;
  }
  if (!rankMode || tier !== 'free') {
    pillTier(ctx, tier, 540, pillCenter, tierIcon);
  } else {
    pillCenter -= 22; // tidak ada pill tier: rapatkan jarak ke kotak statistik
  }
  const tileY = pillCenter + 44;

  // ---------- Kotak statistik ----------
  const gap = 24;
  const tileW = Math.round((LEBAR - gap) / 2);
  const tileH = 116;
  kotakStat(ctx, PAD, tileY, tileW, tileH, {
    label: 'TOTAL DIDENGAR',
    nilai: durationLabel,
    emoji: eJam,
    ikon: ikonJam,
    aksen: WARNA.neon,
  });
  kotakStat(ctx, PAD + tileW + gap, tileY, tileW, tileH, {
    label: 'LAGU SELESAI',
    nilai: String(plays || 0),
    emoji: eMusik,
    ikon: ikonMusik,
    aksen: WARNA.amber,
  });

  // ---------- Isi per mode ----------
  // Zone isi dibatasi FOOT_Y di bawah; waveform selalu jangkar tepat di atas
  // footer, dan baris/panel konten KITA SEBAR ke sisa ruang (gap memuai, bukan
  // dibiarkan nganga) supaya kartu terasa lega tapi tetap penuh.
  const FOOT_Y = 1236;
  let y = tileY + tileH + 24;

  if (serverName) {
    barisServer(ctx, y, serverName, serverDuration, eRadio);
    y += rankMode ? 124 : 132;
  }

  if (rankMode) {
    // Pita pernyataan (mode rank): memanjang mengisi ruang tersisa sampai
    // batas bawah, teks vertikal-tengah - bukan strip tipis menggantung.
    const waveY = FOOT_Y - 96;
    const ctaBottom = waveY - 24;
    const ctaH = Math.max(96, Math.min(230, ctaBottom - y));
    panel(ctx, PAD, y, LEBAR, ctaH, 22, {
      fill: 'rgba(162,201,196,0.10)',
      stroke: 'rgba(162,201,196,0.45)',
    });
    const podium = rank >= 1 && rank <= 3;
    const ctaEmoji = podium ? eParty : eMusik;
    const midY = y + ctaH / 2;
    if (ctaEmoji) ctx.drawImage(ctaEmoji, PAD + 36, midY - 21, 42, 42);
    else ikonMahkota(ctx, PAD + 57, midY, 34, medali.bg);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = WARNA.ink;
    ctx.font = '600 27px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(podium ? 'Masuk podium! Terus dengar, terus naik.' : 'Terus dengar, terus naik.', PAD + 104, midY + 1);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    y += ctaH + 24;
  } else {
    const daftar = Array.isArray(songs) ? songs.slice(0, 3) : [];
    if (daftar.length === 0) {
      // Pendengar baru: jangan biarkan kartu terlihat rusak/kosong.
      panel(ctx, PAD, y + 8, LEBAR, 104, 22, { fill: WARNA.surface, stroke: 'rgba(255,255,255,0.10)' });
      if (eMusik) ctx.drawImage(eMusik, PAD + 52, y + 42, 32, 32);
      else ikonMusik(ctx, PAD + 68, y + 60, 30, WARNA.faint);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = WARNA.muted;
      ctx.font = '600 24px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('Belum ada lagu selesai.', PAD + 106, y + 52);
      ctx.fillStyle = WARNA.faint;
      ctx.font = '500 19px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('Mulai dengar di Discord, riwayatmu muncul di sini.', PAD + 106, y + 82);
      ctx.textAlign = 'center';
      y += 132;
    } else {
      labelBlok(ctx, 'LAGU PALING SERING DIDENGAR', PAD, y + 14);
      y += 32;
      const maksDurasi = Math.max(...daftar.map((s) => Number(s.duration) || 0), 1);
      const rowH = 76;
      const batasBawah = FOOT_Y - 96 - 36; // sisakan ruang waveform jangkar
      const avail = batasBawah - y;
      const baseGap = 10;
      const maxRows = Math.max(1, Math.min(daftar.length, Math.floor((avail + baseGap) / (rowH + baseGap))));
      // Gap memuai mengisi sisa (maks +46) -> tidak ada nganga kosong di tengah.
      const gap = maxRows > 1
        ? Math.min(baseGap + 46, Math.max(baseGap, Math.floor((avail - maxRows * rowH) / (maxRows - 1))))
        : baseGap;
      for (let i = 0; i < maxRows; i += 1) {
        await barisLagu(ctx, y, i, daftar[i], maksDurasi, eMusik);
        y += rowH + gap;
      }
    }
  }

  // ---------- Waveform jangkar: di tengah ruang sisa di atas footer ----------
  const sisaRuang = FOOT_Y - 24 - y;
  if (sisaRuang > 100) {
    waveform(ctx, y + Math.round((sisaRuang - 70) / 2), 70);
  }

  // ---------- Footer (strip gelap ala pita CTA NEXO) ----------
  const footH = 74;
  panel(ctx, PAD, FOOT_Y, LEBAR, footH, 22, { fill: WARNA.surface2, stroke: 'rgba(57,127,128,0.55)' });

  // Logo bulat kecil di kiri strip.
  if (logoImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(PAD + 44, FOOT_Y + footH / 2, 20, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, PAD + 24, FOOT_Y + footH / 2 - 20, 40, 40);
    ctx.restore();
    ctx.strokeStyle = 'rgba(162,201,196,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(PAD + 44, FOOT_Y + footH / 2, 21, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = WARNA.ink;
  ctx.font = '800 22px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('NOXA Sound', PAD + 78, FOOT_Y + footH / 2 - 11);
  ctx.fillStyle = WARNA.faint;
  ctx.font = '500 15px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('Musik, Podcast, Radio 24 Jam', PAD + 78, FOOT_Y + footH / 2 + 14);

  ctx.textAlign = 'right';
  ctx.fillStyle = WARNA.neon;
  ctx.font = '700 20px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(hostTampil(), PAD + LEBAR - 28, FOOT_Y + footH / 2);
  ctx.textAlign = 'center';
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
