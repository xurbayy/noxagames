'use client';

// Profil pendengar: terisi instan dari server component (initialProfile).
// Polling hanya berjalan jika data belum pernah diambil bot sebelumnya.
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Emoji from './Emoji';
import SafeImg from './SafeImg';
import ShareCardButton from './ShareCardButton';
import { durasi } from '../lib/format';
import { premiumEmojiName, BENEFIT_INVENTORY, nilaiBenefit } from '../lib/premiumPlan';

const POLL_MS = 5000;

export default function MeClient({ initialUser, initialProfile = null, isAdmin = false, subscription = null, serverSubscription = null, serverIcon = null, serverPremiumTier = null, serverPackage = null, expiredSubscription = null, profilBasi = false }) {
  const [gantiServerBuka, setGantiServerBuka] = useState(false);
  const [gantiServerId, setGantiServerId] = useState('');
  const [gantiServerPesan, setGantiServerPesan] = useState(null);
  const [gantiServerBusy, setGantiServerBusy] = useState(false);
  const [menyegarkan, setMenyegarkan] = useState(Boolean(profilBasi));
  // Identitas (username & avatar) bisa diperbarui dari bot: data profil membawa
  // avatar Discord terbaru, jadi foto profil yang baru diganti langsung tampil
  // tanpa perlu logout-login ulang.
  const [userInfo, setUserInfo] = useState(initialUser || {});
  // Kartu tawaran NOXA Pass bisa ditutup - tidak dipaksa terus-terusan tampil.
  const [promoPassTersembunyi, setPromoPassTersembunyi] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem('noxa_pass_promo_hidden') === '1') setPromoPassTersembunyi(true); } catch {}
  }, []);

  const tutupPromoPass = useCallback(() => {
    try { localStorage.setItem('noxa_pass_promo_hidden', '1'); } catch {}
    setPromoPassTersembunyi(true);
  }, []);

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
      if (data.user) setUserInfo((u) => ({ ...u, ...data.user }));
      if (data.profile) {
        setState({
          loading: false,
          profile: data.profile,
          // Data lama tetap tampil sementara bot menyiapkan versi baru.
          pending: Boolean(data.pending),
          pendingSince: data.pendingSince || null,
          error: null,
        });
        setMenyegarkan(Boolean(data.pending));
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

  // Profil basi (dari SSR) -> tarik versi terbaru sekali di latar belakang.
  useEffect(() => {
    if (profilBasi && initialProfile) {
      const t = setTimeout(() => load(), 800);
      return () => clearTimeout(t);
    }
  }, [profilBasi, initialProfile, load]);

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
  // Satu badge saja di header: paket tertinggi yang sedang aktif.
  // Ultimate (server) menang atas Premium+/Premium individu supaya logo
  // tidak dobel saat keduanya ditumpuk.
  const adaUltimateAktif = Boolean(serverSubscription && Number(serverSubscription.expires_at) > Date.now());
  const badgeTier = adaUltimateAktif ? 'premium-ultimate' : (subscription?.plan_id || null);
  const badgeNama = adaUltimateAktif
    ? (serverSubscription.tier_name || 'NOXA Premium Ultimate')
    : (subscription?.tier_name || 'NOXA Premium');
  const badgeWarna = badgeTier === 'premium-ultimate'
    ? 'border-purple-400 bg-purple-600 text-white font-bold'
    : badgeTier === 'premium-plus'
    ? 'border-slate-300 bg-slate-200 text-black font-bold'
    : 'border-amber-400 bg-amber-400 text-black font-bold';
  const badgeGambar = badgeTier === 'premium-ultimate'
    ? '/badges/noxa-premium-ultimate.png?v=2'
    : badgeTier === 'premium-plus'
    ? '/badges/noxa-premium-plus.png?v=2'
    : '/badges/noxa-premium.png?v=2';
  // Permintaan yang menggantung lebih dari 90 detik berarti bot tidak memproses
  // antrean (offline/mati) - jangan biarkan halaman berputar selamanya.
  const basi = Boolean(state.pending && state.pendingSince && Date.now() - state.pendingSince > 90 * 1000);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 min-h-[calc(100vh-6rem)]">
      {/* Header tanpa tombol refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SafeImg
            src={userInfo?.avatar}
            alt=""
            className="h-11 w-11 sm:h-12 sm:w-12 rounded-full border border-linebright object-cover"
            fallback={
              <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-crimson font-display text-base sm:text-lg font-bold text-white">
                {String(userInfo?.username || 'U').slice(0, 1).toUpperCase()}
              </span>
            }
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-faint">Profil Pendengar</span>
              {badgeTier && (
                <span className={`noxa-badge normal-case tracking-normal ${badgeWarna}`}>
                  <img
                    src={badgeGambar}
                    alt=""
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 object-contain"
                  />
                  <span>{badgeNama}</span>
                </span>
              )}
            </div>
            <h1 className="font-display text-lg sm:text-xl font-bold break-words">{userInfo?.username}</h1>
            {menyegarkan && (
              <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-faint">
                <span className="nx-spin inline-block h-3 w-3 rounded-full border-2 border-neon border-t-transparent animate-spin" />
                Menyegarkan data dari bot...
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-full border border-crimson bg-crimson px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:border-neon hover:bg-[#930E1F]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Panel Admin
            </Link>
          )}
          <ShareCardButton
            mode="profil"
            data={{
              username: userInfo?.username,
              avatar: userInfo?.avatar,
              durationLabel: durasi(p?.user?.totalDuration || 0),
              plays: p?.user?.totalPlays || 0,
              // Kalau halaman ini menganggap belum ada aktivitas (total 0),
              // kartu share juga tidak boleh menampilkan daftar lagu/server -
              // dulu kartu tetap menampilkannya sehingga terlihat "ada data".
              songs: adaAktivitas(p)
                ? (Array.isArray(p?.topSongs) ? p.topSongs : []).map((s) => ({
                    ...s,
                    durationLabel: durasi(s.duration),
                  }))
                : [],
              premiumTier: badgeTier,
              serverName: adaAktivitas(p) ? (p?.topServer?.name || null) : null,
              serverDuration: adaAktivitas(p) && p?.topServer?.duration ? durasi(p.topServer.duration) : null,
            }}
            linkPath="/top"
            label="Share"
            title="Bagikan kartu profil NOXA Sound"
          />
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

      {/* Banner Langganan Berakhir / Bekas Langganan */}
      {!subscription && !serverSubscription && expiredSubscription && (
        <div className="card mt-6 border-l-4 border-l-amber-500 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold shrink-0">
                !
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-bold text-ink">
                    Paket {expiredSubscription.tier_name} Telah Berakhir
                  </span>
                  <span className="noxa-badge bg-amber-950 text-amber-300 border border-amber-600/40 text-[10px]">
                    Kedaluwarsa
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  Jatuh tempo pada {new Date(Number(expiredSubscription.expires_at)).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <Link
              href="/premium"
              className="inline-flex items-center justify-center rounded-full bg-crimson px-4 py-2 text-xs font-bold text-white hover:bg-neon transition shadow-sm shrink-0"
            >
              Aktifkan Kembali NOXA Pass →
            </Link>
          </div>
          <div className="mt-3.5 border-t border-line/60 pt-3 text-xs leading-relaxed text-muted space-y-1">
            <p>
              <b className="text-ink">✓ Riwayat & Statistikmu Tetap Aman:</b> Semua lagu yang pernah kamu putar, teman dengar bareng, dan data profilmu tetap tersimpan utuh di database NOXA seumur hidup.
            </p>
            <p className="text-faint">
              Limit pemutar (volume 200%, multi-efek DSP, skip instan) dan lencana profil saat ini dijeda ke batas standar gratis sampai kamu mengaktifkannya kembali.
            </p>
          </div>
        </div>
      )}

      {/* Banner Masa Aktif & Jatuh Tempo Langganan Premium - warna per tier */}
      {subscription && (() => {
        const sisaHari = Math.max(0, Math.ceil((Number(subscription.expires_at) - Date.now()) / (1000 * 60 * 60 * 24)));
        const isUltimate = subscription.plan_id === 'premium-ultimate';
        const isPlus = subscription.plan_id === 'premium-plus';
        // Warna solid per tier: Premium emas, Premium+ perak, Ultimate ungu
        // Satu gaya panel solid untuk semua tier (sama seperti kartu NOXA Pass):
        // latar kartu penuh + garis aksen kiri. Sebelumnya tiap tier memakai
        // latar gelap berwarna sendiri sehingga terlihat seperti lapisan
        // transparan di atas latar halaman.
        const warna = isUltimate
          ? { strip: 'bg-purple-500', badge: 'bg-purple-600 text-white border border-purple-400 font-bold' }
          : isPlus
          ? { strip: 'bg-slate-300', badge: 'bg-slate-300 text-black border border-slate-400 font-bold' }
          : { strip: 'bg-amber-400', badge: 'bg-amber-400 text-black border border-amber-500 font-bold' };
        const stripAktif = sisaHari <= 5 ? 'bg-[#F59E0B]' : warna.strip;
        return (
        <div className="card relative mt-6 overflow-hidden p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className={`absolute inset-y-0 left-0 w-1.5 ${stripAktif}`} aria-hidden="true" />
          <div className="flex items-center gap-3.5 pl-1.5">
            <img
              src={subscription.plan_id === 'premium-ultimate' ? '/badges/noxa-premium-ultimate.png?v=2' : subscription.plan_id === 'premium-plus' ? '/badges/noxa-premium-plus.png?v=2' : '/badges/noxa-premium.png?v=2'}
              alt=""
              width={42}
              height={42}
              className="h-10 w-10 shrink-0 object-contain"
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
          <div className="flex flex-col gap-2 shrink-0 pl-1.5">
            {paketServer && (
              <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface p-2 pr-4">
                <SafeImg
                  src={serverPackage?.icon}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full border border-line object-cover"
                  fallback={
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface3 text-sm font-bold text-faint">
                      {String(serverPackage?.name || 'S').slice(0, 1).toUpperCase()}
                    </span>
                  }
                />
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
              className="inline-flex items-center justify-center rounded-full border border-crimson bg-crimson px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:border-neon hover:bg-[#930E1F]"
            >
              Perpanjang Paket →
            </Link>
            {paketServer && (
              <button
                type="button"
                onClick={() => { setGantiServerBuka((v) => !v); setGantiServerPesan(null); }}
                className="rounded-full border border-line bg-surface3 px-4 py-2 text-xs font-bold text-ink hover:border-linebright cursor-pointer"
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
        <div className="card relative mt-4 overflow-hidden p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="absolute inset-y-0 left-0 w-1.5 bg-purple-500" aria-hidden="true" />
          <div className="flex items-center gap-3.5 pl-1.5">
            <img
              src="/badges/noxa-premium-ultimate.png?v=2"
              alt=""
              width={42}
              height={42}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-sm font-bold text-ink">{serverSubscription.tier_name} (Server) Aktif</span>
                <span className="noxa-badge bg-purple-600 text-white border border-purple-400 font-bold">
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
              className="inline-flex items-center justify-center rounded-full border border-crimson bg-crimson px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:border-neon hover:bg-[#930E1F]"
            >
              Perpanjang Paket →
            </Link>
            <button
              type="button"
              onClick={() => { setGantiServerBuka((v) => !v); setGantiServerPesan(null); }}
              className="rounded-full border border-line bg-surface3 px-4 py-2 text-xs font-bold text-ink hover:border-linebright cursor-pointer"
            >
              Ganti Server (cooldown 7 hari)
            </button>
          </div>
        </div>
      )}

      {/* ===== NOXA PASS =====
          Belum berlangganan: SATU kartu ringkas (judul, benefit, harga, satu
          tombol) yang bisa ditutup. Dulu blok ini menampilkan grid item
          "Terkunci" plus tombol beli, jadi terasa menekan. Inventaris penuh
          hanya muncul untuk yang sudah berlangganan. */}
      {(() => {
        // Tier efektif: Ultimate (server) mengalahkan paket individu supaya
        // inventaris tidak pernah kosong saat user hanya punya paket server.
        const tier = badgeTier || 'free';
        const aktif = Boolean(badgeTier && (
          (adaUltimateAktif && Number(serverSubscription.expires_at) > Date.now())
          || (subscription && Number(subscription.expires_at) > Date.now())
        ));
        const namaTier = badgeNama;

        if (!aktif) {
          if (promoPassTersembunyi) return null;
          return (
            <section className="card relative mt-6 overflow-hidden border-linebright">
              <span className="absolute inset-y-0 left-0 w-1.5 bg-crimson" aria-hidden="true" />
              <button
                type="button"
                onClick={tutupPromoPass}
                aria-label="Sembunyikan tawaran NOXA Pass"
                className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full text-faint transition hover:bg-surface3 hover:text-ink cursor-pointer"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>

              <div className="pl-1.5">
                <div className="flex flex-col gap-4 px-4 py-4 pr-10 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-5 sm:py-5 sm:pr-12">
                  <div className="flex items-start gap-3.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/badges/noxa-premium.png?v=2" alt="" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" draggable={false} />
                    <div className="min-w-0">
                      <p className="font-display text-base leading-snug text-ink sm:text-lg">Buka semua fitur dengan NOXA Pass.</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        Skip instan tanpa voting, radio 24/7, volume 200%, efek audio bertumpuk, serta playlist & riwayat profil lebih besar.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-line pt-3.5 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between sm:border-0 sm:pt-0">
                    <div className="shrink-0 min-[400px]:text-right">
                      <p className="font-display text-xl font-bold text-ink sm:text-2xl">Rp 15.000</p>
                      <p className="text-[11px] text-faint">per bulan</p>
                    </div>
                    <Link
                      href="/premium"
                      prefetch={false}
                      className="btn-primary w-full justify-center whitespace-nowrap min-[400px]:w-auto"
                    >
                      NOXA Pass
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        return (
          <section className="card mt-6 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink">
                <Emoji name="party" size={18} /> Inventaris NOXA Pass
              </h2>
              <span className={`noxa-badge font-bold ${badgeWarna}`}>
                {namaTier}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] sm:text-xs text-faint">
              Semua item di bawah ini aktif secara real-time mengikuti paketmu.
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
                    <span className="shrink-0 flex items-center justify-center w-5">
                      {terbuka ? <Emoji name={b.emoji} size={20} /> : (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-faint" aria-hidden="true">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs sm:text-sm font-semibold leading-snug break-words ${terbuka ? 'text-ink' : 'text-muted'}`}>{b.nama}</div>
                      <div className={`text-[11px] sm:text-xs mt-0.5 break-words font-bold ${terbuka ? 'text-neon' : 'text-faint'}`}>
                        {terbuka
                          ? (tier === 'premium-ultimate' ? `${nilai === true ? 'Aktif' : nilai} - di server pilihanmu` : (nilai === true ? 'Aktif' : nilai))
                          : 'Terkunci'}
                      </div>
                    </div>
                    {terbuka && <span className="shrink-0 text-neon font-bold text-sm">✓</span>}
                  </li>
                );
              })}
            </ul>

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

  const [songPage, setSongPage] = useState(0);
  const [coPage, setCoPage] = useState(0);
  const PAGE_SIZE = 10;

  const totalSongPages = Math.ceil(lagu.length / PAGE_SIZE) || 1;
  const displayedSongs = lagu.slice(songPage * PAGE_SIZE, (songPage + 1) * PAGE_SIZE);

  const totalCoPages = Math.ceil(co.length / PAGE_SIZE) || 1;
  const displayedCo = co.slice(coPage * PAGE_SIZE, (coPage + 1) * PAGE_SIZE);

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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Emoji name="number1" size={20} />
            <h2 className="font-display text-base font-bold">Lagu Paling Kamu Dengar</h2>
          </div>
          <span className="text-xs text-faint">Total {lagu.length} lagu</span>
        </div>
        {lagu.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Belum ada lagu tercatat.</p>
        ) : (
          <>
            <ul className="mt-4 space-y-3">
              {displayedSongs.map((s, i) => {
                const rank = songPage * PAGE_SIZE + i + 1;
                return (
                  <li key={`${s.name}-${rank}`} className="flex items-center gap-3">
                    <span className="w-8 shrink-0 text-center">
                      {rank === 1 ? (
                        <Emoji name="number1" size={22} />
                      ) : rank === 2 ? (
                        <Emoji name="number2" size={22} />
                      ) : rank === 3 ? (
                        <Emoji name="number3" size={22} />
                      ) : (
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-surface3 border border-line text-[11px] font-bold tabular-nums text-faint">
                          #{rank}
                        </span>
                      )}
                    </span>
                    <SafeImg
                      src={s.thumb}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-lg border border-line object-cover"
                      fallback={
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface3">
                          <Emoji name="musik" size={18} />
                        </span>
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-semibold leading-snug break-words">{s.name}</div>
                      <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">{durasi(s.duration)} didengar, {s.count} kali</div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {totalSongPages > 1 && (
              <div className="flex items-center justify-between border-t border-line pt-3.5 mt-4 text-xs">
                <button
                  type="button"
                  disabled={songPage === 0}
                  onClick={() => setSongPage((cur) => Math.max(0, cur - 1))}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface2 px-3 py-1.5 font-semibold text-muted hover:border-linebright hover:text-ink disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  ◀ Sebelumnya
                </button>
                <span className="text-xs text-faint font-medium">
                  Halaman <b className="text-ink">{songPage + 1}</b> / <b>{totalSongPages}</b> ({songPage * PAGE_SIZE + 1}–{Math.min((songPage + 1) * PAGE_SIZE, lagu.length)} dari {lagu.length})
                </span>
                <button
                  type="button"
                  disabled={songPage >= totalSongPages - 1}
                  onClick={() => setSongPage((cur) => Math.min(totalSongPages - 1, cur + 1))}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface2 px-3 py-1.5 font-semibold text-muted hover:border-linebright hover:text-ink disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  Berikutnya ▶
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Dengar bareng */}
        <section className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Emoji name="sukapenuh" size={20} />
              <h2 className="font-display text-base font-bold">Paling Sering Dengar Bareng</h2>
            </div>
            <span className="text-xs text-faint">{co.length} teman</span>
          </div>
          {co.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Belum ada yang sering dengar bareng kamu.</p>
          ) : (
            <>
              <ul className="mt-4 space-y-3">
                {displayedCo.map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <SafeImg
                      src={c.avatar}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full border border-line object-cover"
                      fallback={
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface3 text-xs font-bold text-faint">
                          {String(c.username || 'A').slice(0, 1).toUpperCase()}
                        </span>
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-semibold leading-snug break-words">{c.username}</span>
                        {c.premiumTier && premiumEmojiName(c.premiumTier) && (
                          <Emoji name={premiumEmojiName(c.premiumTier)} size={15} />
                        )}
                      </div>
                      <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">{c.count} sesi bareng</div>
                    </div>
                    <span className="text-xs font-bold tabular-nums text-neon shrink-0">{durasi(c.duration)}</span>
                  </li>
                ))}
              </ul>

              {totalCoPages > 1 && (
                <div className="flex items-center justify-between border-t border-line pt-3 mt-4 text-xs">
                  <button
                    type="button"
                    disabled={coPage === 0}
                    onClick={() => setCoPage((cur) => Math.max(0, cur - 1))}
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface2 px-2.5 py-1 text-[11px] font-semibold text-muted hover:border-linebright hover:text-ink disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    ◀ Sebelumnya
                  </button>
                  <span className="text-[11px] text-faint">
                    {coPage + 1} / {totalCoPages} ({coPage * PAGE_SIZE + 1}–{Math.min((coPage + 1) * PAGE_SIZE, co.length)})
                  </span>
                  <button
                    type="button"
                    disabled={coPage >= totalCoPages - 1}
                    onClick={() => setCoPage((cur) => Math.min(totalCoPages - 1, cur + 1))}
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface2 px-2.5 py-1 text-[11px] font-semibold text-muted hover:border-linebright hover:text-ink disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    Berikutnya ▶
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Playlist & server */}
        <section className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Emoji name="playlist" size={20} />
              <h2 className="font-display text-base font-bold">Playlist Pribadi</h2>
            </div>
            {Array.isArray(p.playlists) && p.playlists.length > 0 && (
              <span className="text-xs text-faint">{p.playlists.length} playlist</span>
            )}
          </div>

          {/* Daftar playlist asli dari bot (bukan tebakan dari statistik) */}
          {Array.isArray(p.playlists) && p.playlists.length > 0 ? (
            <ul className="mt-4 space-y-2.5">
              {p.playlists.map((pl) => (
                <li key={pl.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
                  <SafeImg
                    src={pl.cover}
                    alt=""
                    fallbackSrc={pl.fallbackCover}
                    className="h-9 w-9 shrink-0 rounded-lg border border-line object-cover"
                    fallback={
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface3">
                        <Emoji name={pl.isDefault ? 'sukapenuh' : 'playlist'} size={16} />
                      </span>
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-semibold leading-snug break-words">{pl.name}</div>
                    <div className="text-[11px] text-faint mt-0.5">
                      {pl.songCount} lagu{pl.playCount > 0 ? ` · diputar ${pl.playCount}x` : ''}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : p.topPlaylist ? (
            <div className="mt-4 flex items-center gap-3">
              <SafeImg
                src={p.topPlaylist.thumb}
                alt=""
                className="h-11 w-11 shrink-0 rounded-lg border border-line object-cover"
                fallback={
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface3">
                    <Emoji name="playlist" size={18} />
                  </span>
                }
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-semibold leading-snug break-words">{p.topPlaylist.name}</div>
                <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">Playlist teratas, diputar {p.topPlaylist.count} kali</div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Belum ada playlist yang dipakai.</p>
          )}

          {p.topServer?.name ? (
            <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
              <SafeImg
                src={serverIcon}
                alt=""
                className="h-11 w-11 shrink-0 rounded-full border border-line object-cover"
                fallback={
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface3 text-sm font-bold text-faint">
                    {String(p.topServer.name || 'S').slice(0, 1).toUpperCase()}
                  </span>
                }
              />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-faint">Top Server Favorit</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs sm:text-sm font-semibold leading-snug break-words">{p.topServer.name}</span>
                  {premiumEmojiName(serverPremiumTier || p.topServer.premiumTier) && (
                    <Emoji name={premiumEmojiName(serverPremiumTier || p.topServer.premiumTier)} size={16} />
                  )}
                </div>
                <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">Tempat kamu paling lama mendengar, {durasi(p.topServer.duration)}</div>
              </div>
            </div>
          ) : (
            <div className="mt-4 border-t border-line pt-4 text-sm text-muted">
              Belum ada top server favorit tercatat.
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
        <Emoji name={emoji} size={18} className="shrink-0" />
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
