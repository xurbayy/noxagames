'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginForm({ loginUrl }) {
  const [setuju, setSetuju] = useState(false);

  return (
    <div className="mt-6 space-y-4">
      {/* Checkbox Persetujuan Wajib */}
      <label className="flex items-start gap-2.5 text-left text-xs leading-relaxed text-muted cursor-pointer select-none rounded-xl border border-line bg-surface p-3 transition hover:border-linebright">
        <input
          type="checkbox"
          checked={setuju}
          onChange={(e) => setSetuju(e.target.checked)}
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

      {/* Tombol Login Discord - Terkunci sampai dicentang */}
      <div>
        <a
          href={setuju ? loginUrl : undefined}
          aria-disabled={!setuju}
          onClick={(e) => {
            if (!setuju) {
              e.preventDefault();
            }
          }}
          className={`btn-primary w-full justify-center text-sm font-bold transition-all duration-200 ${
            setuju
              ? 'cursor-pointer hover:shadow-[0_0_20px_rgba(255,42,109,0.4)]'
              : 'opacity-40 cursor-not-allowed pointer-events-none filter grayscale'
          }`}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          Lanjutkan dengan Discord
        </a>
      </div>
    </div>
  );
}
