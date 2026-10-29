import Link from 'next/link';

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center gap-4 px-4">
      <span className="flex items-end gap-1 h-8">
        <span className="eq-bar w-1.5 h-8 rounded-sm bg-crimson" style={{ animationDelay: '0ms' }} />
        <span className="eq-bar w-1.5 h-8 rounded-sm bg-neon" style={{ animationDelay: '150ms' }} />
        <span className="eq-bar w-1.5 h-8 rounded-sm bg-crimson" style={{ animationDelay: '300ms' }} />
        <span className="eq-bar w-1.5 h-8 rounded-sm bg-neon/70" style={{ animationDelay: '450ms' }} />
      </span>
      <span className="text-sm text-faint">Memuat...</span>
      <Link href="/" className="sr-only">Kembali</Link>
    </div>
  );
}
