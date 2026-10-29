// Emoji renderer NOXA - komponen murni tanpa hooks, aman dipakai di server
// maupun client component. Emoji tidak ditemukan = tidak dirender sama sekali
// (jangan pernah sampai URL kosong ke DOM - pelajaran web NEXO).
import { emojiSrc } from '../lib/noxa-emojis';

export default function Emoji({ name, size = 20, className = '', alt = '' }) {
  const src = emojiSrc(name, size > 48 ? 128 : 48);
  if (!src) return null;
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={alt}
      className={`inline-block align-middle ${className}`}
      loading="lazy"
      draggable={false}
    />
  );
}
