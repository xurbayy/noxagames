'use client';

import { useState, useEffect, useCallback } from 'react';
import Emoji from '../Emoji';
import { PREMIUM_PLANS, labelHarga } from '../../lib/premiumPlan';

export default function PremiumManagement() {
  const [data, setData] = useState({ subscriptions: [], transactions: [] });
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState(null);
  const [error, setError] = useState(null);

  // State Modal Tambah Manual
  const [bukaTambah, setBukaTambah] = useState(false);
  const [formTambah, setFormTambah] = useState({
    discordId: '',
    username: '',
    planId: 'premium-plus',
    durationMonths: 1,
    guildId: '',
  });

  // State Edit / Perpanjang
  const [editItem, setEditItem] = useState(null); // subscription object
  const [hapusId, setHapusId] = useState(null); // id yang mau dicabut
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/subscriptions', { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.ok) {
        setData({
          subscriptions: json.subscriptions || [],
          transactions: json.transactions || [],
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

  // Tambah langganan manual
  async function submitTambah(e) {
    e.preventDefault();
    setBusy(true);
    setPesan(null);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formTambah),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setPesan(`Paket berhasil diaktifkan untuk Discord ID ${formTambah.discordId}`);
        setBukaTambah(false);
        setFormTambah({ discordId: '', username: '', planId: 'premium-plus', durationMonths: 1, guildId: '' });
        await loadData();
      } else {
        setPesan(json.error || 'Gagal menambahkan langganan.');
      }
    } catch {
      setPesan('Koneksi bermasalah saat menambah langganan.');
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

  const subs = data.subscriptions || [];
  const totalAktif = subs.filter((s) => s.status === 'active').length;
  const totalOmzet = (data.transactions || []).reduce((acc, t) => acc + (t.status === 'paid' ? Number(t.amount) : 0), 0);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Monetisasi & Gateway</div>
          <h2 className="font-display text-lg font-bold">Manajemen Langganan Premium</h2>
        </div>
        <button
          type="button"
          onClick={() => setBukaTambah(true)}
          className="btn-primary !py-2 !px-4 text-xs font-bold cursor-pointer"
        >
          + Tambah Premium Manual
        </button>
      </div>

      {pesan && (
        <div className="card mb-4 border-linebright bg-surface2 p-3.5 text-xs text-ink flex items-center justify-between">
          <span>{pesan}</span>
          <button type="button" onClick={() => setPesan(null)} className="text-faint hover:text-ink cursor-pointer ml-3">✕</button>
        </div>
      )}

      {error && <div className="card mb-4 border-crimson bg-[#2B0003] p-4 text-xs text-ink">{error}</div>}

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

      {/* Daftar Pelanggan Aktif */}
      <div className="card p-5 mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
            <Emoji name="party" size={16} /> Daftar Pelanggan & Server Premium
          </h3>
          <span className="text-xs text-faint">{subs.length} entri</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-faint">Memuat data langganan...</div>
        ) : subs.length === 0 ? (
          <div className="py-8 text-center text-xs text-faint">
            Belum ada pelanggan premium. Klik tombol "+ Tambah Premium Manual" di atas untuk menambahkan.
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
                        <span className={`noxa-badge ${s.status === 'active' ? 'bg-[#14532D] text-[#86EFAC] border border-[#22C55E]' : 'bg-[#2B0003] text-[#FF8A9B] border border-crimson'}`}>
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
                        className="rounded-lg border border-crimson bg-[#2B0003] px-2 py-1 text-xs font-semibold text-neon hover:bg-[#3D0005] cursor-pointer ml-1"
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
        <h3 className="font-display text-base font-bold text-ink mb-3 flex items-center gap-2">
          <Emoji name="jam" size={16} /> Riwayat Invoice & Pembayaran Gateway
        </h3>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH MANUAL */}
      {bukaTambah && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="card relative w-full max-w-md p-6 shadow-[var(--shadow-lift)]">
            <button
              type="button"
              onClick={() => setBukaTambah(false)}
              className="absolute right-4 top-4 text-faint hover:text-ink cursor-pointer"
            >
              ✕
            </button>
            <h3 className="font-display text-lg font-bold text-ink">Tambah Langganan Premium Manual</h3>
            <p className="mt-1 text-xs text-muted">
              Paket dan badge akan langsung aktif di database web dan disinkronkan ke bot.
            </p>

            <form onSubmit={submitTambah} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Discord User ID (Wajib):</label>
                <input
                  required
                  value={formTambah.discordId}
                  onChange={(e) => setFormTambah({ ...formTambah, discordId: e.target.value })}
                  placeholder="Contoh: 836383639439671366"
                  className="w-full rounded-xl border border-linebright bg-bg px-3.5 py-2 text-xs text-ink outline-none focus:border-crimson font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Username (Opsional):</label>
                <input
                  value={formTambah.username}
                  onChange={(e) => setFormTambah({ ...formTambah, username: e.target.value })}
                  placeholder="Contoh: xurbayy"
                  className="w-full rounded-xl border border-linebright bg-bg px-3.5 py-2 text-xs text-ink outline-none focus:border-crimson"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Pilih Paket:</label>
                  <select
                    value={formTambah.planId}
                    onChange={(e) => setFormTambah({ ...formTambah, planId: e.target.value })}
                    className="w-full rounded-xl border border-linebright bg-bg px-3 py-2 text-xs text-ink outline-none focus:border-crimson"
                  >
                    {PREMIUM_PLANS.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Durasi:</label>
                  <select
                    value={formTambah.durationMonths}
                    onChange={(e) => setFormTambah({ ...formTambah, durationMonths: e.target.value })}
                    className="w-full rounded-xl border border-linebright bg-bg px-3 py-2 text-xs text-ink outline-none focus:border-crimson"
                  >
                    <option value={1}>1 Bulan</option>
                    <option value={3}>3 Bulan</option>
                    <option value={6}>6 Bulan</option>
                    <option value={12}>1 Tahun (12 Bln)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Target Guild / Server ID (Opsional):</label>
                <input
                  value={formTambah.guildId}
                  onChange={(e) => setFormTambah({ ...formTambah, guildId: e.target.value })}
                  placeholder="ID server Discord (untuk paket server)"
                  className="w-full rounded-xl border border-linebright bg-bg px-3.5 py-2 text-xs text-ink outline-none focus:border-crimson font-mono"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary w-full justify-center !py-2.5 text-xs font-bold disabled:opacity-50"
                >
                  {busy ? 'Menyimpan...' : 'Aktifkan Sekarang'}
                </button>
                <button
                  type="button"
                  onClick={() => setBukaTambah(false)}
                  className="btn-ghost !py-2.5 text-xs"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </section>
  );
}
