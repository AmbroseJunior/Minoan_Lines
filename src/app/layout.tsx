import type { Metadata, Viewport } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import I18nProvider from '@/components/I18nProvider';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Minoan Lines AI Platform',
  description: 'AI-Powered Operations Platform for Minoan Lines S.A.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Minoan AI' },
};

export const viewport: Viewport = {
  themeColor: '#003087',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-100 dark:bg-slate-900">
        <ThemeProvider>
          <I18nProvider>
            <Nav />
            <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
