'use client';

// GrafikBatang - grafik batang SVG ringan tanpa library (panel admin).
// Dipakai untuk tren aktivitas harian (lagu/durasi/server/pendengar baru)
// dan omzet harian. Ramah sentuh: baris bisa diketuk untuk membaca nilai;
// tanpa pilihan = tampilkan nilai hari terakhir.
import { useId, useState } from 'react';

/**
 * @param {Array<{hari:number, nilai:number}>} titik - data per hari (UTC ms)
 * @param {(n:number)=>string} format - pengubah angka jadi label
 * @param {string} warna - warna utama bar
 * @param {string} satuan - label satuan untuk caption ("lagu", "Rp", ...)
 */
export default function GrafikBatang({ titik, format = (n) => String(n), warna = '#2DD4BF', satuan = '' }) {
  const [pilih, setPilih] = useState(null);
  const gradId = useId();

  if (!Array.isArray(titik) || titik.length === 0) return null;

  const n = titik.length;
  const maks = Math.max(...titik.map((t) => Number(t.nilai) || 0), 1);

  // Geometri viewBox: lebar tetap 640, tinggi 190; scale ke lebar container.
  const VW = 640;
  const VH = 190;
  const padAtas = 10;
  const padBawah = 6;
  const areaTinggi = VH - padAtas - padBawah;
  const slot = VW / n;
  const barW = Math.min(30, Math.max(6, slot * 0.6));

  const labelHari = (ms) => new Date(ms).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  const idxAktif = pilih != null && pilih >= 0 && pilih < n ? pilih : n - 1;
  const aktif = titik[idxAktif];

  return (
    <div>
      {/* Caption nilai aktif (sekaligus pengganti tooltip yang ramah sentuh) */}
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <span className="font-display text-xl font-bold tabular-nums text-ink">{format(Number(aktif.nilai) || 0)}</span>
          {satuan && <span className="ml-1.5 text-xs text-faint">{satuan}</span>}
        </div>
        <span className="shrink-0 text-xs text-faint">{labelHari(aktif.hari)}</span>
      </div>

      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-40 w-full sm:h-[190px]"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Grafik harian ${satuan || 'nilai'}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={warna} stopOpacity="1" />
            <stop offset="100%" stopColor={warna} stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Garis acuan 25/50/75/100% */}
        {[0.25, 0.5, 0.75, 1].map((f) => {
          const y = padAtas + areaTinggi * (1 - f);
          return (
            <line
              key={f}
              x1="0"
              x2={VW}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Batang */}
        {titik.map((t, i) => {
          const v = Number(t.nilai) || 0;
          const h = Math.max(v > 0 ? 3 : 0, (v / maks) * (areaTinggi - 4));
          const x = i * slot + (slot - barW) / 2;
          const y = padAtas + areaTinggi - h;
          const terpilih = i === idxAktif;
          return (
            <g key={t.hari}>
              {/* Area sentuh lebar penuh per slot supaya gampang diketuk di HP */}
              <rect
                x={i * slot}
                y={0}
                width={slot}
                height={VH}
                fill="transparent"
                onClick={() => setPilih(i === idxAktif ? null : i)}
                className="cursor-pointer"
              />
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={2}
                fill={terpilih ? warna : `url(#${gradId})`}
                stroke={terpilih ? '#E2F1EC' : 'none'}
                strokeWidth={terpilih ? 1.5 : 0}
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
            </g>
          );
        })}
      </svg>

      {/* Label sumbu: hari pertama / tengah / terakhir */}
      <div className="mt-1.5 flex justify-between text-[10px] text-faint">
        <span>{labelHari(titik[0].hari)}</span>
        {n > 6 && <span>{labelHari(titik[Math.floor((n - 1) / 2)].hari)}</span>}
        <span>{labelHari(titik[n - 1].hari)}</span>
      </div>
    </div>
  );
}

/**
 * Deret harian dari history kumulatif (stat_history). Total di snapshot bot
 * bersifat KUMULATIF, jadi "aktivitas hari itu" = selisih dengan cum terakhir
 * hari sebelumnya. Hari tanpa baris (bot offline) memakai cum terakhir, jadi
 * delta masuk ke hari saat data muncul lagi - tidak ada angka negatif.
 */
export function deretHarian(history, key, nDays) {
  const DAY = 86400000;
  const valid = (Array.isArray(history) ? history : [])
    .map((h) => ({ day: Number(h.day), cum: Number(h[key]) || 0 }))
    .filter((h) => Number.isFinite(h.day))
    .sort((a, b) => a.day - b.day);
  if (valid.length < 2) return [];

  const last = valid[valid.length - 1].day;
  const start = last - (nDays - 1) * DAY;

  const out = [];
  let idx = -1;
  let prevCum = null;
  for (let d = start; d <= last; d += DAY) {
    while (idx + 1 < valid.length && valid[idx + 1].day <= d) idx += 1;
    if (idx < 0) continue; // belum ada baseline sama sekali
    const cum = valid[idx].cum;
    if (prevCum == null) { prevCum = cum; continue; } // hari baseline: delta belum diketahui
    out.push({ hari: d, nilai: Math.max(0, cum - prevCum) });
    prevCum = cum;
  }
  return out;
}

/** Ringkas Rp untuk label sumbu: 15000 -> "15rb". */
export function ringkasRp(n) {
  const v = Number(n) || 0;
  if (v >= 1000000) return `${(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1)}jt`;
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}rb`;
  return String(v);
}

/**
 * Deret KUMULATIF per hari (angka akhir hari = maksimum yang tersimpan),
 * dipakai grafik "total tumbuh" - hari tanpa baris memakai nilai terakhir.
 */
export function kumulatifHarian(history, key, nDays) {
  const DAY = 86400000;
  const valid = (Array.isArray(history) ? history : [])
    .map((h) => ({ day: Number(h.day), cum: Number(h[key]) || 0 }))
    .filter((h) => Number.isFinite(h.day))
    .sort((a, b) => a.day - b.day);
  if (valid.length === 0) return [];

  const last = valid[valid.length - 1].day;
  const out = [];
  let idx = -1;
  for (let d = last - (nDays - 1) * DAY; d <= last; d += DAY) {
    while (idx + 1 < valid.length && valid[idx + 1].day <= d) idx += 1;
    if (idx < 0) continue; // sebelum data pertama: tidak ada yang bisa digambar
    out.push({ hari: d, nilai: valid[idx].cum });
  }
  return out;
}
