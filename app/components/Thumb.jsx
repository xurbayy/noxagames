'use client';

// Thumbnail yang tidak pernah tampil kosong/rusak: kalau URL null atau gagal
// load, ganti sendiri jadi placeholder gradasi studio + emoji musik.
import { useEffect, useState } from 'react';
import Emoji from './Emoji';

export default function Thumb({ src, alt = '', size = 'h-10 w-10', rounded = 'rounded-lg', emoji = 'musik', emojiSize = 18 }) {
  const [rusak, setRusak] = useState(false);

  useEffect(() => {
    setRusak(false);
  }, [src]);

  if (!src || rusak) {
    return (
      <span className={`${size} ${rounded} flex shrink-0 items-center justify-center border border-line bg-surface3`}>
        <Emoji name={emoji} size={emojiSize} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${size} ${rounded} shrink-0 border border-line object-cover`}
      loading="lazy"
      onError={() => setRusak(true)}
      referrerPolicy="no-referrer"
    />
  );
}
