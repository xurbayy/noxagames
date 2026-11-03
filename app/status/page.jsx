import Emoji from '../components/Emoji';
import { getDb, schemaReady } from '../lib/db';
import { getSnapshot, botAlive, totals } from '../lib/snapshot';
import { pageMeta, SUPPORT_INVITE } from '../lib/site';

export const dynamic = 'force-dynamic';

export const metadata = pageMeta({
  title: 'Status Sistem',
  description:
    'Uptime NOXA Sound 30 hari terakhir, insiden terdeteksi otomatis dari heartbeat bridge bot, dan kondisi layanan saat ini. Transparan, bukan angka hiasan.',
  path: '/status',
});

// ==========================================
// /status - halaman status publik (pola Soundly)
// ==========================================
// Sumber data 100% nyata:
//   - status_heartbeats: satu titik tiap 30 menit, ditulis dari push snapshot
//     bot (POST /api/bot/stats). Celah > GAP_MS antar-titik = bot mati /
//     bridge putus = INSIDEN, dihitung otomatis.
//   - monitor_snapshots: kondisi live (usia snapshot terakhir).
// Hari-hari awal (sebelum 30 hari heartbeat terkumpul) tampil abu "belum ada
// data" - tidak pura-pura 100% sejak hari pertama.
const MENIT = 60_000;
const BUCKET_MS = 30 * MENIT;      // resolusi heartbeat
const GAP_MS = 75 * MENIT;         // celah > ini = bot/bridge turun (graceful)
const HARI = 86400000;

function jam(jumlahMenit) {
  const m = Math.max(1, Math.round(jumlahMenit));
  if (m < 60) return `${m} menit`;
  const h = Math.floor(m / 60);
  const sisa = m % 60;
  if (h < 24) return sisa ? `${h}j ${sisa}m` : `${h} jam`;
  return `${Math.floor(h / 24)} hari ${h % 24} jam`;
}

