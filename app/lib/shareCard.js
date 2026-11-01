// Renderer kartu bagikan NOXA Sound (profil & leaderboard).
//
// Prinsip supaya TIDAK blur (masalah kartu versi lama):
//   1. Semua gambar diambil pada resolusi yang cukup: avatar Discord diminta
//      ulang dengan ?size=256, bukan ukuran 64 bawaan.
//   2. Tidak ada shadowBlur / filter di canvas - dulu angka peringkat diberi
//      glow 24px dan itu yang membuat tepi teks terlihat kabur.
//   3. Semua koordinat bilangan bulat, imageSmoothingQuality = 'high', dan
//      canvas diekspor 1:1 (1080x1350) tanpa diperkecil.
import { SITE_URL } from './site';

const WARNA = {
  bgTop: '#030303',
  bgMid: '#0A0304',
  bgBottom: '#2A0607',
  crimson: '#B11226',
  neon: '#FF4B2B',
  amber: '#F0A63C',
  ink: '#F7F3F1',
  muted: '#A89F9C',
  faint: '#726868',
  line: '#2A2022',
  surface: '#140609',
  surface2: '#1C080C',
  green: '#22C55E',
};

const W = 1080;
const H = 1350;
const PAD = 96;

// Palet badge per tier (solid, sama seperti di web)
const TIER_STYLE = {
  premium: { label: 'NOXA PREMIUM', bg: '#F0A63C', text: '#1A0F00', border: '#FFD08A' },
  'premium-plus': { label: 'NOXA PREMIUM+', bg: '#CBD5E1', text: '#0B1016', border: '#F1F5F9' },
  'premium-ultimate': { label: 'NOXA PREMIUM ULTIMATE', bg: '#7C3AED', text: '#FFFFFF', border: '#C4B5FD' },
};

const BADGE_SRC = {
  premium: '/badges/noxa-premium.png',
  'premium-plus': '/badges/noxa-premium-plus.png',
  'premium-ultimate': '/badges/noxa-premium-ultimate.png',
};

function loadImg(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('src kosong'));
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('gagal muat gambar'));
    img.src = src;
  });
}

/** Avatar Discord diminta ulang pada 256px supaya tidak di-upscale. */
function avatarHiRes(url, size = 256) {
  if (!url) return null;
  if (!url.includes('cdn.discordapp.com')) return url;
  return url.replace(/size=\d+/, `size=${size}`);
}

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
function tulisMuat(ctx, teks, x, y, maksLebar, ukuran, minimal, gaya = 'bold') {
  let uk = ukuran;
  ctx.font = `${gaya} ${uk}px "Segoe UI", system-ui, sans-serif`;
  const t = String(teks || '');
  while (ctx.measureText(t).width > maksLebar && uk > minimal) {
    uk -= 2;
    ctx.font = `${gaya} ${uk}px "Segoe UI", system-ui, sans-serif`;
  }
  ctx.fillText(t, x, y);
  return uk;
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

function hostTampil() {
  try {
    const host = new URL(SITE_URL).host;
    if (host.includes('localhost') || host.startsWith('127.')) return 'NOXA Sound';
    return host;
  } catch {
    return 'NOXA Sound';
  }
}

// ---------- Ikon vektor sederhana (tanpa blur, tajam) ----------
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

/** Kotak statistik: label kecil di atas, nilai besar di bawah. */
function kotakStat(ctx, x, y, w, h, label, nilai, ikon) {
  ctx.fillStyle = WARNA.surface;
  roundRect(ctx, x, y, w, h, 22);
  ctx.fill();
  ctx.strokeStyle = WARNA.line;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 22);
  ctx.stroke();

  if (ikon) ikon(ctx, x + 40, y + h / 2, 30, WARNA.neon);

  ctx.textAlign = 'left';
  ctx.fillStyle = WARNA.faint;
  ctx.font = '600 19px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(label, x + (ikon ? 74 : 32), y + 44);

  ctx.fillStyle = WARNA.ink;
  ctx.font = 'bold 44px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(String(nilai), x + (ikon ? 74 : 32), y + 98);
  ctx.textAlign = 'center';
}

