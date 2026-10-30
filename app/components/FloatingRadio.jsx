'use client';

// Floating Radio: widget audio pojok kanan bawah.
// Memutar stream audio 24/7 otomatis (autoplay) dengan suara keluar.
// User hanya bisa Mute / Unmute lewat tombol speaker.
import { useEffect, useRef, useState } from 'react';
import Emoji from './Emoji';

const STREAM_URL = 'https://das-sa39.cdnstream1.com/5582_128';
const STORAGE_KEY = 'noxa_radio_muted';

export default function FloatingRadio() {
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Cek preferensi mute user
    const prefMuted = localStorage.getItem(STORAGE_KEY) === 'true';
    if (prefMuted) setMuted(true);

    const audio = new Audio();
    audio.src = STREAM_URL;
    audio.preload = 'none';
    audio.loop = true;
    audioRef.current = audio;

    const playStream = async () => {
      if (!audioRef.current) return;
      try {
        audioRef.current.muted = prefMuted;
        audioRef.current.volume = 0.65; // Volume nyaman di telinga
        await audioRef.current.play();
        setPlaying(true);
      } catch {
        // Kebijakan browser (Autoplay Policy): browser menolak play dengan suara
        // sebelum interaksi user pertama. Pasang listener pada interaksi pertama
        // (klik atau scroll apa saja di halaman) untuk langsung menyalakan audio.
        const onFirstInteract = async () => {
          window.removeEventListener('click', onFirstInteract);
          window.removeEventListener('keydown', onFirstInteract);
          window.removeEventListener('touchstart', onFirstInteract);
          try {
            if (audioRef.current) {
              await audioRef.current.play();
              setPlaying(true);
            }
          } catch {}
        };
        window.addEventListener('click', onFirstInteract, { once: true });
        window.addEventListener('keydown', onFirstInteract, { once: true });
        window.addEventListener('touchstart', onFirstInteract, { once: true });
      }
    };

    playStream();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !muted;
    setMuted(nextMuted);
    audioRef.current.muted = nextMuted;
    localStorage.setItem(STORAGE_KEY, String(nextMuted));
    if (!nextMuted && audioRef.current.paused) {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] select-none">
      <div className="card flex items-center gap-3 rounded-full border border-linebright bg-[#111214]/90 py-2 pl-2.5 pr-3 shadow-[0_8px_30px_rgba(0,0,0,0.55)] backdrop-blur-md transition-all hover:border-crimson/50">
        {/* Equalizer bar animasi saat menyala */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-crimson/15 border border-crimson/30 shrink-0">
          {playing && !muted ? (
            <span className="flex items-end gap-[2px] h-3.5">
              <span className="eq-bar w-[2.5px] h-3.5 rounded-sm bg-neon" style={{ animationDelay: '0ms' }} />
              <span className="eq-bar w-[2.5px] h-3.5 rounded-sm bg-crimson" style={{ animationDelay: '160ms' }} />
              <span className="eq-bar w-[2.5px] h-3.5 rounded-sm bg-glow" style={{ animationDelay: '320ms' }} />
            </span>
          ) : (
            <Emoji name="radio" size={15} />
          )}
        </div>

        {/* Info Stream */}
        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[12px] font-bold text-ink whitespace-nowrap">NOXA Radio</span>
            <span className={`h-1.5 w-1.5 rounded-full ${playing && !muted ? 'bg-ok live-dot' : 'bg-faint'}`} />
          </div>
          <div className="mt-1 text-[10px] text-faint whitespace-nowrap">
            {muted ? 'Suara dibisukan' : 'Lofi Beats 24/7'}
          </div>
        </div>

        {/* Tombol Mute / Unmute */}
        <button
          type="button"
          onClick={toggleMute}
          title={muted ? 'Bunyikan suara' : 'Bisukan suara'}
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors cursor-pointer shrink-0 ${
            muted
              ? 'border-line bg-surface3 text-faint hover:text-ink'
              : 'border-crimson/40 bg-crimson/20 text-neon hover:bg-crimson/30'
          }`}
        >
          {muted ? (
            // Ikon Speaker Muted (volume-x)
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            // Ikon Speaker Active (volume-2)
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
