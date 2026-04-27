import type { Metadata, Viewport } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import I18nProvider from '@/components/I18nProvider';
import ThemeProvider from '@/components/ThemeProvider';
import AuthProvider from '@/components/AuthProvider';
import MainWrapper from '@/components/MainWrapper';
import GlobalChatWidget from '@/components/GlobalChatWidget';

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
            <AuthProvider>
              <Nav />
              <main><MainWrapper>{children}</MainWrapper></main>
              <GlobalChatWidget />
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