export default async function StatusPage() {
  const now = Date.now();
  const mulai = now - 30 * HARI;

  let heartbeats = [];
  try {
    await schemaReady();
    const db = getDb();
    const res = await db.execute({
      sql: 'SELECT ts FROM status_heartbeats WHERE ts >= ? ORDER BY ts ASC',
      args: [mulai],
    });
    heartbeats = res.rows.map((r) => Number(r.ts));
  } catch { /* DB down: halaman tetap render, semua komponen jujur "tidak diketahui" */ }

  const snap = await getSnapshot();
  const hidup = botAlive(snap);
  const t = totals(snap?.data);

  // --- Hitung insiden: celah antar-heartbeat + celah terakhir -> sekarang ---
  const insiden = [];
  for (let i = 1; i < heartbeats.length; i += 1) {
    const gap = heartbeats[i] - heartbeats[i - 1];
    if (gap > GAP_MS) {
      insiden.push({ mulai: heartbeats[i - 1] + BUCKET_MS, selesai: heartbeats[i], lamaMenit: gap / MENIT });
    }
  }
  const titikTerakhir = heartbeats.length ? heartbeats[heartbeats.length - 1] : null;
  const celahHidup = titikTerakhir ? now - titikTerakhir : null;
  const sedangInsiden = celahHidup != null && celahHidup > GAP_MS;
  if (sedangInsiden) {
    insiden.push({ mulai: titikTerakhir + BUCKET_MS, selesai: null, lamaMenit: (now - titikTerakhir) / MENIT });
  }

  // --- Status utama (pill besar) ---
  const statusUtama = hidup && !sedangInsiden
    ? { label: 'Semua sistem beroperasi', kelas: 'border-[#22C55E] bg-[#14532D] text-[#86EFAC]', dot: 'bg-[#22C55E]' }
    : hidup && sedangInsiden
      ? { label: 'Gangguan terdeteksi - kami sedang memeriksa', kelas: 'border-[#F59E0B] bg-[#3A2503] text-[#FBBF24]', dot: 'bg-[#F59E0B]' }
      : { label: 'Bot sedang offline', kelas: 'border-crimson bg-[#3B0004] text-neon', dot: 'bg-crimson' };

  // --- Komponen layanan (semuanya dari sinyal nyata) ---
  const layanan = [
    {
      nama: 'Bot Discord (NOXA#3916)',
      ok: hidup,
      ket: hidup ? `Snapshot terakhir ${Math.max(1, Math.floor((snap?.ageSec ?? 0) / 60))} menit lalu` : 'Belum ada snapshot baru dalam 10 menit',
    },
    {
      nama: 'Situs web',
      ok: true,
      ket: 'Kamu sedang membacanya',
    },
    {
      nama: 'Bridge data (bot -> web)',
      ok: !sedangInsiden,
      ket: sedangInsiden ? `Celah heartbeat ${jam((now - titikTerakhir) / MENIT)}` : 'Heartbeat rutin masuk',
    },
    {
      nama: 'Pembayaran QRIS (QiosPay)',
      ok: null,
      ket: 'Diverifikasi saat transaksi dibuat',
    },
  ];

  // --- Papan 30 hari: satu sel per hari, kualitas dari coverage heartbeat ---
  const papan = [];
  for (let d = 0; d < 30; d += 1) {
    const hariMulai = mulai + d * HARI;
    const hariAkhir = hariMulai + HARI;
    const dalam = heartbeats.filter((x) => x >= hariMulai && x < hariAkhir);
    // Coverage: jumlah bucket yang diharapkan dalam hari ini (potong di 'now').
    const batas = Math.min(hariAkhir, now);
    const harusAda = Math.max(1, Math.floor((batas - hariMulai) / BUCKET_MS));
    const cakupan = Math.min(1, dalam.length / harusAda);
    let status = 'kosong'; // belum ada data (awal deploy)
    if (dalam.length >= 2) status = cakupan >= 0.98 ? 'sempurna' : cakupan >= 0.9 ? 'bagus' : 'terganggu';
    else if (dalam.length === 1 && cakupan >= 0.5) status = 'bagus';
    papan.push({ hariMulai, status, cakupan });
  }
  const adaData = papan.some((p) => p.status !== 'kosong');
  const uptimeHari = papan.filter((p) => p.status === 'sempurna' || p.status === 'bagus').length;
  const hariBerdata = papan.filter((p) => p.status !== 'kosong').length;
  const uptimePct = hariBerdata > 0 ? ((uptimeHari / hariBerdata) * 100).toFixed(2) : null;

  const WAL = 'rounded-sm w-full h-8';
  const WARNA_SEL = {
    sempurna: 'bg-[#16A34A]',
    bagus: 'bg-[#65B45C]',
    terganggu: 'bg-[#F59E0B]',
    kosong: 'bg-surface3',
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 min-h-[calc(100vh-6rem)] sm:px-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Status Sistem</h1>
          <div className="accent-bar mt-3" aria-hidden="true" />
        </div>
        <span className="noxa-badge border border-line bg-surface2 text-muted whitespace-nowrap">
          Auto-refresh tiap buka
        </span>
      </div>

      {/* Banner status besar */}
      <div className={`card mt-8 flex items-center gap-3 border px-5 py-4 ${statusUtama.kelas}`}>
        <span className={`h-3 w-3 shrink-0 rounded-full ${statusUtama.dot} live-dot`} aria-hidden="true" />
        <span className="text-sm font-bold">{statusUtama.label}</span>
      </div>

      {/* Angka ringkas */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="stat-tile p-4">
          <div className="text-xs text-muted">Uptime 30 hari</div>
          <div className="mt-1 font-display text-xl font-bold tabular-nums">{uptimePct ? `${uptimePct}%` : '—'}</div>
        </div>
        <div className="stat-tile p-4">
          <div className="text-xs text-muted">Insiden 30 hari</div>
          <div className="mt-1 font-display text-xl font-bold tabular-nums">{insiden.length}</div>
        </div>
        <div className="stat-tile p-4">
          <div className="text-xs text-muted">Server aktif</div>
          <div className="mt-1 font-display text-xl font-bold tabular-nums">{t.servers}</div>
        </div>
        <div className="stat-tile p-4">
          <div className="text-xs text-muted">Lagu diputar</div>
          <div className="mt-1 font-display text-xl font-bold tabular-nums">{t.plays.toLocaleString('id-ID')}</div>
        </div>
      </div>

      {/* Papan harian 30 hari */}
      <section className="mt-8">
        <h2 className="font-display text-base font-bold">30 hari terakhir</h2>
        {adaData ? (
          <>
            <div className="mt-3 flex gap-1">
              {papan.map((p) => (
                <div
                  key={p.hariMulai}
                  title={`${new Date(p.hariMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${{
                    sempurna: 'beroperasi normal',
                    bagus: 'normal dengan celah kecil',
                    terganggu: 'terganggu',
                    kosong: 'belum ada data',
                  }[p.status]}`}
                  className={`${WAL} ${WARNA_SEL[p.status]}`}
                />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-faint">
              <span>{new Date(mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
              <span>{new Date(now).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-faint">
              Selabu = hari sebelum pengumpulan data dimulai. Kualitas dihitung dari kelengkapan heartbeat
              bridge tiap 30 menit - bukan angka tempelan.
            </p>
          </>
        ) : (
          <p className="mt-3 card p-5 text-center text-xs leading-relaxed text-faint">
            Pengumpulan data uptime baru dimulai. Papan ini terisi otomatis dalam beberapa hari
            sementara heartbeat bridge terkumpul.
          </p>
        )}
      </section>

      {/* Komponen layanan */}
      <section className="mt-8">
        <h2 className="font-display text-base font-bold">Layanan</h2>
        <div className="card mt-3 divide-y divide-line">
          {layanan.map((l) => (
            <div key={l.nama} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink break-words">{l.nama}</div>
                <div className="mt-0.5 text-[11px] text-faint break-words">{l.ket}</div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  l.ok === true
                    ? 'bg-[#14532D] text-[#86EFAC] border border-[#22C55E]'
                    : l.ok === false
                      ? 'bg-[#3B0004] text-neon border border-crimson'
                      : 'bg-surface3 text-faint border border-line'
                }`}
              >
                {l.ok === true ? 'Operasional' : l.ok === false ? 'Gangguan' : 'Belum terpantau'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Riwayat insiden */}
      <section className="mt-8">
        <h2 className="font-display text-base font-bold">Insiden terdeteksi otomatis</h2>
        {insiden.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            {adaData ? 'Tidak ada insiden dalam 30 hari terakhir.' : 'Belum ada data heartbeat - daftar ini terisi setelah bridge berjalan beberapa hari.'}
          </p>
        ) : (
          <ul className="card mt-3 divide-y divide-line">
            {insiden.slice(-10).reverse().map((ins, i) => (
              <li key={ins.mulai} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-ink">
                    {new Date(ins.mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {' · '}
                    {new Date(ins.mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>
                  <span className={`noxa-badge shrink-0 ${ins.selesai ? 'bg-surface3 text-faint border border-line' : 'bg-[#3B0004] text-neon border border-crimson'}`}>
                    {ins.selesai ? `Selesai · ${jam(ins.lamaMenit)}` : `Berlangsung · ${jam(ins.lamaMenit)}`}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-faint">
                  Bridge tidak mengirim snapshot selama {jam(ins.lamaMenit)}.
                  {ins.selesai ? '' : ' Tim sedang memeriksa.'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="card mt-10 flex flex-col items-center gap-3 p-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2.5">
          <Emoji name="bantuan" size={20} />
          <p className="text-sm text-muted">
            Gangguan yang tidak tercatat di sini? Lapor lewat tombol feedback di navbar atau server dukungan.
          </p>
        </div>
        <a
          href={SUPPORT_INVITE}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="btn-ghost shrink-0 !px-4 !py-2 text-xs"
        >
          Server Dukungan
        </a>
      </div>
    </div>
  );
}
