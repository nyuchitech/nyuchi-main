/**
 * Nyuchi Platform - Root Layout
 * "Ndiri nekuti tiri" - I am because we are
 */

import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nyuchi Africa - Community Platform',
  description: 'Ubuntu: I am because we are - Supporting African entrepreneurship',
  icons: {
    icon: 'https://assets.nyuchi.com/logos/Nyuchi_Logo_Favicon.ico',
  },
}

// Flash prevention script - runs before React hydrates
const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('nyuchi-theme');
      var theme;
      if (stored === 'light' || stored === 'dark') {
        theme = stored;
      } else {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.classList.add(theme);
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  })();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Nyuchi Brand Fonts: Noto Serif (Display) + Plus Jakarta Sans (Headings/Body) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider defaultTheme="system" storageKey="nyuchi-theme">
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
