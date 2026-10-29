'use client';

// Profil pendengar: tarik /api/me, minta bot isi profil via /api/me/refresh,
// lalu polling sampai data masuk (bot poll antrean tiap ~20 detik).
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import Emoji from './Emoji';
import { durasi } from '../lib/format';

const POLL_MS = 5000;

export default function MeClient({ initialUser }) {
  const [state, setState] = useState({ loading: true, profile: null, pending: false, error: null });
  const pollingRef = useRef(null);
  const tickRef = useRef(0);

  const load = useCallback(async (mintabarukan = false) => {
    try {
      if (mintabarukan) {
        await fetch('/api/me/refresh', { method: 'POST' });
      }
      const res = await fetch('/api/me', { cache: 'no-store' });
      if (res.status === 401) {
        window.location.href = '/login?returnTo=%2Fme';
        return;
      }
      const data = await res.json();
      setState({
        loading: false,
        profile: data.profile || null,
        pending: Boolean(data.pending) || !data.profile,
        error: null,
      });
    } catch {
      setState((s) => ({ ...s, loading: false, error: 'Koneksi bermasalah. Coba lagi.' }));
    }
  }, []);

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling: berhenti kalau profil sudah ada. Selama menunggu bot, tiap 4
  // tick (20 detik) antrekan ulang refresh - kalau bot kelewat satu siklus
  // poll (restart/ offline sesaat), request tidak pernah menggantung.
  useEffect(() => {
    if (state.profile || state.error) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
      return;
    }
    if (!pollingRef.current) {
      tickRef.current = 0;
      pollingRef.current = setInterval(() => {
        tickRef.current += 1;
        load(tickRef.current % 4 === 0);
      }, POLL_MS);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
    };
  }, [state.profile, state.error, load]);

  const p = state.profile;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {initialUser?.avatar ? (
            <img src={initialUser.avatar} alt="" className="h-12 w-12 rounded-full border border-linebright" referrerPolicy="no-referrer" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-crimson/20 border border-crimson/40 font-display text-lg font-bold">
              {String(initialUser?.username || 'U').slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-faint">Profil Pendengar</div>
            <h1 className="font-display text-xl font-bold">{initialUser?.username}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => load(true)} className="btn-ghost !px-3 !py-2 text-xs">
            <Emoji name="refresh" size={14} /> Segarkan
          </button>
          <Link href="/" className="btn-ghost !px-3 !py-2 text-xs">Kembali</Link>
        </div>
      </div>

      {state.loading && <MemuatState />}
      {!state.loading && state.error && (
        <div className="card mt-8 p-8 text-center text-sm text-muted">{state.error}</div>
      )}

      {!state.loading && !state.error && !p && (
        <div className="card mt-8 flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Emoji name="musik" size={36} />
          <h2 className="font-display text-lg font-bold">
            {state.pending ? 'Menyambung data dari bot...' : 'Belum ada statistik dengarmu'}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            {state.pending
              ? 'Bot sedang menyiapkan profilmu dari database statistik, biasanya selesai dalam beberapa detik. Halaman ini terisi otomatis - kalau lebih dari semenit, bot mungkin sedang restart.'
              : 'Kamu belum tercatat mendengarkan lewat bot. Mainkan lagu pertama di server Discord, lalu buka halaman ini lagi.'}
          </p>
          {state.pending && (
            <span className="flex items-end gap-1 h-8 mt-2">
              <span className="eq-bar w-1.5 h-8 rounded-sm bg-crimson" style={{ animationDelay: '0ms' }} />
              <span className="eq-bar w-1.5 h-8 rounded-sm bg-neon" style={{ animationDelay: '150ms' }} />
              <span className="eq-bar w-1.5 h-8 rounded-sm bg-glow/80" style={{ animationDelay: '300ms' }} />
            </span>
          )}
        </div>
      )}

      {!state.loading && p?.user?.exists === false && (
        <div className="card mt-8 flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Emoji name="warning" size={34} />
          <h2 className="font-display text-lg font-bold">Akun Discord ini belum tercatat</h2>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Bot tidak menemukan aktivitas mendengar untuk ID ini. Pastikan kamu sudah pernah
            mendengarkan lewat bot di server mana pun, lalu tekan Segarkan.
          </p>
        </div>
      )}

      {p?.user?.exists && <ProfilIsi p={p} />}
    </div>
  );
}

