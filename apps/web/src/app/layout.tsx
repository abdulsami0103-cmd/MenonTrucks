import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'MenonTrucks - Vehicle Marketplace',
    template: '%s | MenonTrucks',
  },
  description: 'Multi-vendor vehicle marketplace for trucks, trailers, construction machinery, and more. 150,000+ listings worldwide.',
  keywords: ['trucks', 'trailers', 'marketplace', 'commercial vehicles', 'construction machinery', 'buy trucks', 'sell trucks'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
