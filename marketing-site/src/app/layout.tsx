/**
 * Nyuchi Marketing Site - Root Layout
 * www.nyuchi.com
 * "I am because we are"
 */

import type { Metadata } from 'next';
import { ThemeProvider } from '../components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nyuchi Africa - Community Platform for African Entrepreneurs',
  description: 'Ubuntu: I am because we are - Supporting African entrepreneurship and building community.',
  keywords: ['Africa', 'entrepreneurship', 'Ubuntu', 'Zimbabwe', 'community', 'business'],
  openGraph: {
    title: 'Nyuchi Africa',
    description: 'Community Platform for African Entrepreneurs',
    url: 'https://www.nyuchi.com',
    siteName: 'Nyuchi Africa',
    type: 'website',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
