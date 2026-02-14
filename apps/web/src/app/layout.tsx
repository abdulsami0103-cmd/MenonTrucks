import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/structured-data';

const inter = Inter({ subsets: ['latin'] });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://menontrucks.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'MenonTrucks - Europe\'s Vehicle Marketplace',
    template: '%s | MenonTrucks',
  },
  description: 'Multi-vendor vehicle marketplace for trucks, trailers, construction machinery, and more. 150,000+ listings worldwide.',
  keywords: ['trucks', 'trailers', 'marketplace', 'commercial vehicles', 'construction machinery', 'buy trucks', 'sell trucks', 'used trucks Europe'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'MenonTrucks',
    title: 'MenonTrucks - Europe\'s Vehicle Marketplace',
    description: 'Find trucks, trailers, construction machinery and more. 150,000+ listings from 1,700+ sellers worldwide.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MenonTrucks - Europe\'s Vehicle Marketplace',
    description: 'Find trucks, trailers, construction machinery and more. 150,000+ listings worldwide.',
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'en': `${BASE_URL}/en`,
      'nl': `${BASE_URL}/nl`,
      'de': `${BASE_URL}/de`,
      'fr': `${BASE_URL}/fr`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebsiteSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }}
        />
      </head>
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
