'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Emoji from '../Emoji';
import { PREMIUM_PLANS, FITUR_KOMPARASI, LANGKAH_AKTIVASI, CATATAN_BITRATE, CATATAN_CAKUPAN, labelHarga } from '../../lib/premiumPlan';

const PILIHAN_DURASI = [
  { index: 0, bulan: 1, label: '1 Bulan' },
  { index: 1, bulan: 3, label: '3 Bulan', badge: 'Hemat s/d 15%' },
  { index: 2, bulan: 6, label: '6 Bulan', badge: 'Hemat s/d 23%' },
  { index: 3, bulan: 12, label: '1 Tahun', badge: 'Diskon Terbesar 31%' },
];

export default function PremiumPricing({ session = null, activeSubscription = null, activeServer = null }) {
  const [durasiPilihan, setDurasiPilihan] = useState(0);
  const [tabTabel, setTabTabel] = useState(false);

  // State Modal
  const [modalBeli, setModalBeli] = useState(null); // plan object jika modal checkout aktif
  const [modalLoginWajib, setModalLoginWajib] = useState(false); // prompt login jika belum masuk
  const [setujuLogin, setSetujuLogin] = useState(false); // checkbox persetujuan wajib di modal login
  const [guildIdInput, setGuildIdInput] = useState('');
  const [guildTerkunci, setGuildTerkunci] = useState(false); // perpanjang ultimate = server aktif dipertahankan
  const [prosesBeli, setProsesBeli] = useState(false);
  const [transaksiAktif, setTransaksiAktif] = useState(null); // { transactionId, qrisUrl, invoiceUrl, amount, expiresAt }
  const [statusBayar, setStatusBayar] = useState(null); // 'pending' | 'paid' | 'error'
  const [pesanError, setPesanError] = useState(null);

  const pollingTimerRef = useRef(null);

  const currentDurasi = PILIHAN_DURASI[durasiPilihan];

  // Handler klik tombol beli paket
  function handlePilihPaket(plan) {
    if (!session || !session.discordId) {
      setSetujuLogin(false);
      setModalLoginWajib(true);
      return;
    }
    setModalBeli(plan);
    setTransaksiAktif(null);
    setStatusBayar(null);
    setPesanError(null);
    // Perpanjang Ultimate: server aktif otomatis dipertahankan (terkunci).
    // Ganti server hanya lewat profil (cooldown 7 hari).
    if (plan.id === 'premium-ultimate' && activeServer && Number(activeServer.expires_at) > Date.now()) {
      setGuildIdInput(String(activeServer.guild_id || ''));
      setGuildTerkunci(true);
    } else {
      setGuildIdInput('');
      setGuildTerkunci(false);
    }
  }

  // Submit checkout ke backend
  async function mulaiPembayaran() {
    if (!modalBeli) return;
    setProsesBeli(true);
    setPesanError(null);

    if (modalBeli.id === 'premium-ultimate' && !/^\d{17,20}$/.test(guildIdInput.trim())) {
      setPesanError('Paket Ultimate aktif di 1 server pilihan. Masukkan ID Server Discord yang valid (17-20 digit).');
      return;
    }

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: modalBeli.id,
          durationMonths: currentDurasi.bulan,
          guildId: guildIdInput.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setPesanError(data.error || 'Gagal membuat tagihan pembayaran.');
        setProsesBeli(false);
        return;
      }

      setTransaksiAktif(data);
      setStatusBayar('pending');
    } catch {
      setPesanError('Koneksi terputus saat menghubungi server.');
    } finally {
      setProsesBeli(false);
    }
  }

  // Polling cek status pembayaran otomatis tiap 3 detik
  useEffect(() => {
    if (!transaksiAktif || statusBayar === 'paid') return;

    pollingTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/check?txId=${transaksiAktif.transactionId}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.ok && data.status === 'paid') {
          setStatusBayar('paid');
          clearInterval(pollingTimerRef.current);
        }
      } catch {}
    }, 3000);

    return () => clearInterval(pollingTimerRef.current);
  }, [transaksiAktif, statusBayar]);

  // Simulasi bayar khusus pengujian
  async function simulasiBayar() {
    if (!transaksiAktif) return;
    setProsesBeli(true);
    try {
      const res = await fetch('/api/payment/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId: transaksiAktif.transactionId, simulatePay: true }),
      });
      const data = await res.json();
      if (data.ok && data.status === 'paid') {
        setStatusBayar('paid');
      }
    } catch {}
    setProsesBeli(false);
  }

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Selector Siklus Pembayaran */}
      <div className="flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface2 p-1.5 shadow-[var(--shadow-soft)]">
          {PILIHAN_DURASI.map((d) => (
            <button
              key={d.bulan}
              type="button"
              onClick={() => setDurasiPilihan(d.index)}
              className={`relative cursor-pointer rounded-full px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                durasiPilihan === d.index
                  ? 'bg-gradient-to-r from-crimson to-neon text-white shadow-[0_0_16px_rgba(255,42,109,0.45)]'
                  : 'text-muted hover:text-ink hover:bg-surface3'
              }`}
            >
              <span>{d.label}</span>
              {d.badge && (
                <span className="hidden sm:inline-block ml-1.5 rounded-full bg-white text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {d.bulan === 12 ? 'VIP' : 'Hemat'}
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-faint text-center">
          Payment Gateway QRIS resmi otomatis via QiosPay (GoPay, OVO, DANA, ShopeePay, BCA, Mandiri).
        </p>
      </div>

      {/* Banner Info Langganan Aktif (Perpanjang Cerdas + Stacking) */}
      {activeSubscription && Number(activeSubscription.expires_at) > Date.now() && (
        <div className="card border-[#22C55E]/70 bg-[#0F2415] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <img
              src={activeSubscription.plan_id === 'premium-plus' ? '/badges/noxa-premium-plus.png' : '/badges/noxa-premium.png'}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <div>
              <div className="text-sm font-bold text-ink">{activeSubscription.tier_name} (Individu) sedang aktif</div>
              <div className="text-xs text-muted">
                Berlaku sampai {new Date(Number(activeSubscription.expires_at)).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · klik "Perpanjang Sekarang" pada kartu paketmu untuk menambah durasi.
              </div>
            </div>
          </div>
          <span className="noxa-badge bg-[#14532D] border border-[#22C55E] text-[#86EFAC] whitespace-nowrap">
            {Math.max(0, Math.ceil((Number(activeSubscription.expires_at) - Date.now()) / (1000 * 60 * 60 * 24)))} Hari Lagi
          </span>
        </div>
      )}
      {activeServer && Number(activeServer.expires_at) > Date.now() && (
        <div className="card border-purple-500/70 bg-[#1A0B2E] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <img src="/badges/noxa-premium-ultimate.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" />
            <div>
              <div className="text-sm font-bold text-ink">{activeServer.tier_name} (Server) sedang aktif</div>
              <div className="text-xs text-muted">
                Benefit untuk 1 server pilihan (ID: {activeServer.guild_id || 'belum dipilih'}) · ganti server lewat profil, cooldown 7 hari.
              </div>
            </div>
          </div>
          <span className="noxa-badge bg-[#240B3B] border border-purple-500 text-purple-200 whitespace-nowrap">
            {Math.max(0, Math.ceil((Number(activeServer.expires_at) - Date.now()) / (1000 * 60 * 60 * 24)))} Hari Lagi
          </span>
        </div>
      )}

      {/* Grid 3 Kartu Tier Paket */}
      <div className="grid gap-8 md:grid-cols-3 items-stretch">
        {PREMIUM_PLANS.map((plan) => {
          const hargaDurasi = plan.durasi[durasiPilihan];
          const totalHarga = hargaDurasi.harga || plan.hargaBulanan * currentDurasi.bulan;
          const hargaPerBulan = Math.round(totalHarga / currentDurasi.bulan);

          // Perpanjang cerdas + STACKING: individu tidak tumpuk sesamanya;
          // Ultimate (paket server) berdiri sendiri dan bisa ditumpuk dgn individu.
          const adaIndividu = Boolean(activeSubscription && Number(activeSubscription.expires_at) > Date.now());
          const adaUltimate = Boolean(activeServer && Number(activeServer.expires_at) > Date.now());
          const isPlanAktif = plan.id === 'premium-ultimate' ? adaUltimate : (adaIndividu && activeSubscription.plan_id === plan.id);
          const isTerkunci = plan.id === 'premium-ultimate' ? adaUltimate : (adaIndividu && !isPlanAktif);

          return (
            <div
              key={plan.id}
              className={`card group relative flex flex-col justify-between p-6 sm:p-7 transition-all duration-300 ${plan.warna.border} ${
                plan.populer ? `${plan.warna.glow} ring-1 ring-slate-300/30 md:-translate-y-2` : ''
              } ${isTerkunci ? 'opacity-55 saturate-50' : ''}`}
            >
              {/* Badge Status Langganan (Perpanjang Cerdas) */}
              {isPlanAktif && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#14532D] border border-[#22C55E] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#86EFAC] shadow-[0_0_15px_rgba(34,197,94,0.35)] whitespace-nowrap">
                  Langganan Aktifmu
                </div>
              )}
              {isTerkunci && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#2A2022] border border-linebright px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted shadow-[var(--shadow-hair)] whitespace-nowrap">
                  Terkunci
                </div>
              )}

              {/* Badge Populer */}
              {plan.populer && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 shimmer rounded-full bg-gradient-to-r from-slate-200 to-slate-400 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                  Paling Banyak Dipilih
                </div>
              )}

              <div className="flex-1 flex flex-col">
                {/* Header Kartu: Badge & Nama */}
                <div className="flex items-center gap-3.5">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                    <img
                      src={plan.badge}
                      alt={plan.badgeAlt}
                      width={64}
                      height={64}
                      className="h-full w-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-ink">{plan.nama}</h2>
                    <span className="inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-1 border-line bg-surface3 text-muted">
                      {plan.target}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted min-h-[36px]">
                  {plan.tagline}
                </p>

                {/* Harga */}
                <div className="mt-5 border-y border-line/80 py-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                      {labelHarga(totalHarga)}
                    </span>
                    <span className="text-xs text-faint">/ {currentDurasi.label}</span>
                  </div>
                  {currentDurasi.bulan > 1 && (
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="text-muted">Setara {labelHarga(hargaPerBulan)}/bln</span>
                      {hargaDurasi.hemat && (
                        <span className="rounded bg-[#14532D] border border-[#22C55E] px-1.5 py-0.5 text-[10px] font-bold text-[#86EFAC]">
                          {hargaDurasi.hemat}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Fitur Utama */}
                <div className="mt-5 flex-1 flex flex-col">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-faint mb-3">
                    Fitur Unggulan
                  </div>
                  <ul className="space-y-2.5 text-sm md:text-[15px] flex-1">
                    {plan.fiturRingkas.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-snug">
                        <span className="mt-0.5 shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#3B0004] border border-crimson text-neon">
                          <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                          </svg>
                        </span>
                        <span className="text-muted">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tombol CTA Rapi & Selaras (dengan aturan perpanjang cerdas) */}
              <div className="mt-8 pt-5 border-t border-line/60 shrink-0">
                {isTerkunci ? (
                  <div className="w-full h-12 rounded-xl flex flex-col items-center justify-center border border-line bg-surface text-center cursor-not-allowed select-none">
                    <span className="text-xs font-bold text-muted">Terkunci Selama Langganan Aktif</span>
                    <span className="text-[10px] text-faint">Selesaikan masa aktifmu, lalu paket ini bisa dibeli</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePilihPaket(plan)}
                    className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 text-center text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer active:scale-[0.98] ${plan.warna.btn}`}
                  >
                    <span>{isPlanAktif ? 'Perpanjang Sekarang' : (plan.btnLabel || 'Pilih Paket')}</span>
                    <span className="text-base leading-none transition-transform group-hover:translate-x-1">→</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Status Akun Aktif */}
      <div className="card p-4 text-center max-w-xl mx-auto text-xs text-muted">
        {session ? (
          <div className="flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-ok animate-pulse" />
            <span>Terhubung sebagai <strong className="text-ink">{session.username}</strong> ({session.discordId})</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-warn" />
            <span>Belum masuk. <Link href="/login?returnTo=%2Fpremium" className="text-neon hover:underline font-semibold">Masuk dengan Discord</Link> untuk mengaktifkan langganan ke akunmu.</span>
          </div>
        )}
      </div>

      {/* Tabel Komparasi Fitur Lengkap */}
      <section className="space-y-6">
        <div className="text-center">
          <button
            type="button"
            onClick={() => setTabTabel((v) => !v)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-neon hover:underline cursor-pointer"
          >
            <Emoji name="panduan" size={16} />
            {tabTabel ? 'Tutup Tabel Perbandingan' : 'Lihat Tabel Perbandingan Fitur Lengkap'}
            <span>{tabTabel ? '▲' : '▼'}</span>
          </button>
        </div>

        {tabTabel && (
          <div className="card overflow-x-auto noxa-scroll p-4 sm:p-6 shadow-[var(--shadow-lift)]">
            <h3 className="font-display text-lg font-bold mb-4">Matriks Perbandingan Fitur Semua Paket</h3>
            <div className="min-w-[620px]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-line text-faint uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Fitur</th>
                    <th className="py-3 px-3 text-center">Gratis</th>
                    <th className="py-3 px-3 text-center text-amber-400">Premium</th>
                    <th className="py-3 px-3 text-center text-slate-200">Premium+</th>
                    <th className="py-3 px-3 text-center text-purple-400">Ultimate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {FITUR_KOMPARASI.map((kat) => (
                    <React.Fragment key={kat.kategori}>
                      <tr className="bg-surface3">
                        <td colSpan={5} className="py-2.5 px-3 font-display text-xs font-bold uppercase tracking-wider text-neon">
                          {kat.kategori}
                        </td>
                      </tr>
                      {kat.items.map((it) => (
                        <tr key={it.nama} className="hover:bg-surface2 transition-colors">
                          <td className="py-2.5 px-3 text-muted">{it.nama}</td>
                          <td className="py-2.5 px-3 text-center">{renderNilai(it.gratis)}</td>
                          <td className="py-2.5 px-3 text-center font-medium text-amber-300">{renderNilai(it.premium)}</td>
                          <td className="py-2.5 px-3 text-center font-medium text-slate-200">{renderNilai(it.plus)}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-purple-300">{renderNilai(it.ultimate)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-faint break-words">{CATATAN_BITRATE}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-faint break-words">{CATATAN_CAKUPAN}</p>
          </div>
        )}
      </section>

      {/* 3 Langkah Aktivasi */}
      <section>
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Cara Aktivasi Otomatis</h2>
          <div className="accent-bar mx-auto mt-4" aria-hidden="true" />
          <p className="mt-3 text-xs sm:text-sm text-muted">
            Sistem pembayaran QRIS resmi QiosPay terintegrasi langsung dengan database akun Discord kamu.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {LANGKAH_AKTIVASI.map((l) => (
            <div key={l.nomor} className="card p-5 relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2B0003] border border-crimson font-display text-sm font-bold text-neon">
                  {l.nomor}
                </span>
                <h3 className="mt-3 font-display text-base font-bold text-ink">{l.judul}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{l.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL 1: Wajib Login Discord */}
      {modalLoginWajib && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="card relative w-full max-w-md p-6 text-center shadow-[var(--shadow-lift)]">
            <button
              type="button"
              onClick={() => setModalLoginWajib(false)}
              className="absolute right-4 top-4 text-faint hover:text-ink cursor-pointer"
            >
              ✕
            </button>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2B0003] border border-crimson">
              <Emoji name="userprofile" size={28} />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-ink">Masuk dengan Discord Diperlukan</h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted">
              Masuk agar ID Discord dan profilmu langsung terhubung dengan paket premium yang dibeli.
            </p>

            {/* Checkbox persetujuan wajib sebelum tombol login aktif */}
            <div className="mt-5 space-y-4">
              <label className="flex items-start gap-2.5 text-left text-xs leading-relaxed text-muted cursor-pointer select-none rounded-xl border border-line bg-surface p-3 transition hover:border-linebright">
                <input
                  type="checkbox"
                  checked={setujuLogin}
                  onChange={(e) => setSetujuLogin(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded accent-crimson cursor-pointer"
                />
                <span>
                  Saya telah membaca dan menyetujui{' '}
                  <Link href="/terms-of-service" target="_blank" className="text-neon hover:underline font-semibold" onClick={(e) => e.stopPropagation()}>
                    Ketentuan Layanan
                  </Link>{' '}
                  serta{' '}
                  <Link href="/privacy-policy" target="_blank" className="text-neon hover:underline font-semibold" onClick={(e) => e.stopPropagation()}>
                    Kebijakan Privasi
                  </Link>{' '}
                  NOXA Sound.
                </span>
              </label>

              <a
                href={setujuLogin ? '/api/auth/login?returnTo=%2Fpremium' : undefined}
                aria-disabled={!setujuLogin}
                onClick={(e) => { if (!setujuLogin) e.preventDefault(); }}
                className={`btn-primary w-full justify-center !py-3 text-sm font-bold transition-all duration-200 ${
                  setujuLogin
                    ? 'cursor-pointer hover:shadow-[0_0_20px_rgba(255,42,109,0.4)]'
                    : 'opacity-40 cursor-not-allowed pointer-events-none filter grayscale'
                }`}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Masuk Sekarang dengan Discord
              </a>
              {!setujuLogin && (
                <p className="text-[11px] text-faint text-center">
                  Centang persetujuan di atas untuk melanjutkan login.
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => { setModalLoginWajib(false); setSetujuLogin(false); }}
                className="btn-ghost !py-2.5 text-xs"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Checkout & QRIS Payment Gateway */}
      {modalBeli && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="card relative w-full max-w-lg p-6 sm:p-7 shadow-[var(--shadow-lift)] my-8">
            <button
              type="button"
              onClick={() => { setModalBeli(null); setTransaksiAktif(null); setStatusBayar(null); }}
              className="absolute right-4 top-4 text-faint hover:text-ink cursor-pointer"
            >
              ✕
            </button>

            {/* View 1: Rincian Pesanan (Sebelum Bayar) */}
            {!transaksiAktif && (
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={modalBeli.badge}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                  />
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink">{modalBeli.nama}</h3>
                    <p className="text-xs text-muted">Durasi: <strong className="text-neon">{currentDurasi.label}</strong></p>
                  </div>
                </div>

                <div className="hairline my-4" />

                {/* Info Akun Discord Pemesan */}
                <div className="rounded-xl border border-line bg-surface p-3.5 flex items-center gap-3">
                  {session.avatar ? (
                    <img src={session.avatar} alt="" className="h-10 w-10 rounded-full border border-line" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-[#2B0003] border border-crimson flex items-center justify-center font-bold text-neon">
                      {session.username?.slice(0, 1)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="font-semibold text-ink truncate">{session.username}</div>
                    <div className="text-faint font-mono">ID: {session.discordId}</div>
                  </div>
                  <span className="rounded bg-[#14532D] border border-[#22C55E] text-[#86EFAC] text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                    Tersambung
                  </span>
                </div>

                {/* Target server: WAJIB untuk paket Ultimate (benefit 1 server pilihan) */}
                {modalBeli.id === 'premium-ultimate' && (
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-muted mb-1.5">
                      ID Server Discord Tujuan (Wajib):
                    </label>
                    <input
                      value={guildIdInput}
                      onChange={(e) => setGuildIdInput(e.target.value)}
                      placeholder="Contoh: 123456789012345678"
                      readOnly={guildTerkunci}
                      className={`w-full rounded-xl border border-linebright bg-bg px-3.5 py-2.5 text-xs text-ink outline-none focus:border-crimson font-mono ${guildTerkunci ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                    <p className="mt-1 text-[11px] text-faint">
                      {guildTerkunci
                        ? 'Perpanjangan mempertahankan server aktif ini. Ingin memindahkan server? Gunakan tombol Ganti Server di halaman profilmu (cooldown 7 hari).'
                        : 'Aktifkan Discord Developer Mode (Pengaturan → Lanjutan), klik kanan nama server, lalu Copy Server ID. Benefit hanya aktif di server ini; ganti server bisa lewat profil dengan cooldown 7 hari.'}
                    </p>
                  </div>
                )}
                {modalBeli.id !== 'premium-ultimate' && (
                  <div className="mt-4 rounded-xl border border-line bg-surface p-3 text-[11px] text-muted">
                    Paket individu: benefit <strong className="text-ink">ikut akunmu</strong> ke server mana pun kamu memutar lagu. Tidak perlu ID server.
                  </div>
                )}

                {/* Rincian Harga */}
                <div className="mt-5 rounded-xl border border-line bg-surface2 p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted">
                    <span>Harga Paket ({modalBeli.nama})</span>
                    <span>{labelHarga(modalBeli.hargaBulanan * currentDurasi.bulan)}</span>
                  </div>
                  {modalBeli.durasi[durasiPilihan]?.hemat && (
                    <div className="flex justify-between text-ok font-medium">
                      <span>Diskon Durasi</span>
                      <span>-{modalBeli.durasi[durasiPilihan].hemat}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted">
                    <span>Metode Pembayaran</span>
                    <span className="font-semibold text-ink">QRIS Realtime (QiosPay)</span>
                  </div>
                  <div className="border-t border-line/60 pt-2 flex justify-between text-sm font-bold text-ink">
                    <span>Total Pembayaran</span>
                    <span className="text-neon font-display text-lg">
                      {labelHarga(modalBeli.durasi[durasiPilihan]?.harga || modalBeli.hargaBulanan * currentDurasi.bulan)}
                    </span>
                  </div>
                </div>

                {pesanError && (
                  <div className="mt-4 rounded-xl border border-crimson bg-[#2B0003] p-3 text-xs text-ink">
                    {pesanError}
                  </div>
                )}

                {/* Tombol Lanjut ke QRIS */}
                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={mulaiPembayaran}
                    disabled={prosesBeli}
                    className="btn-primary w-full justify-center !py-3 text-sm font-bold disabled:opacity-50"
                  >
                    {prosesBeli ? 'Menyiapkan Tagihan...' : 'Bayar Sekarang dengan QRIS'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalBeli(null)}
                    className="btn-ghost !py-2 text-xs"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* View 2: Tampilan Bayar QRIS & Polling */}
            {transaksiAktif && statusBayar !== 'paid' && (
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E] bg-[#0F2415] px-3 py-1 text-xs font-semibold text-[#86EFAC] mb-4">
                  <span className="h-2 w-2 rounded-full bg-ok animate-pulse" />
                  <span>Menunggu Pembayaran</span>
                </div>

                <h3 className="font-display text-lg font-bold text-ink">Scan QRIS untuk Menyelesaikan</h3>
                <p className="mt-1 text-xs text-muted">
                  Buka aplikasi e-wallet (GoPay, OVO, DANA, BCA, dll) dan scan QR di bawah ini:
                </p>

                {/* QR Code Frame */}
                <div className="my-5 mx-auto w-64 h-64 rounded-2xl border-2 border-linebright bg-white p-3 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  {transaksiAktif.qrisUrl ? (
                    <img src={transaksiAktif.qrisUrl} alt="QRIS" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-black text-center">
                      <Emoji name="party" size={32} />
                      <div className="mt-2 font-display text-base font-bold">QRIS QiosPay</div>
                      <div className="mt-1 text-[11px] text-neutral-600">
                        Total Tagihan: {labelHarga(transaksiAktif.amount)}
                      </div>
                      <a
                        href={transaksiAktif.invoiceUrl || 'https://my.qiospay.com/langganan'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 rounded-lg bg-black px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-neutral-800"
                      >
                        Buka Halaman Bayar →
                      </a>
                    </div>
                  )}
                </div>

                <div className="text-xs text-faint font-mono">
                  ID Transaksi: {transaksiAktif.transactionId}
                </div>
                <div className="mt-2 text-sm font-bold text-ink">
                  Total: <span className="text-neon">{labelHarga(transaksiAktif.amount)}</span>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
                  <span className="nx-spin inline-block h-3.5 w-3.5 rounded-full border-2 border-neon border-t-transparent animate-spin" />
                  <span>Mengecek status pembayaran otomatis...</span>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <a
                    href={transaksiAktif.invoiceUrl || 'https://my.qiospay.com/langganan'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full justify-center !py-2.5 text-xs font-bold"
                  >
                    Buka Link Pembayaran Langsung
                  </a>
                  {/* Simulasi tombol uji coba cepat */}
                  <button
                    type="button"
                    onClick={simulasiBayar}
                    disabled={prosesBeli}
                    className="rounded-xl border border-line px-3 py-2 text-xs text-faint hover:text-ink hover:border-linebright"
                  >
                    [Uji Coba] Konfirmasi Pembayaran Langsung
                  </button>
                  <button
                    type="button"
                    onClick={() => { setModalBeli(null); setTransaksiAktif(null); setStatusBayar(null); }}
                    className="btn-ghost !py-2 text-xs mt-1"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}

            {/* View 3: Pembayaran Sukses & Aktif */}
            {statusBayar === 'paid' && (
              <div className="text-center py-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0F2415] border border-[#22C55E] text-[#86EFAC] text-2xl font-bold">
                  ✓
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold text-ink">Pembayaran Berhasil!</h3>
                <p className="mt-2 text-sm text-muted">
                  Paket <strong>{modalBeli?.nama}</strong> kamu telah aktif untuk akun <strong>{session.username}</strong> ({session.discordId}).
                </p>
                <div className="mt-5 rounded-xl border border-line bg-surface p-4 text-xs text-left space-y-1.5">
                  <div className="flex justify-between"><span className="text-muted">Paket:</span><span className="font-semibold text-ink">{modalBeli?.nama}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Durasi:</span><span className="font-semibold text-ink">{currentDurasi.label}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Status:</span><span className="font-bold text-ok uppercase">Aktif</span></div>
                  <div className="flex justify-between"><span className="text-muted">ID Transaksi:</span><span className="font-mono text-faint">{transaksiAktif?.transactionId}</span></div>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/me"
                    className="btn-primary w-full justify-center !py-2.5 text-sm font-bold"
                  >
                    Lihat Profil & Badge Baru
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setModalBeli(null); setTransaksiAktif(null); setStatusBayar(null); }}
                    className="btn-ghost !py-2 text-xs"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function renderNilai(val) {
  if (val === true) {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0F2415] border border-[#22C55E] text-[#86EFAC] mx-auto font-bold">
        ✓
      </span>
    );
  }
  if (val === false) {
    return <span className="text-faint font-mono">-</span>;
  }
  return <span>{val}</span>;
}
