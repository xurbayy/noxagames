import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import ScrollProgress from './components/ScrollProgress';
import { getSession } from './lib/session';
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
};

export const viewport = {
  themeColor: '#030303',
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
      <body className="min-h-screen antialiased">
        <ScrollProgress />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar session={session} />
        <main>{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