function ProfilIsi({ p }) {
  const u = p.user;
  const lagu = Array.isArray(p.topSongs) ? p.topSongs : [];
  const co = Array.isArray(p.coListeners) ? p.coListeners : [];

  return (
    <div className="mt-8 space-y-6">
      {/* Angka total */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox emoji="jam" label="Total Didengar" angka={durasi(u.totalDuration)} />
        <StatBox emoji="mulai" label="Lagu Selesai" angka={u.totalPlays} />
        <StatBox emoji="userprofile" label="Gabung Sejak" angka={formatTanggal(u.firstSeen)} />
        <StatBox emoji="party" label="Server Favorit" angka={p.topServer ? p.topServer.name : '-'} kecil />
      </div>

      {/* Top lagu */}
      <section className="card p-5">
        <div className="flex items-center gap-2.5">
          <Emoji name="number1" size={20} />
          <h2 className="font-display text-base font-bold">Lagu Paling Kamu Dengar</h2>
        </div>
        {lagu.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Belum ada lagu tercatat.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {lagu.map((s, i) => (
              <li key={`${s.name}-${i}`} className="flex items-center gap-3">
                {s.thumb ? (
                  <img src={s.thumb} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-line object-cover" loading="lazy" />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface3">
                    <Emoji name="musik" size={18} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{s.name}</div>
                  <div className="text-xs text-faint">{durasi(s.duration)} didengar, {s.count} kali</div>
                </div>
                <span className="text-xs font-bold tabular-nums text-faint">#{i + 1}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Dengar bareng */}
        <section className="card p-5">
          <div className="flex items-center gap-2.5">
            <Emoji name="sukapenuh" size={20} />
            <h2 className="font-display text-base font-bold">Paling Sering Dengar Bareng</h2>
          </div>
          {co.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Belum ada yang sering dengar bareng kamu.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {co.map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  {c.avatar ? (
                    <img src={c.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full border border-line" loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface3 text-xs font-bold text-faint">
                      {String(c.username || 'A').slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{c.username}</div>
                    <div className="text-xs text-faint">{c.count} sesi bareng</div>
                  </div>
                  <span className="text-xs font-bold tabular-nums text-neon">{durasi(c.duration)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Playlist & server */}
        <section className="card p-5">
          <div className="flex items-center gap-2.5">
            <Emoji name="playlist" size={20} />
            <h2 className="font-display text-base font-bold">Playlist & Server</h2>
          </div>
          {p.topPlaylist ? (
            <div className="mt-4 flex items-center gap-3">
              {p.topPlaylist.thumb ? (
                <img src={p.topPlaylist.thumb} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-line object-cover" loading="lazy" />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface3">
                  <Emoji name="playlist" size={18} />
                </span>
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{p.topPlaylist.name}</div>
                <div className="text-xs text-faint">Playlist teratas, diputar {p.topPlaylist.count} kali</div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Belum ada playlist yang dipakai.</p>
          )}
          {p.topServer && (
            <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface3">
                <Emoji name="musik" size={18} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{p.topServer.name}</div>
                <div className="text-xs text-faint">Server tempat kamu paling lama mendengar, {durasi(p.topServer.duration)}</div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatBox({ emoji, label, angka, kecil }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-crimson/12 border border-crimson/25">
        <Emoji name={emoji} size={20} />
      </span>
      <div className="min-w-0">
        <div className={`font-display font-bold leading-tight tabular-nums ${kecil ? 'truncate text-sm' : 'text-xl'}`}>{angka}</div>
        <div className="truncate text-xs text-faint">{label}</div>
      </div>
    </div>
  );
}

function formatTanggal(epochMs) {
  if (!epochMs) return '-';
  const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const d = new Date(Number(epochMs));
  if (Number.isNaN(d.getTime())) return '-';
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function MemuatState() {
  return (
    <div className="card mt-8 flex items-center justify-center gap-3 p-14">
      <span className="flex items-end gap-1 h-6">
        <span className="eq-bar w-1.5 h-6 rounded-sm bg-crimson" style={{ animationDelay: '0ms' }} />
        <span className="eq-bar w-1.5 h-6 rounded-sm bg-neon" style={{ animationDelay: '150ms' }} />
        <span className="eq-bar w-1.5 h-6 rounded-sm bg-glow/80" style={{ animationDelay: '300ms' }} />
      </span>
      <span className="text-sm text-faint">Memuat profil...</span>
    </div>
  );
}
