'use client';

// AdminShell: kerangka panel admin (header + konten) + seluruh isi monitoring
// dalam satu client component (dashboard live + player lookup).
// Aturan panel: tanpa confirm()/alert() bawaan, error tampil inline.
import { useCallback, useEffect, useRef, useState } from 'react';
import Emoji from '../Emoji';
import { durasi } from '../../lib/format';
import PremiumManagement from './PremiumManagement';

const POLL_MS = 5000;

export default function AdminShell() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/data', { cache: 'no-store' });
      if (res.status === 403) {
        window.location.href = '/login?admin=1';
        return;
      }
      const d = await res.json();
      setData(d);
      setErr(null);
      setLastUpdate(new Date());
    } catch {
      setErr('Gagal mengambil data. Coba lagi.');
    }
  }, []);

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, POLL_MS);
    return () => clearInterval(timerRef.current);
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 min-h-[calc(100vh-6rem)]">
      <div className="bg-grid pointer-events-none fixed inset-x-0 top-0 -z-10 h-72" aria-hidden="true" />
      {/* Header panel: tanpa baris akun - identitas & keluar sudah ada di navbar */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-faint">Panel Admin NOXA Sound</div>
        <h1 className="font-display text-xl font-bold">Monitoring</h1>
      </div>

      <div className="hairline my-6" />

      {err && <div className="card border-crimson p-4 text-sm text-ink">{err}</div>}

      {!data && !err && (
        <div className="card p-6 space-y-3">
          <div className="skeleton h-5 w-40" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
          </div>
          <div className="skeleton h-24" />
          <p className="text-center text-xs text-faint">Menyambung data...</p>
        </div>
      )}

      {data && (
        <div className="space-y-8">
          <DashboardLive data={data} lastUpdate={lastUpdate} />
          <Statistik data={data} />
          <PremiumManagement />
          <PlayerLookup />
          <RingkasanTop data={data} />
        </div>
      )}
    </div>
  );
}

