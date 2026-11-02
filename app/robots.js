import { SITE_URL } from './lib/site';

// robots.txt - aturan crawler.
//
// PENTING untuk Google Search Console:
//   - Halaman butuh-login dan API harus disallow supaya Google tidak
//     mengindeks halaman kosong (menurunkan kualitas situs).
//   - Googlebot-Image diizinkan eksplisit supaya logo/gambar tampil di hasil
//     pencarian (kalau tidak, Google kadang jatuh ke ikon globe).
//   - `host` memberi tahu Google domain kanonik yang dipakai.
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/me', '/no-access', '/login'],
      },
      { userAgent: 'Googlebot-Image', allow: '/' },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/logo.png', '/opengraph-image', '/sitemap.xml', '/robots.txt'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
