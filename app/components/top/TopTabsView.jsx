'use client';

import { useState } from 'react';
import Emoji from '../Emoji';
import Thumb from '../Thumb';
import SafeImg from '../SafeImg';
import TopListenerList from './TopListenerList';
import { premiumEmojiName } from '../../lib/premiumPlan';
import { durasi } from '../../lib/format';

const RANK_EMOJI = ['number1', 'number2', 'number3'];

export default function TopTabsView({ lagu = [], listener = [], server = [], session = null }) {
  const [tab, setTab] = useState('all'); // 'all' | 'songs' | 'listeners' | 'servers'

  const showSongs = tab === 'all' || tab === 'songs';
  const showListeners = tab === 'all' || tab === 'listeners';
  const showServers = tab === 'all' || tab === 'servers';

  return (
    <div>
      {/* Tab Filter Navigasi */}
      <div className="mt-6 flex flex-wrap gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            tab === 'all'
              ? 'border-crimson bg-[#3B0004] text-ink'
              : 'border-line bg-surface2 text-muted hover:border-linebright hover:text-ink'
          }`}
        >
          Semua Kategori
        </button>
        <button
          type="button"
          onClick={() => setTab('songs')}
          className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            tab === 'songs'
              ? 'border-crimson bg-[#3B0004] text-ink'
              : 'border-line bg-surface2 text-muted hover:border-linebright hover:text-ink'
          }`}
        >
          <Emoji name="musik" size={15} /> Top Lagu ({lagu.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('listeners')}
          className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            tab === 'listeners'
              ? 'border-crimson bg-[#3B0004] text-ink'
              : 'border-line bg-surface2 text-muted hover:border-linebright hover:text-ink'
          }`}
        >
          <Emoji name="userprofile" size={15} /> Top Listener ({listener.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('servers')}
          className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            tab === 'servers'
              ? 'border-crimson bg-[#3B0004] text-ink'
              : 'border-line bg-surface2 text-muted hover:border-linebright hover:text-ink'
          }`}
        >
          <Emoji name="party" size={15} /> Top Server ({server.length})
        </button>
      </div>

      <div className="mt-8 space-y-10">
        {/* Seksi Top Lagu */}
        {showSongs && lagu.length > 0 && (
          <section id="top-lagu">
            <JudulSeksi emoji="musik" judul="Top Lagu" ket={`Top ${lagu.length} lagu paling lama didengar`} />
            <div className="card divide-y divide-line overflow-hidden">
              {lagu.map((s, i) => (
                <div key={`${s.name}-${i}`} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3">
                  <span className="w-6 sm:w-8 shrink-0 text-center">
                    {RANK_EMOJI[i] ? (
                      <Emoji name={RANK_EMOJI[i]} size={20} />
                    ) : (
                      <span className="text-xs sm:text-sm font-bold tabular-nums text-faint">{i + 1}</span>
                    )}
                  </span>
                  <Thumb src={s.thumb} alt="" size="h-9 w-9 sm:h-10 sm:w-10" rounded="rounded-lg" emoji="musik" emojiSize={18} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-semibold leading-snug break-words">{s.name}</div>
                    <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">
                      {durasi(s.duration)} didengar {s.count > 1 ? `· ${s.count}x` : ''}
                    </div>
                  </div>
                  <div className="hidden w-28 sm:w-32 shrink-0 md:block">
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-crimson to-neon"
                        style={{ width: `${barPercent(s.duration, lagu[0]?.duration)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Seksi Top Listener */}
        {showListeners && listener.length > 0 && (
          <section id="top-listener">
            <JudulSeksi emoji="userprofile" judul="Top Listener" ket="Pendengar dengan total durasi terlama" />
            <TopListenerList items={listener} login={Boolean(session)} />
          </section>
        )}

        {/* Seksi Top Server */}
        {showServers && (
          <section id="top-server">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <JudulSeksi emoji="party" judul="Top Server" ket="Server dengan total dengar bareng terlama" />
              <span className="text-xs text-faint">Maksimal 10 server teratas</span>
            </div>

            {server.length > 0 ? (
              <div className="card divide-y divide-line overflow-hidden">
                {server.map((g, i) => (
                  <div key={g.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3">
                    <span className="w-6 sm:w-8 shrink-0 text-center">
                      {RANK_EMOJI[i] ? (
                        <Emoji name={RANK_EMOJI[i]} size={20} />
                      ) : (
                        <span className="text-xs sm:text-sm font-bold tabular-nums text-faint">{i + 1}</span>
                      )}
                    </span>
                    <SafeImg
                      src={g.icon}
                      alt=""
                      className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full border border-line object-cover"
                      fallback={
                        <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface3 text-xs sm:text-sm font-bold text-faint">
                          {String(g.name || 'S').slice(0, 1).toUpperCase()}
                        </span>
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-semibold leading-snug break-words">{g.name}</span>
                        {premiumEmojiName(g.premiumTier) && <Emoji name={premiumEmojiName(g.premiumTier)} size={16} />}
                      </div>
                      <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">{g.users} pendengar tercatat</div>
                    </div>
                    {g.inviteUrl ? (
                      <a
                        href={g.inviteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost shrink-0 !rounded-lg !px-2.5 !py-1.5 text-xs"
                      >
                        <Emoji name="callme" size={13} /> Kunjungi
                      </a>
                    ) : (
                      <span className="text-[11px] text-faint shrink-0 px-2.5 py-1 rounded-md bg-surface3 border border-line">
                        Privat
                      </span>
                    )}
                    <span className="shrink-0 text-sm font-bold tabular-nums text-neon">{durasi(g.duration)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center text-sm text-muted">
                Belum ada data server yang tercatat. Putar lagu di server Discord kamu agar masuk peringkat.
              </div>
            )}
            <p className="mt-3 text-xs leading-relaxed text-faint">
              Daftar server teratas berdasarkan total durasi mendengarkan NOXA Sound bersama komunitas.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function barPercent(nilai, max) {
  if (!max) return 0;
  return Math.max(6, Math.round((Number(nilai) / Number(max)) * 100));
}

function JudulSeksi({ emoji, judul, ket }) {
  return (
    <div className="mb-3 flex items-baseline gap-2.5">
      <Emoji name={emoji} size={20} />
      <h2 className="font-display text-lg font-bold">{judul}</h2>
      <span className="hidden text-xs text-faint sm:inline">{ket}</span>
    </div>
  );
}
