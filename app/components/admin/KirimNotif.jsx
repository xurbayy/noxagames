'use client';

// Form kirim pesan manual dari admin ke lonceng notifikasi user (pola NEXO
// BroadcastManager). Target: semua user (broadcast) atau satu Discord ID.
import { useState } from 'react';
import Emoji from '../Emoji';

const TIPE = [
  { id: 'info', label: 'Info', ket: 'Pengumuman biasa - maintenance, perubahan sistem.' },
  { id: 'event', label: 'Event', ket: 'Kabar besar - event, update, promo.' },
  { id: 'penting', label: 'Penting', ket: 'Harus dibaca - gangguan, aturan baru.' },
];

const KOSONG = { target: 'all', discordId: '', tipe: 'info', judul: '', isi: '', url: '' };

export default function KirimNotif() {
  const [form, setForm] = useState(KOSONG);
  const [sibuk, setSibuk] = useState(false);
  const [hasil, setHasil] = useState(null);

  async function kirim(e) {
    e.preventDefault();
    if (sibuk) return;
    setSibuk(true);
    setHasil(null);
    try {
      const target = form.target === 'all' ? 'all' : form.discordId.trim();
      const res = await fetch('/api/admin/kirim-notif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, tipe: form.tipe, judul: form.judul, isi: form.isi, url: form.url }),
      });
      const d = await res.json().catch(() => ({}));
      if (d.ok) {
        setHasil({ ok: true, teks: d.message });
        setForm((f) => ({ ...f, judul: '', isi: '', url: '' }));
      } else {
        setHasil({ ok: false, teks: d.error || 'Gagal mengirim.' });
      }
    } catch {
      setHasil({ ok: false, teks: 'Gagal menghubungi server.' });
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Emoji name="chat" size={16} />
        <h3 className="font-display text-base font-bold text-ink">Kirim Pesan ke User</h3>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-muted">
        Masuk ke lonceng notifikasi user di web. Untuk kode redeem, kirim dari menu transaksi/promo.
      </p>

      <form onSubmit={kirim} className="space-y-3.5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">Target</label>
            <select
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-xs text-ink outline-none focus:border-crimson"
            >
              <option value="all">Semua user (broadcast)</option>
              <option value="one">Satu user (Discord ID)</option>
            </select>
          </div>
          {form.target === 'one' && (
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">Discord ID</label>
              <input
                value={form.discordId}
                onChange={(e) => setForm({ ...form, discordId: e.target.value.replace(/\D/g, '') })}
                placeholder="836383639439671366"
                inputMode="numeric"
                className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-mono text-xs text-ink outline-none focus:border-crimson"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">Jenis</label>
            <select
              value={form.tipe}
              onChange={(e) => setForm({ ...form, tipe: e.target.value })}
              className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-xs text-ink outline-none focus:border-crimson"
            >
              {TIPE.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <p className="mt-1 text-[10px] leading-snug text-faint">{TIPE.find((t) => t.id === form.tipe)?.ket}</p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">Judul</label>
          <input
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            maxLength={120}
            placeholder="Maintenance malam ini"
            className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-xs text-ink outline-none focus:border-crimson"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">Isi (opsional)</label>
          <textarea
            value={form.isi}
            onChange={(e) => setForm({ ...form, isi: e.target.value })}
            rows={2}
            maxLength={500}
            placeholder="Bot restart 5 menit, pemutaran berlanjut otomatis."
            className="w-full resize-y rounded-xl border border-line bg-bg px-3 py-2 text-xs text-ink outline-none focus:border-crimson"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">Tautan (opsional)</label>
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="/premium"
            className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-mono text-xs text-ink outline-none focus:border-crimson"
          />
          <p className="mt-1 text-[10px] text-faint">Path internal, contoh /premium atau /top.</p>
        </div>

        {hasil && (
          <p className={`rounded-lg border px-3 py-2 text-[11px] leading-relaxed ${
            hasil.ok ? 'border-[#22C55E] bg-[#14532D] text-[#86EFAC]' : 'border-crimson bg-[#3B0004] text-neon'
          }`}>
            {hasil.teks}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sibuk || !form.judul.trim() || (form.target === 'one' && !form.discordId.trim())}
            className="btn-primary !px-4 !py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sibuk ? 'Mengirim...' : 'Kirim Notifikasi'}
          </button>
        </div>
      </form>
    </div>
  );
}
