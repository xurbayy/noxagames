import { ImageResponse } from 'next/og';
import { BRAND } from './lib/noxa-og-colors';

export const runtime = 'edge';
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

// Favicon dinamis: equalizer merah di kotak hitam.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6, backgroundColor: BRAND.pureBlack, paddingBottom: 10 }}>
        {[24, 44, 32].map((h, i) => (
          <div key={i} style={{ width: 8, height: h, borderRadius: 3, backgroundColor: i === 1 ? BRAND.neonRed : BRAND.crimson }} />
        ))}
      </div>
    ),
    size
  );
}
