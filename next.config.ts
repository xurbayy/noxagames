import type { NextConfig } from "next";

// Security headers dasar. CSP ketat tapi tetap membolehkan inline script Next
// (hydration) + font Google + CDN Discord (avatar & emoji) + thumbnail YouTube.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://cdn.discordapp.com https://i.ytimg.com https://img.youtube.com https://*.mzstatic.com https://cdns-images.dzcdn.net https://*.scdn.co",
  "connect-src 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  // Prefetch otomatis dimatikan per-Link di Navbar (lihat komponen) supaya
  // navigasi tidak menggandakan RSC request di jaringan lambat - pelajaran
  // dari web NEXO (web "lag banget").
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
