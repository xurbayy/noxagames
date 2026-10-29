'use client';

export default function Error({ error, reset }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="badge badge-danger">Gangguan</span>
      <h1 className="font-display text-2xl font-bold">Ada yang tersendat di studio</h1>
      <p className="text-sm leading-relaxed text-muted">
        Halaman ini gagal dimuat. Bisa jadi koneksi sedang drop atau data sedang disegarkan.
        Coba sekali lagi, kalau masih muncul hubungi server dukungan.
      </p>
      <button onClick={reset} className="btn-primary">Coba Lagi</button>
    </div>
  );
}
