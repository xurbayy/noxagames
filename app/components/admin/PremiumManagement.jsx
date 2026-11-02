'use client';

import { useState, useEffect, useCallback } from 'react';
import Emoji from '../Emoji';
import KonfirmasiModal from './KonfirmasiModal';
import GrafikBatang from './Grafik';
import { PREMIUM_PLANS, labelHarga } from '../../lib/premiumPlan';

export default function PremiumManagement() {
  const [data, setData] = useState({ subscriptions: [], transactions: [], omzetHarian: [] });
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState(null);
  const [error, setError] = useState(null);
  // Konfirmasi berbahaya memakai popup buatan sendiri (bukan confirm() browser).
  // Bentuk: { tipe, tx? } - tipe: 'hapusTx' | 'bersihkan' | 'bebaskan'.
  const [konfirmasi, setKonfirmasi] = useState(null);

  // Aktivasi manual dari panel: pengganti pemberian pass lewat bot. Tidak
  // membuat baris transaksi (omzet & riwayat gateway tetap bersih), tapi tetap
  // dikirim ke bot supaya badge + benefit benar-benar aktif.
  const FORM_KOSONG = { discordId: '', username: '', planId: 'premium', durationMonths: 1, guildId: '' };

  // State Edit / Perpanjang
  const [editItem, setEditItem] = useState(null); // subscription object
  const [hapusId, setHapusId] = useState(null); // id yang mau dicabut
  const [busy, setBusy] = useState(false);
  // State Tambah Manual
  const [tambahOpen, setTambahOpen] = useState(false);
  const [formBaru, setFormBaru] = useState(FORM_KOSONG);

  // Paket Ultimate = benefit 1 server, jadi ID server wajib diisi.
  const paketServerBaru = formBaru.planId === 'premium-ultimate';

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/subscriptions', { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.ok) {
        setData({
          subscriptions: json.subscriptions || [],
          transactions: json.transactions || [],
          omzetHarian: json.omzetHarian || [],
        });
        setError(null);
      } else {
        setError(json.error || 'Gagal memuat data langganan.');
      }
    } catch {
      setError('Koneksi terputus saat memuat data langganan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tambah pelanggan premium manual (tanpa QRIS)
  async function tambahManual(e) {
    e.preventDefault();
    setBusy(true);
    setPesan(null);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formBaru),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setPesan(
          `${json.tierName} ${json.durationMonths} bulan aktif untuk ${json.discordId} ` +
          `(s/d ${new Date(json.expiresAt).toLocaleDateString('id-ID')}). Bot sinkron dalam ±20 detik.`
        );
        setTambahOpen(false);
        setFormBaru(FORM_KOSONG);
        await loadData();
      } else {
        setPesan(json.error || 'Gagal menambah pelanggan manual.');
      }
    } catch {
      setPesan('Koneksi terputus.');
    } finally {
      setBusy(false);
    }
  }

  // Perpanjang durasi cepat (+N bulan)
  async function perpanjangCepat(id, extendMonths) {
    setBusy(true);
    setPesan(null);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, extendMonths }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setPesan(`Langganan #${id} berhasil diperpanjang +${extendMonths} bulan.`);
        await loadData();
      } else {
        setPesan(json.error || 'Gagal memperpanjang langganan.');
      }
    } catch {
      setPesan('Koneksi terputus.');
    } finally {
      setBusy(false);
    }
  }

  // Simpan perubahan paket / server
  async function simpanEdit(e) {
    e.preventDefault();
    if (!editItem) return;
    setBusy(true);
    setPesan(null);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editItem.id,
          newPlanId: editItem.planId,
          guildId: editItem.guildId || null,
          extendMonths: editItem.tambahBulan || 0,
        }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setPesan(`Langganan #${editItem.id} berhasil diperbarui.`);
        setEditItem(null);
        await loadData();
      } else {
        setPesan(json.error || 'Gagal memperbarui langganan.');
      }
    } catch {
      setPesan('Koneksi terputus.');
    } finally {
      setBusy(false);
    }
  }

  // Hapus / Cabut paket
  async function cabutLangganan(id) {
    setBusy(true);
    setPesan(null);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setPesan(`Langganan #${id} berhasil dicabut dan dinonaktifkan di bot.`);
        setHapusId(null);
        await loadData();
      } else {
        setPesan(json.error || 'Gagal mencabut langganan.');
      }
    } catch {
      setPesan('Koneksi terputus.');
    } finally {
      setBusy(false);
    }
  }

  // Hapus semua transaksi yang tidak lunas (kedaluwarsa/batal/gagal).
  // Konfirmasi lewat popup KonfirmasiModal, bukan confirm() browser.
  async function jalankanBersihkan() {
    const jedaMenit = 60;
    setBusy(true);
    setPesan(null);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hapusKedaluwarsa: true, lebihTuaDariMenit: jedaMenit }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setPesan(`${json.terhapus} transaksi kedaluwarsa dihapus. Transaksi lunas tetap utuh.`);
        setKonfirmasi(null);
        await loadData();
      } else {
        setPesan(json.error || 'Gagal membersihkan transaksi kedaluwarsa.');
      }
    } catch {
      setPesan('Koneksi terputus.');
    } finally {
      setBusy(false);
    }
  }

  // Bebaskan transaksi kedaluwarsa: tandai lunas + aktifkan paketnya.
  // Dipakai kalau pembeli sudah transfer tapi invoice keburu habis waktunya.
  async function jalankanBebaskan(tx) {
    setBusy(true);
    setPesan(null);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId: tx.id }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setPesan(
          json.sudahLunas
            ? `Transaksi ${tx.id} sudah lunas sebelumnya - tidak ada perubahan.`
            : `Transaksi ${tx.id} dibebaskan. Paket ${json.planId} aktif untuk ${json.discordId} ` +
              `s/d ${new Date(json.expiresAt).toLocaleDateString('id-ID')}. Bot sinkron dalam ±20 detik.`
        );
        setKonfirmasi(null);
        await loadData();
      } else {
        setPesan(json.error || 'Gagal membebaskan transaksi.');
      }
    } catch {
      setPesan('Koneksi terputus.');
    } finally {
      setBusy(false);
    }
  }

  // Hapus riwayat transaksi tunggal (确认后 via popup sendiri).
  async function jalankanHapusTx(txId) {
    setBusy(true);
    setPesan(null);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setPesan(`Riwayat transaksi ${txId} berhasil dihapus.`);
        setKonfirmasi(null);
        setData((d) => ({
          ...d,
          transactions: (d.transactions || []).filter((t) => t.id !== txId),
        }));
      } else {
        setPesan(json.error || 'Gagal menghapus transaksi.');
      }
    } catch {
      setPesan('Koneksi terputus.');
    } finally {
      setBusy(false);
    }
  }

  // Satu titik eksekusi untuk semua konfirmasi yang sedang terbuka.
  function konfirmasiYa() {
    if (!konfirmasi || busy) return;
    if (konfirmasi.tipe === 'hapusTx') jalankanHapusTx(konfirmasi.tx.id);
    else if (konfirmasi.tipe === 'bersihkan') jalankanBersihkan();
    else if (konfirmasi.tipe === 'bebaskan') jalankanBebaskan(konfirmasi.tx);
  }

  const subs = data.subscriptions || [];
  const totalAktif = subs.filter((s) => s.status === 'active').length;
  const totalOmzet = (data.transactions || []).reduce((acc, t) => acc + (t.status === 'paid' ? Number(t.amount) : 0), 0);

  // Titik grafik omzet: hari tanpa penjualan digambar nol supaya sumbu waktu
  // tetap utuh (bar kosong = hari sepi, bukan hari hilang).
  const DAY_MS = 86400000;
  const omzetTitik = (() => {
    const rows = Array.isArray(data.omzetHarian) ? data.omzetHarian : [];
    if (rows.length === 0) return [];
    const peta = new Map(rows.map((r) => [Number(r.day), Number(r.total) || 0]));
    const hariTerakhir = Math.max(...rows.map((r) => Number(r.day)));
    const hariPertama = Math.min(...rows.map((r) => Number(r.day)));
    const mulai = Math.max(hariTerakhir - 29 * DAY_MS, hariPertama);
    const out = [];
    for (let d = mulai; d <= hariTerakhir; d += DAY_MS) {
      out.push({ hari: d, nilai: peta.get(d) || 0 });
    }
    return out;
  })();

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Monetisasi & Gateway</div>
          <h2 className="font-display text-lg font-bold">Manajemen Langganan Premium</h2>
        </div>
      </div>

      {pesan && (
        <div className="card mb-4 border-linebright bg-surface2 p-3.5 text-xs text-ink flex items-center justify-between">
          <span>{pesan}</span>
          <button type="button" onClick={() => setPesan(null)} className="text-faint hover:text-ink cursor-pointer ml-3">✕</button>
        </div>
      )}

      {error && <div className="card mb-4 border-crimson p-4 text-xs text-ink">{error}</div>}

      {/* KPI Kartu Ringkas */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 mb-6">
        <div className="stat-tile p-4">
          <div className="text-xs text-muted">Pelanggan Aktif</div>
          <div className="mt-1 font-display text-2xl font-bold tabular-nums text-ink">{totalAktif}</div>
          <div className="mt-0.5 text-[11px] text-faint">Akun / Server terdaftar</div>
        </div>
        <div className="stat-tile p-4">
          <div className="text-xs text-muted">Total Transaksi</div>
          <div className="mt-1 font-display text-2xl font-bold tabular-nums text-ink">{(data.transactions || []).length}</div>
          <div className="mt-0.5 text-[11px] text-faint">Riwayat invoice QiosPay</div>
        </div>
        <div className="stat-tile p-4 col-span-2 md:col-span-1">
          <div className="text-xs text-muted">Total Pendapatan Masuk</div>
          <div className="mt-1 font-display text-2xl font-bold tabular-nums text-neon">{labelHarga(totalOmzet)}</div>
          <div className="mt-0.5 text-[11px] text-faint">Status lunas (paid)</div>
        </div>
      </div>

      {/* Grafik omzet 30 hari (transaksi paid per hari) */}
      <div className="card mb-6 p-4 sm:p-5">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-faint">
            <Emoji name="tambahmusik" size={14} /> Omzet 30 Hari
          </div>
          <span className="text-[11px] text-faint">Hanya transaksi lunas</span>
        </div>
        {omzetTitik.length > 0 ? (
          <div className="mt-3">
            <GrafikBatang
              titik={omzetTitik}
              warna="#F0A63C"
              satuan="diterima"
              format={(v) => labelHarga(v)}
            />
          </div>
        ) : (
          <p className="mt-3 text-xs leading-relaxed text-faint">
            Belum ada transaksi lunas dalam 30 hari terakhir. Grafik muncul otomatis begitu pembayaran QRIS pertama masuk.
          </p>
        )}
      </div>

      {/* Daftar Pelanggan Aktif */}
      <div className="card p-5 mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
            <Emoji name="party" size={16} /> Daftar Pelanggan & Server Premium
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-faint">{subs.length} entri</span>
            <button
              type="button"
              onClick={() => { setFormBaru(FORM_KOSONG); setTambahOpen(true); }}
              disabled={busy}
              className="rounded-lg border border-neon bg-surface2 px-2.5 py-1 text-[11px] font-bold text-neon transition hover:bg-neon hover:text-black cursor-pointer disabled:opacity-50"
            >
              + Tambah Manual
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-faint">Memuat data langganan...</div>
        ) : subs.length === 0 ? (
          <div className="py-8 text-center text-xs text-faint">
            Belum ada pelanggan premium aktif. Paket masuk otomatis dari pembelian QRIS di halaman /premium, atau lewat tombol + Tambah Manual.
          </div>
        ) : (
          <div className="space-y-3">
            {subs.map((s) => {
              const badgeImg = s.planId === 'premium-ultimate'
                ? '/badges/noxa-premium-ultimate.png'
                : s.planId === 'premium-plus'
                ? '/badges/noxa-premium-plus.png'
                : '/badges/noxa-premium.png';

              return (
                <div
                  key={s.id}
                  className="rounded-xl border border-line bg-surface p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-linebright"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <img src={badgeImg} alt="" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-ink">{s.username}</span>
                        <span className="noxa-badge border border-line bg-surface3 text-muted">
                          {s.tierName}
                        </span>
                        <span className={`noxa-badge ${s.status === 'active' ? 'bg-[#14532D] text-[#86EFAC] border border-[#22C55E]' : 'bg-surface3 text-faint border border-line'}`}>
                          {s.status === 'active' ? `${s.sisaHari} hari lagi` : 'Kedaluwarsa'}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-faint font-mono">
                        <span>User ID: <strong className="text-ink">{s.discordId}</strong></span>
                        {s.guildId && <span>Server ID: <strong className="text-neon">{s.guildId}</strong></span>}
                        <span>Berakhir: {new Date(s.expiresAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Aksi Perpanjang & Kelola */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => perpanjangCepat(s.id, 1)}
                      disabled={busy}
                      className="rounded-lg border border-line bg-surface2 px-2.5 py-1 text-xs font-semibold text-ink hover:border-neon hover:text-neon cursor-pointer disabled:opacity-50"
                      title="Perpanjang 1 Bulan"
                    >
                      +1 Bln
                    </button>
                    <button
                      type="button"
                      onClick={() => perpanjangCepat(s.id, 3)}
                      disabled={busy}
                      className="rounded-lg border border-line bg-surface2 px-2.5 py-1 text-xs font-semibold text-ink hover:border-neon hover:text-neon cursor-pointer disabled:opacity-50"
                      title="Perpanjang 3 Bulan"
                    >
                      +3 Bln
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditItem({ ...s, tambahBulan: 0 })}
                      disabled={busy}
                      className="rounded-lg border border-line bg-surface2 px-2.5 py-1 text-xs font-semibold text-muted hover:text-ink cursor-pointer"
                    >
                      Ubah
                    </button>

                    {hapusId === s.id ? (
                      <div className="inline-flex items-center gap-1.5 ml-1">
                        <button
                          type="button"
                          onClick={() => cabutLangganan(s.id)}
                          disabled={busy}
                          className="rounded-lg bg-crimson px-2.5 py-1 text-xs font-bold text-white hover:bg-neon cursor-pointer"
                        >
                          Ya, Cabut
                        </button>
                        <button
                          type="button"
                          onClick={() => setHapusId(null)}
                          className="text-xs text-faint hover:text-ink cursor-pointer px-1.5"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setHapusId(s.id)}
                        disabled={busy}
                        className="rounded-lg border border-crimson px-2 py-1 text-xs font-semibold text-neon hover:bg-crimson hover:text-white cursor-pointer ml-1"
                      >
                        Cabut
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Riwayat Transaksi QiosPay */}
      <div className="card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
            <Emoji name="jam" size={16} /> Riwayat Invoice & Pembayaran Gateway
          </h3>
          {/* Bersihkan transaksi yang sudah kedaluwarsa/batal/gagal, supaya
              daftar riwayat tidak menumpuk invoice lama. Transaksi lunas
              TIDAK pernah ikut dihapus. */}
          {data.transactions?.length > 0 && (
            <button
              type="button"
              onClick={() => setKonfirmasi({ tipe: 'bersihkan' })}
              disabled={busy}
              className="rounded-lg border border-crimson bg-surface2 px-2.5 py-1 text-[11px] font-bold text-neon transition hover:bg-crimson hover:text-white cursor-pointer disabled:opacity-50"
              title="Hapus semua transaksi yang tidak lunas"
            >
              Bersihkan yang Kedaluwarsa
            </button>
          )}
        </div>
        {data.transactions?.length === 0 ? (
          <p className="text-xs text-faint py-4 text-center">Belum ada riwayat transaksi.</p>
        ) : (
          <div className="overflow-x-auto noxa-scroll">
            <table className="w-full text-left text-xs min-w-[580px]">
              <thead>
                <tr className="border-b border-line text-faint text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">ID Transaksi</th>
                  <th className="py-2.5 px-3">Pengguna</th>
                  <th className="py-2.5 px-3">Paket</th>
                  <th className="py-2.5 px-3">Nominal</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {data.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface2 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-faint">{tx.id}</td>
                    <td className="py-2.5 px-3 text-ink font-medium">{tx.username} <span className="text-faint font-mono text-[10px]">({tx.discordId})</span></td>
                    <td className="py-2.5 px-3 text-muted">{tx.planId} ({tx.durationMonths} bln)</td>
                    <td className="py-2.5 px-3 text-ink font-bold tabular-nums">{labelHarga(tx.amount)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`noxa-badge ${tx.status === 'paid' ? 'bg-[#14532D] text-[#86EFAC] border border-[#22C55E]' : 'bg-[#3A2503] text-[#FBBF24] border border-[#F59E0B]'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-faint">{new Date(tx.createdAt).toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {tx.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => setKonfirmasi({ tipe: 'bebaskan', tx })}
                            disabled={busy}
                            className="rounded-md border border-[#22C55E] bg-surface3 px-2 py-0.5 text-[11px] font-bold text-[#86EFAC] hover:bg-[#14532D] hover:text-white transition cursor-pointer disabled:opacity-50"
                            title="Tandai lunas & aktifkan paketnya (untuk invoice yang sudah dibayar tapi keburu kedaluwarsa)"
                          >
                            Bebaskan
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setKonfirmasi({ tipe: 'hapusTx', tx })}
                          disabled={busy}
                          className="rounded-md border border-line bg-surface3 px-2 py-0.5 text-[11px] font-bold text-crimson hover:bg-[#3B0004] hover:text-white transition cursor-pointer"
                          title="Hapus riwayat transaksi ini"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL EDIT / PERPANJANG */}
      {editItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="card relative w-full max-w-md p-6 shadow-[var(--shadow-lift)]">
            <button
              type="button"
              onClick={() => setEditItem(null)}
              className="absolute right-4 top-4 text-faint hover:text-ink cursor-pointer"
            >
              ✕
            </button>
            <h3 className="font-display text-lg font-bold text-ink">Ubah / Perpanjang Langganan #{editItem.id}</h3>
            <p className="mt-1 text-xs text-muted">
              Untuk pengguna: <strong className="text-ink">{editItem.username}</strong> ({editItem.discordId})
            </p>

            <form onSubmit={simpanEdit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Paket Langganan:</label>
                <select
                  value={editItem.planId}
                  onChange={(e) => setEditItem({ ...editItem, planId: e.target.value })}
                  className="w-full rounded-xl border border-linebright bg-bg px-3 py-2 text-xs text-ink outline-none focus:border-crimson"
                >
                  {PREMIUM_PLANS.map((p) => (
                    <option key={p.id} value={p.id}>{p.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Tambah Durasi (Bulan):</label>
                <select
                  value={editItem.tambahBulan || 0}
                  onChange={(e) => setEditItem({ ...editItem, tambahBulan: Number(e.target.value) })}
                  className="w-full rounded-xl border border-linebright bg-bg px-3 py-2 text-xs text-ink outline-none focus:border-crimson"
                >
                  <option value={0}>Jangan tambah durasi (tetap sama)</option>
                  <option value={1}>+1 Bulan (30 hari)</option>
                  <option value={3}>+3 Bulan (90 hari)</option>
                  <option value={6}>+6 Bulan (180 hari)</option>
                  <option value={12}>+1 Tahun (365 hari)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Target Guild / Server ID:</label>
                <input
                  value={editItem.guildId || ''}
                  onChange={(e) => setEditItem({ ...editItem, guildId: e.target.value })}
                  placeholder="ID server Discord"
                  className="w-full rounded-xl border border-linebright bg-bg px-3.5 py-2 text-xs text-ink outline-none focus:border-crimson font-mono"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary w-full justify-center !py-2.5 text-xs font-bold disabled:opacity-50"
                >
                  {busy ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="btn-ghost !py-2.5 text-xs"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL TAMBAH MANUAL */}
      {tambahOpen && (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
          <div className="card relative my-6 w-full max-w-md p-5 shadow-[var(--shadow-lift)] sm:p-6">
            <button
              type="button"
              onClick={() => setTambahOpen(false)}
              className="absolute right-4 top-4 text-faint hover:text-ink cursor-pointer"
            >
              ✕
            </button>
            <h3 className="font-display text-lg font-bold text-ink">Tambah Pelanggan Manual</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Paket langsung aktif dan dikirim ke bot (tanpa invoice, omzet gateway tidak terpengaruh).
            </p>

            <form onSubmit={tambahManual} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">ID Discord Pengguna *</label>
                <input
                  value={formBaru.discordId}
                  onChange={(e) => setFormBaru({ ...formBaru, discordId: e.target.value })}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="1455442230801203323"
                  className="w-full rounded-xl border border-linebright bg-bg px-3.5 py-2 text-xs text-ink outline-none focus:border-crimson font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Nama Tampilan (opsional)</label>
                <input
                  value={formBaru.username}
                  onChange={(e) => setFormBaru({ ...formBaru, username: e.target.value })}
                  autoComplete="off"
                  placeholder="Nama di panel admin"
                  className="w-full rounded-xl border border-linebright bg-bg px-3.5 py-2 text-xs text-ink outline-none focus:border-crimson"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Paket</label>
                  <select
                    value={formBaru.planId}
                    onChange={(e) => setFormBaru({ ...formBaru, planId: e.target.value })}
                    className="w-full rounded-xl border border-linebright bg-bg px-2.5 py-2 text-xs text-ink outline-none focus:border-crimson"
                  >
                    {PREMIUM_PLANS.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Durasi</label>
                  <select
                    value={formBaru.durationMonths}
                    onChange={(e) => setFormBaru({ ...formBaru, durationMonths: Number(e.target.value) })}
                    className="w-full rounded-xl border border-linebright bg-bg px-2.5 py-2 text-xs text-ink outline-none focus:border-crimson"
                  >
                    <option value={1}>1 Bulan</option>
                    <option value={3}>3 Bulan</option>
                    <option value={6}>6 Bulan</option>
                    <option value={12}>1 Tahun</option>
                  </select>
                </div>
              </div>

              {paketServerBaru && (
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">ID Server Tujuan *</label>
                  <input
                    value={formBaru.guildId}
                    onChange={(e) => setFormBaru({ ...formBaru, guildId: e.target.value })}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="ID server Discord"
                    className="w-full rounded-xl border border-linebright bg-bg px-3.5 py-2 text-xs text-ink outline-none focus:border-crimson font-mono"
                  />
                  <p className="mt-1 text-[11px] text-faint leading-relaxed">
                    Paket Ultimate berlaku untuk seluruh member server ini.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary w-full justify-center !py-2.5 text-xs font-bold disabled:opacity-50"
                >
                  {busy ? 'Menyimpan...' : 'Aktifkan Sekarang'}
                </button>
                <button
                  type="button"
                  onClick={() => setTambahOpen(false)}
                  className="btn-ghost !py-2.5 text-xs"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP KONFIRMASI BUATAN SENDIRI (pengganti confirm() browser) */}
      <KonfirmasiModal
        open={Boolean(konfirmasi)}
        busy={busy}
        onBatal={() => setKonfirmasi(null)}
        onKonfirmasi={konfirmasiYa}
        {...(konfirmasi?.tipe === 'hapusTx'
          ? {
              judul: 'Hapus Riwayat Transaksi?',
              pesan: `Transaksi ${konfirmasi.tx?.id} (${konfirmasi.tx?.username || '-'} - ${labelHarga(konfirmasi.tx?.amount || 0)}) akan dihapus permanen dari riwayat.`,
              catatan: 'Status transaksi tidak berubah - invoice di gateway tetap ada. Tindakan ini tidak bisa dibatalkan.',
              labelAksi: 'Hapus Riwayat',
              varian: 'bahaya',
            }
          : konfirmasi?.tipe === 'bebaskan'
            ? {
                judul: 'Bebaskan Transaksi?',
                pesan: `Paket ${konfirmasi.tx?.planId} (${konfirmasi.tx?.durationMonths || 1} bln) langsung aktif untuk ${konfirmasi.tx?.discordId}.`,
                catatan: 'Lakukan ini HANYA kalau pembayaran benar-benar sudah masuk. Tindakan ini tidak bisa dibatalkan.',
                labelAksi: 'Ya, Bebaskan',
                varian: 'aman',
              }
            : {
                judul: 'Bersihkan Transaksi Kedaluwarsa?',
                pesan: 'Semua transaksi yang tidak lunas (kedaluwarsa, batal, gagal) dan lebih tua dari 60 menit akan dihapus dari riwayat.',
                catatan: 'Transaksi LUNAS tidak akan disentuh. Tindakan ini tidak bisa dibatalkan.',
                labelAksi: 'Bersihkan',
                varian: 'bahaya',
              })}
      />
    </section>
  );
}