function DashboardLive({ data, lastUpdate }) {
  const bot = data.bot || {};
  const t = data.totals || {};
  const live = data.live || {};

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">Status Bridge</h2>
        <span className="text-xs text-faint">
          {lastUpdate ? `Diperbarui ${lastUpdate.toLocaleTimeString('id-ID')}` : ''} (auto tiap 5 dtk)
        </span>
      </div>

      <div className="card flex flex-wrap items-center gap-x-8 gap-y-3 p-4">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${bot.alive ? 'bg-ok live-dot' : 'bg-crimson'}`} />
          <span className="text-sm font-bold">{bot.alive ? 'Bot Terhubung' : 'Bot Offline'}</span>
          <span className="text-xs text-faint">{bot.ageLabel || ''}</span>
        </div>
        {live.botPingMs != null && (
          <span className="text-xs text-muted">Ping gateway {live.botPingMs} ms</span>
        )}
        {live.uptimeSec != null && (
          <span className="text-xs text-muted">Uptime {durasi(live.uptimeSec)}</span>
        )}
        <span className="text-xs text-muted">
          {live.playingServers > 0
            ? `${live.playingServers} server sedang memutar, ${live.listeners} pendengar live`
            : 'Tidak ada pemutaran aktif sekarang'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatBox emoji="musik" label="Server" angka={t.servers ?? 0} />
        <StatBox emoji="userprofile" label="Pendengar Tercatat" angka={t.listeners ?? 0} />
        <StatBox emoji="mulai" label="Lagu Diputar" angka={t.plays ?? 0} />
        <StatBox emoji="jam" label="Total Didengar" angka={durasi(t.durationSec)} />
      </div>

      {/* Live players */}
      <div className="mt-4">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-faint">
          <Emoji name="radio" size={14} /> Pemutaran Live
        </h3>
        {!Array.isArray(live.players) || live.players.length === 0 ? (
          <div className="card p-6 text-center text-sm text-faint">Tidak ada server yang sedang memutar.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {live.players.map((p, i) => (
              <div key={`${p.guildId}-${i}`} className="card flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5">
                <Emoji name={p.mode === 'radio' ? 'radio' : p.mode === 'podcast' ? 'podcast' : 'musik'} size={18} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-semibold text-ink leading-snug break-words">{p.title}</div>
                  <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">
                    {p.guildName} {p.requester ? `diminta ${p.requester}` : ''} {p.listeners > 0 ? `· ${p.listeners} pendengar` : ''}
                  </div>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-faint">
                  {p.positionSec > 0 ? `${durasi(p.positionSec)} / ${durasi(p.durationSec)}` : durasi(p.durationSec)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Statistik mendalam dari snapshot terakhir: rasio per unit, porsi server dominan,
// dan intensitas pemutaran lagu teratas.
function Statistik({ data }) {
  const t = data.totals || {};
  const server = Array.isArray(data.topServers) ? data.topServers.slice(0, 5) : [];
  const songs = Array.isArray(data.topSongs) ? data.topSongs.slice(0, 5) : [];
  const per = (a, b) => (Number(b) > 0 ? Number(a) / Number(b) : 0);

  const kpis = [
    { label: 'Rata-rata Waktu / User', nilai: durasi(Math.round(per(t.durationSec, t.listeners))), sub: 'Durasi dengar per akun' },
    { label: 'Rata-rata Lagu / User', nilai: `${per(t.plays, t.listeners).toFixed(1)}x`, sub: 'Lagu selesai per pendengar' },
    { label: 'Intensitas / Server', nilai: `${per(t.plays, t.servers).toFixed(1)}x`, sub: 'Lagu diputar per guild' },
    { label: 'Durasi Rata-rata / Lagu', nilai: durasi(Math.round(per(t.durationSec, t.plays))), sub: 'Panjang trek rata-rata' },
  ];

  const totalServer = server.reduce((a, s) => a + (Number(s.duration) || 0), 0);
  const maxSongCount = songs.reduce((m, s) => Math.max(m, Number(s.count) || 0), 0);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Statistik & Analisis</h2>
        <span className="text-xs text-faint">Agregat bot real-time</span>
      </div>

      {/* Grid KPI Micro-cards */}
      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-3 sm:p-4">
            <div className="text-[11px] sm:text-xs text-muted leading-tight break-words">{k.label}</div>
            <div className="mt-1 font-display text-lg sm:text-xl font-bold tabular-nums text-ink break-words">{k.nilai}</div>
            <div className="mt-0.5 text-[10px] sm:text-[11px] text-faint leading-tight break-words">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Distribusi Server */}
        <div className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-faint">
              <Emoji name="party" size={14} /> Dominasi 5 Server Teratas
            </div>
            <span className="text-[11px] text-faint">Berdasarkan durasi</span>
          </div>
          {server.length === 0 ? (
            <p className="text-sm text-faint">Belum ada data server.</p>
          ) : (
            <ul className="space-y-3.5">
              {server.map((g, idx) => {
                const dur = Number(g.duration) || 0;
                const pct = totalServer > 0 ? Math.round((dur / totalServer) * 100) : 0;
                return (
                  <li key={g.id || g.name || idx}>
                    <div className="flex items-baseline justify-between gap-2 sm:gap-3 text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-xs font-bold tabular-nums text-faint shrink-0">#{idx + 1}</span>
                        <span className="font-semibold text-ink text-xs sm:text-sm leading-snug break-words">{g.name}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <span className="text-[11px] sm:text-xs text-muted">{durasi(dur)}</span>
                        <span className="rounded bg-surface3 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-neon">{pct}%</span>
                      </div>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-crimson to-amber transition-all duration-500"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Popularitas Lagu Teratas */}
        <div className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-faint">
              <Emoji name="musik" size={14} /> Intensitas 5 Lagu Terpopuler
            </div>
            <span className="text-[11px] text-faint">Frekuensi putar</span>
          </div>
          {songs.length === 0 ? (
            <p className="text-sm text-faint">Belum ada data lagu.</p>
          ) : (
            <ul className="space-y-3.5">
              {songs.map((s, idx) => {
                const count = Number(s.count) || 0;
                const pct = maxSongCount > 0 ? Math.round((count / maxSongCount) * 100) : 0;
                return (
                  <li key={s.name || idx}>
                    <div className="flex items-baseline justify-between gap-2 sm:gap-3 text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-xs font-bold tabular-nums text-faint shrink-0">#{idx + 1}</span>
                        <span className="font-semibold text-ink text-xs sm:text-sm leading-snug break-words">{s.name}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <span className="text-[11px] sm:text-xs text-muted">{durasi(s.duration)}</span>
                        <span className="rounded bg-surface3 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-ink">{count}x</span>
                      </div>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-neon to-crimson transition-all duration-500"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function PlayerLookup() {
  const [id, setId] = useState('');
  const [status, setStatus] = useState({ fase: 'idle', pesan: null, profile: null });
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);

  async function cari(e) {
    e.preventDefault();
    setKonfirmasiHapus(false);
    const clean = id.replace(/\D/g, '');
    if (!/^\d{17,20}$/.test(clean)) {
      setStatus({ fase: 'idle', pesan: 'Discord ID harus 17 sampai 20 digit angka.', profile: null });
      return;
    }
    setStatus({ fase: 'mengirim', pesan: null, profile: null });
    try {
      const res = await fetch('/api/admin/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discordId: clean }),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        setStatus({ fase: 'idle', pesan: d.error || 'Gagal mengantrekan lookup.', profile: null });
        return;
      }
      setStatus({ fase: 'menunggu', pesan: null, profile: null });
      tungguHasil(clean, 0);
    } catch {
      setStatus({ fase: 'idle', pesan: 'Koneksi bermasalah.', profile: null });
    }
  }

  async function tungguHasil(discordId, coba) {
    if (coba > 15) {
      setStatus({ fase: 'idle', pesan: 'Bot belum merespons. Pastikan bot online lalu coba lagi.', profile: null });
      return;
    }
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const res = await fetch(`/api/admin/lookup?discordId=${discordId}`, { cache: 'no-store' });
      const d = await res.json();
      if (d.pending) {
        tungguHasil(discordId, coba + 1);
        return;
      }
      if (d.profile) {
        setStatus({ fase: 'idle', pesan: null, profile: d.profile });
        return;
      }
      setStatus({ fase: 'idle', pesan: d.failed ? 'Bot gagal membaca profil user ini.' : 'Tidak ada data untuk ID ini.', profile: null });
    } catch {
      setStatus({ fase: 'idle', pesan: 'Koneksi bermasalah saat menunggu hasil.', profile: null });
    }
  }

  // Menghapus data profil user ini dari web (permintaan penghapusan data).
  async function hapusData(discordId) {
    setStatus((s) => ({ ...s, fase: 'menghapus' }));
    try {
      const res = await fetch('/api/admin/player', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discordId }),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        setStatus((s) => ({ ...s, fase: 'idle', pesan: d.error || 'Gagal menghapus data.' }));
        return;
      }
      setKonfirmasiHapus(false);
      setStatus({
        fase: 'idle',
        pesan: `Data ID ${discordId} berhasil dihapus dari web & bot.`,
        profile: null,
      });
    } catch {
      setStatus((s) => ({ ...s, fase: 'idle', pesan: 'Koneksi bermasalah saat menghapus data.' }));
    }
  }

  const p = status.profile;

  return (
    <section>
      <h2 className="mb-4 font-display text-lg font-bold">Player Lookup</h2>
      <div className="card p-5">
        <form onSubmit={cari} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Discord ID pemain (17-20 digit)"
            className="w-full sm:min-w-0 sm:flex-1 rounded-xl border border-linebright bg-bg px-4 py-2.5 text-sm outline-none focus:border-crimson"
            inputMode="numeric"
          />
          <button type="submit" disabled={status.fase === 'mengirim' || status.fase === 'menunggu'} className="btn-primary !py-2.5 disabled:opacity-50 w-full sm:w-auto justify-center">
            {status.fase === 'menunggu' ? 'Menunggu bot...' : 'Cari Profil'}
          </button>
        </form>
        {status.pesan && <div className="mt-3 text-sm text-muted">{status.pesan}</div>}
        {p && (
          <div className="mt-5 border-t border-line pt-5">
            {p.user?.exists ? (
              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                  <span className="text-muted">ID: <span className="font-mono text-ink">{p.user.id}</span></span>
                  <span className="text-muted">Lagu selesai: <span className="font-bold tabular-nums text-ink">{p.user.totalPlays}</span></span>
                  <span className="text-muted">Total didengar: <span className="font-bold text-ink">{durasi(p.user.totalDuration)}</span></span>
                </div>
                {Array.isArray(p.topSongs) && p.topSongs.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-faint">Top lagu</div>
                    <ul className="mt-2 space-y-2">
                      {p.topSongs.map((s, i) => (
                        <li key={i} className="flex items-baseline justify-between gap-2 text-xs sm:text-sm text-muted">
                          <div className="min-w-0 flex-1">
                            <span className="text-faint">{i + 1}.</span> <span className="font-medium text-ink break-words">{s.name}</span>
                          </div>
                          <span className="shrink-0 text-faint tabular-nums text-xs">{s.count}x, {durasi(s.duration)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.topServer && (
                  <div className="text-muted text-xs sm:text-sm break-words">Server favorit: <span className="text-ink font-semibold">{p.topServer.name}</span> ({durasi(p.topServer.duration)})</div>
                )}

                {/* Penghapusan data untuk permintaan pengguna. Konfirmasi inline,
                    tanpa alert/confirm bawaan browser. */}
                <div className="mt-4 border-t border-line pt-4">
                  {konfirmasiHapus ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-ink">Hapus semua data pemain ID ini (sesuai ketentuan layanan)?</span>
                      <button
                        type="button"
                        onClick={() => hapusData(p.user.id)}
                        disabled={status.fase === 'menghapus'}
                        className="rounded-full bg-crimson px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-neon disabled:opacity-50"
                      >
                        {status.fase === 'menghapus' ? 'Menghapus...' : 'Ya, Hapus'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setKonfirmasiHapus(false)}
                        className="btn-ghost !px-3.5 !py-1.5 text-xs"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setKonfirmasiHapus(true)}
                        className="rounded-full border border-crimson px-3.5 py-1.5 text-xs font-bold text-neon transition hover:bg-crimson hover:text-white"
                      >
                        Hapus Data Pemain
                      </button>
                      <span className="text-xs text-faint">Untuk permintaan penghapusan data dari pengguna (web & bot).</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted">User ini belum tercatat atau sudah tidak memiliki data di bot.</p>
                <div className="border-t border-line pt-3">
                  {konfirmasiHapus ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-ink">Tetap hapus sisa cache / antrean ID ini?</span>
                      <button
                        type="button"
                        onClick={() => hapusData(id.replace(/\D/g, ''))}
                        disabled={status.fase === 'menghapus'}
                        className="rounded-full bg-crimson px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-neon disabled:opacity-50"
                      >
                        {status.fase === 'menghapus' ? 'Menghapus...' : 'Ya, Hapus'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setKonfirmasiHapus(false)}
                        className="btn-ghost !px-3.5 !py-1.5 text-xs"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setKonfirmasiHapus(true)}
                      className="rounded-full border border-crimson px-3.5 py-1.5 text-xs font-bold text-neon transition hover:bg-crimson hover:text-white"
                    >
                      Hapus Sisa Data ID Ini
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function RingkasanTop({ data }) {
  const lagu = Array.isArray(data.topSongs) ? data.topSongs.slice(0, 5) : [];
  const server = Array.isArray(data.topServers) ? data.topServers.slice(0, 5) : [];
  const listener = Array.isArray(data.topListeners) ? data.topListeners.slice(0, 5) : [];

  return (
    <section>
      <h2 className="mb-4 font-display text-lg font-bold">Ringkasan Top</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <TopList judul="Lagu" emoji="musik" items={lagu} render={(s) => (
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-semibold text-ink leading-snug break-words">{s.name}</div>
            <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">{durasi(s.duration)}, {s.count}x</div>
          </div>
        )} />
        <TopList judul="Listener" emoji="userprofile" items={listener} render={(u) => (
          <div className="min-w-0 flex items-center gap-2">
            {u.avatar && <img src={u.avatar} alt="" className="h-7 w-7 shrink-0 rounded-full border border-line object-cover" loading="lazy" referrerPolicy="no-referrer" />}
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-semibold text-ink leading-snug break-words">{u.username}</div>
              <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">{durasi(u.duration)}</div>
            </div>
          </div>
        )} />
        <TopList judul="Server" emoji="party" items={server} render={(g) => (
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-semibold text-ink leading-snug break-words">{g.name}</div>
            <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">{durasi(g.duration)}, {g.users} pendengar</div>
          </div>
        )} />
      </div>
    </section>
  );
}

function TopList({ judul, emoji, items, render }) {
  return (
    <div className="card p-3.5 sm:p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-faint">
        <Emoji name={emoji} size={14} /> Top {judul}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-faint">Belum ada data.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i}>{render(item)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatBox({ emoji, label, angka }) {
  return (
    <div className="stat-tile flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4">
      <Emoji name={emoji} size={22} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="font-display text-lg sm:text-xl font-bold leading-tight tabular-nums break-words">{angka}</div>
        <div className="text-[11px] sm:text-xs text-faint leading-tight mt-0.5 break-words">{label}</div>
      </div>
    </div>
  );
}
