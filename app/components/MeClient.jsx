'use client';

// Profil pendengar: terisi instan dari server component (initialProfile).
// Polling hanya berjalan jika data belum pernah diambil bot sebelumnya.
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Emoji from './Emoji';
import ShareCardButton from './ShareCardButton';
import { durasi } from '../lib/format';
import { premiumEmojiName, BENEFIT_INVENTORY, nilaiBenefit } from '../lib/premiumPlan';

const POLL_MS = 5000;

export default function MeClient({ initialUser, initialProfile = null, isAdmin = false, subscription = null, serverSubscription = null, serverIcon = null, serverPremiumTier = null, serverPackage = null }) {
  const [gantiServerBuka, setGantiServerBuka] = useState(false);
  const [gantiServerId, setGantiServerId] = useState('');
  const [gantiServerPesan, setGantiServerPesan] = useState(null);
  const [gantiServerBusy, setGantiServerBusy] = useState(false);

  // Banner ultimate standalone: tampil di block 1 HANYA bila tidak ada paket individu
  // (kalau keduanya aktif, ultimate tampil di banner keduanya bawah).
  const paketServer = subscription?.plan_id === 'premium-ultimate' && Boolean(subscription?.guild_id);
  const adaIndividuAktif = Boolean(subscription && subscription.plan_id !== 'premium-ultimate');
  const tampilkanBannerUltimate = Boolean(serverSubscription && Number(serverSubscription.expires_at) > Date.now() && adaIndividuAktif);

  async function submitGantiServer(e) {
    e.preventDefault();
    setGantiServerBusy(true);
    setGantiServerPesan(null);
    try {
      const res = await fetch('/api/me/switch-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: gantiServerId.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setGantiServerPesan({ ok: true, text: data.message });
        setGantiServerBuka(false);
        setTimeout(() => window.location.reload(), 1800);
      } else {
        setGantiServerPesan({ ok: false, text: data.error || 'Gagal mengganti server.' });
      }
    } catch {
      setGantiServerPesan({ ok: false, text: 'Koneksi terputus.' });
    } finally {
      setGantiServerBusy(false);
    }
  }
  const [state, setState] = useState({
    loading: !initialProfile,
    profile: initialProfile || null,
    pending: !initialProfile,
    pendingSince: null,
    error: null,
  });
  const pollingRef = useRef(null);

  const load = useCallback(async (refresh = false) => {
    try {
      const res = await fetch(refresh ? '/api/me?refresh=1' : '/api/me', { cache: 'no-store' });
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
          pendingSince: null,
          error: null,
        });
      } else {
        setState((s) => ({
          ...s,
          loading: false,
          pending: Boolean(data.pending),
          pendingSince: data.pendingSince || s.pendingSince,
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
  // Permintaan yang menggantung lebih dari 90 detik berarti bot tidak memproses
  // antrean (offline/mati) - jangan biarkan halaman berputar selamanya.
  const basi = Boolean(state.pending && state.pendingSince && Date.now() - state.pendingSince > 90 * 1000);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 min-h-[calc(100vh-6rem)]">
      {/* Header tanpa tombol refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {initialUser?.avatar ? (
            <img src={initialUser.avatar} alt="" className="h-11 w-11 sm:h-12 sm:w-12 rounded-full border border-linebright object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#2B0003] border border-crimson font-display text-base sm:text-lg font-bold">
              {String(initialUser?.username || 'U').slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-faint">Profil Pendengar</span>
              {subscription && (
                <span className={`noxa-badge normal-case tracking-normal ${
                  subscription.plan_id === 'premium-ultimate'
                    ? 'border-purple-500 bg-[#240B3B] text-purple-200'
                    : subscription.plan_id === 'premium-plus'
                    ? 'border-slate-300 bg-[#1E232A] text-slate-100'
                    : 'border-amber-500 bg-[#2D1B03] text-amber-300'
                }`}>
                  <img
                    src={subscription.plan_id === 'premium-ultimate' ? '/badges/noxa-premium-ultimate.png' : subscription.plan_id === 'premium-plus' ? '/badges/noxa-premium-plus.png' : '/badges/noxa-premium.png'}
                    alt=""
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 object-contain"
                  />
                  <span>{subscription.tier_name || 'Premium'}</span>
                </span>
              )}
            </div>
            <h1 className="font-display text-lg sm:text-xl font-bold break-words">{initialUser?.username}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-full border border-crimson bg-[#2B0003] px-3.5 py-2 text-xs font-bold text-neon transition hover:bg-[#3D0005] hover:text-white shadow-[var(--shadow-hair)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
              Panel Admin
            </Link>
          )}
          {adaAktivitas(p) && (
            <ShareCardButton
              mode="profil"
              data={{
                username: initialUser?.username,
                avatar: initialUser?.avatar,
                durationLabel: durasi(p.user.totalDuration),
                plays: p.user.totalPlays,
                songs: p.topSongs,
                premiumTier: subscription?.plan_id || null,
              }}
              linkPath="/top"
              label="Bagikan"
            />
          )}
          {/* Profil tidak punya tombol kembali: diganti Logout seperti halaman
              akun lain, karena tujuan keluar dari profil adalah keluar sesi. */}
          <a
            href="/api/auth/logout"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface2 px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-neon hover:text-neon"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </a>
        </div>
      </div>

      {/* Banner Masa Aktif & Jatuh Tempo Langganan Premium - warna per tier */}
      {subscription && (() => {
        const sisaHari = Math.max(0, Math.ceil((Number(subscription.expires_at) - Date.now()) / (1000 * 60 * 60 * 24)));
        const isUltimate = subscription.plan_id === 'premium-ultimate';
        const isPlus = subscription.plan_id === 'premium-plus';
        // Warna solid per tier: Premium emas, Premium+ perak, Ultimate ungu
        const warna = isUltimate
          ? { bg: '#1A0B2E', border: 'border-purple-500', badge: 'bg-[#240B3B] text-purple-200 border-purple-500' }
          : isPlus
          ? { bg: '#161B22', border: 'border-[#CBD5E1]', badge: 'bg-[#1E232A] text-slate-100 border-[#CBD5E1]' }
          : { bg: '#2D1B03', border: 'border-[#F0A63C]', badge: 'bg-[#2D1B03] text-[#F0A63C] border-[#F0A63C]' };
        return (
        <div className={`mt-6 rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          sisaHari <= 5
            ? 'border-[#F59E0B] bg-[#2E1805]'
            : `${warna.border} ${warna.bg} shadow-[var(--shadow-hair)]`
        }`}>
          <div className="flex items-center gap-3.5">
            <img
              src={subscription.plan_id === 'premium-ultimate' ? '/badges/noxa-premium-ultimate.png' : subscription.plan_id === 'premium-plus' ? '/badges/noxa-premium-plus.png' : '/badges/noxa-premium.png'}
              alt=""
              width={42}
              height={42}
              className="h-10 w-10 shrink-0 object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-sm font-bold text-ink">{subscription.tier_name} Aktif</span>
                <span className={`noxa-badge ${
                  sisaHari <= 5
                    ? 'bg-[#B45309] text-white border border-[#F59E0B]'
                    : warna.badge
                }`}>
                  {sisaHari > 0 ? `${sisaHari} Hari Lagi` : 'Jatuh Tempo Hari Ini'}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Jatuh tempo pada: <strong className="text-ink font-semibold">{new Date(Number(subscription.expires_at)).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {paketServer && (
              <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface p-2 pr-4">
                {serverPackage?.icon ? (
                  <img
                    src={serverPackage.icon}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full border border-line object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface3 text-sm font-bold text-faint">
                    {String(serverPackage?.name || 'S').slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-faint">Aktif di server</div>
                  <div className="truncate text-xs sm:text-sm font-bold text-ink">
                    {serverPackage?.name || `Server ${subscription.guild_id}`}
                  </div>
                </div>
              </div>
            )}
            <Link
              href="/premium"
              className="btn-ghost !py-2 !px-4 text-xs font-semibold"
            >
              Perpanjang Paket →
            </Link>
            {paketServer && (
              <button
                type="button"
                onClick={() => { setGantiServerBuka((v) => !v); setGantiServerPesan(null); }}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted hover:text-ink hover:border-linebright cursor-pointer"
              >
                Ganti Server (cooldown 7 hari)
              </button>
            )}
          </div>
        </div>
        );
      })()}

      {/* Banner kedua: NOXA Pass Ultimate (paket server) saat DITUMPUK dengan paket individu */}
      {tampilkanBannerUltimate && (
        <div className="mt-4 rounded-2xl border border-purple-500 bg-[#1A0B2E] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[var(--shadow-hair)]">
          <div className="flex items-center gap-3.5">
            <img
              src="/badges/noxa-premium-ultimate.png"
              alt=""
              width={42}
              height={42}
              className="h-10 w-10 shrink-0 object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-sm font-bold text-ink">{serverSubscription.tier_name} (Server) Aktif</span>
                <span className="noxa-badge bg-[#240B3B] text-purple-200 border border-purple-500">
                  {Math.max(0, Math.ceil((Number(serverSubscription.expires_at) - Date.now()) / (1000 * 60 * 60 * 24)))} Hari Lagi
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Jatuh tempo pada: <strong className="text-ink font-semibold">{new Date(Number(serverSubscription.expires_at)).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                {serverPackage && <> · aktif di <strong className="text-ink font-semibold">{serverPackage.name || `Server ${serverPackage.guildId}`}</strong></>}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Link
              href="/premium"
              className="btn-ghost !py-2 !px-4 text-xs font-semibold"
            >
              Perpanjang Paket →
            </Link>
            <button
              type="button"
              onClick={() => { setGantiServerBuka((v) => !v); setGantiServerPesan(null); }}
              className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted hover:text-ink hover:border-linebright cursor-pointer"
            >
              Ganti Server (cooldown 7 hari)
            </button>
          </div>
        </div>
      )}

      {/* ===== INVENTARIS NOXA PASS (ala NEXO): jelas mana aktif mana terkunci ===== */}
      {(() => {
        const tier = subscription?.plan_id || 'free';
        const aktif = Boolean(subscription && Number(subscription.expires_at) > Date.now());
        return (
          <section className="card mt-6 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink">
                <Emoji name="party" size={18} /> Inventaris NOXA Pass
              </h2>
              {aktif ? (
                <span className={`noxa-badge ${
                  tier === 'premium-ultimate' ? 'bg-[#240B3B] text-purple-200 border-purple-500'
                  : tier === 'premium-plus' ? 'bg-[#1E232A] text-slate-100 border-slate-300'
                  : 'bg-[#2D1B03] text-amber-300 border-amber-500'
                }`}>
                  {subscription.tier_name || 'Premium'}
                </span>
              ) : (
                <span className="noxa-badge bg-surface3 text-faint border-line">Belum Aktif</span>
              )}
            </div>
            <p className="mt-1.5 text-[11px] sm:text-xs text-faint">
              {aktif
                ? 'Semua item di bawah ini aktif secara real-time mengikuti paketmu.'
                : 'Item terkunci akan terbuka otomatis saat kamu berlangganan NOXA Pass.'}
            </p>

            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {BENEFIT_INVENTORY.map((b) => {
                const nilai = nilaiBenefit(tier, b);
                const terbuka = aktif && nilai !== null && nilai !== false;
                return (
                  <li
                    key={b.nama}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition ${
                      terbuka ? 'border-linebright bg-surface hover:border-crimson' : 'border-line bg-surface2'
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                      terbuka ? 'bg-[#2B0003] border-crimson' : 'bg-surface3 border-line'
                    }`}>
                      {terbuka ? <Emoji name={b.emoji} size={16} /> : (
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-faint" aria-hidden="true">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs sm:text-sm font-semibold leading-snug break-words ${terbuka ? 'text-ink' : 'text-muted'}`}>{b.nama}</div>
                      <div className={`text-[11px] sm:text-xs mt-0.5 break-words ${terbuka ? 'text-neon font-bold' : 'text-faint'}`}>
                        {terbuka
                          ? (tier === 'premium-ultimate' ? `${nilai === true ? 'Aktif' : nilai} - di server pilihanmu` : (nilai === true ? 'Aktif' : nilai))
                          : 'Terkunci'}
                      </div>
                    </div>
                    {terbuka ? (
                      <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#0F2415] border border-[#22C55E] text-[#86EFAC] text-xs font-bold">✓</span>
                    ) : (
                      <Link href="/premium" className="shrink-0 rounded-full border border-crimson bg-[#2B0003] px-2.5 py-0.5 text-[10px] font-bold text-neon hover:bg-[#3D0005]">
                        Buka
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            {!aktif && (
              <Link href="/premium" className="btn-primary mt-4 w-full justify-center !py-2.5 text-xs font-bold">
                Lihat Paket NOXA Pass →
              </Link>
            )}
          </section>
        );
      })()}

      {/* Form ganti server paket Ultimate */}
      {paketServer && gantiServerBuka && (
        <form onSubmit={submitGantiServer} className="mt-3 rounded-2xl border border-line bg-surface2 p-4 space-y-2.5">
          <label className="block text-xs font-semibold text-muted">
            ID Server Discord baru (17-20 digit). Aktifkan Developer Mode di Discord, klik kanan nama server, Copy Server ID.
          </label>
          <input
            value={gantiServerId}
            onChange={(e) => setGantiServerId(e.target.value)}
            placeholder="Contoh: 123456789012345678"
            inputMode="numeric"
            className="w-full rounded-xl border border-linebright bg-bg px-3.5 py-2.5 text-xs text-ink outline-none focus:border-crimson font-mono"
          />
          {gantiServerPesan && (
            <p className={`text-xs ${gantiServerPesan.ok ? 'text-ok' : 'text-crimson'}`}>{gantiServerPesan.text}</p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={gantiServerBusy} className="btn-primary !py-2 !px-4 text-xs disabled:opacity-50">
              {gantiServerBusy ? 'Memproses...' : 'Ganti Server'}
            </button>
            <button type="button" onClick={() => setGantiServerBuka(false)} className="btn-ghost !py-2 !px-4 text-xs">
              Batal
            </button>
          </div>
        </form>
      )}

      {state.loading && <MemuatState />}
      {!state.loading && state.error && (
        <div className="card mt-8 flex flex-col items-center gap-3 p-8 text-center text-sm text-muted">
          {state.error}
          <button
            type="button"
            onClick={() => { setState((s) => ({ ...s, loading: true, error: null })); load(); }}
            className="btn-primary !px-4 !py-2 text-sm"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {!state.loading && !state.error && !p && (
        <div className="card mt-8 flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Emoji name="musik" size={36} />
          <h2 className="font-display text-lg font-bold">
            {state.pending ? (basi ? 'Data profil belum terkirim' : 'Menyambung data dari bot...') : 'Belum ada statistik dengarmu'}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            {!state.pending
              ? 'Kamu belum tercatat mendengarkan lewat bot. Mainkan lagu pertama di server Discord, lalu buka halaman ini lagi.'
              : basi
                ? 'Permintaan data sudah lama menunggu bot. Kalau bot di Discord tidak merespons, cek server dukungan, lalu minta ulang di sini.'
                : 'Bot sedang menyiapkan profilmu dari database statistik, biasanya selesai dalam beberapa detik.'}
          </p>
          {state.pending && basi && (
            <button type="button" onClick={() => { setState((s) => ({ ...s, pendingSince: Date.now() })); load(true); }} className="btn-primary mt-1 !px-4 !py-2 text-sm">
              Minta Ulang
            </button>
          )}
          {state.pending && !basi && (
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

      {p?.user?.exists && !adaAktivitas(p) && (
        <div className="card mt-8 flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Emoji name="musik" size={36} />
          <h2 className="font-display text-lg font-bold">Belum ada statistik dengarmu</h2>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Bot belum mencatat satu lagu pun dari akun ini, jadi belum ada angka atau daftar lagu
            yang bisa ditampilkan. Putar lagu pertama di server Discord, statistiknya muncul otomatis di sini.
          </p>
        </div>
      )}

      {p?.user?.exists && adaAktivitas(p) && <ProfilIsi p={p} serverIcon={serverIcon} serverPremiumTier={serverPremiumTier} />}
    </div>
  );
}

// Pengguna dianggap punya statistik hanya kalau bot mencatat durasi atau lagu
// selesai. Payload lama kadang mengirim 0 untuk keduanya tapi masih menyertakan
// daftar lagu; tanpa aturan ini halaman menampilkan "0 dtk" di atas daftar lagu.
function adaAktivitas(p) {
  return Boolean(p?.user?.exists) && (Number(p.user.totalPlays) > 0 || Number(p.user.totalDuration) > 0);
}

function ProfilIsi({ p, serverIcon, serverPremiumTier }) {
  const u = p.user;
  const lagu = Array.isArray(p.topSongs) ? p.topSongs : [];
  const co = Array.isArray(p.coListeners) ? p.coListeners : [];

  return (
    <div className="mt-8 space-y-6">
      {/* Angka total: StatBox vertikal yang tidak memotong teks.
          Kotak yang datanya tidak dikirim bot tidak dirender (bukan diisi "-"). */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <StatBox emoji="jam" label="Total Didengar" angka={durasi(u.totalDuration)} />
        <StatBox emoji="mulai" label="Lagu Selesai" angka={`${u.totalPlays} lagu`} />
        {Number(u.firstSeen) > 0 && (
          <StatBox emoji="userprofile" label="Gabung Sejak" angka={formatTanggal(u.firstSeen)} />
        )}
        {p.topServer?.name && (
          <StatBox emoji="party" label="Server Favorit" angka={p.topServer.name} />
        )}
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
                  <div className="text-xs sm:text-sm font-semibold leading-snug break-words">{s.name}</div>
                  <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">{durasi(s.duration)} didengar, {s.count} kali</div>
                </div>
                <span className="text-xs font-bold tabular-nums text-faint shrink-0">#{i + 1}</span>
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
                    <div className="text-xs sm:text-sm font-semibold leading-snug break-words">{c.username}</div>
                    <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">{c.count} sesi bareng</div>
                  </div>
                  <span className="text-xs font-bold tabular-nums text-neon shrink-0">{durasi(c.duration)}</span>
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
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-semibold leading-snug break-words">{p.topPlaylist.name}</div>
                <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">Playlist teratas, diputar {p.topPlaylist.count} kali</div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Belum ada playlist yang dipakai.</p>
          )}
          {p.topServer?.name && (
            <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
              {serverIcon ? (
                <img
                  src={serverIcon}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-full border border-line object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface3">
                  <Emoji name="musik" size={18} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-semibold leading-snug break-words">{p.topServer.name}</span>
                  {premiumEmojiName(serverPremiumTier || p.topServer.premiumTier) && (
                    <Emoji name={premiumEmojiName(serverPremiumTier || p.topServer.premiumTier)} size={16} />
                  )}
                </div>
                <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">Server tempat kamu paling lama mendengar, {durasi(p.topServer.duration)}</div>
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
    <div className="stat-tile flex flex-col justify-between p-3.5 sm:p-4 min-h-[96px]">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-[#2B0003] border border-crimson">
          <Emoji name={emoji} size={15} />
        </span>
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-faint leading-tight break-words">{label}</span>
      </div>
      <div className="mt-2.5 font-display text-[14px] sm:text-[15px] md:text-base font-bold leading-snug text-ink break-words">
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
