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
              ? 'border-crimson bg-[#1F4E47] text-[#DCEFE6]'
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
              ? 'border-crimson bg-[#1F4E47] text-[#DCEFE6]'
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
              ? 'border-crimson bg-[#1F4E47] text-[#DCEFE6]'
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
              ? 'border-crimson bg-[#1F4E47] text-[#DCEFE6]'
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
                        className="h-full rounded-full bg-crimson"
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
                  <div key={g.id} className="flex items-center gap-1.5 px-3 py-3 sm:gap-3 sm:px-4">
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
                    {g.inviteUrl && (
                      <a
                        href={g.inviteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Kunjungi ${g.name || 'server'}`}
                        className="btn-ghost shrink-0 !rounded-lg !px-2 !py-1.5 text-xs min-[380px]:!px-2.5"
                      >
                        <svg viewBox="0 0 24 24" width={13} height={13} fill="currentColor" aria-hidden="true" className="shrink-0">
                          <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                        <span className="hidden min-[380px]:inline">Kunjungi</span>
                      </a>
                    )}
                    <span className="shrink-0 text-xs font-bold tabular-nums text-neon sm:text-sm">{durasi(g.duration)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center text-sm text-muted">
                Belum ada data server yang tercatat. Putar lagu di server Discord kamu agar masuk peringkat.
              </div>
            )}
            <p className="mt-3 text-xs leading-relaxed text-faint">
              Daftar server teratas yang membuka tautan undangan komunitas untuk dikunjungi.
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
