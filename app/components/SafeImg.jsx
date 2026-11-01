'use client';

// SafeImg: <img> yang tidak pernah menampilkan kotak rusak.
//
// Masalah nyata: cover playlist & sebagian avatar disimpan sebagai URL
// attachment Discord yang punya token kedaluwarsa (?ex=...&is=...&hm=...),
// atau avatar user yang sudah ganti foto (URL lama 404). Tanpa fallback,
// browser menampilkan ikon gambar rusak.
//
// Perilaku:
//   1. Coba src asli.
//   2. Gagal -> coba `fallbackSrc` (kalau ada).
//   3. Gagal juga -> render `fallback` (ReactNode), default: kotak kosong
//      bergaris supaya layout tidak melompat.
import { useEffect, useState } from 'react';

export default function SafeImg({
  src,
  alt = '',
  className = '',
  fallbackSrc = null,
  fallback = null,
  ...rest
}) {
  const [gagal, setGagal] = useState(false);
  const [pakaiFallback, setPakaiFallback] = useState(false);

  // Reset saat src berubah (mis. ganti halaman / data profil baru).
  useEffect(() => {
    setGagal(false);
    setPakaiFallback(false);
  }, [src]);

  const sumber = pakaiFallback ? fallbackSrc : src;
  const tidakAda = !sumber || gagal;

  if (tidakAda) {
    if (fallback) return fallback;
    return (
      <span
        aria-hidden="true"
        className={`inline-block bg-surface3 border border-line ${className}`}
      />
    );
  }

  return (
    <img
      src={sumber}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => {
        if (fallbackSrc && !pakaiFallback) setPakaiFallback(true);
        else setGagal(true);
      }}
      {...rest}
    />
  );
}
