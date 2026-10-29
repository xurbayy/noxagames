'use client';

// Top Listener interaktif: baris bisa diklik -> kartu profil mini (modal),
// tiap baris + modal punya tombol Share yang merender kartu peringkat
// 1080x1350 (4:5) ke canvas dengan palet resmi NOXA, lalu Web Share API (HP)
// atau unduh PNG + salin link (desktop). Guest yang share diarahkan ke login.
import { useState } from 'react';
import Emoji from '../Emoji';
import Thumb from '../Thumb';
import { durasi } from '../../lib/format';

function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function renderCard(item, rank) {
  const c = document.createElement('canvas');
  c.width = 1080;
  c.height = 1350;
  const ctx = c.getContext('2d');

  // Latar studio gelap + semburat merah
  const g = ctx.createLinearGradient(0, 0, 0, 1350);
  g.addColorStop(0, '#030303');
  g.addColorStop(0.55, '#080303');
  g.addColorStop(1, '#3B0004');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1080, 1350);
  const rg = ctx.createRadialGradient(540, 430, 60, 540, 430, 520);
  rg.addColorStop(0, 'rgba(184, 0, 18, 0.35)');
  rg.addColorStop(1, 'rgba(184, 0, 18, 0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, 1080, 920);
  ctx.fillStyle = '#B80012';
  ctx.fillRect(0, 0, 1080, 14);

  // Logo bulet
  try {
    const logo = await loadImg('/logo.png');
    ctx.save();
    ctx.beginPath();
    ctx.arc(540, 150, 70, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, 470, 80, 140, 140);
    ctx.restore();
    ctx.strokeStyle = 'rgba(184, 0, 18, 0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(540, 150, 72, 0, Math.PI * 2);
    ctx.stroke();
  } catch {}

  ctx.textAlign = 'center';
  ctx.fillStyle = '#A89899';
  ctx.font = '600 34px Inter, sans-serif';
  ctx.fillText('TOP LISTENER', 540, 300);
  ctx.fillStyle = '#FF101F';
  ctx.shadowColor = 'rgba(255, 0, 26, 0.5)';
  ctx.shadowBlur = 24;
  ctx.font = 'bold 100px Inter, sans-serif';
  ctx.fillText(`#${rank}`, 540, 416);
  ctx.shadowBlur = 0;

  // Avatar bulat + ring
  const xc = 540, yc = 640, r = 170;
  try {
    const av = item.avatar ? await loadImg(item.avatar) : null;
    ctx.save();
    ctx.beginPath();
    ctx.arc(xc, yc, r, 0, Math.PI * 2);
    ctx.clip();
    if (av) {
      ctx.drawImage(av, xc - r, yc - r, r * 2, r * 2);
    } else {
      throw new Error('tanpa avatar');
    }
    ctx.restore();
  } catch {
    const g2 = ctx.createLinearGradient(xc - r, yc - r, xc + r, yc + r);
    g2.addColorStop(0, '#5C0008');
    g2.addColorStop(1, '#B80012');
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.arc(xc, yc, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 150px Inter, sans-serif';
    ctx.fillText(String(item.username || 'A').slice(0, 1).toUpperCase(), xc, yc + 52);
  }
  ctx.strokeStyle = '#B80012';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(xc, yc, r + 8, 0, Math.PI * 2);
  ctx.stroke();

  // Nama + statistik
  let nama = item.username || 'Pendengar';
  ctx.fillStyle = '#F7F1F1';
  ctx.font = 'bold 62px Inter, sans-serif';
  while (ctx.measureText(nama).width > 900 && nama.length > 4) nama = nama.slice(0, -2);
  ctx.fillText(nama, 540, 930);
  ctx.fillStyle = '#A89899';
  ctx.font = '600 40px Inter, sans-serif';
  ctx.fillText(`Total Didengar  ${durasi(item.duration)}`, 540, 1010);
  ctx.fillText(`${item.plays} lagu selesai didengar`, 540, 1070);

  // Garis + footer
  ctx.strokeStyle = 'rgba(184, 0, 18, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(240, 1160);
  ctx.lineTo(840, 1160);
  ctx.stroke();
  ctx.fillStyle = '#6E5C5E';
  ctx.font = '500 32px Inter, sans-serif';
  ctx.fillText('NOXA Sound - Bot hiburan audio Discord', 540, 1240);

  return c;
}

export default function TopListenerList({ items, login = false }) {
  const [buka, setBuka] = useState(null); // index item di modal
  const [toast, setToast] = useState('');

  function tampilToast(t) {
    setToast(t);
    setTimeout(() => setToast(''), 2600);
  }

  async function bagikan(item, rank) {
    if (!login) {
      window.location.href = '/login?returnTo=%2Ftop';
      return;
    }
    try {
      const canvas = await renderCard(item, rank);
      const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
      const file = new File([blob], `noxa-top-listener-${rank}.png`, { type: 'image/png' });
      const link = `${window.location.origin}/top`;
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'NOXA Sound', text: `Top Listener #${rank} di NOXA Sound` });
        return;
      }
      // Desktop: unduh PNG + salin link
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(a.href);
      try { await navigator.clipboard.writeText(link); } catch {}
      tampilToast('Kartu diunduh dan link leaderboard disalin');
    } catch {
      tampilToast('Gagal membuat kartu. Coba lagi.');
    }
  }

  return (
    <>
      <div className="card divide-y divide-line overflow-hidden">
        {items.map((u, i) => (
          <div
            key={u.id}
            onClick={() => setBuka(i)}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-surface3"
          >
            <span className="w-8 shrink-0 text-center">
              {RANK_EMOJI[i] ? <Emoji name={RANK_EMOJI[i]} size={22} /> : <span className="text-sm font-bold tabular-nums text-faint">{i + 1}</span>}
            </span>
            <Thumb src={u.avatar} alt="" size="h-10 w-10" rounded="rounded-full" emoji="userprofile" emojiSize={16} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{u.username}</div>
              <div className="text-xs text-faint">{u.plays} lagu selesai didengar</div>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); bagikan(u, i + 1); }}
              title="Bagikan peringkat ini"
              className="btn-ghost shrink-0 !rounded-lg !px-2.5 !py-1.5"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>
            <span className="shrink-0 text-sm font-bold tabular-nums text-neon">{durasi(u.duration)}</span>
          </div>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-linebright bg-surface2 px-5 py-2.5 text-sm font-medium text-ink shadow-2xl">
          {toast}
        </div>
      )}

      {buka != null && items[buka] && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setBuka(null)}>
          <div className="card w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="badge badge-danger">Top #{buka + 1}</span>
              <button type="button" onClick={() => setBuka(null)} className="text-faint hover:text-ink transition-colors cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="mt-5 flex flex-col items-center text-center">
              <Thumb src={items[buka].avatar} alt="" size="h-24 w-24" rounded="rounded-full" emoji="userprofile" emojiSize={36} />
              <h3 className="mt-3 font-display text-xl font-bold">{items[buka].username}</h3>
              <p className="mt-1 text-sm text-muted">Pendengar paling setia di NOXA Sound</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-surface p-3 text-center">
                <div className="font-display text-lg font-bold tabular-nums text-neon">{durasi(items[buka].duration)}</div>
                <div className="text-xs text-faint">Total Didengar</div>
              </div>
              <div className="rounded-xl border border-line bg-surface p-3 text-center">
                <div className="font-display text-lg font-bold tabular-nums">{items[buka].plays}</div>
                <div className="text-xs text-faint">Lagu Selesai</div>
              </div>
            </div>
            <button type="button" onClick={() => bagikan(items[buka], buka + 1)} className="btn-primary mt-5 w-full justify-center">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Bagikan Kartu Peringkat
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-faint">
              Kartu 1080x1350 siap diposting. Guest akan diminta login dulu.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

const RANK_EMOJI = ['number1', 'number2', 'number3'];
