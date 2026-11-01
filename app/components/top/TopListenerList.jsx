'use client';

// Top Listener interaktif: baris bisa diklik -> kartu profil mini (modal).
// Tombol Share memakai renderer kartu bersama (lib/shareCard, 1080x1350) yang
// tajam - versi lama menggambar sendiri, meng-upscale avatar 64px dan memakai
// shadowBlur sehingga hasilnya blur.
import { useState } from 'react';
import Emoji from '../Emoji';
import Thumb from '../Thumb';
import ShareCardButton from '../ShareCardButton';
import { durasi } from '../../lib/format';
import { premiumEmojiName } from '../../lib/premiumPlan';

export default function TopListenerList({ items }) {
  const [buka, setBuka] = useState(null); // index item di modal

  const dataKartu = (u, i) => ({
    username: u.username,
    avatar: u.avatar,
    durationLabel: durasi(u.duration),
    plays: u.plays,
    rank: i + 1,
    premiumTier: u.premiumTier || null,
    serverName: u.topServer?.name || null,
    serverDuration: u.topServer?.duration ? durasi(u.topServer.duration) : null,
  });

  return (
    <>
      <div className="card divide-y divide-line overflow-hidden">
        {items.map((u, i) => (
          <div
            key={u.id}
            onClick={() => setBuka(i)}
            className="flex cursor-pointer items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 transition-colors hover:bg-surface3"
          >
            <span className="w-6 sm:w-8 shrink-0 text-center">
              {RANK_EMOJI[i] ? <Emoji name={RANK_EMOJI[i]} size={20} /> : <span className="text-xs sm:text-sm font-bold tabular-nums text-faint">{i + 1}</span>}
            </span>
            <Thumb src={u.avatar} alt="" size="h-9 w-9 sm:h-10 sm:w-10" rounded="rounded-full" emoji="userprofile" emojiSize={16} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-semibold leading-snug break-words">{u.username}</span>
                {premiumEmojiName(u.premiumTier) && <Emoji name={premiumEmojiName(u.premiumTier)} size={16} />}
              </div>
              <div className="text-[11px] sm:text-xs text-faint break-words mt-0.5">{u.plays} lagu selesai</div>
            </div>
            <span onClick={(e) => e.stopPropagation()} className="shrink-0 hidden sm:inline">
              <ShareCardButton
                mode="rank"
                data={dataKartu(u, i)}
                linkPath="/top"
                label="Bagikan"
                className="!px-2.5 !py-1.5"
              />
            </span>
            <span className="shrink-0 text-xs sm:text-sm font-bold tabular-nums text-neon">{durasi(u.duration)}</span>
          </div>
        ))}
      </div>

      {buka != null && items[buka] && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setBuka(null)}>
          <div className="card w-full max-w-sm p-6 shadow-[var(--shadow-lift)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="badge badge-danger">Top #{buka + 1}</span>
              <button type="button" onClick={() => setBuka(null)} className="text-faint hover:text-ink transition-colors cursor-pointer" aria-label="Tutup">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="mt-5 flex flex-col items-center text-center">
              <Thumb src={items[buka].avatar} alt="" size="h-24 w-24" rounded="rounded-full" emoji="userprofile" emojiSize={36} />
              <h3 className="mt-3 font-display text-xl font-bold flex items-center gap-2">
                {items[buka].username}
                {premiumEmojiName(items[buka].premiumTier) && <Emoji name={premiumEmojiName(items[buka].premiumTier)} size={22} />}
              </h3>
              <p className="mt-1 text-sm text-muted">Pendengar paling setia di NOXA Sound</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-surface p-3 text-center">
                <div className="font-display text-lg font-bold tabular-nums text-neon">{durasi(items[buka].duration)}</div>
                <div className="text-xs text-faint">Total Didengar</div>
              </div>
              <div className="rounded-xl border border-line bg-surface p-3 text-center">
                <div className="font-display text-lg font-bold tabular-nums">{items[buka].plays}</div>
                <div className="text-xs text-faint">Lagu Selesai</div>
              </div>
            </div>
            <div className="mt-5">
              <ShareCardButton
                mode="rank"
                data={dataKartu(items[buka], buka)}
                linkPath="/top"
                label="Bagikan"
                className="w-full justify-center !py-3 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const RANK_EMOJI = ['number1', 'number2', 'number3'];
