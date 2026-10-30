'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Tombol kembali ala NEXO (bisa history back atau link spesifik).
export default function BackButton({ label = 'Kembali', className = '', href }) {
  const router = useRouter();

  const classes = `inline-flex items-center gap-2 rounded-full border border-line bg-surface2 px-4 py-2 text-sm font-semibold text-ink transition hover:border-linebright hover:bg-surface3 cursor-pointer ${className}`;
  const icon = (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );

  if (href) {
    return (
      <Link href={href} prefetch={false} className={classes}>
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={classes}
    >
      {icon}
      {label}
    </button>
  );
}
