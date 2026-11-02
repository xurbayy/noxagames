import { SITE_URL } from './lib/site';

// Sitemap untuk Google Search Console.
//
// Aturan:
//   - HANYA halaman publik yang diindeks. /me, /admin, /no-access dan /login
//     sengaja TIDAK didaftarkan: butuh sesi atau isinya kosong bagi crawler,
//     dan halaman tipis menurunkan kualitas situs di mata Google.
//   - /pemutar didaftarkan karena isinya nyata (panel pemutar + penjelasan),
//     bukan halaman kosong.
//   - changeFrequency & priority = petunjuk, bukan perintah.
export default function sitemap() {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/top`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/panduan`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/pemutar`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/premium`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms-of-service`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
