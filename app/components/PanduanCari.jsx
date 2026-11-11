'use client';

// PanduanCari - daftar perintah dengan pencarian langsung (pola halaman
// commands Soundly: search box + filter kategori). Datanya tetap dari
// panduan-content.js (server), di sini cuma difilter di client - tanpa API.
import { useMemo, useState } from 'react';
import Emoji from './Emoji';

export default function PanduanCari({ kategori }) {
  const [kata, setKata] = useState('');
  const [filter, setFilter] = useState('semua');
  const q = kata.trim().toLowerCase();

  const hasil = useMemo(() => {
    const out = [];
    let totalItem = 0;
    for (const kat of kategori) {
      if (filter !== 'semua' && kat.key !== filter) continue;
      const items = kat.items.filter((it) => {
        if (!q) return true;
        const alias = it.alias || '';
        return (`${it.cmd} ${it.desc} ${alias}`).toLowerCase().includes(q);
      });
      totalItem += kat.items.length;
      if (items.length > 0) out.push({ ...kat, items });
    }
    return { kategori: out, totalItem };
  }, [q, filter, kategori]);

  const kosong = hasil.kategori.length === 0;

  return (
    <div>
      {/* Kotak cari + chip filter kategori */}
      <div className="sticky top-[72px] z-40 -mx-4 bg-bg/95 px-4 py-3 backdrop-blur-xl sm:top-[76px]">
        <label className="relative block">
          <span className="sr-only">Cari perintah</span>
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={kata}
            onChange={(e) => setKata(e.target.value)}
            placeholder="Cari perintah... misal: skip, playlist, volume"
            className="w-full rounded-xl border border-line bg-surface2 py-2.5 pl-10 pr-16 text-sm text-ink outline-none transition placeholder:text-faint focus:border-crimson"
          />
          {kata && (
            <button
              type="button"
              onClick={() => setKata('')}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-line bg-surface3 px-2 py-0.5 text-[10px] font-semibold text-faint transition hover:text-ink cursor-pointer"
            >
              Hapus
            </button>
          )}
        </label>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('semua')}
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
              filter === 'semua' ? 'border-crimson bg-crimson/15 text-neon' : 'border-line bg-surface2 text-muted hover:text-ink'
            }`}
          >
            Semua
          </button>
          {kategori.map((kat) => (
            <button
              key={kat.key}
              type="button"
              onClick={() => setFilter(kat.key)}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
                filter === kat.key ? 'border-crimson bg-crimson/15 text-neon' : 'border-line bg-surface2 text-muted hover:text-ink'
              }`}
            >
              {kat.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-faint">
        {q || filter !== 'semua'
          ? `${hasil.kategori.reduce((a, k) => a + k.items.length, 0)} dari ${hasil.totalItem} perintah cocok.`
          : `${hasil.totalItem} perintah tersedia.`}
      </p>

      {kosong ? (
        <div className="card mt-4 flex flex-col items-center gap-3 p-10 text-center">
          <Emoji name="cari" size={30} />
          <p className="text-sm font-semibold text-ink">Tidak ada yang cocok dengan &quot;{kata}&quot;.</p>
          <p className="text-xs text-faint">Coba kata lain, atau hapus filter kategori.</p>
          <button
            type="button"
            onClick={() => { setKata(''); setFilter('semua'); }}
            className="btn-ghost !px-4 !py-2 text-xs"
          >
            Reset pencarian
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {hasil.kategori.map((kat) => (
            <section key={kat.key} className="card p-5" id={kat.key}>
              <div className="flex items-center gap-2.5">
                <Emoji name={kat.emoji} size={24} className="shrink-0" />
                <h2 className="font-display text-base font-bold">{kat.label}</h2>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">{kat.intro}</p>
              <ul className="mt-4 space-y-3">
                {kat.items.map((it) => (
                  <li key={it.cmd} className="border-l-2 border-crimson/40 pl-3">
                    <div className="text-sm font-semibold">
                      {it.cmd.startsWith('.') ? <span className="cmd">{it.cmd}</span> : it.cmd}
                      {it.alias ? <span className="ml-2 text-xs font-normal text-faint">alias {it.alias}</span> : null}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{it.desc}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
