// Pusat konstanta SEO + branding NOXA Sound. Ganti SITE_URL lewat env saat deploy.
// Bot Discord-nya bernama NOXA; NOXA Sound adalah identitas webnya karena bot
// mencakup musik, podcast, dan radio (bukan musik saja).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://noxa-sound.vercel.app'
).replace(/\/+$/, '');

export const CANONICAL_HOST = (() => {
  try { return new URL(SITE_URL).host; } catch { return 'noxa-sound.vercel.app'; }
})();

/**
 * Origin kanonik untuk redirect server-side.
 * - Production: SELALU SITE_URL (request.url di proksi bisa salah host, pernah
 *   bikin login mati di web NEXO - pelajaran yang sama diterapkan di sini).
 * - Dev localhost/127.0.0.1: pakai host + PORT asli (pakai .host, bukan
 *   .hostname, supaya port tidak hilang).
 */
export function canonicalOrigin(requestUrl) {
  if (process.env.NODE_ENV === 'production') return SITE_URL;
  if (requestUrl) {
    try {
      const u = new URL(requestUrl);
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === '::1') {
        return `${u.protocol}//${u.host}`;
      }
    } catch { /* URL aneh -> pakai kanonik */ }
  }
  return SITE_URL;
}

export const BOT_INVITE =
  process.env.NEXT_PUBLIC_BOT_INVITE ||
  'https://discord.com/oauth2/authorize?client_id=1481672108256792687&scope=bot+applications.commands&permissions=277062478913';

export const SUPPORT_INVITE =
  process.env.NEXT_PUBLIC_SUPPORT_INVITE || 'https://discord.gg/53mJhsHeAk';

export const SITE_NAME = 'NOXA Sound';
export const SITE_TAGLINE = 'Bot hiburan audio Discord: musik, podcast, dan radio';
export const SITE_DESCRIPTION =
  'NOXA Sound adalah bot Discord hiburan audio gratis: putar musik dari 8 platform, podcast 15 tema kurasi, dan radio lagu populer 24 jam nonstop. Audio jernih, kontrol lengkap, dan statistik pendengaranmu.';

export const SITE_KEYWORDS = [
  'NOXA Sound',
  'NOXA',
  'bot discord musik',
  'bot musik discord indonesia',
  'discord music bot',
  'bot discord podcast',
  'radio discord 24 jam',
  'bot discord gratis',
  'bot lagu discord',
  'discord podcast bot',
  'musik discord server',
];

/** Palet resmi NOXA Sound, sama dengan utils/colors.js di repo bot. */
export const BRAND = {
  pureBlack: '#0F2E2A',    // teks & jangkar tergelap
  deepBlack: '#1F4E47',     // ribbon utama logo / footer
  darkCrimson: '#2E6F63',   // hover & link
  darkMaroon: '#8DBFB3',    // sage: border, ikon sekunder
  crimson: '#1F4E47',       // aksen gelap (nama var dipertahankan utk kelas)
  neonRed: '#2E6F63',
  glowRed: '#F2A15B',       // peach CTA - satu-satunya aksen hangat
  mint: '#DCEFE6',          // background lembut
  paper: '#F4FAF7',         // latar terang 60%
};

export function absoluteUrl(path = '/') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

// Helper metadata per-halaman: canonical + Open Graph + Twitter seragam.
export function pageMeta({ title, description, path, type = 'website' }) {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      type,
      siteName: SITE_NAME,
    },
    twitter: { card: 'summary_large_image', title: `${title} | ${SITE_NAME}`, description },
  };
}
