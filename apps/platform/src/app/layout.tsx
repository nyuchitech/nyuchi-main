/**
 * Nyuchi Platform - Root Layout
 * "I am because we are" - Ubuntu Philosophy
 */

import type { Metadata } from 'next';
import { ThemeProvider } from '../components/ThemeProvider';
import { PaperProvider } from '../components/PaperProvider';
import { Providers } from '../components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nyuchi Africa - Community Platform',
  description: 'Ubuntu: I am because we are - Supporting African entrepreneurship',
  icons: {
    icon: 'https://assets.nyuchi.com/logos/Nyuchi_Logo_Favicon.ico',
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
        {/* Nyuchi Brand Fonts: Noto Serif (Display) + Plus Jakarta Sans (Headings/Body) */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Brand CSS from assets.nyuchi.com */}
        <link rel="stylesheet" href="https://assets.nyuchi.com/css/v5/all.css" />
      </head>
      <body>
        <ThemeProvider>
          <PaperProvider>
            <Providers>
              {children}
            </Providers>
          </PaperProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
