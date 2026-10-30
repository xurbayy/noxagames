'use client';

// Profil pendengar: terisi instan dari server component (initialProfile).
// Polling hanya berjalan jika data belum pernah diambil bot sebelumnya.
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import Emoji from './Emoji';
import BackButton from './BackButton';
import { durasi } from '../lib/format';

const POLL_MS = 5000;

export default function MeClient({ initialUser, initialProfile = null }) {
  const [state, setState] = useState({
    loading: !initialProfile,
    profile: initialProfile || null,
    pending: !initialProfile,
    error: null,
  });
  const pollingRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/me', { cache: 'no-store' });
      if (res.status === 401) {
        window.location.href = '/login?returnTo=%2Fme';
        return;
      }
      const data = await res.json();
      if (data.profile) {
        setState({
          loading: false,
          profile: data.profile,
          pending: false,
          error: null,
        });
      } else {
        setState((s) => ({
          ...s,
          loading: false,
          pending: Boolean(data.pending),
        }));
      }
    } catch {
      setState((s) => ({ ...s, loading: false, error: 'Koneksi bermasalah. Coba lagi.' }));
    }
  }, []);

  // Jika profile belum ada saat render server, ambil via API
  useEffect(() => {
    if (!initialProfile) {
      load();
    }
  }, [initialProfile, load]);

  // Polling hanya aktif jika profil belum tersedia
  useEffect(() => {
    if (state.profile || state.error) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
      return;
    }
    if (!pollingRef.current) {
      pollingRef.current = setInterval(() => {
        load();
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
      {/* Header tanpa tombol refresh */}
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
        <BackButton href="/" className="!px-3.5 !py-2 text-xs" />
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
              ? 'Bot sedang menyiapkan profilmu dari database statistik, biasanya selesai dalam beberapa detik.'
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
            mendengarkan lewat bot di server mana pun.
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
      {/* Angka total: StatBox vertikal yang tidak memotong teks */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <StatBox emoji="jam" label="Total Didengar" angka={durasi(u.totalDuration)} />
        <StatBox emoji="mulai" label="Lagu Selesai" angka={`${u.totalPlays} lagu`} />
        <StatBox emoji="userprofile" label="Gabung Sejak" angka={formatTanggal(u.firstSeen)} />
        <StatBox emoji="party" label="Server Favorit" angka={p.topServer ? p.topServer.name : '-'} />
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

// StatBox vertikal yang tidak pernah memotong teks panjang
function StatBox({ emoji, label, angka }) {
  return (
    <div className="card flex flex-col justify-between p-4 min-h-[96px]">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-crimson/12 border border-crimson/25">
          <Emoji name={emoji} size={16} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-faint leading-none">{label}</span>
      </div>
      <div className="mt-2.5 font-display text-[15px] sm:text-base font-bold leading-snug text-ink break-words">
        {angka}
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
