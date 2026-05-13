import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { StringProvider } from '@/components/providers/string-provider';
import { I18nProvider } from '@/components/providers/i18n-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Oxubiraz — Reading Speed Platform',
    template: '%s | Oxubiraz',
  },
  description: 'Multilingual AI-powered reading speed education platform for children',
  applicationName: 'Oxubiraz',
  keywords: ['reading', 'education', 'children', 'speed reading', 'multilingual'],
  authors: [{ name: 'Oxubiraz Team' }],
  creator: 'Oxubiraz',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Oxubiraz',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Oxubiraz',
    title: 'Oxubiraz — Reading Speed Platform',
    description: 'Multilingual AI-powered reading speed education platform for children',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oxubiraz',
    description: 'Multilingual AI-powered reading speed education platform for children',
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7c3aed' },
    { media: '(prefers-color-scheme: dark)', color: '#6d28d9' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="az" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <AuthProvider>
              <I18nProvider>
                <StringProvider>
                  {children}
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    toastOptions={{
                      duration: 4000,
                      classNames: {
                        toast: 'font-sans',
                      },
                    }}
                  />
                </StringProvider>
              </I18nProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
