'use client';

// AdminShell: kerangka panel admin (header + konten) + seluruh isi monitoring
// dalam satu client component (dashboard live + player lookup).
// Aturan panel: tanpa confirm()/alert() bawaan, error tampil inline.
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import Emoji from '../Emoji';
import { durasi } from '../../lib/format';

const POLL_MS = 5000;

export default function AdminShell({ admin }) {
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

  async function keluar() {
    await fetch('/api/auth/logout?admin=1');
    window.location.href = '/';
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header panel */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Panel Admin NOXA Sound</div>
          <h1 className="font-display text-xl font-bold">Monitoring</h1>
        </div>
        <div className="flex items-center gap-3">
          {admin?.avatar && <img src={admin.avatar} alt="" className="h-8 w-8 rounded-full border border-linebright" referrerPolicy="no-referrer" />}
          <span className="text-sm text-muted">{admin?.username}</span>
          <Link href="/" className="btn-ghost !px-3 !py-1.5 text-xs">Ke Web</Link>
          <button onClick={keluar} className="btn-ghost !px-3 !py-1.5 text-xs">Keluar Panel</button>
        </div>
      </div>

      <div className="hairline my-6" />

      {err && <div className="card border-crimson/50 p-4 text-sm text-ink">{err}</div>}

      {!data && !err && <div className="card p-10 text-center text-sm text-faint">Menyambung data...</div>}

      {data && (
        <div className="space-y-8">
          <DashboardLive data={data} lastUpdate={lastUpdate} />
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
              <div key={`${p.guildId}-${i}`} className="card flex items-center gap-3 p-3.5">
                <Emoji name={p.mode === 'radio' ? 'radio' : p.mode === 'podcast' ? 'podcast' : 'musik'} size={20} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.title}</div>
                  <div className="truncate text-xs text-faint">
                    {p.guildName} {p.requester ? `diminta ${p.requester}` : ''} {p.listeners > 0 ? `${p.listeners} pendengar` : ''}
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

function PlayerLookup() {
  const [id, setId] = useState('');
  const [status, setStatus] = useState({ fase: 'idle', pesan: null, profile: null });

  async function cari(e) {
    e.preventDefault();
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

  const p = status.profile;

  return (
    <section>
      <h2 className="mb-4 font-display text-lg font-bold">Player Lookup</h2>
      <div className="card p-5">
        <form onSubmit={cari} className="flex flex-wrap gap-3">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Discord ID pemain (17-20 digit)"
            className="min-w-0 flex-1 rounded-xl border border-linebright bg-bg px-4 py-2.5 text-sm outline-none focus:border-crimson"
            inputMode="numeric"
          />
          <button type="submit" disabled={status.fase === 'mengirim' || status.fase === 'menunggu'} className="btn-primary !py-2.5 disabled:opacity-50">
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
                    <ul className="mt-2 space-y-1.5">
                      {p.topSongs.map((s, i) => (
                        <li key={i} className="truncate text-muted">{i + 1}. <span className="text-ink">{s.name}</span> {s.count}x, {durasi(s.duration)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.topServer && (
                  <div className="text-muted">Server favorit: <span className="text-ink">{p.topServer.name}</span> ({durasi(p.topServer.duration)})</div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">User ini belum tercatat di database statistik bot.</p>
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
          <div className="min-w-0"><div className="truncate text-sm font-semibold">{s.name}</div><div className="text-xs text-faint">{durasi(s.duration)}, {s.count}x</div></div>
        )} />
        <TopList judul="Listener" emoji="userprofile" items={listener} render={(u) => (
          <div className="min-w-0 flex items-center gap-2">
            {u.avatar && <img src={u.avatar} alt="" className="h-7 w-7 shrink-0 rounded-full" loading="lazy" referrerPolicy="no-referrer" />}
            <div className="min-w-0"><div className="truncate text-sm font-semibold">{u.username}</div><div className="text-xs text-faint">{durasi(u.duration)}</div></div>
          </div>
        )} />
        <TopList judul="Server" emoji="party" items={server} render={(g) => (
          <div className="min-w-0"><div className="truncate text-sm font-semibold">{g.name}</div><div className="text-xs text-faint">{durasi(g.duration)}, {g.users} pendengar</div></div>
        )} />
      </div>
    </section>
  );
}

function TopList({ judul, emoji, items, render }) {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-faint">
        <Emoji name={emoji} size={14} /> Top {judul}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-faint">Belum ada data.</p>
      ) : (
        <ul className="space-y-2.5">{items.map(render)}</ul>
      )}
    </div>
  );
}

function StatBox({ emoji, label, angka }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-crimson/12 border border-crimson/25">
        <Emoji name={emoji} size={20} />
      </span>
      <div className="min-w-0">
        <div className="font-display text-xl font-bold leading-tight tabular-nums">{angka}</div>
        <div className="truncate text-xs text-faint">{label}</div>
      </div>
    </div>
  );
}