/** Pill tier NOXA Pass (solid, teks kontras). */
function pillTier(ctx, tier, centerX, y) {
  const st = TIER_STYLE[tier];
  if (!st) return;
  ctx.font = 'bold 22px "Segoe UI", system-ui, sans-serif';
  const lebar = ctx.measureText(st.label).width + 56;
  const h = 52;
  const x = centerX - lebar / 2;
  ctx.fillStyle = st.bg;
  roundRect(ctx, x, y - h / 2, lebar, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = st.border;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y - h / 2, lebar, h, h / 2);
  ctx.stroke();
  ctx.fillStyle = st.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(st.label, centerX, y + 1);
  ctx.textBaseline = 'alphabetic';
}

/** Baris server favorit: ikon, nama, durasi. */
function barisServer(ctx, y, nama, durasi) {
  if (!nama) return;
  const x = PAD;
  const w = W - PAD * 2;
  const h = 104;
  ctx.fillStyle = WARNA.surface2;
  roundRect(ctx, x, y, w, h, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(177,18,38,0.55)';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 22);
  ctx.stroke();

  ikonServer(ctx, x + 52, y + h / 2, 36, WARNA.neon);

  ctx.textAlign = 'left';
  ctx.fillStyle = WARNA.faint;
  ctx.font = '600 18px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('TOP SERVER FAVORIT', x + 92, y + 38);
  ctx.fillStyle = WARNA.ink;
  tulisMuat(ctx, nama, x + 92, y + 78, w - 300, 30, 18, 'bold');

  if (durasi) {
    ctx.textAlign = 'right';
    ctx.fillStyle = WARNA.neon;
    ctx.font = 'bold 30px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(durasi, x + w - 30, y + 64);
    ctx.textAlign = 'center';
  }
}

/**
 * Gambar kartu. Mode 'profil' menampilkan lagu favorit, mode 'rank'
 * menampilkan posisi di leaderboard.
 */
export async function renderShareCard({
  mode = 'profil',
  username,
  avatar,
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

  // ---------- Latar ----------
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, WARNA.bgTop);
  grad.addColorStop(0.55, WARNA.bgMid);
  grad.addColorStop(1, WARNA.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Grid halus (garis tipis, tidak mengganggu teks)
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= W; gx += 72) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, H);
    ctx.stroke();
  }
  for (let gy = 0; gy <= H; gy += 72) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(W, gy);
    ctx.stroke();
  }

  // Glow radial merah di tengah atas
  const glow = ctx.createRadialGradient(540, 520, 60, 540, 520, 620);
  glow.addColorStop(0, 'rgba(177, 18, 38, 0.32)');
  glow.addColorStop(1, 'rgba(177, 18, 38, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 1150);

  // Bar aksen atas: merah -> amber
  const barGrad = ctx.createLinearGradient(0, 0, W, 0);
  barGrad.addColorStop(0, WARNA.crimson);
  barGrad.addColorStop(0.6, WARNA.neon);
  barGrad.addColorStop(1, WARNA.amber);
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, W, 12);

  // Bracket sudut dekoratif
  ctx.strokeStyle = 'rgba(255,75,43,0.5)';
  ctx.lineWidth = 3;
  const bLen = 44;
  const bOff = 34;
  // kiri atas
  ctx.beginPath(); ctx.moveTo(bOff, bOff + bLen); ctx.lineTo(bOff, bOff); ctx.lineTo(bOff + bLen, bOff); ctx.stroke();
  // kanan atas
  ctx.beginPath(); ctx.moveTo(W - bOff - bLen, bOff); ctx.lineTo(W - bOff, bOff); ctx.lineTo(W - bOff, bOff + bLen); ctx.stroke();
  // kiri bawah
  ctx.beginPath(); ctx.moveTo(bOff, H - bOff - bLen); ctx.lineTo(bOff, H - bOff); ctx.lineTo(bOff + bLen, H - bOff); ctx.stroke();
  // kanan bawah
  ctx.beginPath(); ctx.moveTo(W - bOff - bLen, H - bOff); ctx.lineTo(W - bOff, H - bOff); ctx.lineTo(W - bOff, H - bOff - bLen); ctx.stroke();

  // ---------- Header ----------
  try {
    const logo = await loadImg('/logo.png');
    ctx.save();
    ctx.beginPath();
    ctx.arc(84, 92, 34, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, 50, 58, 68, 68);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,75,43,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(84, 92, 35, 0, Math.PI * 2);
    ctx.stroke();
  } catch { /* logo opsional */ }

  ctx.textAlign = 'left';
  ctx.fillStyle = WARNA.ink;
  ctx.font = 'bold 34px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('NOXA Sound', 138, 88);
  ctx.fillStyle = WARNA.faint;
  ctx.font = '600 18px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('BOT HIBURAN AUDIO DISCORD', 138, 122);
  ctx.textAlign = 'center';

  // Lencana NOXA Pass (kanan-atas kartu)
  if (BADGE_SRC[premiumTier]) {
    try {
      const badgeImg = await loadImg(BADGE_SRC[premiumTier]);
      ctx.drawImage(badgeImg, W - 196, 38, 136, 136);
    } catch { /* badge opsional */ }
  }

  // ---------- Avatar + nama + statistik ----------
  const rankMode = mode === 'rank';
  const avY = rankMode ? 540 : 432;
  const avR = rankMode ? 112 : 108;

  // Label mode
  ctx.fillStyle = WARNA.muted;
  ctx.font = '700 24px "Segoe UI", system-ui, sans-serif';
  if (rankMode) {
    tulisSpasi(ctx, 'TOP LISTENER', 540, 248, 10);
  } else {
    tulisSpasi(ctx, 'PROFIL PENDENGAR', 540, 286, 10);
  }

  // Nomor peringkat besar (gradient, tajam)
  if (rankMode) {
    const rankGrad = ctx.createLinearGradient(380, 300, 700, 420);
    rankGrad.addColorStop(0, WARNA.neon);
    rankGrad.addColorStop(1, WARNA.amber);
    ctx.fillStyle = rankGrad;
    ctx.font = 'bold 132px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(rank ? `#${rank}` : '#', 540, 400);
  }

  // Cincin glow di belakang avatar
  const ringGlow = ctx.createRadialGradient(540, avY, avR - 10, 540, avY, avR + 46);
  ringGlow.addColorStop(0, 'rgba(255,75,43,0.42)');
  ringGlow.addColorStop(1, 'rgba(255,75,43,0)');
  ctx.fillStyle = ringGlow;
  ctx.beginPath();
  ctx.arc(540, avY, avR + 46, 0, Math.PI * 2);
  ctx.fill();

  try {
    const av = await loadImg(avatarHiRes(avatar));
    ctx.save();
    ctx.beginPath();
    ctx.arc(540, avY, avR, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(av, 540 - avR, avY - avR, avR * 2, avR * 2);
    ctx.restore();
  } catch {
    const fallback = ctx.createLinearGradient(540 - avR, avY - avR, 540 + avR, avY + avR);
    fallback.addColorStop(0, '#5C0008');
    fallback.addColorStop(1, WARNA.crimson);
    ctx.fillStyle = fallback;
    ctx.beginPath();
    ctx.arc(540, avY, avR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(avR * 0.9)}px "Segoe UI", system-ui, sans-serif`;
    ctx.fillText(String(username || 'A').slice(0, 1).toUpperCase(), 540, avY + avR * 0.32);
  }
  // Cincin avatar: merah tebal + cincin tipis luar
  ctx.strokeStyle = WARNA.crimson;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(540, avY, avR + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,75,43,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(540, avY, avR + 18, 0, Math.PI * 2);
  ctx.stroke();

  // Nama
  ctx.fillStyle = WARNA.ink;
  ctx.font = 'bold 54px "Segoe UI", system-ui, sans-serif';
  const nameY = avY + avR + 78;
  tulisMuat(ctx, username || 'Pendengar', 540, nameY, 880, 54, 28);

  // Pill tier di bawah nama
  if (premiumTier && TIER_STYLE[premiumTier]) {
    pillTier(ctx, premiumTier, 540, nameY + 54);
  }

  // Dua kotak statistik
  const tileW = 400;
  const tileH = 126;
  const tileY = nameY + (premiumTier && TIER_STYLE[premiumTier] ? 110 : 46);
  kotakStat(ctx, 540 - tileW - 14, tileY, tileW, tileH, 'TOTAL DIDENGAR', durationLabel, ikonJam);
  kotakStat(ctx, 540 + 14, tileY, tileW, tileH, 'LAGU SELESAI', String(plays || 0), ikonMusik);

  // ---------- Konten per mode ----------
  if (rankMode) {
    // Server favorit
    barisServer(ctx, tileY + tileH + 44, serverName, serverDuration);

    // Tagline penutup
    ctx.fillStyle = WARNA.muted;
    ctx.font = '600 26px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('Terus dengar, terus naik.', 540, tileY + tileH + 214);
  } else {
    // Server favorit DULU supaya selalu kelihatan, lalu lagu favorit.
    let y = tileY + tileH + 28;
    if (serverName) {
      barisServer(ctx, y, serverName, serverDuration);
      y += 104 + 30;
    } else {
      y += 18;
    }

    const labelY = y;
    ctx.textAlign = 'left';
    ctx.fillStyle = WARNA.muted;
    ctx.font = '700 22px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('LAGU PALING SERING DIDENGAR', PAD, labelY);
    ctx.textAlign = 'center';

    const daftar = Array.isArray(songs) ? songs.slice(0, serverName ? 2 : 3) : [];
    const rowH = 84;
    const rowGap = 6;
    for (let i = 0; i < daftar.length; i += 1) {
      const s = daftar[i];
      const ry = labelY + 22 + i * (rowH + rowGap);
      // baris latar
      ctx.fillStyle = i === 0 ? WARNA.surface2 : WARNA.surface;
      roundRect(ctx, PAD, ry, W - PAD * 2, rowH, 18);
      ctx.fill();
      ctx.strokeStyle = WARNA.line;
      ctx.lineWidth = 2;
      roundRect(ctx, PAD, ry, W - PAD * 2, rowH, 18);
      ctx.stroke();

      // Nomor peringkat
      ctx.fillStyle = i === 0 ? WARNA.neon : WARNA.faint;
      ctx.font = 'bold 34px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`#${i + 1}`, PAD + 28, ry + 58);

      // Thumbnail
      const tx = PAD + 92;
      const ts = 64;
      let thumb = null;
      try {
        thumb = await loadImg(s.thumb);
      } catch { /* tanpa cover */ }
      if (thumb) {
        ctx.save();
        roundRect(ctx, tx, ry + (rowH - ts) / 2, ts, ts, 12);
        ctx.clip();
        ctx.drawImage(thumb, tx, ry + (rowH - ts) / 2, ts, ts);
        ctx.restore();
      } else {
        ctx.fillStyle = WARNA.surface2;
        roundRect(ctx, tx, ry + (rowH - ts) / 2, ts, ts, 12);
        ctx.fill();
        ikonMusik(ctx, tx + ts / 2, ry + rowH / 2, 30, WARNA.faint);
      }

      // Judul lagu
      ctx.fillStyle = WARNA.ink;
      ctx.font = '600 27px "Segoe UI", system-ui, sans-serif';
      tulisMuat(ctx, s.name || 'Lagu', tx + ts + 24, ry + 42, 560, 27, 16, '600');

      // Detail
      ctx.fillStyle = WARNA.faint;
      ctx.font = '500 21px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(s.count ? `${s.count} kali diputar` : 'lagu favorit', tx + ts + 24, ry + 72);

      // Durasi di kanan
      if (s.durationLabel) {
        ctx.textAlign = 'right';
        ctx.fillStyle = WARNA.neon;
        ctx.font = 'bold 24px "Segoe UI", system-ui, sans-serif';
        ctx.fillText(s.durationLabel, W - PAD - 26, ry + 56);
        ctx.textAlign = 'left';
      }
    }
  }

  // ---------- Footer ----------
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'rgba(177, 18, 38, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(240, 1258);
  ctx.lineTo(840, 1258);
  ctx.stroke();

  ctx.fillStyle = WARNA.ink;
  ctx.font = 'bold 26px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(hostTampil(), 540, 1300);

  ctx.fillStyle = WARNA.faint;
  ctx.font = '500 19px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('NOXA Sound  ·  Musik, Podcast, Radio 24 Jam', 540, 1330);

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
