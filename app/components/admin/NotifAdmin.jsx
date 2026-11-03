'use client';

// Lonceng notifikasi ADMIN (pola NEXO). Isi: pembelian NOXA Pass baru,
// feedback user, dan alert lain. Poll 30 detik.
//
// Catatan desain: tombol + dropdown diletakkan di header panel admin supaya
// tidak menumpuk dengan lonceng user di navbar.
import { useCallback, useEffect, useRef, useState } from 'react';

const IKON = {
  pembelian: { label: 'PEMBELIAN', kelas: 'bg-[#14532D] text-[#86EFAC] border-[#22C55E]' },
  feedback: { label: 'FEEDBACK', kelas: 'bg-[#1E232A] text-[#CBD5E1] border-slate-400' },
  penting: { label: 'PENTING', kelas: 'bg-[#0C3A44] text-neon border-crimson' },
  info: null,
};

export default function NotifAdmin() {
  const [items, setItems] = useState([]);
  const [belum, setBelum] = useState(0);
  const [buka, setBuka] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const boxRef = useRef(null);

  const muat = useCallback(async () => {
    if (typeof document !== 'undefined' && document.hidden) return;
    try {
      const res = await fetch('/api/admin/notif?n=50', { cache: 'no-store' });
      if (!res.ok) return;
      const d = await res.json().catch(() => ({}));
      if (Array.isArray(d.notif)) setItems(d.notif);
      setBelum(Number(d.belum) || 0);
    } catch { /* diamkan */ }
  }, []);

  useEffect(() => {
    const t = setTimeout(muat, 0);
    const iv = setInterval(muat, 30000);
    const onVisible = () => { if (!document.hidden) muat(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(t); clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [muat]);

  useEffect(() => {
    if (!buka) return undefined;
    const onKlik = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setBuka(false); };
    const onEsc = (e) => { if (e.key === 'Escape') setBuka(false); };
    document.addEventListener('mousedown', onKlik);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onKlik);
      document.removeEventListener('keydown', onEsc);
    };
  }, [buka]);

  async function tandai(id) {
    setItems((arr) => arr.map((n) => (n.id === id ? { ...n, dibaca: true } : n)));
    setBelum((b) => Math.max(0, b - 1));
    try {
      await fetch('/api/admin/notif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {}
  }

  async function tandaiSemua() {
    setSibuk(true);
    setItems((arr) => arr.map((n) => ({ ...n, dibaca: true })));
    setBelum(0);
    try {
      await fetch('/api/admin/notif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
    } catch {}
    finally { setSibuk(false); }
  }

  async function hapusSemua() {
    setSibuk(true);
    const lama = items;
    setItems([]);
    setBelum(0);
    try {
      const res = await fetch('/api/admin/notif?all=1', { method: 'DELETE' });
      if (!res.ok) setItems(lama);
    } catch { setItems(lama); }
    finally { setSibuk(false); }
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-label={`Notifikasi admin${belum ? ` (${belum} baru)` : ''}`}
        aria-expanded={buka}
        className="relative flex h-9 items-center gap-2 rounded-full border border-line bg-surface2 px-3 text-xs font-semibold text-ink transition hover:border-linebright hover:bg-surface3 cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        <span className="hidden sm:inline">Notifikasi</span>
        {belum > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-crimson px-1 text-[0.6rem] font-bold text-white">
            {belum > 9 ? '9+' : belum}
          </span>
        )}
      </button>

      {buka && (
        <div className="absolute right-0 top-11 z-[60] w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-surface2 shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-bold text-ink">Notifikasi Admin</p>
              <p className="text-[11px] text-faint">{belum > 0 ? `${belum} belum dibaca` : 'Semua sudah dibaca'}</p>
            </div>
            <div className="flex items-center gap-2.5">
              {belum > 0 && (
                <button type="button" onClick={tandaiSemua} disabled={sibuk} className="text-[11px] font-semibold text-neon hover:underline cursor-pointer disabled:opacity-50">
                  Tandai
                </button>
              )}
              {items.length > 0 && (
                <button type="button" onClick={hapusSemua} disabled={sibuk} className="text-[11px] font-semibold text-faint hover:text-crimson cursor-pointer disabled:opacity-50">
                  Bersihkan
                </button>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-7 text-center text-xs leading-relaxed text-faint">
              Belum ada notifikasi. Pembelian baru dan feedback user akan masuk ke sini otomatis.
            </p>
          ) : (
            <ul className="max-h-[24rem] divide-y divide-line/70 overflow-y-auto">
              {items.map((n) => {
                const ikon = IKON[n.tipe] || null;
                return (
                  <li key={n.id} className={`px-4 py-3 ${n.dibaca ? '' : 'bg-[#07242A]'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold leading-snug text-ink break-words">
                          {ikon && (
                            <span className={`mr-1.5 inline-block rounded border px-1.5 py-0.5 text-[0.55rem] font-extrabold ${ikon.kelas}`}>
                              {ikon.label}
                            </span>
                          )}
                          {n.judul}
                        </p>
                        {n.isi && <p className="mt-1 text-[11px] leading-relaxed text-muted break-words">{n.isi}</p>}
                        <p className="mt-1 text-[10px] text-faint">
                          {new Date(n.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.dibaca && (
                        <button
                          type="button"
                          onClick={() => tandai(n.id)}
                          aria-label="Tandai dibaca"
                          className="shrink-0 rounded-full p-1 text-faint transition hover:bg-surface3 hover:text-ink cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
