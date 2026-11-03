import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import ConsentNotif from './components/ConsentNotif';
import ScrollProgress from './components/ScrollProgress';
import { getSession, isAdminDiscordId } from './lib/session';
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_URL, absoluteUrl } from './lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', display: 'swap' });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'NOXA Sound', 'NOXA', 'bot discord musik', 'bot musik discord indonesia',
    'discord music bot', 'bot discord podcast', 'radio discord 24 jam', 'bot discord gratis',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: `${SITE_NAME} | ${SITE_TAGLINE}`, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
  // Google Search Console: isi NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION dengan kode
  // dari GSC (metode "HTML tag") lalu redeploy - tag meta terpasang otomatis.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  icons: {
    // Satu set ikon dari logo resmi NOXA (pola NEXO): tab browser, Google,
    // dan preview link Discord/WhatsApp semuanya dapat ukuran yang pas.
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-48x48.png', type: 'image/png', sizes: '48x48' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/logo.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    // CATATAN 3 Nov 2026: link rel=manifest SENGAJA DIHAPUS. Situs ini kini
    // web biasa (bukan PWA) - prompt "Pasang aplikasi" terdeteksi heuristik
    // Safe Browsing sebagai pola instalasi agresif. Tanpa manifest, Chrome
    // tidak akan pernah menawarkan install.
  },
};

export const viewport = {
  themeColor: '#04171A',
};

export default async function RootLayout({ children }) {
  const session = await getSession().catch(() => null);

  // JSON-LD structured data untuk hasil pencarian kaya (SoftwareApplication).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Discord',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
    featureList:
      'Musik dari 8 platform, Podcast 15 tema, Radio lagu populer 24 jam, Live lirik, Efek audio DSP, Profil pendengar',
  };

  return (
    <html lang="id" className={`${inter.variable} ${space.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <ScrollProgress />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar session={session} isAdmin={Boolean(session && isAdminDiscordId(session.discordId))} />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
        <ConsentNotif />
      </body>
    </html>
  );
}
