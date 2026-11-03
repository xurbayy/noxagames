import { ImageResponse } from 'next/og';
import { BRAND, SITE_NAME } from './lib/site';

export const runtime = 'edge';
export const alt = 'NOXA Sound - Bot hiburan audio Discord';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// OG image dinamis: dark studio merah hitam, tanpa asset raster.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: BRAND.pureBlack,
          backgroundImage:
            `radial-gradient(700px 380px at 80% 0%, rgba(57,127,128,0.35), transparent 65%), radial-gradient(500px 300px at 10% 100%, rgba(18,63,69,0.5), transparent 60%)`,
          color: '#E2F1EC',
        }}
      >
        {/* Equalizer bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 110 }}>
          {[52, 110, 78, 40].map((h, i) => (
            <div
              key={i}
              style={{
                width: 16,
                height: h,
                borderRadius: 6,
                backgroundColor: i % 2 === 0 ? BRAND.neonRed : BRAND.crimson,
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 36, fontSize: 92, fontWeight: 700, letterSpacing: -2 }}>
          <span style={{ display: 'flex' }}>NOXA&nbsp;</span>
          <span style={{ display: 'flex', color: BRAND.neonRed, textShadow: `0 0 40px rgba(127,198,190,0.6)` }}>Sound</span>
        </div>
        <div style={{ display: 'flex', marginTop: 18, fontSize: 34, color: '#9DB8B6' }}>
          Bot hiburan audio Discord: musik, podcast, dan radio
        </div>
        <div style={{ display: 'flex', marginTop: 44, fontSize: 26, color: '#5F7D7C' }}>{SITE_NAME} | gratis untuk semua server</div>
      </div>
    ),
    size
  );
}
