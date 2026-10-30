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
  bgBottom: '#3B0A08',
  crimson: '#B11226',
  neon: '#FF4B2B',
  amber: '#F0A63C',
  ink: '#F7F3F1',
  muted: '#A89F9C',
  faint: '#726868',
  line: '#2A2022',
  surface: '#120509',
};

const W = 1080;
const H = 1350;

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

function hostTampil() {
  try {
    const host = new URL(SITE_URL).host;
    if (host.includes('localhost') || host.startsWith('127.')) return 'NOXA Sound';
    return host;
  } catch {
    return 'NOXA Sound';
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
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.textAlign = 'center';

  // Latar
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, WARNA.bgTop);
  grad.addColorStop(0.55, WARNA.bgMid);
  grad.addColorStop(1, WARNA.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(540, 520, 80, 540, 520, 560);
  glow.addColorStop(0, 'rgba(177, 18, 38, 0.28)');
  glow.addColorStop(1, 'rgba(177, 18, 38, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 1100);

  // Bar aksen atas: merah -> amber, sama dengan accent bar di web
  const barGrad = ctx.createLinearGradient(0, 0, W, 0);
  barGrad.addColorStop(0, WARNA.crimson);
  barGrad.addColorStop(1, WARNA.amber);
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, W, 12);

  // Header: logo + wordmark
  try {
    const logo = await loadImg('/logo.png');
    ctx.save();
    ctx.beginPath();
    ctx.arc(84, 92, 34, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, 50, 58, 68, 68);
    ctx.restore();
  } catch { /* logo opsional */ }
  ctx.textAlign = 'left';
  ctx.fillStyle = WARNA.ink;
  ctx.font = 'bold 32px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('NOXA Sound', 138, 92);
  ctx.fillStyle = WARNA.faint;
  ctx.font = '600 20px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('BOT HIBURAN AUDIO DISCORD', 138, 122);
  ctx.textAlign = 'center';

  // Lencana NOXA Pass (kanan-atas kartu) untuk pemegang premium
  const BADGE_SRC = {
    premium: '/badges/noxa-premium.png',
    'premium-plus': '/badges/noxa-premium-plus.png',
    'premium-ultimate': '/badges/noxa-premium-ultimate.png',
  };
  if (BADGE_SRC[premiumTier]) {
    try {
      const badgeImg = await loadImg(BADGE_SRC[premiumTier]);
      ctx.drawImage(badgeImg, W - 190, 42, 128, 128);
    } catch { /* badge opsional */ }
  }

  // Judul mode
  ctx.fillStyle = WARNA.muted;
  ctx.font = '600 26px "Segoe UI", system-ui, sans-serif';
  if (mode === 'rank') {
    ctx.fillText('T O P   L I S T E N E R', 540, 236);
    ctx.fillStyle = WARNA.neon;
    ctx.font = 'bold 96px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(rank ? `#${rank}` : '#', 540, 340);
  } else {
    ctx.fillText('P R O F I L   P E N D E N G A R', 540, 286);
  }

  // Avatar (posisi disesuaikan supaya daftar lagu tidak menabrak footer)
  const avY = mode === 'rank' ? 500 : 460;
  const r = 136;
  try {
    const av = await loadImg(avatarHiRes(avatar));
    ctx.save();
    ctx.beginPath();
    ctx.arc(540, avY, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(av, 540 - r, avY - r, r * 2, r * 2);
    ctx.restore();
  } catch {
    const fallback = ctx.createLinearGradient(540 - r, avY - r, 540 + r, avY + r);
    fallback.addColorStop(0, '#5C0008');
    fallback.addColorStop(1, WARNA.crimson);
    ctx.fillStyle = fallback;
    ctx.beginPath();
    ctx.arc(540, avY, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 130px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(String(username || 'A').slice(0, 1).toUpperCase(), 540, avY + 46);
  }
  ctx.strokeStyle = WARNA.crimson;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(540, avY, r + 6, 0, Math.PI * 2);
  ctx.stroke();

  // Nama
  ctx.fillStyle = WARNA.ink;
  ctx.font = 'bold 56px "Segoe UI", system-ui, sans-serif';
  tulisMuat(ctx, username || 'Pendengar', 540, avY + 208, 880, 56, 30);

  // Dua kotak statistik
  const tileW = 396;
  const tileH = 132;
  const tileY = avY + 246;
  const tiles = [
    { label: 'TOTAL DIDENGAR', value: durationLabel },
    { label: 'LAGU SELESAI', value: String(plays || 0) },
  ];
  tiles.forEach((t, i) => {
    const x = i === 0 ? 540 - tileW - 16 : 540 + 16;
    ctx.fillStyle = WARNA.surface;
    roundRect(ctx, x, tileY, tileW, tileH, 24);
    ctx.fill();
    ctx.strokeStyle = WARNA.line;
    ctx.lineWidth = 2;
    roundRect(ctx, x, tileY, tileW, tileH, 24);
    ctx.stroke();
    ctx.fillStyle = WARNA.faint;
    ctx.font = '600 20px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(t.label, x + tileW / 2, tileY + 48);
    ctx.fillStyle = WARNA.ink;
    ctx.font = 'bold 44px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(t.value, x + tileW / 2, tileY + 102);
  });

  // Lagu favorit (mode profil)
  if (mode === 'profil' && Array.isArray(songs) && songs.length) {
    const startY = tileY + tileH + 56;
    ctx.textAlign = 'left';
    ctx.fillStyle = WARNA.muted;
    ctx.font = '600 24px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('LAGU PALING SERING DIDENGAR', 96, startY);

    const daftar = songs.slice(0, 3);
    for (let i = 0; i < daftar.length; i += 1) {
      const s = daftar[i];
      const y = startY + 26 + i * 108;
      let thumb = null;
      try {
        thumb = await loadImg(s.thumb);
      } catch { /* tanpa cover */ }
      if (thumb) {
        ctx.save();
        roundRect(ctx, 96, y, 88, 88, 14);
        ctx.clip();
        ctx.drawImage(thumb, 96, y, 88, 88);
        ctx.restore();
      } else {
        ctx.fillStyle = WARNA.surface;
        roundRect(ctx, 96, y, 88, 88, 14);
        ctx.fill();
      }
      ctx.fillStyle = WARNA.ink;
      ctx.font = '600 30px "Segoe UI", system-ui, sans-serif';
      let nama = String(s.name || '');
      while (ctx.measureText(nama).width > 640 && nama.length > 6) nama = `${nama.slice(0, -2)}`;
      ctx.fillText(nama, 208, y + 42);
      ctx.fillStyle = WARNA.faint;
      ctx.font = '500 24px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(s.count ? `${s.count} kali diputar` : 'lagu favorit', 208, y + 76);
      ctx.textAlign = 'right';
      ctx.fillStyle = WARNA.neon;
      ctx.font = 'bold 28px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(`#${i + 1}`, 984, y + 58);
      ctx.textAlign = 'left';
    }
  }

  // Footer
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'rgba(177, 18, 38, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(240, 1268);
  ctx.lineTo(840, 1268);
  ctx.stroke();
  ctx.fillStyle = WARNA.faint;
  ctx.font = '500 26px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(`NOXA Sound  ·  ${hostTampil()}`, 540, 1318);

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
